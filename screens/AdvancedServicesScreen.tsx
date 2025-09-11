/**
 * Écran de test et démonstration des services avancés
 *
 * Fonctionnalités :
 * - Test du service d'authentification
 * - Monitoring des performances en temps réel
 * - Interface de gestion des optimisations
 * - Démonstration des services avancés
 *
 * @version 1.0.0
 * @author Axiom Team
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import authService, {
  type AuthState,
  type AuthCredentials,
} from '../services/AuthenticationService';
import performanceService, {
  type PerformanceMetrics,
  type PerformanceProfile,
  type DeviceCapabilities,
} from '../services/PerformanceOptimizationService';

const AdvancedServicesScreen: React.FC = () => {
  // États pour l'authentification
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [credentials] = useState<AuthCredentials>({
    username: 'test_user',
    password: 'test_password_123',
    email: 'test@axiom.app',
  });
  const [authLoading, setAuthLoading] = useState(false);

  // États pour les performances
  const [perfMetrics, setPerfMetrics] = useState<PerformanceMetrics | null>(
    null,
  );
  const [perfProfile, setPerfProfile] = useState<PerformanceProfile | null>(
    null,
  );
  const [deviceCaps, setDeviceCaps] = useState<DeviceCapabilities | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    // Initialisation des services
    initializeServices();

    // Écoute des changements d'authentification
    const unsubscribeAuth = authService.onAuthStateChanged(setAuthState);

    // Écoute des métriques de performance
    const unsubscribePerf = performanceService.onMetricsUpdate(setPerfMetrics);

    return () => {
      unsubscribeAuth();
      unsubscribePerf();
    };
  }, []);

  useEffect(() => {
    // Mise à jour des données de performance
    if (perfMetrics) {
      setPerfProfile(performanceService.getCurrentProfile());
      setDeviceCaps(performanceService.getDeviceCapabilities());
      setRecommendations(performanceService.getPerformanceRecommendations());
    }
  }, [perfMetrics]);

  const initializeServices = () => {
    setAuthState(authService.getAuthState());
    setPerfMetrics(performanceService.getCurrentMetrics());
    setPerfProfile(performanceService.getCurrentProfile());
    setDeviceCaps(performanceService.getDeviceCapabilities());
  };

  // Tests d'authentification
  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      await authService.login(credentials);
      Alert.alert('Succès', 'Connexion réussie !');
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthLoading(true);
    try {
      await authService.register(credentials);
      Alert.alert('Succès', 'Inscription réussie !');
    } catch (error: any) {
      Alert.alert("Erreur d'inscription", error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      Alert.alert('Déconnexion', 'Vous êtes déconnecté');
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Tests de performance
  const handleRecalibratePerformance = async () => {
    try {
      const newProfile = await performanceService.recalibrateProfile();
      setPerfProfile(newProfile);
      Alert.alert('Recalibrage', `Nouveau profil: ${newProfile.level}`);
    } catch (error: any) {
      Alert.alert('Erreur de recalibrage', error.message);
    }
  };

  const handleOptimizeBattery = async () => {
    try {
      await performanceService.updateSettings({
        preserveBattery: true,
        backgroundSync: false,
      });
      await performanceService.recalibrateProfile();
      Alert.alert('Optimisation', "Mode économie d'énergie activé");
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1048576) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getPerformanceColor = (level: string): string => {
    switch (level) {
      case 'potato':
        return '#ff4444';
      case 'low':
        return '#ff8800';
      case 'medium':
        return '#ffaa00';
      case 'high':
        return '#88cc00';
      case 'ultra':
        return '#00cc44';
      default:
        return '#666666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Services Avancés - Tests</Text>

      {/* Section Authentification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Authentification</Text>
        {authState?.isAuthenticated ? (
          <View style={styles.authInfo}>
            <Text style={styles.authText}>
              ✅ Connecté: {authState.user?.username}
            </Text>
            <Text style={styles.authText}>Email: {authState.user?.email}</Text>
            <Text style={styles.authText}>
              Dernière sync: {authState.lastSyncAt?.substring(0, 16)}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleLogout}>
              <Text style={styles.buttonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.authText}>❌ Non connecté</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleLogin}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Se connecter</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleRegister}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>S'inscrire</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Section Performances */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Performances</Text>
        {deviceCaps && (
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceText}>
              📱 RAM: {formatBytes(deviceCaps.ram * 1024 * 1024)}
            </Text>
            <Text style={styles.deviceText}>
              🧠 CPU: {deviceCaps.cpuCores} cœurs
            </Text>
            <Text style={styles.deviceText}>🎮 GPU: {deviceCaps.gpuTier}</Text>
            <Text style={styles.deviceText}>
              🌐 Réseau: {deviceCaps.networkSpeed}
            </Text>
          </View>
        )}

        {perfProfile && (
          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileLevel,
                { color: getPerformanceColor(perfProfile.level) },
              ]}
            >
              Profil: {perfProfile.level.toUpperCase()}
            </Text>
            <Text style={styles.profileText}>
              Animations: {perfProfile.animationsEnabled ? '✅' : '❌'}
            </Text>
            <Text style={styles.profileText}>
              Transferts simultanés: {perfProfile.maxConcurrentTransfers}
            </Text>
            <Text style={styles.profileText}>
              Taille chunks: {formatBytes(perfProfile.chunkSize * 1024)}
            </Text>
            <Text style={styles.profileText}>
              Cache: {formatBytes(perfProfile.cacheSize * 1024 * 1024)}
            </Text>
          </View>
        )}

        {perfMetrics && (
          <View style={styles.metricsInfo}>
            <Text style={styles.metricsTitle}>Métriques temps réel:</Text>
            <Text style={styles.metricsText}>FPS: {perfMetrics.fps}</Text>
            <Text style={styles.metricsText}>
              Mémoire: {formatBytes(perfMetrics.memoryUsage * 1024 * 1024)}
            </Text>
            <Text style={styles.metricsText}>
              CPU: {perfMetrics.cpuUsage.toFixed(1)}%
            </Text>
            <Text style={styles.metricsText}>
              Latence: {perfMetrics.networkLatency.toFixed(0)}ms
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleRecalibratePerformance}
          >
            <Text style={styles.buttonText}>Recalibrer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonWarning]}
            onPress={handleOptimizeBattery}
          >
            <Text style={styles.buttonText}>Mode Batterie</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Recommandations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Recommandations</Text>
          {recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationText}>
              • {rec}
            </Text>
          ))}
        </View>
      )}

      {/* Section État des Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 État des Services</Text>
        <View style={styles.serviceStatus}>
          <Text style={styles.serviceText}>
            🔐 AuthenticationService:{' '}
            <Text style={styles.serviceActive}>✅ Actif</Text>
          </Text>
          <Text style={styles.serviceText}>
            ⚡ PerformanceService:{' '}
            <Text style={styles.serviceActive}>✅ Actif</Text>
          </Text>
          <Text style={styles.serviceText}>
            🧠 StorageManagementService:{' '}
            <Text style={styles.serviceActive}>✅ Intégré</Text>
          </Text>
          <Text style={styles.serviceText}>
            🔄 TransferResumptionService:{' '}
            <Text style={styles.serviceActive}>✅ Intégré</Text>
          </Text>
          <Text style={styles.serviceText}>
            🛡️ SecurityService:{' '}
            <Text style={styles.serviceActive}>✅ Intégré</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  authInfo: {
    gap: 8,
  },
  authText: {
    fontSize: 14,
    color: '#666',
  },
  deviceInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  deviceText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  profileInfo: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  profileLevel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileText: {
    fontSize: 14,
    color: '#2d5a2d',
    marginBottom: 4,
  },
  metricsInfo: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  metricsText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#28a745',
  },
  buttonSecondary: {
    backgroundColor: '#6c757d',
  },
  buttonWarning: {
    backgroundColor: '#ffc107',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  recommendationText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceStatus: {
    gap: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#495057',
  },
  serviceActive: {
    color: '#28a745',
    fontWeight: 'bold',
  },
});

export default AdvancedServicesScreen;
