import TestScreen from './screens/TestScreen';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { NativeModules } from 'react-native';
/**
 * Axiom - Application de messagerie sécurisée
 * 
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from './screens/HomeScreen';
import ConversationScreen from './screens/ConversationScreen';
import FileTransferScreen from './screens/FileTransferScreen';
import SettingsScreen from './screens/SettingsScreen';
import StorageScreen from './screens/StorageScreen';
import HeaderWithLogo from './components/HeaderWithLogo';

// Définition du type pour la pile de navigation
export type RootStackParamList = {
  Home: undefined;
  Conversation: undefined;
  FileTransfer: undefined;
  Settings: undefined;
  Storage: undefined;
  Test: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Titre avec logo personnalisé pour éviter les problèmes avec ESLint
const LogoTitle = () => <HeaderWithLogo />;

function App() {
  useEffect(() => {
    async function checkBiometric() {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (available) {
        const result = await rnBiometrics.simplePrompt({ promptMessage: 'Authentification requise' });
        if (!result.success) {
          // Fermer l'app ou afficher un écran verrouillé
          // ...code pour masquer l'UI ou quitter...
        }
      }
    }
    checkBiometric();
  }, []);
  useEffect(() => {
    if (Platform.OS === 'android' && NativeModules) {
      if (NativeModules?.RNAndroidWindow) {
        NativeModules.RNAndroidWindow.setFlagSecure(true);
      }
    }
  }, []);
  const isDarkMode = useColorScheme() === 'dark';
  
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Test"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0A1929',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
              color: '#FFFFFF',
            },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              headerTitle: LogoTitle,
              headerStyle: {
                backgroundColor: '#0A1929', // Fond bleu foncé comme sur l'image
              },
            }} 
          />
          <Stack.Screen 
            name="Conversation" 
            component={ConversationScreen} 
            options={{ 
              title: 'Conversation',
              headerBackTitle: 'Retour',
            }} 
          />
          <Stack.Screen 
            name="FileTransfer" 
            component={FileTransferScreen} 
            options={{ 
              title: 'Transfert de fichiers',
              headerBackTitle: 'Retour',
            }} 
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ 
              title: 'Paramètres',
              headerBackTitle: 'Retour',
            }} 
          />
          <Stack.Screen 
            name="Storage" 
            component={StorageScreen} 
            options={{ 
              title: 'Gestion du stockage',
              headerBackTitle: 'Retour',
            }} 
          />
          <Stack.Screen 
            name="Test" 
            component={TestScreen} 
            options={{ 
              title: "Écran de test",
              headerBackTitle: "Retour",
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}



// Styles non nécessaires pour l'App, car les styles sont appliqués au niveau des écrans

export default App;
