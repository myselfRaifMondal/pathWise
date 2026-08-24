import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { DecoratedApplication } from '@/state/useDerived';
import { useTheme } from '@/theme/ThemeProvider';

export function BoardCard({
  application,
  dragging = false,
}: {
  application: DecoratedApplication;
  dragging?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: dragging ? theme.colors.line2 : theme.colors.line,
          opacity: dragging ? 0.96 : 1,
        },
        dragging ? styles.lifted : null,
      ]}
    >
      <Text size={14} weight="500">
        {application.role}
      </Text>
      <Text size={12} tone="fg2">
        {application.company}
      </Text>
      {application.deadlineShort ? (
        <Text size={12} style={{ color: application.deadlineColor }}>
          {application.deadlineShort}
        </Text>
      ) : null}
    </View>
  );
}

export const CARD_WIDTH = 240;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 3,
  },
  lifted: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});
