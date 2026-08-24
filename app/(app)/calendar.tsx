import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Head } from '@/components/Head';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { monthLabel } from '@/lib/format';
import { useApplications } from '@/state/ApplicationsProvider';
import { buildCalendar, useDerived } from '@/state/useDerived';
import { useTheme } from '@/theme/ThemeProvider';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const theme = useTheme();
  const router = useRouter();
  const { applications } = useApplications();
  const derived = useDerived(applications, theme);

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { cells, deadlineCount } = useMemo(
    () => buildCalendar(month, derived.applications),
    [derived.applications, month],
  );

  const step = (delta: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));

  return (
    <Screen
      title="Calendar"
      action={
        <View style={styles.controls}>
          <Button label="‹" variant="outline" onPress={() => step(-1)} />
          <Text size={13} weight="500" style={styles.monthLabel}>
            {monthLabel(month)}
          </Text>
          <Button label="›" variant="outline" onPress={() => step(1)} />
        </View>
      }
    >
      <Head title="Calendar — PathWise" description="Every application deadline on one month grid." />
      <Text size={13} tone="fg2" style={styles.count}>
        {deadlineCount} {deadlineCount === 1 ? 'deadline' : 'deadlines'} this month
      </Text>

      <Card style={styles.grid}>
        <View style={styles.week}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={styles.cell}>
              <Text size={12} tone="fg3" weight="500">
                {day}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.days}>
          {cells.map((cell) => (
            <View
              key={cell.key}
              style={[
                styles.cell,
                styles.day,
                { borderColor: theme.colors.line0 },
                cell.day === 0 ? styles.blank : null,
              ]}
            >
              {cell.day ? (
                <>
                  <View
                    style={[
                      styles.dayNumber,
                      cell.isToday ? { backgroundColor: theme.tab.activeBg } : null,
                    ]}
                  >
                    <Text
                      size={12}
                      weight={cell.isToday ? '600' : '400'}
                      style={cell.isToday ? { color: theme.tab.activeFg } : undefined}
                    >
                      {cell.day}
                    </Text>
                  </View>
                  {cell.events.map((event) => (
                    <Pressable
                      key={event.id}
                      accessibilityRole="button"
                      onPress={() => router.push(`/application/${event.id}`)}
                      style={[styles.event, { backgroundColor: theme.colors.tint }]}
                    >
                      <Text size={11} numberOfLines={1}>
                        {event.label}
                      </Text>
                    </Pressable>
                  ))}
                </>
              ) : null}
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  monthLabel: { minWidth: 120, textAlign: 'center' },
  count: { marginBottom: 12 },
  grid: { padding: 12 },
  week: { flexDirection: 'row' },
  days: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, paddingHorizontal: 4, paddingVertical: 6 },
  day: { minHeight: 86, borderTopWidth: StyleSheet.hairlineWidth, gap: 4 },
  blank: { opacity: 0.35 },
  dayNumber: {
    width: 22,
    height: 22,
    borderRadius: 980,
    alignItems: 'center',
    justifyContent: 'center',
  },
  event: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
});
