import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SimpleWebComponent = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Axiom App (Version Web)</Text>
        <Text style={styles.headerSubtitle}>
          Application de messagerie sécurisée
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.text}>Bienvenue sur l'application Axiom !</Text>
        <Text style={styles.subtext}>
          Cette version web est une version simplifiée de l'application mobile.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: '100vh',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default SimpleWebComponent;
