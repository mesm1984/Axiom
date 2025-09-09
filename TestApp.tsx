import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestApp = () => {
  console.log('🟢 TestApp is rendering');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>TEST APP WORKS!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TestApp;
