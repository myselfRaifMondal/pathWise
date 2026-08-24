import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

/** The landing page's sticky top bar. */
export function Nav() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View
      style={[styles.nav, { backgroundColor: theme.colors.nav, borderColor: theme.colors.line }]}
    >
      <Pressable accessibilityRole="link" onPress={() => router.push('/')}>
        <Text size={17} weight="600">
          PathWise
        </Text>
      </Pressable>
      <View style={styles.actions}>
        <Pressable accessibilityRole="link" onPress={() => router.push('/signin')}>
          <Text size={13} tone="fg2">
            Sign in
          </Text>
        </Pressable>
        <Button label="Get started" onPress={() => router.push('/signup')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 24 },
});
