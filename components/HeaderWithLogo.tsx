import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

// Composant pour l'en-tête avec logo
const HeaderWithLogo: React.FC = () => (
  <View style={styles.headerContainer}>
    <Image 
      source={require('../images/logo_axiom.png')} 
      style={styles.logo}
      resizeMode="contain"
    />
    <Text style={styles.headerTitle}>Axiom</Text>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 4,
    textShadowColor: '#00BFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default HeaderWithLogo;
