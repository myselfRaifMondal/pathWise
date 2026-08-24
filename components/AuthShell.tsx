import { useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export function AuthShell({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.page }}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 48 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Pressable accessibilityRole="link" onPress={() => router.push('/')}>
            <Text size={17} weight="600" style={styles.brand}>
              PathWise
            </Text>
          </Pressable>
          <Text size={26} weight="600" style={styles.title}>
            {title}
          </Text>
          <View style={styles.form}>{children}</View>
          <View style={styles.footer}>{footer}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthLink({ label, onPress }: { label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Text
      size={13}
      accessibilityRole="link"
      onPress={onPress}
      style={{ color: theme.colors.fg, textDecorationLine: 'underline' }}
    >
      {label}
    </Text>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Text size={13} tone="red" accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 380, gap: 8 },
  brand: { marginBottom: 24 },
  title: { marginBottom: 20 },
  form: { gap: 14 },
  footer: { marginTop: 22, gap: 10, alignItems: 'flex-start' },
});
