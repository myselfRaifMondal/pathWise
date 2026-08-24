import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Head } from '@/components/Head';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/ui/Button';
import { Segmented } from '@/components/ui/Field';
import { Badge, Divider } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useApplications } from '@/state/ApplicationsProvider';
import { useToast } from '@/state/ToastProvider';
import { useDerived } from '@/state/useDerived';
import { useTheme } from '@/theme/ThemeProvider';
import { STAGES, badgeToneFor, type Stage } from '@/theme/tokens';

async function confirmDelete(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    return typeof window !== 'undefined'
      ? window.confirm('Remove this application?\n\nThis cannot be undone.')
      : false;
  }
  return new Promise((resolve) => {
    Alert.alert('Remove this application?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Remove', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function ApplicationDetail() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { applications, moveToStage, remove } = useApplications();
  const derived = useDerived(applications, theme);
  const [busy, setBusy] = useState(false);

  const application = derived.applications.find((row) => String(row.id) === String(id));

  if (!application) {
    return (
      <Sheet title="Application not found">
        <Text size={13} tone="fg2">
          This application no longer exists. It may have been removed on another device.
        </Text>
        <Button label="Back" variant="outline" size="md" onPress={() => router.back()} />
      </Sheet>
    );
  }

  const changeStage = async (stage: Stage) => {
    if (stage === application.stage) return;
    try {
      await moveToStage(application.id, stage);
      toast(`${application.company} moved to ${stage}`);
    } catch {
      toast('Could not move that application');
    }
  };

  const onDelete = async () => {
    if (!(await confirmDelete())) return;
    setBusy(true);
    try {
      await remove(application.id);
      toast('Application removed');
      router.back();
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : 'Could not remove that application');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      title={application.role}
      subtitle={application.company}
      footer={
        <>
          <Button
            label="Remove"
            variant="destructive"
            size="md"
            loading={busy}
            onPress={onDelete}
          />
          <Button label="Done" size="md" onPress={() => router.back()} />
        </>
      }
    >
      <Head
        title={`${application.role} at ${application.company} — PathWise`}
        description="Application detail."
      />

      <View style={styles.badgeRow}>
        <Badge label={application.stage} tone={theme.badge[badgeToneFor(application.stage)]} />
        {application.location ? (
          <Text size={13} tone="fg2">
            {application.location}
          </Text>
        ) : null}
      </View>

      <Segmented label="Stage" options={STAGES} value={application.stage} onChange={changeStage} />

      <Divider />

      <Row label="Applied" value={application.appliedLong} />
      <Row
        label="Deadline"
        value={
          application.deadline
            ? `${application.deadlineLong}${application.kind ? ` · ${application.kind}` : ''}`
            : '—'
        }
        valueColor={application.deadlineColor}
      />

      <Divider />

      <View style={styles.block}>
        <Text size={12} tone="fg2" weight="500">
          Note
        </Text>
        <Text size={14} tone={application.note ? 'fg' : 'fg3'}>
          {application.note ?? 'No note yet.'}
        </Text>
      </View>

      <View style={styles.block}>
        <Text size={12} tone="fg2" weight="500">
          Contact
        </Text>
        {application.contact?.name ? (
          <View style={styles.contact}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.tint }]}>
              <Text size={12} weight="600" tone="fg2">
                {application.contactInitials}
              </Text>
            </View>
            <View style={styles.grow}>
              <Text size={14} weight="500">
                {application.contact.name}
              </Text>
              <Text size={12} tone="fg2">
                {[application.contact.title, application.contact.email]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
          </View>
        ) : (
          <Text size={14} tone="fg3">
            No contact recorded.
          </Text>
        )}
      </View>
    </Sheet>
  );
}

function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text size={13} tone="fg2">
        {label}
      </Text>
      <Text size={13} weight="500" style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 2 },
  block: { gap: 6 },
  contact: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 36, height: 36, borderRadius: 980, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, gap: 2 },
});
