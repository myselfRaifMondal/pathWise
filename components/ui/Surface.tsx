import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import type { BadgeStyle } from '@/theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  const theme = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.line },
        style,
      ]}
    />
  );
}

export function Divider() {
  const theme = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.colors.line }]} />;
}

export function Badge({ label, tone }: { label: string; tone: BadgeStyle }) {
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text size={12} weight="500" style={{ color: tone.fg }}>
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text size={15} weight="500">
        {title}
      </Text>
      <Text size={13} tone="fg2" style={styles.emptyBody}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 20 },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
  badge: { paddingHorizontal: 10, height: 24, borderRadius: 980, justifyContent: 'center' },
  empty: { paddingVertical: 48, alignItems: 'center', gap: 6 },
  emptyBody: { textAlign: 'center', maxWidth: 320 },
});
