import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface SlideTransitionProps {
  children: any;
  visible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  delay?: number;
}

const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  visible,
  direction = 'right',
  duration = 300,
  delay = 0,
}) => {
  const translateX = useRef(new Animated.Value(getInitialPosition())).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  function getInitialPosition() {
    switch (direction) {
      case 'left':
        return visible ? 0 : -screenWidth;
      case 'right':
        return visible ? 0 : screenWidth;
      case 'up':
        return visible ? 0 : -screenWidth;
      case 'down':
        return visible ? 0 : screenWidth;
      default:
        return visible ? 0 : screenWidth;
    }
  }

  function getTargetPosition() {
    if (visible) {
      return 0;
    }
    switch (direction) {
      case 'left':
        return -screenWidth;
      case 'right':
        return screenWidth;
      case 'up':
        return -screenWidth;
      case 'down':
        return screenWidth;
      default:
        return screenWidth;
    }
  }

  useEffect(() => {
    const animations = [
      Animated.timing(translateX, {
        toValue: getTargetPosition(),
        duration,
        easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: duration * 0.8,
        easing: visible ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ];

    if (delay > 0) {
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel(animations),
      ]).start();
    } else {
      Animated.parallel(animations).start();
    }
  }, [visible, direction, duration, delay, translateX, opacity]);

  const transform = [];
  if (direction === 'left' || direction === 'right') {
    transform.push({ translateX });
  } else {
    transform.push({ translateY: translateX });
  }

  return (
    <Animated.View
      style={{
        transform,
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default SlideTransition;
