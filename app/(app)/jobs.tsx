import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Head } from '@/components/Head';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Badge, Card, Divider } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { api } from '@/lib/api';
import type { Profile } from '@/lib/types';
import { useApplications } from '@/state/ApplicationsProvider';
import { useTheme } from '@/theme/ThemeProvider';

/** What suggestions will be matched on, once they exist. */
const SIGNALS = [
  { label: 'Target roles and seniority', key: 'targetRoles' as const },
  { label: 'Preferred locations and work type', key: 'preferredLocations' as const },
  { label: 'Skills and experience', key: 'skills' as const },
];

export default function Jobs() {
  const theme = useTheme();
  const router = useRouter();
  const { demo } = useApplications();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (demo) return;
    api.getProfile().then(setProfile).catch(() => setProfile(null));
  }, [demo]);

  const ready = SIGNALS.filter((signal) => (profile?.[signal.key]?.length ?? 0) > 0).length;

  return (
    <Screen title="Jobs">
      <Head
        title="Jobs — PathWise"
        description="Suggested job applications, matched to the details you have already filled in."
      />

      <Card style={styles.card}>
        <View style={styles.headRow}>
          <Text size={17} weight="600">
            Suggested applications
          </Text>
          <Badge label="Upcoming" tone={theme.badge.neutral} />
        </View>
        <Text size={14} tone="fg2">
          PathWise will suggest roles worth applying to, drawn from the details you have
          already filled in — so a suggestion arrives with the application half-written.
          This is not built yet.
        </Text>

        <Divider />

        <Text size={12} tone="fg2" weight="500">
          What it will match on
        </Text>
        {SIGNALS.map((signal) => {
          const filled = (profile?.[signal.key]?.length ?? 0) > 0;
          return (
            <View key={signal.label} style={styles.signal}>
              <Text size={14} tone={filled ? 'fg' : 'fg3'}>
                {filled ? '✓' : '○'}  {signal.label}
              </Text>
            </View>
          );
        })}

        {demo ? (
          <>
            <Text size={13} tone="fg2" style={styles.note}>
              The demo has no account, so there are no details to match on.
            </Text>
            <Button label="Create an account" size="md" onPress={() => router.push('/signup')} />
          </>
        ) : (
          <>
            <Text size={13} tone="fg2" style={styles.note}>
              {ready === SIGNALS.length
                ? 'Your details are ready — suggestions will use them as soon as they land.'
                : `${ready} of ${SIGNALS.length} filled in. The more you add, the better the first suggestions will be.`}
            </Text>
            <Button
              label={ready === 0 ? 'Add your details' : 'Update your details'}
              size="md"
              onPress={() => router.push('/profile')}
            />
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  signal: { paddingVertical: 1 },
  note: { marginTop: 4 },
});
