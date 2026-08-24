import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { Head } from '@/components/Head';
import { Screen } from '@/components/Screen';
import { Badge, Card, Divider, EmptyState } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useApplications } from '@/state/ApplicationsProvider';
import { useDerived } from '@/state/useDerived';
import { useTheme } from '@/theme/ThemeProvider';
import { badgeToneFor } from '@/theme/tokens';

export default function Overview() {
  const theme = useTheme();
  const router = useRouter();
  const { applications, loading, reload, demo } = useApplications();
  const derived = useDerived(applications, theme);
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <Screen title="Overview" onRefresh={demo ? undefined : reload} refreshing={loading}>
      <Head title="Overview — PathWise" description="Your application pipeline at a glance." />

      <View style={[styles.metrics, { flexDirection: wide ? 'row' : 'column' }]}>
        {derived.metrics.map((metric) => (
          <Card key={metric.label} style={[styles.metric, wide ? { flex: 1 } : null]}>
            <Text size={12} tone="fg2" weight="500">
              {metric.label}
            </Text>
            <Text size={34} weight="600">
              {metric.value}
            </Text>
            <Text size={12} tone="fg3">
              {metric.unit || ' '}
            </Text>
          </Card>
        ))}
      </View>

      <View style={[styles.panels, { flexDirection: wide ? 'row' : 'column' }]}>
        <Card style={wide ? { flex: 1 } : undefined}>
          <Text size={15} weight="600" style={styles.panelTitle}>
            Upcoming deadlines
          </Text>
          {derived.deadlines.length ? (
            derived.deadlines.map((deadline, index) => (
              <View key={deadline.id}>
                {index > 0 ? <Divider /> : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/application/${deadline.id}`)}
                  style={styles.deadlineRow}
                >
                  <View style={styles.grow}>
                    <Text size={14} weight="500">
                      {deadline.role}
                    </Text>
                    <Text size={12} tone="fg2">
                      {deadline.company} · {deadline.kind}
                    </Text>
                  </View>
                  <Text size={13} weight="500" style={{ color: deadline.timeColor }}>
                    {deadline.timeLabel}
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text size={13} tone="fg2" style={styles.quiet}>
              Nothing due in the next two weeks.
            </Text>
          )}
        </Card>

        <Card style={wide ? { flex: 1.4 } : undefined}>
          <Text size={15} weight="600" style={styles.panelTitle}>
            Applications
          </Text>
          {derived.hasApplications ? (
            derived.applications.map((application, index) => (
              <View key={application.id}>
                {index > 0 ? <Divider /> : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push(`/application/${application.id}`)}
                  style={styles.appRow}
                >
                  <View style={styles.grow}>
                    <Text size={14} weight="500">
                      {application.role}
                    </Text>
                    <Text size={12} tone="fg2">
                      {application.company}
                    </Text>
                  </View>
                  <Badge label={application.stage} tone={theme.badge[badgeToneFor(application.stage)]} />
                  <Text
                    size={13}
                    style={[styles.deadlineCell, { color: application.deadlineColor }]}
                  >
                    {application.deadlineLabel}
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View>
              <EmptyState
                title="No applications yet"
                body="Log the first one — it takes about twelve seconds."
              />
              <Button
                label="New application"
                size="md"
                style={styles.emptyCta}
                onPress={() => router.push('/new')}
              />
            </View>
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: { gap: 12 },
  metric: { paddingVertical: 18, paddingHorizontal: 18, gap: 2 },
  panels: { gap: 12, marginTop: 12 },
  panelTitle: { marginBottom: 12 },
  grow: { flex: 1, gap: 2 },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  appRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  deadlineCell: { minWidth: 56, textAlign: 'right' },
  quiet: { paddingVertical: 12 },
  emptyCta: { alignSelf: 'center' },
});
