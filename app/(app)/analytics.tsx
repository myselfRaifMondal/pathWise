import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Head } from '@/components/Head';
import { Screen } from '@/components/Screen';
import { Card, EmptyState } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useApplications } from '@/state/ApplicationsProvider';
import { useDerived } from '@/state/useDerived';
import { useTheme } from '@/theme/ThemeProvider';
import { isWeb } from '@/theme/responsive';
import { useResponsive } from '@/theme/useResponsive';
import { web } from '@/theme/web';


export default function Analytics() {
  const theme = useTheme();
  const { applications } = useApplications();
  const derived = useDerived(applications, theme);
  const { wide } = useResponsive();

  const rates = [
    { label: 'Response rate', value: derived.rates.response, note: 'Any reply after applying' },
    { label: 'Interview rate', value: derived.rates.interview, note: 'Reached interview or offer' },
    { label: 'Offer rate', value: derived.rates.offer, note: 'Offers per application sent' },
  ];

  return (
    <Screen title="Analytics">
      <Head
        title="Analytics — PathWise"
        description="Response, interview and offer rates computed from your own log."
      />

      {derived.hasApplications ? (
        <>
          <View {...web('stack')} style={[styles.rates, isWeb ? null : { flexDirection: wide ? 'row' : 'column' }]}>
            {rates.map((rate) => (
              <Card key={rate.label} {...web('stack-item')} style={isWeb || !wide ? undefined : { flex: 1 }}>
                <Text size={12} tone="fg2" weight="500">
                  {rate.label}
                </Text>
                <Text size={44} weight="600">
                  {rate.value}
                </Text>
                <Text size={12} tone="fg3">
                  {rate.note}
                </Text>
              </Card>
            ))}
          </View>

          <Card style={styles.funnel}>
            <Text size={15} weight="600" style={styles.funnelTitle}>
              Funnel
            </Text>
            {derived.funnel.map((row) => (
              <View key={row.stage} style={styles.funnelRow}>
                <Text size={13} tone="fg2" style={styles.funnelLabel}>
                  {row.stage}
                </Text>
                <View style={[styles.track, { backgroundColor: theme.colors.inset }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${row.widthPct}%`,
                        backgroundColor:
                          row.stage === 'Offer'
                            ? theme.colors.green
                            : row.stage === 'Rejected'
                              ? theme.colors.red
                              : theme.colors.fg2,
                      },
                    ]}
                  />
                </View>
                <Text size={13} weight="500" style={styles.funnelCount}>
                  {row.count}
                </Text>
              </View>
            ))}
          </Card>

          <View {...web('stack')} style={[styles.rates, isWeb ? null : { flexDirection: wide ? 'row' : 'column' }]}>
            <Card {...web('stack-item')} style={isWeb || !wide ? undefined : { flex: 1 }}>
              <Text size={12} tone="fg2" weight="500">
                Offers
              </Text>
              <Text size={40} weight="600" tone="green">
                {derived.offers}
              </Text>
            </Card>
            <Card {...web('stack-item')} style={isWeb || !wide ? undefined : { flex: 1 }}>
              <Text size={12} tone="fg2" weight="500">
                Rejected
              </Text>
              <Text size={40} weight="600" tone="red">
                {derived.rejected}
              </Text>
            </Card>
          </View>
        </>
      ) : (
        <Card>
          <EmptyState
            title="Nothing to measure yet"
            body="Rates appear once you have logged an application or two."
          />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rates: { gap: 12 },
  funnel: { marginVertical: 12 },
  funnelTitle: { marginBottom: 16 },
  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 7 },
  funnelLabel: { width: 84 },
  track: { flex: 1, height: 10, borderRadius: 980, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 980 },
  funnelCount: { width: 28, textAlign: 'right' },
});
