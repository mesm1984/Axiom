/**
 * Service d'optimisation des performances pour Axiom
 *
 * Fonctionnalités :
 * - Optimisation pour appareils bas de gamme
 * - Gestion intelligente de la mémoire
 * - Monitoring des performances en temps réel
 * - Adaptation automatique de la qualité
 * - Détection des limitations matérielles
 *
 * @version 1.0.0
 * @author Axiom Team
 */

import { Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types et interfaces
export interface DeviceCapabilities {
  ram: number; // MB
  cpuCores: number;
  gpuTier: 'low' | 'medium' | 'high';
  screenDensity: number;
  networkSpeed: 'slow' | 'medium' | 'fast';
  batteryOptimized: boolean;
}

export interface PerformanceProfile {
  level: 'potato' | 'low' | 'medium' | 'high' | 'ultra';
  animationsEnabled: boolean;
  maxConcurrentTransfers: number;
  chunkSize: number; // KB
  compressionLevel: number; // 0-9
  cacheSize: number; // MB
  preloadMessages: number;
  backgroundProcessing: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number; // MB
  cpuUsage: number; // %
  networkLatency: number; // ms
  renderTime: number; // ms
  gcCount: number;
  timestamp: number;
}

export interface OptimizationSettings {
  autoAdjustQuality: boolean;
  preserveBattery: boolean;
  reducedMotion: boolean;
  dataCompression: boolean;
  backgroundSync: boolean;
  adaptiveQuality: boolean;
}

// Classes d'erreur
export class PerformanceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PerformanceError';
  }
}

/**
 * Service d'optimisation des performances pour tous les appareils
 */
class PerformanceOptimizationService {
  private deviceCapabilities: DeviceCapabilities | null = null;
  private currentProfile: PerformanceProfile | null = null;
  private metricsHistory: PerformanceMetrics[] = [];
  private settings: OptimizationSettings = {
    autoAdjustQuality: true,
    preserveBattery: false,
    reducedMotion: false,
    dataCompression: true,
    backgroundSync: true,
    adaptiveQuality: true,
  };

  private listeners: Set<(metrics: PerformanceMetrics) => void> = new Set();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastGcCount = 0;

  constructor() {
    this.initializeService();
  }

  // Initialisation du service
  private async initializeService(): Promise<void> {
    try {
      await this.loadSettings();
      await this.detectDeviceCapabilities();
      await this.selectOptimalProfile();
      this.startPerformanceMonitoring();
    } catch (error) {
      console.error("Erreur lors de l'initialisation des performances:", error);
    }
  }

  // Détection des capacités de l'appareil
  private async detectDeviceCapabilities(): Promise<DeviceCapabilities> {
    const screenData = Dimensions.get('screen');

    const capabilities: DeviceCapabilities = {
      ram: await this.estimateRAM(),
      cpuCores: await this.estimateCPUCores(),
      gpuTier: await this.estimateGPUTier(),
      screenDensity: screenData.scale,
      networkSpeed: await this.estimateNetworkSpeed(),
      batteryOptimized: this.settings.preserveBattery,
    };

    this.deviceCapabilities = capabilities;
    await this.storeDeviceCapabilities(capabilities);
    return capabilities;
  }

  // Estimation de la RAM disponible
  private async estimateRAM(): Promise<number> {
    try {
      if (Platform.OS === 'android') {
        // Sur Android, on peut estimer selon la densité d'écran et l'année
        const { scale } = Dimensions.get('screen');
        if (scale <= 1.5) {
          return 1024; // Appareils bas de gamme
        }
        if (scale <= 2.5) {
          return 2048; // Appareils moyens
        }
        if (scale <= 3.5) {
          return 4096; // Appareils haut de gamme
        }
        return 6144; // Appareils premium
      } else {
        // Sur iOS, estimation selon le modèle (approximation)
        const { height, width, scale } = Dimensions.get('screen');
        const totalPixels = height * width * scale;

        if (totalPixels < 1000000) {
          return 1024; // iPhone ancien
        }
        if (totalPixels < 2000000) {
          return 2048; // iPhone standard
        }
        if (totalPixels < 3000000) {
          return 4096; // iPhone récent
        }
        return 6144; // iPhone Pro/Max
      }
    } catch {
      return 2048; // Valeur par défaut conservatrice
    }
  }

  // Estimation du nombre de cœurs CPU
  private async estimateCPUCores(): Promise<number> {
    try {
      // Estimation basée sur les performances de rendering
      const startTime = performance.now();

      // Test de charge CPU simple
      for (let i = 0; i < 100000; i++) {
        Math.sqrt(i);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Plus c'est rapide, plus on a de cœurs probablement
      if (duration < 10) {
        return 8; // Très rapide
      }
      if (duration < 20) {
        return 6; // Rapide
      }
      if (duration < 30) {
        return 4; // Moyen
      }
      if (duration < 50) {
        return 2; // Lent
      }
      return 1; // Très lent
    } catch {
      return 4; // Valeur par défaut moderne
    }
  }

  // Estimation du niveau GPU
  private async estimateGPUTier(): Promise<'low' | 'medium' | 'high'> {
    try {
      const { height, width, scale } = Dimensions.get('screen');
      const totalPixels = height * width * scale;
      const pixelDensity = totalPixels / (height * width);

      // Test de rendu pour estimer les performances GPU
      const renderStart = performance.now();

      // Simulation d'une animation complexe
      await new Promise(resolve => {
        let frame = 0;
        const animate = () => {
          frame++;
          if (frame < 60) {
            requestAnimationFrame(animate);
          } else {
            resolve(undefined);
          }
        };
        requestAnimationFrame(animate);
      });

      const renderTime = performance.now() - renderStart;

      // Classification basée sur la performance de rendu et la résolution
      if (pixelDensity > 3 && renderTime < 1000) {
        return 'high';
      }
      if (pixelDensity > 2 && renderTime < 1500) {
        return 'medium';
      }
      return 'low';
    } catch {
      return 'medium'; // Valeur par défaut
    }
  }

  // Estimation de la vitesse réseau
  private async estimateNetworkSpeed(): Promise<'slow' | 'medium' | 'fast'> {
    try {
      const startTime = performance.now();

      // Test de latence avec un petit payload
      const response = await fetch('data:text/plain;base64,SGVsbG8gV29ybGQ=', {
        method: 'GET',
        cache: 'no-cache',
      });

      await response.text();
      const latency = performance.now() - startTime;

      if (latency < 100) {
        return 'fast';
      }
      if (latency < 300) {
        return 'medium';
      }
      return 'slow';
    } catch {
      return 'medium'; // Valeur par défaut
    }
  }

  // Sélection du profil optimal
  private async selectOptimalProfile(): Promise<PerformanceProfile> {
    if (!this.deviceCapabilities) {
      throw new PerformanceError(
        "Capacités de l'appareil non détectées",
        'NO_CAPABILITIES',
      );
    }

    const caps = this.deviceCapabilities;
    let profile: PerformanceProfile;

    // Profil "potato" pour les appareils très anciens
    if (caps.ram <= 1024 && caps.cpuCores <= 2 && caps.gpuTier === 'low') {
      profile = {
        level: 'potato',
        animationsEnabled: false,
        maxConcurrentTransfers: 1,
        chunkSize: 64, // KB
        compressionLevel: 9,
        cacheSize: 10, // MB
        preloadMessages: 5,
        backgroundProcessing: false,
      };
    }
    // Profil "low" pour les appareils bas de gamme
    else if (caps.ram <= 2048 && caps.gpuTier === 'low') {
      profile = {
        level: 'low',
        animationsEnabled: !this.settings.reducedMotion,
        maxConcurrentTransfers: 2,
        chunkSize: 128,
        compressionLevel: 7,
        cacheSize: 25,
        preloadMessages: 10,
        backgroundProcessing: false,
      };
    }
    // Profil "medium" pour les appareils moyens
    else if (caps.ram <= 4096 && caps.cpuCores <= 6) {
      profile = {
        level: 'medium',
        animationsEnabled: true,
        maxConcurrentTransfers: 3,
        chunkSize: 256,
        compressionLevel: 5,
        cacheSize: 50,
        preloadMessages: 20,
        backgroundProcessing: true,
      };
    }
    // Profil "high" pour les appareils performants
    else if (caps.ram <= 6144) {
      profile = {
        level: 'high',
        animationsEnabled: true,
        maxConcurrentTransfers: 5,
        chunkSize: 512,
        compressionLevel: 3,
        cacheSize: 100,
        preloadMessages: 50,
        backgroundProcessing: true,
      };
    }
    // Profil "ultra" pour les appareils premium
    else {
      profile = {
        level: 'ultra',
        animationsEnabled: true,
        maxConcurrentTransfers: 8,
        chunkSize: 1024,
        compressionLevel: 1,
        cacheSize: 200,
        preloadMessages: 100,
        backgroundProcessing: true,
      };
    }

    // Ajustements selon les préférences utilisateur
    if (this.settings.preserveBattery) {
      profile.maxConcurrentTransfers = Math.max(
        1,
        Math.floor(profile.maxConcurrentTransfers / 2),
      );
      profile.backgroundProcessing = false;
      profile.compressionLevel = Math.min(9, profile.compressionLevel + 2);
    }

    if (this.settings.reducedMotion) {
      profile.animationsEnabled = false;
    }

    this.currentProfile = profile;
    await this.storeProfile(profile);
    return profile;
  }

  // Démarrage du monitoring des performances
  private startPerformanceMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000); // Collecte toutes les 5 secondes
  }

  // Collecte des métriques de performance
  private async collectMetrics(): Promise<PerformanceMetrics> {
    const startTime = performance.now();

    const metrics: PerformanceMetrics = {
      fps: await this.measureFPS(),
      memoryUsage: await this.measureMemoryUsage(),
      cpuUsage: await this.measureCPUUsage(),
      networkLatency: await this.measureNetworkLatency(),
      renderTime: performance.now() - startTime,
      gcCount: await this.getGCCount(),
      timestamp: Date.now(),
    };

    // Conserver seulement les 100 dernières métriques
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift();
    }

    // Ajustement automatique si activé
    if (this.settings.autoAdjustQuality) {
      await this.adjustProfileBasedOnMetrics(metrics);
    }

    // Notifier les listeners
    this.notifyListeners(metrics);

    return metrics;
  }

  // Mesure du FPS
  private async measureFPS(): Promise<number> {
    return new Promise(resolve => {
      let frames = 0;
      const startTime = performance.now();

      const countFrames = () => {
        frames++;
        const elapsed = performance.now() - startTime;

        if (elapsed >= 1000) {
          resolve(frames);
        } else {
          requestAnimationFrame(countFrames);
        }
      };

      requestAnimationFrame(countFrames);
    });
  }

  // Mesure de l'utilisation mémoire
  private async measureMemoryUsage(): Promise<number> {
    try {
      // Estimation approximative basée sur le profil et l'historique
      if (this.currentProfile) {
        const baseUsage = this.currentProfile.cacheSize;
        const dynamicUsage = this.metricsHistory.length * 0.1; // 0.1MB par métrique
        return baseUsage + dynamicUsage;
      }
      return 50; // Estimation par défaut
    } catch {
      return 50;
    }
  }

  // Mesure de l'utilisation CPU
  private async measureCPUUsage(): Promise<number> {
    try {
      const startTime = performance.now();

      // Test de charge CPU standardisé
      let iterations = 0;
      const targetTime = 50; // 50ms de test

      while (performance.now() - startTime < targetTime) {
        Math.sqrt(iterations++);
      }

      const actualTime = performance.now() - startTime;
      const efficiency = targetTime / actualTime;

      // Conversion en pourcentage d'utilisation (inversé)
      return Math.max(0, Math.min(100, (1 - efficiency) * 100));
    } catch {
      return 30; // Valeur par défaut
    }
  }

  // Mesure de la latence réseau
  private async measureNetworkLatency(): Promise<number> {
    try {
      const startTime = performance.now();
      await fetch('data:text/plain;base64,dGVzdA==');
      return performance.now() - startTime;
    } catch {
      return 200; // Valeur par défaut
    }
  }

  // Comptage des garbage collections
  private async getGCCount(): Promise<number> {
    // Estimation approximative basée sur l'utilisation mémoire
    const currentMemory = await this.measureMemoryUsage();
    if (currentMemory > (this.deviceCapabilities?.ram || 2048) * 0.7) {
      this.lastGcCount++;
    }
    return this.lastGcCount;
  }

  // Ajustement automatique du profil
  private async adjustProfileBasedOnMetrics(
    metrics: PerformanceMetrics,
  ): Promise<void> {
    if (!this.currentProfile || !this.deviceCapabilities) {
      return;
    }

    const profile = this.currentProfile;
    let needsUpdate = false;

    // Si FPS trop bas, réduire la qualité
    if (metrics.fps < 30 && profile.level !== 'potato') {
      if (profile.animationsEnabled) {
        profile.animationsEnabled = false;
        needsUpdate = true;
      } else if (profile.maxConcurrentTransfers > 1) {
        profile.maxConcurrentTransfers--;
        needsUpdate = true;
      }
    }

    // Si FPS correct et utilisation faible, augmenter la qualité
    else if (
      metrics.fps > 55 &&
      metrics.cpuUsage < 50 &&
      profile.level !== 'ultra'
    ) {
      if (!profile.animationsEnabled && !this.settings.reducedMotion) {
        profile.animationsEnabled = true;
        needsUpdate = true;
      } else if (profile.maxConcurrentTransfers < 8) {
        profile.maxConcurrentTransfers++;
        needsUpdate = true;
      }
    }

    // Si mémoire critique, réduire le cache
    if (metrics.memoryUsage > this.deviceCapabilities.ram * 0.8) {
      profile.cacheSize = Math.max(10, profile.cacheSize * 0.8);
      profile.preloadMessages = Math.max(5, profile.preloadMessages * 0.8);
      needsUpdate = true;
    }

    if (needsUpdate) {
      await this.storeProfile(profile);
      console.log(`Profil ajusté automatiquement: ${profile.level}`, profile);
    }
  }

  // API publique

  // Obtenir les capacités de l'appareil
  getDeviceCapabilities(): DeviceCapabilities | null {
    return this.deviceCapabilities;
  }

  // Obtenir le profil de performance actuel
  getCurrentProfile(): PerformanceProfile | null {
    return this.currentProfile;
  }

  // Obtenir les métriques actuelles
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metricsHistory[this.metricsHistory.length - 1] || null;
  }

  // Obtenir l'historique des métriques
  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  // Forcer une réévaluation du profil
  async recalibrateProfile(): Promise<PerformanceProfile> {
    await this.detectDeviceCapabilities();
    return await this.selectOptimalProfile();
  }

  // Définir un profil personnalisé
  async setCustomProfile(profile: Partial<PerformanceProfile>): Promise<void> {
    if (!this.currentProfile) {
      throw new PerformanceError(
        'Aucun profil de base défini',
        'NO_BASE_PROFILE',
      );
    }

    this.currentProfile = { ...this.currentProfile, ...profile };
    await this.storeProfile(this.currentProfile);
  }

  // Gestion des paramètres d'optimisation
  async updateSettings(
    newSettings: Partial<OptimizationSettings>,
  ): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.storeSettings();

    // Recalibrer le profil si nécessaire
    if (
      newSettings.preserveBattery !== undefined ||
      newSettings.reducedMotion !== undefined
    ) {
      await this.selectOptimalProfile();
    }
  }

  getSettings(): OptimizationSettings {
    return { ...this.settings };
  }

  // Système d'écoute des métriques
  onMetricsUpdate(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(metrics: PerformanceMetrics): void {
    this.listeners.forEach(listener => {
      try {
        listener(metrics);
      } catch (error) {
        console.error('Erreur dans listener de performance:', error);
      }
    });
  }

  // Recommandations pour l'utilisateur
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const currentMetrics = this.getCurrentMetrics();
    const profile = this.getCurrentProfile();

    if (!currentMetrics || !profile) {
      return recommendations;
    }

    if (currentMetrics.fps < 30) {
      recommendations.push(
        'Désactivez les animations pour améliorer la fluidité',
      );
    }

    if (
      currentMetrics.memoryUsage >
      (this.deviceCapabilities?.ram || 2048) * 0.7
    ) {
      recommendations.push('Videz le cache pour libérer de la mémoire');
    }

    if (profile.level === 'potato' || profile.level === 'low') {
      recommendations.push(
        'Fermez les autres applications pour de meilleures performances',
      );
    }

    if (currentMetrics.networkLatency > 500) {
      recommendations.push('Vérifiez votre connexion internet');
    }

    if (!this.settings.dataCompression) {
      recommendations.push(
        'Activez la compression pour économiser de la bande passante',
      );
    }

    return recommendations;
  }

  // Nettoyage des ressources
  dispose(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.listeners.clear();
    this.metricsHistory = [];
  }

  // Méthodes de stockage privées
  private async storeDeviceCapabilities(
    capabilities: DeviceCapabilities,
  ): Promise<void> {
    await AsyncStorage.setItem(
      'axiom_device_capabilities',
      JSON.stringify(capabilities),
    );
  }

  private async loadDeviceCapabilities(): Promise<DeviceCapabilities | null> {
    const stored = await AsyncStorage.getItem('axiom_device_capabilities');
    return stored ? JSON.parse(stored) : null;
  }

  private async storeProfile(profile: PerformanceProfile): Promise<void> {
    await AsyncStorage.setItem(
      'axiom_performance_profile',
      JSON.stringify(profile),
    );
  }

  private async loadProfile(): Promise<PerformanceProfile | null> {
    const stored = await AsyncStorage.getItem('axiom_performance_profile');
    return stored ? JSON.parse(stored) : null;
  }

  private async storeSettings(): Promise<void> {
    await AsyncStorage.setItem(
      'axiom_optimization_settings',
      JSON.stringify(this.settings),
    );
  }

  private async loadSettings(): Promise<void> {
    const stored = await AsyncStorage.getItem('axiom_optimization_settings');
    if (stored) {
      this.settings = { ...this.settings, ...JSON.parse(stored) };
    }
  }
}

// Instance singleton
const performanceService = new PerformanceOptimizationService();
export default performanceService;
