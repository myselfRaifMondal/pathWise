import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { AuthError, AuthLink, AuthShell } from '@/components/AuthShell';
import { Head } from '@/components/Head';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/state/AuthProvider';

export default function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      router.replace('/overview');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to PathWise"
      footer={
        <>
          <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
            <Text size={13} tone="fg2">
              New here?
            </Text>
            <AuthLink label="Create an account" onPress={() => router.replace('/signup')} />
          </View>
          <AuthLink label="Forgot password?" onPress={() => router.replace('/forgot')} />
        </>
      }
    >
      <Head title="Sign in — PathWise" description="Sign in to your PathWise application tracker." />
      <Field
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Field
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={submit}
        returnKeyType="go"
      />
      <AuthError message={error} />
      <Button
        label="Sign in"
        size="md"
        fullWidth
        loading={busy}
        disabled={!email || !password}
        onPress={submit}
      />
    </AuthShell>
  );
}
