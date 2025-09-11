import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Import des écrans
import HomeScreenSimple from '../screens/HomeScreenSimple';
import ConversationScreenSimple from '../screens/ConversationScreenSimple';
import FileTransferScreenSimple from '../screens/FileTransferScreenSimple';
import SettingsScreenSimple from '../screens/SettingsScreenSimple';
import StorageScreenSimple from '../screens/StorageScreenSimple';

const AppNavigator = () => {
  const [activeScreen, setActiveScreen] = useState('Home');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return <HomeScreenSimple />;
      case 'Conversations':
        return <ConversationScreenSimple />;
      case 'Files':
        return <FileTransferScreenSimple />;
      case 'Settings':
        return <SettingsScreenSimple />;
      case 'Storage':
        return <StorageScreenSimple />;
      default:
        return <HomeScreenSimple />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeScreen === 'Home' && styles.activeTab]}
          onPress={() => setActiveScreen('Home')}
        >
          <Text style={[styles.tabText, activeScreen === 'Home' && styles.activeTabText]}>
            🏠 Accueil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeScreen === 'Conversations' && styles.activeTab]}
          onPress={() => setActiveScreen('Conversations')}
        >
          <Text style={[styles.tabText, activeScreen === 'Conversations' && styles.activeTabText]}>
            💬 Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeScreen === 'Files' && styles.activeTab]}
          onPress={() => setActiveScreen('Files')}
        >
          <Text style={[styles.tabText, activeScreen === 'Files' && styles.activeTabText]}>
            📁 Fichiers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeScreen === 'Settings' && styles.activeTab]}
          onPress={() => setActiveScreen('Settings')}
        >
          <Text style={[styles.tabText, activeScreen === 'Settings' && styles.activeTabText]}>
            ⚙️ Config
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeScreen === 'Storage' && styles.activeTab]}
          onPress={() => setActiveScreen('Storage')}
        >
          <Text style={[styles.tabText, activeScreen === 'Storage' && styles.activeTabText]}>
            💾 Stockage
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    textAlign: 'center',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AppNavigator;
          component={FileTransferScreenSimple}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 16 }}>📁</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Stockage"
          component={StorageScreenSimple}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 16 }}>💾</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Paramètres"
          component={SettingsScreenSimple}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 16 }}>⚙️</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
