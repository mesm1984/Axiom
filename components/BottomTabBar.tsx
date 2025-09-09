import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

interface TabItem {
  name: keyof RootStackParamList;
  icon: string;
  label: string;
}

interface BottomTabBarProps {
  currentRoute: string;
}

const tabs: TabItem[] = [
  { name: 'Home', icon: '🏠', label: 'Accueil' },
  { name: 'Conversation', icon: '💬', label: 'Chat' },
  { name: 'FileTransfer', icon: '📁', label: 'Fichiers' },
  { name: 'Settings', icon: '⚙️', label: 'Réglages' },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentRoute }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderTab = (tab: TabItem, index: number) => {
    const isActive = currentRoute === tab.name;
    const scaleValue = new Animated.Value(isActive ? 1.1 : 1);

    const handlePress = () => {
      if (!isActive) {
        Animated.spring(scaleValue, {
          toValue: 1.2,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(scaleValue, {
            toValue: 1.1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }).start();
        });

        navigation.navigate(tab.name);
      }
    };

    return (
      <TouchableOpacity
        key={index}
        style={[styles.tab, isActive && styles.activeTab]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          <Text style={[styles.icon, isActive && styles.activeIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.label, isActive && styles.activeLabel]}>
            {tab.label}
          </Text>
        </Animated.View>
        {isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>{tabs.map(renderTab)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activeTab: {
    // Styles spéciaux pour l'onglet actif
  },
  tabContent: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeIcon: {
    fontSize: 22,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 30,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
});

export default BottomTabBar;
