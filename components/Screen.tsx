import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

/** Shared page frame: centred 1120px column, matching the design's max-width. */
export function Screen({
  title,
  action,
  children,
  onRefresh,
  refreshing = false,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const gutter = width >= 900 ? 48 : 20;

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.page }}
      contentContainerStyle={{ paddingHorizontal: gutter, paddingBottom: insets.bottom + 64 }}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.fg2} />
        ) : undefined
      }
    >
      <View style={styles.column}>
        <View style={styles.header}>
          <Text size={34} weight="600">
            {title}
          </Text>
          {action}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: 1120, alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 28,
    gap: 16,
  },
});
