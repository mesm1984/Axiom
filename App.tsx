import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ScrollView } from 'react-native';

const App = () => {
  const [activeSection, setActiveSection] = useState('home');

  const handlePress = (feature: string) => {
    Alert.alert('Axiom', `Section ${feature} sélectionnée`);
    setActiveSection(feature.toLowerCase());
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'conversations':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>💬 Conversations</Text>
            <Text style={styles.sectionDescription}>Messagerie sécurisée avec chiffrement E2E</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>🔐 Chiffrement bout-à-bout</Text>
              <Text style={styles.featureItem}>📱 Messages en temps réel</Text>
              <Text style={styles.featureItem}>🔔 Notifications sécurisées</Text>
            </View>
          </View>
        );
      case 'fichiers':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>📁 Transfert de Fichiers</Text>
            <Text style={styles.sectionDescription}>Partage sécurisé de documents</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>📄 Documents cryptés</Text>
              <Text style={styles.featureItem}>🔒 Transfert sécurisé</Text>
              <Text style={styles.featureItem}>📊 Suivi des envois</Text>
            </View>
          </View>
        );
      case 'paramètres':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>⚙️ Paramètres</Text>
            <Text style={styles.sectionDescription}>Configuration de sécurité</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>🔑 Gestion des clés</Text>
              <Text style={styles.featureItem}>🛡️ Niveau de sécurité</Text>
              <Text style={styles.featureItem}>🔧 Options avancées</Text>
            </View>
          </View>
        );
      case 'stockage':
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>💾 Stockage</Text>
            <Text style={styles.sectionDescription}>Gestion des données cryptées</Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>🗄️ Base de données chiffrée</Text>
              <Text style={styles.featureItem}>🧹 Nettoyage sécurisé</Text>
              <Text style={styles.featureItem}>📈 Statistiques d'usage</Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.sectionContent}>
            <Text style={styles.welcomeTitle}>Axiom</Text>
            <Text style={styles.welcomeSubtitle}>Communication Sécurisée</Text>
            <Text style={styles.welcomeDescription}>
              Plateforme de messagerie avec chiffrement bout-à-bout et transfert de fichiers sécurisé
            </Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>✅ Application initialisée</Text>
              <Text style={styles.statusText}>🔐 Mode sécurisé activé</Text>
              <Text style={styles.statusText}>🌐 Prêt pour la communication</Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Axiom</Text>
        <Text style={styles.headerSubtitle}>Sécurisé • Privé • Crypté</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, activeSection === 'home' && styles.activeNavButton]}
          onPress={() => { setActiveSection('home'); handlePress('Accueil'); }}
        >
          <Text style={[styles.navText, activeSection === 'home' && styles.activeNavText]}>🏠</Text>
          <Text style={[styles.navLabel, activeSection === 'home' && styles.activeNavLabel]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeSection === 'conversations' && styles.activeNavButton]}
          onPress={() => { setActiveSection('conversations'); handlePress('Conversations'); }}
        >
          <Text style={[styles.navText, activeSection === 'conversations' && styles.activeNavText]}>💬</Text>
          <Text style={[styles.navLabel, activeSection === 'conversations' && styles.activeNavLabel]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeSection === 'fichiers' && styles.activeNavButton]}
          onPress={() => { setActiveSection('fichiers'); handlePress('Fichiers'); }}
        >
          <Text style={[styles.navText, activeSection === 'fichiers' && styles.activeNavText]}>📁</Text>
          <Text style={[styles.navLabel, activeSection === 'fichiers' && styles.activeNavLabel]}>Fichiers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeSection === 'paramètres' && styles.activeNavButton]}
          onPress={() => { setActiveSection('paramètres'); handlePress('Paramètres'); }}
        >
          <Text style={[styles.navText, activeSection === 'paramètres' && styles.activeNavText]}>⚙️</Text>
          <Text style={[styles.navLabel, activeSection === 'paramètres' && styles.activeNavLabel]}>Config</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, activeSection === 'stockage' && styles.activeNavButton]}
          onPress={() => { setActiveSection('stockage'); handlePress('Stockage'); }}
        >
          <Text style={[styles.navText, activeSection === 'stockage' && styles.activeNavText]}>💾</Text>
          <Text style={[styles.navLabel, activeSection === 'stockage' && styles.activeNavLabel]}>Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1929', // Bleu nuit principal
  },
  header: {
    backgroundColor: '#1A2B3D', // Bleu nuit plus clair pour le header
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2C3E50',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    color: '#85C1E9',
    marginBottom: 8,
    paddingLeft: 10,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#85C1E9',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#52C41A',
    marginBottom: 5,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#1A2B3D',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: '#2C3E50',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  activeNavButton: {
    backgroundColor: '#2C3E50',
  },
  navText: {
    fontSize: 16,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  activeNavText: {
    fontSize: 18,
  },
  activeNavLabel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default App;
