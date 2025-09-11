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
import AdvancedServicesScreen from './screens/AdvancedServicesScreen';

export type RootStackParamList = {
  Home: undefined;
  Conversation: undefined;
  FileTransfer: undefined;
  Settings: undefined;
  Storage: undefined;
  AdvancedServices: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  try {
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            animation: 'slide_from_right',
            animationDuration: 250,
            headerShown: true,
            headerStyle: {
              backgroundColor: '#007AFF',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Accueil',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              animation: 'fade',
            }}
          />
          <Stack.Screen
            name="Conversation"
            component={ConversationScreen}
            options={{
              title: 'Conversation',
              animation: 'slide_from_right',
              animationDuration: 300,
            }}
          />
          <Stack.Screen
            name="FileTransfer"
            component={FileTransferScreen}
            options={{
              title: 'Transfert de fichiers',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Paramètres',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Storage"
            component={StorageScreen}
            options={{
              title: 'Stockage',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="AdvancedServices"
            component={AdvancedServicesScreen}
            options={{
              title: 'Services Avancés',
              animation: 'slide_from_right',
            }}
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
