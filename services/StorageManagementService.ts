import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export interface FileInfo {
  id: string;
  name: string;
  path: string;
  size: number;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  mimeType: string;
  createdAt: Date;
  lastAccessed: Date;
  conversationId?: string;
  isEncrypted: boolean;
  thumbnail?: string;
}

export interface StorageStats {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  fileCount: number;
  filesByType: {
    [key in FileInfo['type']]: {
      count: number;
      size: number;
    };
  };
  oldestFiles: FileInfo[];
  largestFiles: FileInfo[];
  duplicateFiles: FileInfo[][];
}

export interface StorageQuota {
  maxTotalSize: number; // en bytes
  maxFileSize: number; // en bytes
  warningThreshold: number; // pourcentage (ex: 0.8 pour 80%)
  autoCleanupEnabled: boolean;
  autoCleanupThreshold: number; // pourcentage (ex: 0.9 pour 90%)
  retentionDays: number; // jours avant auto-suppression
}

class StorageManagementService {
  private static instance: StorageManagementService;
  private readonly STORAGE_KEY = 'axiom_storage_data';
  private readonly QUOTA_KEY = 'axiom_storage_quota';
  private readonly FILES_DIR = `${RNFS.DocumentDirectoryPath}/axiom_files`;

  private constructor() {
    this.initializeStorageDirectory();
  }

  static getInstance(): StorageManagementService {
    if (!StorageManagementService.instance) {
      StorageManagementService.instance = new StorageManagementService();
    }
    return StorageManagementService.instance;
  }

  private async initializeStorageDirectory(): Promise<void> {
    try {
      const exists = await RNFS.exists(this.FILES_DIR);
      if (!exists) {
        await RNFS.mkdir(this.FILES_DIR);
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation du répertoire:", error);
    }
  }

  // Analyse complète du stockage
  async analyzeStorage(): Promise<StorageStats> {
    try {
      const files = await this.getAllFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const deviceInfo = await RNFS.getFSInfo();

      const filesByType: StorageStats['filesByType'] = {
        image: { count: 0, size: 0 },
        video: { count: 0, size: 0 },
        document: { count: 0, size: 0 },
        audio: { count: 0, size: 0 },
        other: { count: 0, size: 0 },
      };

      files.forEach(file => {
        filesByType[file.type].count++;
        filesByType[file.type].size += file.size;
      });

      // Fichiers les plus anciens (non accédés depuis longtemps)
      const oldestFiles = [...files]
        .sort((a, b) => a.lastAccessed.getTime() - b.lastAccessed.getTime())
        .slice(0, 10);

      // Fichiers les plus volumineux
      const largestFiles = [...files]
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);

      // Détection de doublons (par nom et taille)
      const duplicateFiles = this.findDuplicateFiles(files);

      return {
        totalSize,
        usedSize: totalSize,
        availableSize: deviceInfo.freeSpace,
        fileCount: files.length,
        filesByType,
        oldestFiles,
        largestFiles,
        duplicateFiles,
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse du stockage:", error);
      throw error;
    }
  }

  // Trouve les fichiers dupliqués
  private findDuplicateFiles(files: FileInfo[]): FileInfo[][] {
    const groups = new Map<string, FileInfo[]>();

    files.forEach(file => {
      const key = `${file.name}_${file.size}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(file);
    });

    return Array.from(groups.values()).filter(group => group.length > 1);
  }

  // Obtient tous les fichiers stockés
  async getAllFiles(): Promise<FileInfo[]> {
    try {
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (!storedData) return [];

      const files: FileInfo[] = JSON.parse(storedData).map((file: any) => ({
        ...file,
        createdAt: new Date(file.createdAt),
        lastAccessed: new Date(file.lastAccessed),
      }));

      // Vérifier que les fichiers existent toujours
      const existingFiles: FileInfo[] = [];
      for (const file of files) {
        const exists = await RNFS.exists(file.path);
        if (exists) {
          existingFiles.push(file);
        }
      }

      // Mettre à jour la liste si des fichiers ont été supprimés
      if (existingFiles.length !== files.length) {
        await this.saveFilesList(existingFiles);
      }

      return existingFiles;
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers:', error);
      return [];
    }
  }

  // Ajoute un nouveau fichier au registre
  async addFile(
    fileInfo: Omit<FileInfo, 'id' | 'createdAt' | 'lastAccessed'>,
  ): Promise<FileInfo> {
    try {
      const newFile: FileInfo = {
        ...fileInfo,
        id: this.generateFileId(),
        createdAt: new Date(),
        lastAccessed: new Date(),
      };

      const files = await this.getAllFiles();
      files.push(newFile);
      await this.saveFilesList(files);

      return newFile;
    } catch (error) {
      console.error("Erreur lors de l'ajout du fichier:", error);
      throw error;
    }
  }

  // Met à jour la date de dernier accès
  async updateLastAccessed(fileId: string): Promise<void> {
    try {
      const files = await this.getAllFiles();
      const fileIndex = files.findIndex(f => f.id === fileId);

      if (fileIndex !== -1) {
        files[fileIndex].lastAccessed = new Date();
        await this.saveFilesList(files);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'accès:", error);
    }
  }

  // Supprime des fichiers
  async deleteFiles(fileIds: string[]): Promise<void> {
    try {
      const files = await this.getAllFiles();
      const filesToDelete = files.filter(f => fileIds.includes(f.id));

      // Supprimer les fichiers physiques
      for (const file of filesToDelete) {
        const exists = await RNFS.exists(file.path);
        if (exists) {
          await RNFS.unlink(file.path);
        }
      }

      // Mettre à jour la liste
      const remainingFiles = files.filter(f => !fileIds.includes(f.id));
      await this.saveFilesList(remainingFiles);
    } catch (error) {
      console.error('Erreur lors de la suppression des fichiers:', error);
      throw error;
    }
  }

  // Nettoyage automatique intelligent
  async performIntelligentCleanup(): Promise<{
    deletedFiles: FileInfo[];
    spaceSaved: number;
  }> {
    try {
      const quota = await this.getStorageQuota();
      const stats = await this.analyzeStorage();

      if (!quota.autoCleanupEnabled) {
        return { deletedFiles: [], spaceSaved: 0 };
      }

      const usagePercentage = stats.usedSize / quota.maxTotalSize;

      if (usagePercentage < quota.autoCleanupThreshold) {
        return { deletedFiles: [], spaceSaved: 0 };
      }

      const filesToDelete: FileInfo[] = [];

      // 1. Supprimer les fichiers anciens
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - quota.retentionDays);

      const oldFiles = stats.oldestFiles.filter(
        file => file.lastAccessed < cutoffDate,
      );
      filesToDelete.push(...oldFiles);

      // 2. Supprimer les doublons (garder le plus récent)
      stats.duplicateFiles.forEach(duplicates => {
        const sorted = duplicates.sort(
          (a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime(),
        );
        filesToDelete.push(...sorted.slice(1)); // Garder le premier (plus récent)
      });

      const spaceSaved = filesToDelete.reduce(
        (sum, file) => sum + file.size,
        0,
      );

      if (filesToDelete.length > 0) {
        await this.deleteFiles(filesToDelete.map(f => f.id));
      }

      return { deletedFiles: filesToDelete, spaceSaved };
    } catch (error) {
      console.error('Erreur lors du nettoyage automatique:', error);
      throw error;
    }
  }

  // Gestion des quotas
  async getStorageQuota(): Promise<StorageQuota> {
    try {
      const storedQuota = await AsyncStorage.getItem(this.QUOTA_KEY);
      if (storedQuota) {
        return JSON.parse(storedQuota);
      }

      // Quota par défaut
      const defaultQuota: StorageQuota = {
        maxTotalSize: 5 * 1024 * 1024 * 1024, // 5 GB
        maxFileSize: 500 * 1024 * 1024, // 500 MB
        warningThreshold: 0.8, // 80%
        autoCleanupEnabled: true,
        autoCleanupThreshold: 0.9, // 90%
        retentionDays: 30, // 30 jours
      };

      await this.setStorageQuota(defaultQuota);
      return defaultQuota;
    } catch (error) {
      console.error('Erreur lors de la récupération du quota:', error);
      throw error;
    }
  }

  async setStorageQuota(quota: StorageQuota): Promise<void> {
    try {
      await AsyncStorage.setItem(this.QUOTA_KEY, JSON.stringify(quota));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du quota:', error);
      throw error;
    }
  }

  // Utilitaires privés
  private async saveFilesList(files: FileInfo[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la liste:', error);
      throw error;
    }
  }

  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Formatage utilitaire
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  static getFileTypeFromMimeType(mimeType: string): FileInfo['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (
      mimeType.startsWith('application/pdf') ||
      mimeType.startsWith('application/msword') ||
      mimeType.startsWith('application/vnd.openxmlformats') ||
      mimeType.startsWith('text/')
    )
      return 'document';
    return 'other';
  }
}

export default StorageManagementService;
