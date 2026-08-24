import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useApplications } from '@/state/ApplicationsProvider';
import { useAuth } from '@/state/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { isWeb } from '@/theme/responsive';
import { useResponsive } from '@/theme/useResponsive';
import { web } from '@/theme/web';
import { initials } from '@/lib/format';

const TABS = [
  { href: '/overview', label: 'Overview' },
  { href: '/board', label: 'Board' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/settings', label: 'Settings' },
] as const;

export function AppNav() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { demo } = useApplications();
  const { wide } = useResponsive();

  const monogram = user?.name ? initials(user.name) : user?.email?.slice(0, 2).toUpperCase() ?? '··';

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.nav, borderColor: theme.colors.line }]}>
      <View {...web('gutter')} style={[styles.row, isWeb ? null : { paddingHorizontal: wide ? 48 : 20 }]}>
        <Pressable accessibilityRole="link" onPress={() => router.push('/')}>
          <Text size={17} weight="600">
            PathWise
          </Text>
        </Pressable>

        {isWeb ? (
          <View {...web('tabs-inline')}>
            <Tabs pathname={pathname} />
          </View>
        ) : wide ? (
          <Tabs pathname={pathname} />
        ) : null}

        <View style={styles.actions}>
          <Button label="＋ New" onPress={() => router.push('/new')} />
          {demo ? (
            <View style={[styles.demoTag, { backgroundColor: theme.colors.tint }]}>
              <Text size={11} weight="500" tone="fg2">
                Demo
              </Text>
            </View>
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.tint }]}>
              <Text size={12} weight="600" tone="fg2">
                {monogram}
              </Text>
            </View>
          )}
        </View>
      </View>

      {isWeb || !wide ? (
        <View {...web('tabs-scroll')} style={[styles.narrowTabs, { paddingHorizontal: 12 }]}>
          <Tabs pathname={pathname} scrollable />
        </View>
      ) : null}
    </View>
  );
}

function Tabs({ pathname, scrollable = false }: { pathname: string; scrollable?: boolean }) {
  const theme = useTheme();
  const router = useRouter();

  const content = TABS.map((tab) => {
    const active = pathname === tab.href;
    return (
      <Pressable
        key={tab.href}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        onPress={() => router.push(tab.href)}
        style={[styles.tab, { backgroundColor: active ? theme.tab.activeBg : 'transparent' }]}
      >
        <Text size={13} weight="500" style={{ color: active ? theme.tab.activeFg : theme.tab.fg }}>
          {tab.label}
        </Text>
      </Pressable>
    );
  });

  if (!scrollable) return <View style={styles.tabs}>{content}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    gap: 16,
  },
  tabs: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  narrowTabs: { paddingBottom: 8 },
  tab: { paddingHorizontal: 14, height: 30, borderRadius: 980, justifyContent: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 30, height: 30, borderRadius: 980, alignItems: 'center', justifyContent: 'center' },
  demoTag: { paddingHorizontal: 10, height: 24, borderRadius: 980, justifyContent: 'center' },
});
