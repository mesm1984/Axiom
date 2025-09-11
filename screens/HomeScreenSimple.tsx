import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const HomeScreenSimple = (): React.JSX.Element => {
  const handlePress = (feature: string) => {
    Alert.alert('Navigation', `Vous êtes dans la section ${feature}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AxiomApp</Text>
      <Text style={styles.subtitle}>Communication sécurisée</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress('Conversations')}
        >
          <Text style={styles.buttonText}>💬 Nouvelle conversation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress('Paramètres')}
        >
          <Text style={styles.buttonText}>⚙️ Paramètres</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('FileTransfer')}
        >
          <Text style={styles.buttonText}>📁 Transfert de fichiers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Storage')}
        >
          <Text style={styles.buttonText}>💾 Stockage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0084FF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 15,
  },
  button: {
    backgroundColor: '#0084FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreenSimple;
