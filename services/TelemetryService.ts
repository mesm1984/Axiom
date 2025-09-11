/**
 * Service de télémétrie respectant la vie privée
 * Collecte de métriques anonymes avec consentement explicite (opt-in uniquement)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Types pour la télémétrie
export interface TelemetryEvent {
  event: string;
  category: 'performance' | 'usage' | 'error' | 'security';
  timestamp: number;
  sessionId: string;
  data?: Record<string, any>;
}

export interface TelemetryConfig {
  enabled: boolean;
  collectPerformance: boolean;
  collectUsage: boolean;
  collectErrors: boolean;
  collectSecurity: boolean;
  uploadInterval: number; // en minutes
  maxStoredEvents: number;
  anonymousUserId?: string;
}

export interface PerformanceMetrics {
  appStartTime?: number;
  screenLoadTime?: number;
  transferSpeed?: number;
  memoryUsage?: number;
  cpuUsage?: number;
  batteryLevel?: number;
  networkType?: string;
}

export interface UsageMetrics {
  feature: string;
  action: string;
  duration?: number;
  success: boolean;
}

export interface ErrorMetrics {
  errorType: string;
  errorMessage?: string;
  stackTrace?: string;
  context?: string;
}

export interface SecurityMetrics {
  eventType: 'encryption' | 'authentication' | 'p2p_connection';
  success: boolean;
  duration?: number;
}

class TelemetryService {
  private static instance: TelemetryService;
  private config: TelemetryConfig;
  private sessionId: string;
  private sessionStartTime: number;
  private eventQueue: TelemetryEvent[] = [];
  private uploadTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    
    // Configuration par défaut (télémétrie désactivée)
    this.config = {
      enabled: false,
      collectPerformance: true,
      collectUsage: true,
      collectErrors: true,
      collectSecurity: false, // Plus sensible, désactivé par défaut
      uploadInterval: 60, // 1 heure
      maxStoredEvents: 1000,
    };

    this.loadConfiguration();
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Génère un ID de session unique et anonyme
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Génère un ID utilisateur anonyme permanent
   */
  private generateAnonymousUserId(): string {
    return `user_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
  }

  /**
   * Charge la configuration depuis le stockage local
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const savedConfig = await AsyncStorage.getItem('telemetry_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      // Générer un ID utilisateur anonyme s'il n'existe pas
      if (!this.config.anonymousUserId) {
        this.config.anonymousUserId = this.generateAnonymousUserId();
        await this.saveConfiguration();
      }

      // Charger les événements en attente
      await this.loadStoredEvents();

      // Démarrer l'upload automatique si activé
      if (this.config.enabled) {
        this.startUploadTimer();
      }

    } catch (error) {
      console.warn('[Télémétrie] Erreur lors du chargement de la configuration:', error);
    }
  }

  /**
   * Sauvegarde la configuration
   */
  private async saveConfiguration(): Promise<void> {
    try {
      await AsyncStorage.setItem('telemetry_config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('[Télémétrie] Erreur lors de la sauvegarde de la configuration:', error);
    }
  }

  /**
   * Charge les événements stockés localement
   */
  private async loadStoredEvents(): Promise<void> {
    try {
      const storedEvents = await AsyncStorage.getItem('telemetry_events');
      if (storedEvents) {
        this.eventQueue = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.warn('[Télémétrie] Erreur lors du chargement des événements:', error);
    }
  }

  /**
   * Sauvegarde les événements localement
   */
  private async saveStoredEvents(): Promise<void> {
    try {
      // Limiter le nombre d'événements stockés
      if (this.eventQueue.length > this.config.maxStoredEvents) {
        this.eventQueue = this.eventQueue.slice(-this.config.maxStoredEvents);
      }
      
      await AsyncStorage.setItem('telemetry_events', JSON.stringify(this.eventQueue));
    } catch (error) {
      console.warn('[Télémétrie] Erreur lors de la sauvegarde des événements:', error);
    }
  }

  /**
   * Active ou désactive la télémétrie avec consentement explicite
   */
  public async setTelemetryEnabled(enabled: boolean): Promise<void> {
    this.config.enabled = enabled;
    await this.saveConfiguration();

    if (enabled) {
      this.startUploadTimer();
      console.log('[Télémétrie] Télémétrie activée avec consentement utilisateur');
    } else {
      this.stopUploadTimer();
      // Supprimer tous les événements stockés si désactivé
      await this.clearStoredEvents();
      console.log('[Télémétrie] Télémétrie désactivée - données supprimées');
    }
  }

  /**
   * Configure les types de données à collecter
   */
  public async configureTelemetry(config: Partial<TelemetryConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.saveConfiguration();
    
    if (this.config.enabled) {
      this.startUploadTimer();
    }
  }

  /**
   * Enregistre un événement de performance
   */
  public trackPerformance(metrics: PerformanceMetrics): void {
    if (!this.config.enabled || !this.config.collectPerformance) {
      return;
    }

    this.addEvent({
      event: 'performance_metric',
      category: 'performance',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {
        ...metrics,
        platform: Platform.OS,
        sessionDuration: Date.now() - this.sessionStartTime,
      },
    });
  }

  /**
   * Enregistre un événement d'usage
   */
  public trackUsage(metrics: UsageMetrics): void {
    if (!this.config.enabled || !this.config.collectUsage) {
      return;
    }

    this.addEvent({
      event: 'usage_metric',
      category: 'usage',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {
        ...metrics,
        platform: Platform.OS,
      },
    });
  }

  /**
   * Enregistre un événement d'erreur
   */
  public trackError(metrics: ErrorMetrics): void {
    if (!this.config.enabled || !this.config.collectErrors) {
      return;
    }

    this.addEvent({
      event: 'error_metric',
      category: 'error',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {
        ...metrics,
        platform: Platform.OS,
        // Anonymiser les informations sensibles dans les stack traces
        stackTrace: metrics.stackTrace ? this.anonymizeStackTrace(metrics.stackTrace) : undefined,
      },
    });
  }

  /**
   * Enregistre un événement de sécurité
   */
  public trackSecurity(metrics: SecurityMetrics): void {
    if (!this.config.enabled || !this.config.collectSecurity) {
      return;
    }

    this.addEvent({
      event: 'security_metric',
      category: 'security',
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: {
        ...metrics,
        platform: Platform.OS,
      },
    });
  }

  /**
   * Enregistre le démarrage de l'application
   */
  public trackAppStart(startTime: number): void {
    this.trackPerformance({
      appStartTime: Date.now() - startTime,
    });

    this.trackUsage({
      feature: 'app',
      action: 'start',
      success: true,
    });
  }

  /**
   * Enregistre le changement d'écran
   */
  public trackScreenNavigation(screenName: string, loadTime?: number): void {
    this.trackUsage({
      feature: 'navigation',
      action: `screen_${screenName}`,
      duration: loadTime,
      success: true,
    });

    if (loadTime) {
      this.trackPerformance({
        screenLoadTime: loadTime,
      });
    }
  }

  /**
   * Enregistre l'utilisation d'une fonctionnalité
   */
  public trackFeatureUsage(feature: string, action: string, success: boolean = true, duration?: number): void {
    this.trackUsage({
      feature,
      action,
      success,
      duration,
    });
  }

  /**
   * Enregistre les métriques de transfert P2P
   */
  public trackP2PTransfer(success: boolean, fileSize: number, duration: number, speed: number): void {
    this.trackUsage({
      feature: 'p2p_transfer',
      action: success ? 'transfer_success' : 'transfer_failed',
      success,
      duration,
    });

    this.trackPerformance({
      transferSpeed: speed,
    });

    this.trackSecurity({
      eventType: 'p2p_connection',
      success,
      duration,
    });
  }

  /**
   * Enregistre les métriques de chiffrement
   */
  public trackEncryption(operation: 'encrypt' | 'decrypt', success: boolean, duration: number): void {
    this.trackSecurity({
      eventType: 'encryption',
      success,
      duration,
    });

    this.trackPerformance({
      // Pas de détails sensibles, juste les performances
    });
  }

  /**
   * Anonymise les stack traces pour supprimer les informations sensibles
   */
  private anonymizeStackTrace(stackTrace: string): string {
    return stackTrace
      .replace(/\/Users\/[^\/]+/g, '/Users/[ANONYMIZED]')
      .replace(/\/home\/[^\/]+/g, '/home/[ANONYMIZED]')
      .replace(/C:\\Users\\[^\\]+/g, 'C:\\Users\\[ANONYMIZED]')
      .replace(/file:\/\/\/.*?\//g, 'file://[ANONYMIZED]/')
      .replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, '[IP_ANONYMIZED]');
  }

  /**
   * Ajoute un événement à la queue
   */
  private addEvent(event: TelemetryEvent): void {
    this.eventQueue.push(event);
    this.saveStoredEvents();

    // Upload automatique si la queue devient trop pleine
    if (this.eventQueue.length >= 100) {
      this.uploadEvents();
    }
  }

  /**
   * Démarre le timer d'upload automatique
   */
  private startUploadTimer(): void {
    this.stopUploadTimer();
    
    const intervalMs = this.config.uploadInterval * 60 * 1000; // Convertir en millisecondes
    this.uploadTimer = setInterval(() => {
      this.uploadEvents();
    }, intervalMs);
  }

  /**
   * Arrête le timer d'upload automatique
   */
  private stopUploadTimer(): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
      this.uploadTimer = null;
    }
  }

  /**
   * Upload les événements vers le serveur de télémétrie
   */
  private async uploadEvents(): Promise<void> {
    if (!this.config.enabled || this.eventQueue.length === 0) {
      return;
    }

    try {
      // En production, remplacer par votre endpoint de télémétrie
      const TELEMETRY_ENDPOINT = 'https://telemetry.axiom-app.com/events';
      
      const payload = {
        anonymousUserId: this.config.anonymousUserId,
        sessionId: this.sessionId,
        appVersion: '1.0.0', // À récupérer dynamiquement
        platform: Platform.OS,
        events: this.eventQueue,
      };

      const response = await fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Axiom-App/1.0.0',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log(`[Télémétrie] ${this.eventQueue.length} événements uploadés avec succès`);
        this.eventQueue = []; // Vider la queue après upload réussi
        await this.saveStoredEvents();
      } else {
        console.warn('[Télémétrie] Échec upload - code:', response.status);
      }

    } catch (error) {
      console.warn('[Télémétrie] Erreur lors de l\'upload:', error);
      // Les événements restent en queue pour retry ultérieur
    }
  }

  /**
   * Upload manuel des événements
   */
  public async uploadEventsNow(): Promise<boolean> {
    try {
      await this.uploadEvents();
      return this.eventQueue.length === 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Supprime tous les événements stockés
   */
  public async clearStoredEvents(): Promise<void> {
    this.eventQueue = [];
    try {
      await AsyncStorage.removeItem('telemetry_events');
    } catch (error) {
      console.warn('[Télémétrie] Erreur lors de la suppression des événements:', error);
    }
  }

  /**
   * Obtient les statistiques de la télémétrie
   */
  public getTelemetryStats(): {
    enabled: boolean;
    eventCount: number;
    sessionId: string;
    sessionDuration: number;
    config: TelemetryConfig;
  } {
    return {
      enabled: this.config.enabled,
      eventCount: this.eventQueue.length,
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStartTime,
      config: { ...this.config },
    };
  }

  /**
   * Exporte les données de télémétrie pour l'utilisateur (RGPD)
   */
  public async exportUserData(): Promise<{
    config: TelemetryConfig;
    events: TelemetryEvent[];
    statistics: any;
  }> {
    return {
      config: { ...this.config },
      events: [...this.eventQueue],
      statistics: this.getTelemetryStats(),
    };
  }

  /**
   * Supprime toutes les données de télémétrie (RGPD)
   */
  public async deleteAllUserData(): Promise<void> {
    await this.clearStoredEvents();
    this.config = {
      enabled: false,
      collectPerformance: true,
      collectUsage: true,
      collectErrors: true,
      collectSecurity: false,
      uploadInterval: 60,
      maxStoredEvents: 1000,
    };
    await this.saveConfiguration();
    this.stopUploadTimer();
    console.log('[Télémétrie] Toutes les données utilisateur supprimées');
  }

  /**
   * Obtient la configuration actuelle
   */
  public getConfiguration(): TelemetryConfig {
    return { ...this.config };
  }

  /**
   * Méthode pour tester la télémétrie en mode développement
   */
  public async debugTelemetry(): Promise<any> {
    return {
      config: this.config,
      eventCount: this.eventQueue.length,
      events: this.eventQueue.slice(-10), // Derniers 10 événements
      sessionInfo: {
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        duration: Date.now() - this.sessionStartTime,
      },
    };
  }
}

export default TelemetryService;
