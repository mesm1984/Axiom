import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export interface TransferSession {
  id: string;
  fileName: string;
  fileSize: number;
  filePath: string;
  targetPath: string;
  progress: number;
  status:
    | 'pending'
    | 'active'
    | 'paused'
    | 'completed'
    | 'failed'
    | 'cancelled';
  startedAt: Date;
  lastResumedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  chunkSize: number;
  transferredBytes: number;
  sessionData?: any; // Données spécifiques au protocole (WebRTC, etc.)
  retryCount: number;
  maxRetries: number;
}

export interface TransferChunk {
  sessionId: string;
  chunkIndex: number;
  offset: number;
  size: number;
  hash: string;
  isTransferred: boolean;
  retryCount: number;
}

export interface TransferProgress {
  sessionId: string;
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  speed: number; // bytes per second
  eta: number; // seconds remaining
  chunksCompleted: number;
  totalChunks: number;
}

class TransferResumptionService {
  private static instance: TransferResumptionService;
  private readonly SESSIONS_KEY = 'axiom_transfer_sessions';
  private readonly CHUNKS_KEY = 'axiom_transfer_chunks';
  private readonly DEFAULT_CHUNK_SIZE = 64 * 1024; // 64KB chunks
  private readonly MAX_RETRIES = 3;

  private activeSessions = new Map<string, TransferSession>();
  private progressCallbacks = new Map<
    string,
    (progress: TransferProgress) => void
  >();
  private transferIntervals = new Map<string, NodeJS.Timeout>();

  private constructor() {
    this.loadActiveSessions();
  }

  static getInstance(): TransferResumptionService {
    if (!TransferResumptionService.instance) {
      TransferResumptionService.instance = new TransferResumptionService();
    }
    return TransferResumptionService.instance;
  }

  // Crée une nouvelle session de transfert
  async createTransferSession(
    fileName: string,
    fileSize: number,
    filePath: string,
    targetPath: string,
    chunkSize = this.DEFAULT_CHUNK_SIZE,
  ): Promise<TransferSession> {
    const session: TransferSession = {
      id: this.generateSessionId(),
      fileName,
      fileSize,
      filePath,
      targetPath,
      progress: 0,
      status: 'pending',
      startedAt: new Date(),
      chunkSize,
      transferredBytes: 0,
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    };

    // Calculer les chunks nécessaires
    const totalChunks = Math.ceil(fileSize / chunkSize);
    const chunks: TransferChunk[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const offset = i * chunkSize;
      const currentChunkSize = Math.min(chunkSize, fileSize - offset);

      chunks.push({
        sessionId: session.id,
        chunkIndex: i,
        offset,
        size: currentChunkSize,
        hash: '', // Sera calculé lors du transfert
        isTransferred: false,
        retryCount: 0,
      });
    }

    // Sauvegarder la session et les chunks
    await this.saveSession(session);
    await this.saveSessionChunks(session.id, chunks);

    this.activeSessions.set(session.id, session);

    return session;
  }

  // Reprend une session de transfert interrompue
  async resumeTransferSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        console.error(`Session ${sessionId} introuvable`);
        return false;
      }

      if (session.status === 'completed') {
        console.log(`Session ${sessionId} déjà terminée`);
        return true;
      }

      // Vérifier que le fichier source existe toujours
      const sourceExists = await RNFS.exists(session.filePath);
      if (!sourceExists) {
        session.status = 'failed';
        session.errorMessage = 'Fichier source introuvable';
        await this.saveSession(session);
        return false;
      }

      // Analyser les chunks déjà transférés
      const chunks = await this.getSessionChunks(sessionId);
      const transferredChunks = chunks.filter(chunk => chunk.isTransferred);

      session.transferredBytes = transferredChunks.reduce(
        (total, chunk) => total + chunk.size,
        0,
      );
      session.progress = (session.transferredBytes / session.fileSize) * 100;
      session.status = 'active';
      session.lastResumedAt = new Date();

      await this.saveSession(session);
      this.activeSessions.set(sessionId, session);

      console.log(
        `Session ${sessionId} reprise: ${session.progress.toFixed(1)}% (${
          transferredChunks.length
        }/${chunks.length} chunks)`,
      );

      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la reprise de session ${sessionId}:`,
        error,
      );
      return false;
    }
  }

  // Met à jour le progrès d'un chunk
  async updateChunkProgress(
    sessionId: string,
    chunkIndex: number,
    isCompleted: boolean,
    hash?: string,
  ): Promise<void> {
    try {
      const chunks = await this.getSessionChunks(sessionId);
      const chunk = chunks.find(c => c.chunkIndex === chunkIndex);

      if (!chunk) {
        console.error(
          `Chunk ${chunkIndex} introuvable pour session ${sessionId}`,
        );
        return;
      }

      chunk.isTransferred = isCompleted;
      if (hash) {
        chunk.hash = hash;
      }

      await this.saveSessionChunks(sessionId, chunks);

      // Mettre à jour la session
      const session = this.activeSessions.get(sessionId);
      if (session) {
        const transferredChunks = chunks.filter(c => c.isTransferred);
        session.transferredBytes = transferredChunks.reduce(
          (total, c) => total + c.size,
          0,
        );
        session.progress = (session.transferredBytes / session.fileSize) * 100;

        // Vérifier si le transfert est terminé
        if (transferredChunks.length === chunks.length) {
          session.status = 'completed';
          session.completedAt = new Date();
          this.stopTransferMonitoring(sessionId);
        }

        await this.saveSession(session);

        // Notifier du progrès
        this.notifyProgress(sessionId, session, chunks);
      }
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du chunk ${chunkIndex}:`,
        error,
      );
    }
  }

  // Obtient les chunks manquants pour une session
  async getMissingChunks(sessionId: string): Promise<TransferChunk[]> {
    const chunks = await this.getSessionChunks(sessionId);
    return chunks.filter(chunk => !chunk.isTransferred);
  }

  // Gestion des erreurs de transfert
  async handleTransferError(
    sessionId: string,
    error: string,
    chunkIndex?: number,
  ): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return false;
      }

      if (chunkIndex !== undefined) {
        // Erreur sur un chunk spécifique
        const chunks = await this.getSessionChunks(sessionId);
        const chunk = chunks.find(c => c.chunkIndex === chunkIndex);

        if (chunk) {
          chunk.retryCount++;
          if (chunk.retryCount >= this.MAX_RETRIES) {
            session.status = 'failed';
            session.errorMessage = `Échec du chunk ${chunkIndex} après ${this.MAX_RETRIES} tentatives`;
            this.stopTransferMonitoring(sessionId);
          }
          await this.saveSessionChunks(sessionId, chunks);
        }
      } else {
        // Erreur globale de session
        session.retryCount++;
        if (session.retryCount >= session.maxRetries) {
          session.status = 'failed';
          session.errorMessage = error;
          this.stopTransferMonitoring(sessionId);
        } else {
          session.status = 'paused';
          session.errorMessage = `Tentative ${session.retryCount}/${session.maxRetries}: ${error}`;
        }
      }

      await this.saveSession(session);
      return session.status !== 'failed';
    } catch (err) {
      console.error("Erreur lors de la gestion d'erreur:", err);
      return false;
    }
  }

  // Pause une session de transfert
  async pauseTransfer(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'active') {
      session.status = 'paused';
      await this.saveSession(session);
      this.stopTransferMonitoring(sessionId);
    }
  }

  // Annule une session de transfert
  async cancelTransfer(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'cancelled';
      await this.saveSession(session);
      this.stopTransferMonitoring(sessionId);

      // Supprimer le fichier partiel si il existe
      try {
        const exists = await RNFS.exists(session.targetPath);
        if (exists) {
          await RNFS.unlink(session.targetPath);
        }
      } catch (error) {
        console.warn('Impossible de supprimer le fichier partiel:', error);
      }
    }
  }

  // Obtient toutes les sessions actives
  async getActiveSessions(): Promise<TransferSession[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter(
      session =>
        session.status === 'active' ||
        session.status === 'paused' ||
        session.status === 'pending',
    );
  }

  // Nettoyage des sessions terminées anciennes
  async cleanupOldSessions(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const sessions = await this.getAllSessions();
    const cutoff = new Date(Date.now() - maxAge);

    const sessionsToDelete = sessions.filter(session => {
      const sessionDate = session.completedAt || session.startedAt;
      return (
        (session.status === 'completed' ||
          session.status === 'failed' ||
          session.status === 'cancelled') &&
        sessionDate < cutoff
      );
    });

    for (const session of sessionsToDelete) {
      await this.deleteSession(session.id);
    }

    return sessionsToDelete.length;
  }

  // Inscription aux notifications de progrès
  onProgress(
    sessionId: string,
    callback: (progress: TransferProgress) => void,
  ): void {
    this.progressCallbacks.set(sessionId, callback);
  }

  // Désinscription des notifications
  offProgress(sessionId: string): void {
    this.progressCallbacks.delete(sessionId);
  }

  // Méthodes privées
  private async loadActiveSessions(): Promise<void> {
    try {
      const sessions = await this.getActiveSessions();
      sessions.forEach(session => {
        this.activeSessions.set(session.id, session);
      });
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    }
  }

  private notifyProgress(
    sessionId: string,
    session: TransferSession,
    chunks: TransferChunk[],
  ): void {
    const callback = this.progressCallbacks.get(sessionId);
    if (!callback) {
      return;
    }

    const completedChunks = chunks.filter(c => c.isTransferred).length;
    const progress: TransferProgress = {
      sessionId,
      bytesTransferred: session.transferredBytes,
      totalBytes: session.fileSize,
      percentage: session.progress,
      speed: this.calculateTransferSpeed(sessionId),
      eta: this.calculateETA(sessionId),
      chunksCompleted: completedChunks,
      totalChunks: chunks.length,
    };

    callback(progress);
  }

  private calculateTransferSpeed(_sessionId: string): number {
    // Implémentation simplifiée - devrait calculer la vitesse basée sur l'historique
    return 0;
  }

  private calculateETA(_sessionId: string): number {
    // Implémentation simplifiée - devrait calculer le temps restant
    return 0;
  }

  private stopTransferMonitoring(sessionId: string): void {
    const interval = this.transferIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.transferIntervals.delete(sessionId);
    }
  }

  private generateSessionId(): string {
    return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Méthodes de persistance
  private async saveSession(session: TransferSession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const index = sessions.findIndex(s => s.id === session.id);

      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }

      await AsyncStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de session:', error);
    }
  }

  private async getSession(sessionId: string): Promise<TransferSession | null> {
    try {
      const sessions = await this.getAllSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de session:', error);
      return null;
    }
  }

  private async getAllSessions(): Promise<TransferSession[]> {
    try {
      const data = await AsyncStorage.getItem(this.SESSIONS_KEY);
      if (!data) {
        return [];
      }

      return JSON.parse(data).map((session: any) => ({
        ...session,
        startedAt: new Date(session.startedAt),
        lastResumedAt: session.lastResumedAt
          ? new Date(session.lastResumedAt)
          : undefined,
        completedAt: session.completedAt
          ? new Date(session.completedAt)
          : undefined,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
      return [];
    }
  }

  private async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      const filteredSessions = sessions.filter(s => s.id !== sessionId);
      await AsyncStorage.setItem(
        this.SESSIONS_KEY,
        JSON.stringify(filteredSessions),
      );

      // Supprimer aussi les chunks
      await AsyncStorage.removeItem(`${this.CHUNKS_KEY}_${sessionId}`);

      // Nettoyer les références locales
      this.activeSessions.delete(sessionId);
      this.progressCallbacks.delete(sessionId);
      this.stopTransferMonitoring(sessionId);
    } catch (error) {
      console.error('Erreur lors de la suppression de session:', error);
    }
  }

  private async saveSessionChunks(
    sessionId: string,
    chunks: TransferChunk[],
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.CHUNKS_KEY}_${sessionId}`,
        JSON.stringify(chunks),
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des chunks:', error);
    }
  }

  private async getSessionChunks(sessionId: string): Promise<TransferChunk[]> {
    try {
      const data = await AsyncStorage.getItem(
        `${this.CHUNKS_KEY}_${sessionId}`,
      );
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des chunks:', error);
      return [];
    }
  }
}

export default TransferResumptionService;
