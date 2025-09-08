import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

interface AnimatedMessageProps {
  children: any;
  delay?: number;
  duration?: number;
  isVisible?: boolean;
}

const AnimatedMessage: React.FC<AnimatedMessageProps> = ({
  children,
  delay = 0,
  duration = 300,
  isVisible = true,
}) => {
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible) {
      // Animation d'entrée
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: duration * 0.8,
            easing: Easing.out(Easing.back(1.2)),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      // Animation de sortie
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -20,
          duration: duration * 0.6,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.6,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: duration * 0.6,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, delay, duration, translateY, opacity, scale]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedMessage;
