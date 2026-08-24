import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { isWeb } from '@/theme/responsive';
import { useResponsive } from '@/theme/useResponsive';
import { web } from '@/theme/web';


/**
 * The design's drawer and dialog. Both are presented as router modals, so this
 * only has to supply the panel: centred on a wide screen, full-bleed on a phone.
 */
export function Sheet({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { wideSheet } = useResponsive();

  return (
    <View style={[styles.backdrop, { backgroundColor: theme.colors.page }]}>
      <View
        {...web('sheet')}
        style={[
          styles.panel,
          { backgroundColor: theme.colors.sheet, borderColor: theme.colors.line },
          isWeb ? null : { maxWidth: wideSheet ? 560 : undefined, marginTop: wideSheet ? 0 : insets.top },
        ]}
      >
        <View style={[styles.head, { borderColor: theme.colors.line }]}>
          <View style={styles.headText}>
            <Text size={19} weight="600">
              {title}
            </Text>
            {subtitle ? (
              <Text size={13} tone="fg2">
                {subtitle}
              </Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            style={[styles.close, { backgroundColor: theme.colors.tint }]}
          >
            <Text size={15} tone="fg2">
              ✕
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {footer ? (
          <View style={[styles.footer, { borderColor: theme.colors.line, paddingBottom: insets.bottom + 16 }]}>
            {footer}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center' },
  panel: {
    flex: 1,
    width: '100%',
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headText: { flex: 1, gap: 3 },
  close: { width: 30, height: 30, borderRadius: 980, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 16 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
