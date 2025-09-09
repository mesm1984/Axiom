import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: any;
  style?: ViewStyle | ViewStyle[];
  pressInScale?: number;
  pressOutScale?: number;
  duration?: number;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  style,
  pressInScale = 0.95,
  pressOutScale = 1,
  duration = 100,
  ...props
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: pressInScale,
      duration,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: pressOutScale,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AnimatedButton;
