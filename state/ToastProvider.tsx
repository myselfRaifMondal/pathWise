import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { FONT } from '@/theme/tokens';

/** Matches the design: one message at a time, cleared after three seconds. */
const DURATION = 3000;

// react-native-web has no native animated module; asking for it only logs a warning.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback((next: string) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(next);
    timer.current = setTimeout(() => setMessage(null), DURATION);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <ToastContext.Provider value={fire}>
      {children}
      {message ? <Toast message={message} /> : null}
    </ToastContext.Provider>
  );
}

function Toast({ message }: { message: string }) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const offset = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(offset, { toValue: 0, duration: 180, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [offset, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.sheet,
          borderColor: theme.colors.line,
          opacity,
          transform: [{ translateY: offset }],
        },
      ]}
    >
      <Text style={[styles.text, { color: theme.colors.fg }]}>{message}</Text>
    </Animated.View>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    maxWidth: 420,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: { fontFamily: FONT, fontSize: 13, fontWeight: '500' },
});
