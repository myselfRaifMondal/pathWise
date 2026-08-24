import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Head } from '@/components/Head';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/ui/Button';
import { Field, Segmented } from '@/components/ui/Field';
import { Text } from '@/components/ui/Text';
import { toISODate } from '@/lib/format';
import { useApplications } from '@/state/ApplicationsProvider';
import { useToast } from '@/state/ToastProvider';
import { STAGES, type Stage } from '@/theme/tokens';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default function NewApplication() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useApplications();

  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState<Stage>('Applied');
  const [deadline, setDeadline] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (deadline && !ISO_DATE.test(deadline)) {
      setError('Use the format YYYY-MM-DD for the deadline.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await create({
        role: role.trim(),
        company: company.trim(),
        stage,
        deadline: deadline || null,
        location: location.trim() || null,
        // Mirrors the design: a deadline with no label is just "Deadline".
        kind: deadline ? 'Deadline' : null,
        applied: stage === 'Saved' ? null : toISODate(new Date()),
      });
      toast('Application added');
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add that application');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet
      title="New application"
      subtitle="Role and company are all you need to start."
      footer={
        <>
          <Button label="Cancel" variant="ghost" size="md" onPress={() => router.back()} />
          <Button
            label="Add application"
            size="md"
            loading={busy}
            disabled={!role.trim() || !company.trim()}
            onPress={submit}
          />
        </>
      }
    >
      <Head title="New application — PathWise" description="Log a new job or internship application." />
      <Field label="Role" value={role} onChangeText={setRole} placeholder="Frontend Engineer" />
      <Field label="Company" value={company} onChangeText={setCompany} placeholder="Vercel" />
      <Segmented label="Stage" options={STAGES} value={stage} onChange={setStage} />
      <Field
        label="Deadline"
        value={deadline}
        onChangeText={setDeadline}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      <Field label="Location" value={location} onChangeText={setLocation} placeholder="Remote" />
      {error ? (
        <View>
          <Text size={13} tone="red" accessibilityLiveRegion="polite">
            {error}
          </Text>
        </View>
      ) : null}
    </Sheet>
  );
}
