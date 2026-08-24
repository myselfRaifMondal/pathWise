import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';

import { Head } from '@/components/Head';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Card, Divider } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useApplications } from '@/state/ApplicationsProvider';
import { useAuth } from '@/state/AuthProvider';
import { useToast } from '@/state/ToastProvider';
import { useThemeControls } from '@/theme/ThemeProvider';

/** Confirm destructive actions on both platforms — Alert is a no-op shim on web. */
async function confirmDestructive(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert
    return typeof window !== 'undefined' ? window.confirm(`${title}\n\n${message}`) : false;
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export default function Settings() {
  const router = useRouter();
  const toast = useToast();
  const { user, updateProfile, signOut, deleteAccount } = useAuth();
  const { demo, endDemo } = useApplications();
  const { theme, override, setOverride } = useThemeControls();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
      toast('Changes saved');
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : 'Could not save your changes');
    } finally {
      setSaving(false);
    }
  };

  const chooseTheme = async (next: 'dark' | 'light') => {
    setOverride(next);
    if (!demo && user) {
      try {
        await updateProfile({ themePreference: next });
      } catch {
        // The local preference already applied; a failed sync is not worth a toast.
      }
    }
  };

  const onDeleteAccount = async () => {
    const confirmed = await confirmDestructive(
      'Delete your account?',
      'This permanently removes your account and every application you have logged. It cannot be undone.',
    );
    if (!confirmed) return;
    try {
      await deleteAccount();
      toast('Account deleted');
      router.replace('/');
    } catch (caught) {
      toast(caught instanceof Error ? caught.message : 'Could not delete your account');
    }
  };

  return (
    <Screen title="Settings">
      <Head title="Settings — PathWise" description="Manage your PathWise profile and appearance." />

      <Card style={styles.card}>
        <Text size={15} weight="600">
          Appearance
        </Text>
        <Text size={13} tone="fg2">
          PathWise follows your device by default.
        </Text>
        <View style={styles.row}>
          <Button
            label="Dark"
            variant={theme.name === 'dark' ? 'filled' : 'outline'}
            onPress={() => chooseTheme('dark')}
          />
          <Button
            label="Light"
            variant={theme.name === 'light' ? 'filled' : 'outline'}
            onPress={() => chooseTheme('light')}
          />
          {override ? (
            <Button label="Match device" variant="ghost" onPress={() => setOverride(null)} />
          ) : null}
        </View>
      </Card>

      {demo ? (
        <Card style={styles.card}>
          <Text size={15} weight="600">
            You are viewing the demo
          </Text>
          <Text size={13} tone="fg2">
            These twelve applications are sample data. Nothing here is saved to an account.
          </Text>
          <View style={styles.row}>
            <Button label="Create an account" onPress={() => router.push('/signup')} />
            <Button
              label="Leave the demo"
              variant="outline"
              onPress={() => {
                endDemo();
                router.replace('/');
              }}
            />
          </View>
        </Card>
      ) : (
        <>
          <Card style={styles.card}>
            <Text size={15} weight="600">
              Profile
            </Text>
            <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
            <Field
              label="Email"
              value={user?.email ?? ''}
              editable={false}
              hint="Your sign-in address cannot be changed yet."
            />
            <View style={styles.row}>
              <Button label="Save changes" loading={saving} onPress={saveProfile} />
            </View>
          </Card>

          <Card style={styles.card}>
            <Text size={15} weight="600">
              Account
            </Text>
            <View style={styles.row}>
              <Button
                label="Sign out"
                variant="outline"
                onPress={async () => {
                  await signOut();
                  router.replace('/');
                }}
              />
            </View>
            <Divider />
            <Text size={13} tone="fg2">
              Deleting your account permanently removes it and every application you have logged.
            </Text>
            <View style={styles.row}>
              <Button label="Delete account" variant="destructive" onPress={onDeleteAccount} />
            </View>
          </Card>
        </>
      )}

      <Card style={styles.card}>
        <Text size={15} weight="600">
          About
        </Text>
        <View style={styles.row}>
          <Button label="Privacy" variant="ghost" onPress={() => router.push('/privacy')} />
          <Button label="Terms" variant="ghost" onPress={() => router.push('/terms')} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
});
