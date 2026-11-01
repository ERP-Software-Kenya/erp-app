import React, { createContext, useContext, useCallback, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

export const DRAWER_WIDTH = 280;
const OPEN_DURATION = 260;
const CLOSE_DURATION = 220;

interface DrawerContextValue {
  translateX: SharedValue<number>;
  overlayOpacity: SharedValue<number>;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const translateX = useSharedValue(-DRAWER_WIDTH);
  const overlayOpacity = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback((): void => {
    setIsOpen(true);
    translateX.value = withTiming(0, { duration: OPEN_DURATION });
    overlayOpacity.value = withTiming(0.5, { duration: OPEN_DURATION });
  }, [translateX, overlayOpacity]);

  const closeDrawer = useCallback((): void => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: CLOSE_DURATION });
    overlayOpacity.value = withTiming(0, { duration: CLOSE_DURATION });
    setTimeout(() => setIsOpen(false), CLOSE_DURATION);
  }, [translateX, overlayOpacity]);

  return (
    <DrawerContext.Provider value={{ translateX, overlayOpacity, isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error('useDrawer must be used within DrawerProvider');
  return ctx;
}
