import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Head } from '@/components/Head';
import { Nav } from '@/components/Nav';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useApplications } from '@/state/ApplicationsProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { isWeb } from '@/theme/responsive';
import { useResponsive } from '@/theme/useResponsive';
import { web } from '@/theme/web';

const AUTHOR_URL = 'https://github.com/myselfRaifMondal';

const FEATURES = [
  {
    title: 'Six stages.\nNo ambiguity.',
    body: 'Saved to offer, every application sits in exactly one place. Drag it forward when something happens.',
  },
  {
    title: 'Deadlines that\nsurface themselves.',
    body: 'Assessments, interviews and offer expiries appear before they are due. Not after.',
  },
  {
    title: 'A funnel,\nnot a feeling.',
    body: 'Response, interview and offer rates computed from your own log.',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    cadence: 'forever',
    cta: 'Get started',
    featured: false,
    features: [
      'Up to 25 applications',
      'All six stages and the board',
      'Deadlines and calendar',
      'One device',
    ],
  },
  {
    name: 'Plus',
    price: '₹149',
    cadence: 'per month · ₹1,190 per year',
    cta: 'Try Plus free for 14 days',
    featured: true,
    features: [
      'Unlimited applications',
      'Notes and contacts on every application',
      'Analytics — response, interview and offer rates',
      'Deadline reminders by email',
      'CSV export and sync across devices',
    ],
  },
  {
    name: 'Coach',
    price: '₹499',
    cadence: 'per month, per coach',
    cta: 'Start with Coach',
    featured: false,
    features: [
      'Everything in Plus',
      'Up to 20 candidate workspaces',
      'Shared boards with comments',
      'Funnel reports across candidates',
      'For advisors and career centers',
    ],
  },
];

export default function Landing() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startDemo } = useApplications();
  // On web every size below comes from CSS (theme/webStyles.ts); `gutter` is
  // undefined there and the [data-pw="gutter"] rule applies the padding.
  const { wide, gutter } = useResponsive();

  const openDemo = () => {
    startDemo();
    router.push('/overview');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.land, paddingTop: insets.top }}>
      <Head
        title="PathWise — every application, accounted for"
        description="The simplest way to track jobs, internships and everything in between. Six stages, deadlines that surface themselves, and a funnel computed from your own log."
      />
      <Nav />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
        <View {...web('gutter')} style={[styles.hero, { paddingHorizontal: gutter }]}>
          <Text variant="hero" style={styles.center}>
            {'Every application,\naccounted for.'}
          </Text>
          <Text variant="subtitle" tone="fg2" style={[styles.center, styles.measure]}>
            The simplest way to track jobs, internships and everything in between.
          </Text>
          <View style={styles.heroActions}>
            <Button label="Get started" size="lg" onPress={() => router.push('/signup')} />
            <Button label="View the demo" size="lg" variant="outline" onPress={openDemo} />
          </View>
        </View>

        {FEATURES.map((feature, index) => (
          <View
            key={feature.title}
            {...web('gutter')}
            style={[
              styles.band,
              { paddingHorizontal: gutter,
                backgroundColor: index % 2 === 0 ? theme.colors.band : theme.colors.land },
            ]}
          >
            <Text variant="bandHeading" style={styles.center}>
              {feature.title}
            </Text>
            <Text variant="bandBody" tone="fg2" style={[styles.center, styles.measure]}>
              {feature.body}
            </Text>
          </View>
        ))}

        <View {...web('gutter')} style={[styles.band, { paddingHorizontal: gutter }]}>
          <Text variant="bandHeading" style={styles.center}>
            {'Pricing that\nstays out of the way.'}
          </Text>
          <Text variant="bandBody" tone="fg2" style={[styles.center, styles.measure]}>
            Free covers a full job search. Pay only when you need more.
          </Text>

          <View
            {...web('stack')}
            style={[styles.plans, isWeb ? null : { flexDirection: wide ? 'row' : 'column' }]}
          >
            {PLANS.map((plan) => (
              <View
                key={plan.name}
                {...web('stack-item')}
                style={[
                  styles.plan,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: plan.featured ? theme.colors.line2 : theme.colors.line,
                  },
                  isWeb || !wide ? null : { flex: 1 },
                ]}
              >
                <View style={styles.planHead}>
                  <Text size={15} weight="600">
                    {plan.name}
                  </Text>
                  {plan.featured ? (
                    <View style={[styles.pill, { backgroundColor: theme.colors.tint }]}>
                      <Text size={11} weight="500" tone="fg2">
                        Most popular
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="planPrice">{plan.price}</Text>
                <Text size={13} tone="fg2">
                  {plan.cadence}
                </Text>
                <View style={styles.planFeatures}>
                  {plan.features.map((item) => (
                    <Text key={item} size={13} tone="fg2">
                      {item}
                    </Text>
                  ))}
                </View>
                <Button
                  label={plan.cta}
                  fullWidth
                  size="md"
                  variant={plan.featured ? 'filled' : 'outline'}
                  onPress={() => router.push('/signup')}
                />
              </View>
            ))}
          </View>

          <Text size={12} tone="fg3" style={[styles.center, styles.fineprint]}>
            Prices in INR, taxes included. Cancel anytime; your data exports with you.
          </Text>
        </View>

        <View {...web('gutter')} style={[styles.band, { paddingHorizontal: gutter }]}>
          <Text variant="bandHeading" style={styles.center}>
            Start tracking.
          </Text>
          <Button
            label="Create account"
            size="lg"
            style={styles.finalCta}
            onPress={() => router.push('/signup')}
          />
        </View>

        <View
          {...web('gutter')}
          style={[styles.footer, { paddingHorizontal: gutter, borderColor: theme.colors.line }]}
        >
          <Text size={12} tone="fg3">
            © {new Date().getFullYear()} PathWise
          </Text>
          <View style={styles.footerLinks}>
            <Text size={12} tone="fg3" onPress={() => router.push('/privacy')}>
              Privacy
            </Text>
            <Text size={12} tone="fg3" onPress={() => router.push('/terms')}>
              Terms
            </Text>
            <Text
              size={12}
              tone="fg3"
              accessibilityRole="link"
              href={AUTHOR_URL}
              hrefAttrs={{ rel: 'author noopener', target: '_blank' }}
              onPress={() => Linking.openURL(AUTHOR_URL)}
              style={styles.credit}
            >
              Built by Raif Mondal
            </Text>
            <Text size={12} tone="fg3">
              Your data stays yours.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  hero: { paddingTop: 96, paddingBottom: 88, alignItems: 'center', gap: 20 },
  measure: { alignSelf: 'center' },
  heroActions: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  band: { paddingVertical: 88, alignItems: 'center', gap: 16 },
  plans: { gap: 20, marginTop: 24, width: '100%', maxWidth: 1000, alignSelf: 'center' },
  plan: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 28, gap: 8 },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { paddingHorizontal: 10, height: 22, borderRadius: 980, justifyContent: 'center' },
  planFeatures: { gap: 8, marginVertical: 20 },
  fineprint: { marginTop: 20, maxWidth: 420 },
  // Button defaults to alignSelf:'flex-start', which overrides the band's
  // alignItems:'center'. The style prop is applied last, so centre it here.
  finalCta: { alignSelf: 'center', marginTop: 8 },
  footer: {
    paddingVertical: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
    alignItems: 'center',
  },
  footerLinks: { flexDirection: 'row', gap: 20, flexWrap: 'wrap', justifyContent: 'center' },
  credit: { textDecorationLine: 'underline' },
});
