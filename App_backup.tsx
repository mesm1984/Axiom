import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Initialisation conditionnelle de react-native-screens
try {
  const { enableScreens } = require('react-native-screens');
  enableScreens();
} catch (error) {
  console.warn('react-native-screens not available:', error);
}

import HomeScreen from './screens/HomeScreen';
import ConversationScreen from './screens/ConversationScreen';
import FileTransferScreen from './screens/FileTransferScreen';
import SettingsScreen from './screens/SettingsScreen';
import StorageScreen from './screens/StorageScreen';

export type RootStackParamList = {
  Home: undefined;
  Conversation: undefined;
  FileTransfer: undefined;
  Settings: undefined;
  Storage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  try {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Accueil' }}
          />
          <Stack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={{ title: 'Conversation' }}
          />
          <Stack.Screen
            name="FileTransfer"
            component={FileTransferScreen}
            options={{ title: 'Transfert de fichiers' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Paramètres' }}
          />
          <Stack.Screen
            name="Storage"
            component={StorageScreen}
            options={{ title: 'Stockage' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return null;
  }
};

export default App;
