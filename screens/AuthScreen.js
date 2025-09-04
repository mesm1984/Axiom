import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:4000'; // Adapter selon l'environnement

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [token, setToken] = useState('');
  const [keyFetched, setKeyFetched] = useState('');

  // Inscription
  const register = async () => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, publicKey }),
      });
      const data = await res.json();
      if (data.success) Alert.alert('Inscription réussie');
      else Alert.alert('Erreur', data.error || 'Erreur inconnue');
    } catch (e) {
      Alert.alert('Erreur réseau');
    }
  };

  // Connexion
  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        await AsyncStorage.setItem('token', data.token);
        Alert.alert('Connexion réussie');
      } else {
        Alert.alert('Erreur', data.error || 'Erreur inconnue');
      }
    } catch (e) {
      Alert.alert('Erreur réseau');
    }
  };

  // Récupérer la clé publique d'un utilisateur
  const fetchKey = async () => {
    try {
      const res = await fetch(`${API_URL}/key/${username}`);
      const data = await res.json();
      if (data.publicKey) setKeyFetched(data.publicKey);
      else Alert.alert('Erreur', data.error || 'Erreur inconnue');
    } catch (e) {
      Alert.alert('Erreur réseau');
    }
  };

  // Mettre à jour sa clé publique
  const updateKey = async () => {
    try {
      const t = token || (await AsyncStorage.getItem('token'));
      const res = await fetch(`${API_URL}/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t, publicKey }),
      });
      const data = await res.json();
      if (data.success) Alert.alert('Clé mise à jour');
      else Alert.alert('Erreur', data.error || 'Erreur inconnue');
    } catch (e) {
      Alert.alert('Erreur réseau');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Inscription</Text>
      <TextInput placeholder="Nom d'utilisateur" value={username} onChangeText={setUsername} />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="Clé publique" value={publicKey} onChangeText={setPublicKey} />
      <Button title="S'inscrire" onPress={register} />
      <Text style={styles.marginTop}>Connexion</Text>
      <Button title="Se connecter" onPress={login} />
      <Text style={styles.marginTop}>Gestion des clés</Text>
      <Button title="Mettre à jour ma clé" onPress={updateKey} />
      <Button title="Récupérer la clé d'un utilisateur" onPress={fetchKey} />
      {keyFetched ? <Text>Clé récupérée : {keyFetched}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  marginTop: {
    marginTop: 20,
  },
});
