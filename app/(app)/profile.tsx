import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Head } from '@/components/Head';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/ui/Button';
import { Field, Segmented } from '@/components/ui/Field';
import { Divider } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { api } from '@/lib/api';
import { SENIORITIES, WORK_TYPES, type Profile, type Seniority, type WorkType } from '@/lib/types';
import { useApplications } from '@/state/ApplicationsProvider';
import { useToast } from '@/state/ToastProvider';
import { useTheme } from '@/theme/ThemeProvider';

/** Comma-separated in the input, array over the wire. */
const toList = (value: string) =>
  value.split(',').map((part) => part.trim()).filter(Boolean);

export default function ProfileSheet() {
  const router = useRouter();
  const toast = useToast();
  const theme = useTheme();
  const { demo } = useApplications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [seniority, setSeniority] = useState<Seniority | null>(null);
  const [workType, setWorkType] = useState<WorkType | null>(null);

  useEffect(() => {
    if (demo) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .getProfile()
      .then((profile: Profile) => {
        if (cancelled) return;
        setForm({
          fullName: profile.fullName ?? '',
          phone: profile.phone ?? '',
          currentLocation: profile.currentLocation ?? '',
          resumeUrl: profile.resumeUrl ?? '',
          noticePeriod: profile.noticePeriod ?? '',
          workAuthorization: profile.workAuthorization ?? '',
          targetRoles: profile.targetRoles.join(', '),
          preferredLocations: profile.preferredLocations.join(', '),
          skills: profile.skills.join(', '),
          yearsExperience: profile.yearsExperience?.toString() ?? '',
          education: profile.education ?? '',
          expectedSalaryMin: profile.expectedSalaryMin?.toString() ?? '',
          portfolioUrl: profile.portfolioUrl ?? '',
          linkedinUrl: profile.linkedinUrl ?? '',
          githubUrl: profile.githubUrl ?? '',
        });
        setSeniority(profile.seniority);
        setWorkType(profile.workType);
      })
      .catch((caught) =>
        setError(caught instanceof Error ? caught.message : 'Could not load your details'),
      )
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [demo]);

  const set = (key: string) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.saveProfile({
        fullName: form.fullName,
        phone: form.phone,
        currentLocation: form.currentLocation,
        resumeUrl: form.resumeUrl,
        noticePeriod: form.noticePeriod,
        workAuthorization: form.workAuthorization,
        targetRoles: toList(form.targetRoles ?? ''),
        seniority,
        preferredLocations: toList(form.preferredLocations ?? ''),
        workType,
        skills: toList(form.skills ?? ''),
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
        education: form.education,
        expectedSalaryMin: form.expectedSalaryMin ? Number(form.expectedSalaryMin) : null,
        portfolioUrl: form.portfolioUrl,
        linkedinUrl: form.linkedinUrl,
        githubUrl: form.githubUrl,
      });
      toast('Details saved');
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your details');
    } finally {
      setSaving(false);
    }
  };

  if (demo) {
    return (
      <Sheet title="Application details" subtitle="Sample data — nothing is saved in the demo.">
        <Head title="Application details — PathWise" description="Your reusable job application profile." />
        <Text size={14} tone="fg2">
          Create an account to keep these details and reuse them across applications.
        </Text>
        <Button label="Create an account" size="md" onPress={() => router.push('/signup')} />
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Application details"
      subtitle="Filled in once, reused for every application."
      footer={
        <>
          <Button label="Cancel" variant="ghost" size="md" onPress={() => router.back()} />
          <Button label="Save details" size="md" loading={saving} onPress={submit} />
        </>
      }
    >
      <Head title="Application details — PathWise" description="Your reusable job application profile." />

      {loading ? (
        <ActivityIndicator color={theme.colors.fg2} />
      ) : (
        <>
          <Section title="About you" />
          <Field label="Full name" value={form.fullName} onChangeText={set('fullName')} placeholder="Raif Mondal" />
          <Field label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="+91…" keyboardType="phone-pad" />
          <Field label="Current location" value={form.currentLocation} onChangeText={set('currentLocation')} placeholder="Bengaluru" />
          <Field label="Résumé link" value={form.resumeUrl} onChangeText={set('resumeUrl')} placeholder="https://…" autoCapitalize="none" />
          <Field label="Notice period" value={form.noticePeriod} onChangeText={set('noticePeriod')} placeholder="30 days, or Immediate" />
          <Field label="Work authorisation" value={form.workAuthorization} onChangeText={set('workAuthorization')} placeholder="Indian citizen, needs visa, …" />

          <Divider />
          <Section title="What you are looking for" />
          <Field label="Target roles" value={form.targetRoles} onChangeText={set('targetRoles')} placeholder="Frontend Engineer, Design Engineer" hint="Separate with commas." />
          <Segmented label="Seniority" options={SENIORITIES} value={seniority ?? 'Mid'} onChange={setSeniority} />
          <Field label="Preferred locations" value={form.preferredLocations} onChangeText={set('preferredLocations')} placeholder="Bengaluru, Remote" hint="Separate with commas." />
          <Segmented label="Work type" options={WORK_TYPES} value={workType ?? 'Any'} onChange={setWorkType} />

          <Divider />
          <Section title="Fit" />
          <Field label="Skills" value={form.skills} onChangeText={set('skills')} placeholder="TypeScript, React Native, Python" hint="Separate with commas." />
          <Field label="Years of experience" value={form.yearsExperience} onChangeText={set('yearsExperience')} placeholder="3" keyboardType="number-pad" />
          <Field label="Education" value={form.education} onChangeText={set('education')} placeholder="B.Tech, Computer Science" />

          <Divider />
          <Section title="Compensation and links" />
          <Field label="Minimum expected salary" value={form.expectedSalaryMin} onChangeText={set('expectedSalaryMin')} placeholder="1800000" keyboardType="number-pad" hint="Per year, in INR." />
          <Field label="Portfolio" value={form.portfolioUrl} onChangeText={set('portfolioUrl')} placeholder="https://…" autoCapitalize="none" />
          <Field label="LinkedIn" value={form.linkedinUrl} onChangeText={set('linkedinUrl')} placeholder="https://linkedin.com/in/…" autoCapitalize="none" />
          <Field label="GitHub" value={form.githubUrl} onChangeText={set('githubUrl')} placeholder="https://github.com/…" autoCapitalize="none" />

          {error ? (
            <Text size={13} tone="red" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
        </>
      )}
    </Sheet>
  );
}

function Section({ title }: { title: string }) {
  return (
    <View>
      <Text size={15} weight="600">
        {title}
      </Text>
    </View>
  );
}
