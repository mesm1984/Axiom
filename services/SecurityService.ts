import SafeAsyncStorage from '../utils/SafeAsyncStorage';

export interface RateLimit {
  action: string;
  maxAttempts: number;
  windowMs: number; // Fenêtre de temps en millisecondes
  attempts: number;
  resetTime: number;
}

export interface UserReporting {
  reportedUserId: string;
  reportType: 'spam' | 'harassment' | 'inappropriate' | 'security' | 'other';
  description: string;
  reportedAt: Date;
  reporterId: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  evidence?: string[]; // URLs ou identifiants de preuves
}

export interface SecurityAlert {
  id: string;
  type:
    | 'suspicious_activity'
    | 'rate_limit_exceeded'
    | 'spam_detected'
    | 'security_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: any;
}

export interface UserTrustScore {
  userId: string;
  score: number; // 0-100
  factors: {
    accountAge: number;
    messageCount: number;
    reportCount: number;
    verificationLevel: number;
    behaviorScore: number;
  };
  lastUpdated: Date;
}

class SecurityService {
  private static instance: SecurityService;
  private readonly RATE_LIMITS_KEY = 'axiom_rate_limits';
  private readonly REPORTS_KEY = 'axiom_user_reports';
  private readonly ALERTS_KEY = 'axiom_security_alerts';
  private readonly TRUST_SCORES_KEY = 'axiom_trust_scores';
  private readonly BLOCKED_USERS_KEY = 'axiom_blocked_users';

  // Configuration par défaut des limites
  private readonly DEFAULT_LIMITS = {
    messages: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 messages/minute
    orb_vibration: { maxAttempts: 5, windowMs: 60 * 1000 }, // 5 Orb/minute
    file_transfer: { maxAttempts: 10, windowMs: 60 * 1000 }, // 10 transferts/minute
    new_conversation: { maxAttempts: 20, windowMs: 60 * 60 * 1000 }, // 20 nouvelles conversations/heure
    report_user: { maxAttempts: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 signalements/jour
  };

  private rateLimits = new Map<string, RateLimit>();
  private blockedUsers = new Set<string>();

  private constructor() {
    this.loadConfiguration();
  }

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Rate Limiting
  async checkRateLimit(
    userId: string,
    action: string,
  ): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    resetTime: number;
  }> {
    const limitKey = `${userId}_${action}`;
    const now = Date.now();

    let limit = this.rateLimits.get(limitKey);
    const config =
      this.DEFAULT_LIMITS[action as keyof typeof this.DEFAULT_LIMITS];

    if (!config) {
      // Action non limitée
      return { allowed: true, remainingAttempts: -1, resetTime: 0 };
    }

    if (!limit) {
      // Première utilisation
      limit = {
        action,
        maxAttempts: config.maxAttempts,
        windowMs: config.windowMs,
        attempts: 1,
        resetTime: now + config.windowMs,
      };
    } else if (now > limit.resetTime) {
      // Fenêtre expirée, reset
      limit.attempts = 1;
      limit.resetTime = now + config.windowMs;
    } else {
      // Dans la fenêtre courante
      limit.attempts++;
    }

    this.rateLimits.set(limitKey, limit);
    await this.saveRateLimits();

    const allowed = limit.attempts <= limit.maxAttempts;
    const remainingAttempts = Math.max(0, limit.maxAttempts - limit.attempts);

    if (!allowed) {
      await this.createSecurityAlert({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        message: `Rate limit dépassé pour l'action ${action}`,
        userId,
        metadata: {
          action,
          attempts: limit.attempts,
          maxAttempts: limit.maxAttempts,
        },
      });
    }

    return {
      allowed,
      remainingAttempts,
      resetTime: limit.resetTime,
    };
  }

  // Détection de spam
  async detectSpam(
    content: string,
    userId: string,
  ): Promise<{
    isSpam: boolean;
    confidence: number;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    let spamScore = 0;

    // Détection basique de spam
    const spamPatterns = [
      /(.)\1{10,}/, // Répétition excessive de caractères
      /^[A-Z\s!]{20,}$/, // Tout en majuscules
      /(https?:\/\/[^\s]+)/gi, // URLs (suspectes en masse)
      /(\d{10,})/, // Numéros de téléphone
      /(buy now|click here|free money|win now)/gi, // Mots-clés spam
    ];

    spamPatterns.forEach((pattern, index) => {
      if (pattern.test(content)) {
        spamScore += [30, 25, 15, 20, 40][index];
        reasons.push(
          [
            'Répétition excessive de caractères',
            'Texte entièrement en majuscules',
            'URLs suspectes',
            'Numéro de téléphone détecté',
            'Mots-clés de spam détectés',
          ][index],
        );
      }
    });

    // Vérifier l'historique de l'utilisateur
    const trustScore = await this.getUserTrustScore(userId);
    if (trustScore.score < 30) {
      spamScore += 20;
      reasons.push('Score de confiance faible');
    }

    const isSpam = spamScore >= 50;
    const confidence = Math.min(spamScore / 100, 1);

    if (isSpam) {
      await this.createSecurityAlert({
        type: 'spam_detected',
        severity: confidence > 0.8 ? 'high' : 'medium',
        message: `Spam détecté avec ${Math.round(
          confidence * 100,
        )}% de confiance`,
        userId,
        metadata: { content, reasons, confidence },
      });
    }

    return { isSpam, confidence, reasons };
  }

  // Système de signalement
  async reportUser(
    reporterId: string,
    reportedUserId: string,
    reportType: UserReporting['reportType'],
    description: string,
    evidence?: string[],
  ): Promise<{ success: boolean; reportId?: string }> {
    try {
      // Vérifier le rate limit
      const rateLimitCheck = await this.checkRateLimit(
        reporterId,
        'report_user',
      );
      if (!rateLimitCheck.allowed) {
        return { success: false };
      }

      const report: UserReporting = {
        reportedUserId,
        reportType,
        description,
        reportedAt: new Date(),
        reporterId,
        status: 'pending',
        evidence,
      };

      const reports = await this.getAllReports();
      reports.push(report);
      await this.saveReports(reports);

      // Créer une alerte de sécurité
      await this.createSecurityAlert({
        type: 'suspicious_activity',
        severity: reportType === 'security' ? 'high' : 'medium',
        message: `Utilisateur signalé pour ${reportType}`,
        userId: reportedUserId,
        metadata: { reportType, reporterId },
      });

      // Mettre à jour le score de confiance
      await this.updateUserTrustScore(reportedUserId, -10);

      return { success: true, reportId: `${reportedUserId}_${Date.now()}` };
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      return { success: false };
    }
  }

  // Gestion des utilisateurs bloqués
  async blockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const blockedUsers = await this.getBlockedUsers(userId);
      if (!blockedUsers.includes(blockedUserId)) {
        blockedUsers.push(blockedUserId);
        await this.saveBlockedUsers(userId, blockedUsers);
      }
      return true;
    } catch (error) {
      console.error('Erreur lors du blocage:', error);
      return false;
    }
  }

  async unblockUser(userId: string, blockedUserId: string): Promise<boolean> {
    try {
      const blockedUsers = await this.getBlockedUsers(userId);
      const filteredUsers = blockedUsers.filter(id => id !== blockedUserId);
      await this.saveBlockedUsers(userId, filteredUsers);
      return true;
    } catch (error) {
      console.error('Erreur lors du déblocage:', error);
      return false;
    }
  }

  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    try {
      const blockedUsers = await this.getBlockedUsers(userId);
      return blockedUsers.includes(targetUserId);
    } catch (error) {
      console.error('Erreur lors de la vérification de blocage:', error);
      return false;
    }
  }

  // Score de confiance
  async getUserTrustScore(userId: string): Promise<UserTrustScore> {
    try {
      const scores = await this.getAllTrustScores();
      const existing = scores.find(s => s.userId === userId);

      if (existing) {
        return existing;
      }

      // Nouveau score par défaut
      const newScore: UserTrustScore = {
        userId,
        score: 50, // Score neutre
        factors: {
          accountAge: 0,
          messageCount: 0,
          reportCount: 0,
          verificationLevel: 0,
          behaviorScore: 50,
        },
        lastUpdated: new Date(),
      };

      scores.push(newScore);
      await this.saveTrustScores(scores);
      return newScore;
    } catch (error) {
      console.error('Erreur lors de la récupération du score:', error);
      return {
        userId,
        score: 50,
        factors: {
          accountAge: 0,
          messageCount: 0,
          reportCount: 0,
          verificationLevel: 0,
          behaviorScore: 50,
        },
        lastUpdated: new Date(),
      };
    }
  }

  async updateUserTrustScore(userId: string, delta: number): Promise<void> {
    try {
      const scores = await this.getAllTrustScores();
      const index = scores.findIndex(s => s.userId === userId);

      if (index >= 0) {
        scores[index].score = Math.max(
          0,
          Math.min(100, scores[index].score + delta),
        );
        scores[index].lastUpdated = new Date();
      } else {
        const currentScore = await this.getUserTrustScore(userId);
        currentScore.score = Math.max(
          0,
          Math.min(100, currentScore.score + delta),
        );
        currentScore.lastUpdated = new Date();
        scores.push(currentScore);
      }

      await this.saveTrustScores(scores);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du score:', error);
    }
  }

  // Alertes de sécurité
  async createSecurityAlert(
    alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>,
  ): Promise<string> {
    try {
      const newAlert: SecurityAlert = {
        ...alert,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        resolved: false,
      };

      const alerts = await this.getAllAlerts();
      alerts.push(newAlert);
      await this.saveAlerts(alerts);

      return newAlert.id;
    } catch (error) {
      console.error("Erreur lors de la création d'alerte:", error);
      return '';
    }
  }

  async getUnresolvedAlerts(): Promise<SecurityAlert[]> {
    try {
      const alerts = await this.getAllAlerts();
      return alerts.filter(alert => !alert.resolved);
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    try {
      const alerts = await this.getAllAlerts();
      const index = alerts.findIndex(alert => alert.id === alertId);

      if (index >= 0) {
        alerts[index].resolved = true;
        await this.saveAlerts(alerts);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la résolution d'alerte:", error);
      return false;
    }
  }

  // Méthodes de persistance
  private async loadConfiguration(): Promise<void> {
    try {
      const rateLimitsData = await SafeAsyncStorage.getItem(this.RATE_LIMITS_KEY);
      if (rateLimitsData) {
        const parsed = JSON.parse(rateLimitsData);
        Object.entries(parsed).forEach(([key, value]) => {
          this.rateLimits.set(key, value as RateLimit);
        });
      }

      const blockedUsersData = await SafeAsyncStorage.getItem(
        this.BLOCKED_USERS_KEY,
      );
      if (blockedUsersData) {
        this.blockedUsers = new Set(JSON.parse(blockedUsersData));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  }

  private async saveRateLimits(): Promise<void> {
    try {
      const data = Object.fromEntries(this.rateLimits);
      await SafeAsyncStorage.setItem(this.RATE_LIMITS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des rate limits:', error);
    }
  }

  private async getAllReports(): Promise<UserReporting[]> {
    try {
      const data = await SafeAsyncStorage.getItem(this.REPORTS_KEY);
      if (!data) {
        return [];
      }

      return JSON.parse(data).map((report: any) => ({
        ...report,
        reportedAt: new Date(report.reportedAt),
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des signalements:', error);
      return [];
    }
  }

  private async saveReports(reports: UserReporting[]): Promise<void> {
    try {
      await SafeAsyncStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des signalements:', error);
    }
  }

  private async getAllAlerts(): Promise<SecurityAlert[]> {
    try {
      const data = await SafeAsyncStorage.getItem(this.ALERTS_KEY);
      if (!data) {
        return [];
      }

      return JSON.parse(data).map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  private async saveAlerts(alerts: SecurityAlert[]): Promise<void> {
    try {
      await SafeAsyncStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des alertes:', error);
    }
  }

  private async getAllTrustScores(): Promise<UserTrustScore[]> {
    try {
      const data = await SafeAsyncStorage.getItem(this.TRUST_SCORES_KEY);
      if (!data) {
        return [];
      }

      return JSON.parse(data).map((score: any) => ({
        ...score,
        lastUpdated: new Date(score.lastUpdated),
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des scores:', error);
      return [];
    }
  }

  private async saveTrustScores(scores: UserTrustScore[]): Promise<void> {
    try {
      await SafeAsyncStorage.setItem(this.TRUST_SCORES_KEY, JSON.stringify(scores));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des scores:', error);
    }
  }

  private async getBlockedUsers(userId: string): Promise<string[]> {
    try {
      const data = await SafeAsyncStorage.getItem(
        `${this.BLOCKED_USERS_KEY}_${userId}`,
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des utilisateurs bloqués:',
        error,
      );
      return [];
    }
  }

  private async saveBlockedUsers(
    userId: string,
    blockedUsers: string[],
  ): Promise<void> {
    try {
      await SafeAsyncStorage.setItem(
        `${this.BLOCKED_USERS_KEY}_${userId}`,
        JSON.stringify(blockedUsers),
      );
    } catch (error) {
      console.error(
        'Erreur lors de la sauvegarde des utilisateurs bloqués:',
        error,
      );
    }
  }
}

export default SecurityService;

