import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';

interface PageTransitionProps {
  children: React.ReactNode;
  visible: boolean;
  type?: 'slide' | 'fade' | 'scale' | 'slideUp';
  duration?: number;
  style?: ViewStyle;
}

const { width, height } = Dimensions.get('window');

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  visible,
  type = 'fade',
  duration = 300,
  style,
}) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateX = useRef(new Animated.Value(visible ? 0 : width)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : height)).current;
  const scale = useRef(new Animated.Value(visible ? 1 : 0.8)).current;

  useEffect(() => {
    if (visible) {
      switch (type) {
        case 'slide':
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'slideUp':
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'scale':
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start();
          break;

        default: // fade
          Animated.timing(opacity, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }).start();
      }
    } else {
      switch (type) {
        case 'slide':
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.8,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: width,
              duration: duration * 0.8,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'slideUp':
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.8,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: height,
              duration: duration * 0.8,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
          break;

        case 'scale':
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: duration * 0.8,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.8,
              duration: duration * 0.8,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
          break;

        default: // fade
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.8,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }).start();
      }
    }
  }, [visible, type, duration, opacity, translateX, translateY, scale]);

  const getTransform = () => {
    switch (type) {
      case 'slide':
        return [{ translateX }];
      case 'slideUp':
        return [{ translateY }];
      case 'scale':
        return [{ scale }];
      default:
        return [];
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          opacity,
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PageTransition;
