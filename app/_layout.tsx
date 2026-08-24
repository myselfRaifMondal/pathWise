import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApplicationsProvider } from '@/state/ApplicationsProvider';
import { AuthProvider } from '@/state/AuthProvider';
import { ToastProvider } from '@/state/ToastProvider';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ApplicationsProvider>
              <ToastProvider>
                <Shell />
              </ToastProvider>
            </ApplicationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Shell() {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.page },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="privacy" options={{ headerShown: true, title: 'Privacy' }} />
        <Stack.Screen name="terms" options={{ headerShown: true, title: 'Terms' }} />
      </Stack>
    </>
  );
}
