import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Écran de test React Native</Text>
      <Text style={styles.text}>Si cet écran s'affiche, votre environnement React Native/TypeScript fonctionne correctement.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0084FF',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default TestScreen;
