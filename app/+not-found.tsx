import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Head } from '@/components/Head';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export default function NotFound() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.colors.page }]}>
      <Head title="Not found — PathWise" description="This page does not exist." />
      <Text size={44} weight="600">
        404
      </Text>
      <Text size={15} tone="fg2">
        That page does not exist.
      </Text>
      <Button label="Back to PathWise" size="md" onPress={() => router.replace('/')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
});
