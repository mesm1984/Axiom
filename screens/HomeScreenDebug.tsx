import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HomeScreenDebug = (): React.JSX.Element => {
  console.log('HomeScreenDebug rendered');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomeScreen Debug - Test d'affichage</Text>
      <Text style={styles.subText}>
        Si vous voyez ceci, le problème vient d'ailleurs
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreenDebug;
