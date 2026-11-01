import React from 'react';
import { TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useDrawer, DRAWER_WIDTH } from './DrawerContext';

interface DrawerPanelProps {
  children: React.ReactNode;
}

export function DrawerPanel({ children }: DrawerPanelProps): React.ReactElement {
  const { translateX, overlayOpacity, isOpen, closeDrawer } = useDrawer();

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <>
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View
          pointerEvents={isOpen ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000', zIndex: 99 }, overlayStyle]}
        />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          panelStyle,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: DRAWER_WIDTH,
            zIndex: 100,
            backgroundColor: '#0d1b3e',
          },
        ]}
      >
        {children}
      </Animated.View>
    </>
  );
}
