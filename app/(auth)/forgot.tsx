import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { AuthError, AuthLink, AuthShell } from '@/components/AuthShell';
import { Head } from '@/components/Head';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/state/AuthProvider';
import { useToast } from '@/state/ToastProvider';

export default function Forgot() {
  const router = useRouter();
  const { forgot } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      // The API answers identically whether or not the address exists, so the
      // screen must not claim an account was found.
      toast(await forgot(email.trim()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send the reset link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      footer={
        <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
          <Text size={13} tone="fg2">
            Remembered it?
          </Text>
          <AuthLink label="Sign in" onPress={() => router.replace('/signin')} />
        </View>
      }
    >
      <Head title="Reset your password — PathWise" description="Request a PathWise password reset link." />
      <Field
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onSubmitEditing={submit}
        returnKeyType="go"
      />
      <AuthError message={error} />
      <Button
        label="Send reset link"
        size="md"
        fullWidth
        loading={busy}
        disabled={!email}
        onPress={submit}
      />
    </AuthShell>
  );
}
