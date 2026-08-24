import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppNav } from '@/components/AppNav';
import { useApplications } from '@/state/ApplicationsProvider';
import { useAuth } from '@/state/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function AppLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const { demo } = useApplications();

  if (status === 'loading') {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.page }]}>
        <ActivityIndicator color={theme.colors.fg2} />
      </View>
    );
  }

  // The landing page's demo grants access without an account.
  if (status !== 'authenticated' && !demo) return <Redirect href="/signin" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.page, paddingTop: insets.top }}>
      <AppNav />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.page },
          animation: 'none',
        }}
      >
        <Stack.Screen name="new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen
          name="profile"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="application/[id]"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
