import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const FileTransferScreenSimple = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📁 Transfert de fichiers</Text>
        <Text style={styles.subtitle}>Fonctionnalité en développement</Text>
        <Text style={styles.description}>
          Ici sera implémenté le transfert sécurisé de fichiers
        </Text>
        <View style={styles.feature}>
          <Text style={styles.featureText}>📋 À implémenter :</Text>
          <Text style={styles.featureItem}>• Sélection de fichiers</Text>
          <Text style={styles.featureItem}>• Chiffrement des fichiers</Text>
          <Text style={styles.featureItem}>• Transfert P2P</Text>
          <Text style={styles.featureItem}>• Historique des transferts</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 30,
  },
  feature: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '100%',
    elevation: 2,
  },
  featureText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2196F3',
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default FileTransferScreenSimple;
