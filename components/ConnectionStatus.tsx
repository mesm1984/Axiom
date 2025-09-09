import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ConnectionStatusProps {
  isConnected: boolean;
  isE2EReady: boolean;
  lastSeen?: Date;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isE2EReady,
  lastSeen,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (isConnected && isE2EReady) {
      // Animation d'apparition de la barre de statut
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animation de pulsation pour l'indicateur de connexion
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else {
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, isE2EReady, pulseAnim, slideAnim]);

  const getStatusText = () => {
    if (!isConnected) return 'Hors ligne';
    if (!isE2EReady) return 'Chiffrement en cours...';
    return 'En ligne • Chiffré E2E';
  };

  const getStatusColor = () => {
    if (!isConnected) return '#ff4444';
    if (!isE2EReady) return '#ffaa00';
    return '#00cc44';
  };

  const formatLastSeen = () => {
    if (!lastSeen) return '';
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return lastSeen.toLocaleDateString();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.statusContent}>
        <Animated.View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: getStatusColor(),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {lastSeen && !isConnected && (
            <Text style={styles.lastSeenText}>{formatLastSeen()}</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  lastSeenText: {
    fontSize: 11,
    color: '#666',
    marginTop: 1,
  },
});

export default ConnectionStatus;
