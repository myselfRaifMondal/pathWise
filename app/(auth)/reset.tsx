import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';

import { AuthError, AuthLink, AuthShell } from '@/components/AuthShell';
import { Head } from '@/components/Head';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Text } from '@/components/ui/Text';
import { api, tokens } from '@/lib/api';
import { useToast } from '@/state/ToastProvider';

const MIN_PASSWORD = 8;

/** Landing point for the link emailed by POST /api/auth/forgot. */
export default function Reset() {
  const router = useRouter();
  const toast = useToast();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api.resetPassword(token, password);
      await tokens.write(result.accessToken, result.refreshToken);
      toast('Password updated');
      router.replace('/overview');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not reset your password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      footer={<AuthLink label="Back to sign in" onPress={() => router.replace('/signin')} />}
    >
      <Head title="Choose a new password — PathWise" description="Set a new PathWise password." />
      {token ? (
        <>
          <Field
            placeholder="New password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD} characters.`}
            onSubmitEditing={submit}
            returnKeyType="go"
          />
          <AuthError message={error} />
          <Button
            label="Update password"
            size="md"
            fullWidth
            loading={busy}
            disabled={password.length < MIN_PASSWORD}
            onPress={submit}
          />
        </>
      ) : (
        <Text size={13} tone="fg2">
          This link is missing its reset token. Request a new one from the sign-in screen.
        </Text>
      )}
    </AuthShell>
  );
}
