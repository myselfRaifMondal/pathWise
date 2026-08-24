import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { AuthError, AuthLink, AuthShell } from '@/components/AuthShell';
import { Head } from '@/components/Head';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Text } from '@/components/ui/Text';
import { useAuth } from '@/state/AuthProvider';

const MIN_PASSWORD = 8;

export default function SignUp() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      router.replace('/overview');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create your account');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      footer={
        <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
          <Text size={13} tone="fg2">
            Already registered?
          </Text>
          <AuthLink label="Sign in" onPress={() => router.replace('/signin')} />
        </View>
      }
    >
      <Head
        title="Create your PathWise account"
        description="Track every job and internship application in one place."
      />
      <Field placeholder="Name" value={name} onChangeText={setName} autoComplete="name" />
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
        autoComplete="new-password"
        textContentType="newPassword"
        hint={`At least ${MIN_PASSWORD} characters.`}
        onSubmitEditing={submit}
        returnKeyType="go"
      />
      <AuthError message={error} />
      <Button
        label="Create account"
        size="md"
        fullWidth
        loading={busy}
        disabled={!email || password.length < MIN_PASSWORD}
        onPress={submit}
      />
    </AuthShell>
  );
}
