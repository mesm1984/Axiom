import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import P2PTransferService from '../services/P2PTransferService';
import TelemetryService from '../services/TelemetryService';

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

type SettingsRowProps = {
  title: string;
  description?: string;
  right?: React.ReactNode;
  onPress?: () => void;
};

const SettingsRow = ({
  title,
  description,
  right,
  onPress,
}: SettingsRowProps) => {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsRowLeft}>
        <Text style={styles.settingsRowTitle}>{title}</Text>
        {description && (
          <Text style={styles.settingsRowDescription}>{description}</Text>
        )}
      </View>
      {right && <View style={styles.settingsRowRight}>{right}</View>}
    </TouchableOpacity>
  );
};

const SettingsScreen = () => {
  const [wifiOnly, setWifiOnly] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Nouvelles options
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [stunEnabled, setStunEnabled] = useState(true);
  const [turnEnabled, setTurnEnabled] = useState(true);
  const [showSTUNTURNConfig, setShowSTUNTURNConfig] = useState(false);
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);

  // Configuration STUN/TURN
  const [customSTUNServer, setCustomSTUNServer] = useState('');
  const [customTURNServer, setCustomTURNServer] = useState('');
  const [turnUsername, setTurnUsername] = useState('');
  const [turnPassword, setTurnPassword] = useState('');

  // Services
  const p2pService = P2PTransferService.getInstance();
  const telemetryService = TelemetryService.getInstance();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Charger configuration télémétrie
      const telemetryConfig = telemetryService.getConfiguration();
      setTelemetryEnabled(telemetryConfig.enabled);

      // Charger configuration P2P
      const p2pConfig = p2pService.getConfiguration();
      setStunEnabled(p2pConfig.transfer.enableSTUN || true);
      setTurnEnabled(p2pConfig.transfer.enableTURN || true);
    } catch (error) {
      console.warn('Erreur lors du chargement des paramètres:', error);
    }
  };

  const showUserInfo = () => {
    Alert.alert(
      'Informations utilisateur',
      'Nom: John Doe\nEmail: john.doe@example.com\nClé publique: AB12CD34EF56GH78IJ90',
      [{ text: 'Fermer' }],
    );
  };

  const showBackupInfo = () => {
    Alert.alert(
      'Sauvegarde et restauration',
      'Dernière sauvegarde: 20/08/2023\n\nLes sauvegardes incluent vos messages, contacts et préférences. Elles sont chiffrées et stockées localement.',
      [
        {
          text: 'Sauvegarder maintenant',
          onPress: () => console.log('Backup requested'),
        },
        { text: 'Restaurer', onPress: () => console.log('Restore requested') },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const showSecurityInfo = () => {
    Alert.alert(
      'Sécurité et confidentialité',
      'Chiffrement de bout en bout activé\nProtection par mot de passe: Activée\nVérification en deux étapes: Désactivée',
      [
        {
          text: 'Configurer',
          onPress: () => console.log('Security config requested'),
        },
        { text: 'Fermer', style: 'cancel' },
      ],
    );
  };

  const showAboutInfo = () => {
    Alert.alert(
      "À propos d'Axiom",
      "Version: 1.0.0\n\nAxiom est une application de communication sécurisée qui permet l'échange de fichiers volumineux sans sacrifier la qualité ni la confidentialité.",
      [{ text: 'Fermer' }],
    );
  };

  // Nouvelles fonctions pour les paramètres avancés
  const handleTelemetryToggle = async (enabled: boolean) => {
    if (enabled) {
      Alert.alert(
        'Activer la télémétrie',
        "La télémétrie collecte des données anonymes d'usage pour améliorer l'application. Aucune donnée personnelle n'est collectée.\n\nVoulez-vous activer cette fonctionnalité ?",
        [
          { text: 'Non', style: 'cancel' },
          {
            text: 'Oui',
            onPress: async () => {
              await telemetryService.setTelemetryEnabled(true);
              setTelemetryEnabled(true);
              telemetryService.trackFeatureUsage(
                'settings',
                'telemetry_enabled',
                true,
              );
            },
          },
        ],
      );
    } else {
      Alert.alert(
        'Désactiver la télémétrie',
        'Toutes les données de télémétrie seront supprimées de votre appareil.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Désactiver',
            style: 'destructive',
            onPress: async () => {
              await telemetryService.setTelemetryEnabled(false);
              setTelemetryEnabled(false);
            },
          },
        ],
      );
    }
  };

  const handleSTUNToggle = async (enabled: boolean) => {
    setStunEnabled(enabled);
    await p2pService.configureTransfer({ enableSTUN: enabled });
    telemetryService.trackFeatureUsage('settings', 'stun_toggle', true);
  };

  const handleTURNToggle = async (enabled: boolean) => {
    setTurnEnabled(enabled);
    await p2pService.configureTransfer({ enableTURN: enabled });
    telemetryService.trackFeatureUsage('settings', 'turn_toggle', true);
  };

  const handleShowTelemetryDetails = () => {
    const stats = telemetryService.getTelemetryStats();
    Alert.alert(
      'Détails de la télémétrie',
      `État: ${stats.enabled ? 'Activée' : 'Désactivée'}\n` +
        `Événements en attente: ${stats.eventCount}\n` +
        `Durée de session: ${Math.round(
          stats.sessionDuration / 1000 / 60,
        )} min\n\n` +
        `Types de données collectées:\n` +
        `• Performance: ${stats.config.collectPerformance ? 'Oui' : 'Non'}\n` +
        `• Usage: ${stats.config.collectUsage ? 'Oui' : 'Non'}\n` +
        `• Erreurs: ${stats.config.collectErrors ? 'Oui' : 'Non'}\n` +
        `• Sécurité: ${stats.config.collectSecurity ? 'Oui' : 'Non'}`,
      [
        {
          text: 'Exporter mes données',
          onPress: async () => {
            const data = await telemetryService.exportUserData();
            Alert.alert('Export', `${data.events.length} événements exportés`);
          },
        },
        {
          text: 'Supprimer toutes mes données',
          style: 'destructive',
          onPress: async () => {
            await telemetryService.deleteAllUserData();
            setTelemetryEnabled(false);
            Alert.alert('Suppression', 'Toutes vos données ont été supprimées');
          },
        },
        { text: 'Fermer', style: 'cancel' },
      ],
    );
  };

  const testP2PConnectivity = async () => {
    Alert.alert('Test de connectivité', 'Test en cours...', []);

    try {
      await p2pService.initializeConnection();
      const results = await p2pService.testConnectivity();

      Alert.alert(
        'Résultats du test P2P',
        `STUN: ${results.stun ? '✅ Fonctionne' : '❌ Échec'}\n` +
          `TURN: ${results.turn ? '✅ Fonctionne' : '❌ Échec'}\n` +
          `Candidats ICE trouvés: ${results.candidates.length}\n\n` +
          `Types de candidats:\n` +
          `${results.candidates
            .map(c => `• ${c.type}: ${c.address || 'N/A'}`)
            .join('\n')}`,
        [{ text: 'OK' }],
      );

      telemetryService.trackFeatureUsage(
        'settings',
        'p2p_connectivity_test',
        true,
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de tester la connectivité P2P');
      telemetryService.trackError({
        errorType: 'p2p_test_failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        context: 'settings_screen',
      });
    }
  };

  const saveSTUNTURNConfig = async () => {
    try {
      const config: any = {
        stunServers: [],
        turnServers: [],
      };

      if (customSTUNServer.trim()) {
        config.stunServers.push(customSTUNServer.trim());
      }

      if (customTURNServer.trim()) {
        config.turnServers.push({
          urls: customTURNServer.trim(),
          username: turnUsername.trim() || undefined,
          credential: turnPassword.trim() || undefined,
        });
      }

      await p2pService.configureSTUNTURN(config);
      setShowSTUNTURNConfig(false);
      Alert.alert(
        'Configuration sauvegardée',
        'La configuration STUN/TURN a été mise à jour',
      );
      telemetryService.trackFeatureUsage(
        'settings',
        'stun_turn_config_updated',
        true,
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder la configuration');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SettingsSection title="Compte">
        <SettingsRow
          title="Informations utilisateur"
          description="Profil, clés de chiffrement"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={showUserInfo}
        />
        <SettingsRow
          title="Sauvegarde et restauration"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={showBackupInfo}
        />
      </SettingsSection>

      <SettingsSection title="Préférences">
        <SettingsRow
          title="Mode Wi-Fi uniquement"
          description="Les transferts ne s'effectueront que via Wi-Fi"
          right={
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={wifiOnly ? '#0084FF' : '#f4f3f4'}
              onValueChange={setWifiOnly}
              value={wifiOnly}
            />
          }
        />
        <SettingsRow
          title="Notifications"
          right={
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#0084FF' : '#f4f3f4'}
              onValueChange={setNotifications}
              value={notifications}
            />
          }
        />
        <SettingsRow
          title="Mode sombre"
          right={
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkMode ? '#0084FF' : '#f4f3f4'}
              onValueChange={setDarkMode}
              value={darkMode}
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Sécurité">
        <SettingsRow
          title="Sécurité et confidentialité"
          description="Chiffrement, mots de passe, authentification"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={showSecurityInfo}
        />
      </SettingsSection>

      <SettingsSection title="Connectivité P2P">
        <SettingsRow
          title="Serveurs STUN"
          description="Améliore la connectivité P2P à travers les NAT"
          right={
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={stunEnabled ? '#0084FF' : '#f4f3f4'}
              onValueChange={handleSTUNToggle}
              value={stunEnabled}
            />
          }
        />
        <SettingsRow
          title="Serveurs TURN"
          description="Connexion P2P via relay en cas d'échec direct"
          right={
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={turnEnabled ? '#0084FF' : '#f4f3f4'}
              onValueChange={handleTURNToggle}
              value={turnEnabled}
            />
          }
        />
        <SettingsRow
          title="Configuration avancée"
          description="Serveurs STUN/TURN personnalisés"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={() => setShowSTUNTURNConfig(true)}
        />
        <SettingsRow
          title="Tester la connectivité"
          description="Vérifier les connexions STUN/TURN"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={testP2PConnectivity}
        />
      </SettingsSection>

      <SettingsSection title="Télémétrie et données">
        <SettingsRow
          title="Télémétrie anonyme"
          description="Aide à améliorer l'application (opt-in uniquement)"
          right={
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={telemetryEnabled ? '#0084FF' : '#f4f3f4'}
              onValueChange={handleTelemetryToggle}
              value={telemetryEnabled}
            />
          }
        />
        <SettingsRow
          title="Détails et données"
          description="Voir les données collectées et options RGPD"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={handleShowTelemetryDetails}
        />
      </SettingsSection>

      <SettingsSection title="Aide">
        <SettingsRow
          title="À propos"
          description="Informations sur l'application"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={showAboutInfo}
        />
        <SettingsRow
          title="Support technique"
          description="Obtenir de l'aide"
          right={<Text style={styles.chevron}>›</Text>}
          onPress={() =>
            Alert.alert('Support', 'Contact: support@axiomapp.com')
          }
        />
      </SettingsSection>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() =>
          Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?')
        }
      >
        <Text style={styles.logoutButtonText}>Déconnexion</Text>
      </TouchableOpacity>

      {/* Modal de configuration STUN/TURN */}
      <Modal
        visible={showSTUNTURNConfig}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSTUNTURNConfig(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configuration STUN/TURN</Text>

            <Text style={styles.inputLabel}>Serveur STUN personnalisé:</Text>
            <TextInput
              style={styles.textInput}
              value={customSTUNServer}
              onChangeText={setCustomSTUNServer}
              placeholder="stun:votre-serveur.com:3478"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Serveur TURN personnalisé:</Text>
            <TextInput
              style={styles.textInput}
              value={customTURNServer}
              onChangeText={setCustomTURNServer}
              placeholder="turn:votre-serveur.com:3478"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Nom d'utilisateur TURN:</Text>
            <TextInput
              style={styles.textInput}
              value={turnUsername}
              onChangeText={setTurnUsername}
              placeholder="username"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Mot de passe TURN:</Text>
            <TextInput
              style={styles.textInput}
              value={turnPassword}
              onChangeText={setTurnPassword}
              placeholder="password"
              secureTextEntry
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSTUNTURNConfig(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveSTUNTURNConfig}
              >
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0084FF',
    marginLeft: 15,
    marginBottom: 5,
    marginTop: 10,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsRowLeft: {
    flex: 1,
  },
  settingsRowTitle: {
    fontSize: 16,
  },
  settingsRowDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  settingsRowRight: {
    marginLeft: 10,
  },
  chevron: {
    fontSize: 20,
    color: '#888',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Styles pour les modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    maxWidth: '90%',
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0084FF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#0084FF',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SettingsScreen;
