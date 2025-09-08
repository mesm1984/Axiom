/**
 * Axiom - Application de messagerie sécurisée (version web)
 *
 * @format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Assurez-vous d'utiliser la version web de HomeScreen
import HomeScreen from './screens/HomeScreen.web';

export type RootStackParamList = {
  Home: undefined;
  Conversation: undefined;
  FileTransfer: undefined;
  Settings: undefined;
  Storage: undefined;
};

function App() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Axiom App (Version Web)</Text>
        <Text style={styles.headerSubtitle}>
          Cette version est simplifiée pour le web
        </Text>
      </View>

      <View style={styles.content}>
        <HomeScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0084FF',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
});

export default App;
