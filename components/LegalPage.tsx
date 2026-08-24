import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { isWeb } from '@/theme/responsive';
import { useResponsive } from '@/theme/useResponsive';
import { web } from '@/theme/web';


export type LegalSection = { heading: string; body: string[] };

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { gutter } = useResponsive();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.page }}
      {...web('gutter')}
      contentContainerStyle={{
        paddingHorizontal: gutter,
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 64,
      }}
    >
      <View style={styles.column}>
        <Button label="← Back" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <Text variant="screenTitle">{title}</Text>
        <Text size={12} tone="fg3" style={styles.updated}>
          Last updated {updated}
        </Text>
        <Text size={15} tone="fg2" style={styles.intro}>
          {intro}
        </Text>

        {sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text size={17} weight="600">
              {section.heading}
            </Text>
            {section.body.map((paragraph) => (
              <Text key={paragraph} size={14} tone="fg2" style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  column: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  back: { marginBottom: 20, marginLeft: -20 },
  updated: { marginTop: 6 },
  intro: { marginTop: 20 },
  section: { marginTop: 32, gap: 10 },
  paragraph: { lineHeight: 22 },
});
