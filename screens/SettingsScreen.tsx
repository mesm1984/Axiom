import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

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
});

export default SettingsScreen;
