import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Head } from '@/components/Head';
import { Nav } from '@/components/Nav';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useApplications } from '@/state/ApplicationsProvider';
import { useTheme } from '@/theme/ThemeProvider';

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
  const { width } = useWindowDimensions();
  const { startDemo } = useApplications();

  const wide = width >= 900;
  const gutter = wide ? 48 : 24;
  const heroSize = wide ? 72 : Math.min(44, width * 0.11);
  const bandSize = wide ? 44 : 30;

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
        <View style={[styles.hero, { paddingHorizontal: gutter }]}>
          <Text size={heroSize} weight="600" style={styles.center}>
            {'Every application,\naccounted for.'}
          </Text>
          <Text size={wide ? 21 : 17} tone="fg2" style={[styles.center, styles.heroBody]}>
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
            style={[
              styles.band,
              {
                paddingHorizontal: gutter,
                backgroundColor: index % 2 === 0 ? theme.colors.band : theme.colors.land,
              },
            ]}
          >
            <Text size={bandSize} weight="600" style={styles.center}>
              {feature.title}
            </Text>
            <Text size={wide ? 17 : 15} tone="fg2" style={[styles.center, styles.bandBody]}>
              {feature.body}
            </Text>
          </View>
        ))}

        <View style={[styles.band, { paddingHorizontal: gutter }]}>
          <Text size={bandSize} weight="600" style={styles.center}>
            {'Pricing that\nstays out of the way.'}
          </Text>
          <Text size={wide ? 17 : 15} tone="fg2" style={[styles.center, styles.bandBody]}>
            Free covers a full job search. Pay only when you need more.
          </Text>

          <View style={[styles.plans, { flexDirection: wide ? 'row' : 'column' }]}>
            {PLANS.map((plan) => (
              <View
                key={plan.name}
                style={[
                  styles.plan,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: plan.featured ? theme.colors.line2 : theme.colors.line,
                    flex: wide ? 1 : undefined,
                  },
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
                <Text size={40} weight="600">
                  {plan.price}
                </Text>
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

        <View style={[styles.band, { paddingHorizontal: gutter }]}>
          <Text size={bandSize} weight="600" style={styles.center}>
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
  heroBody: { maxWidth: 420 },
  heroActions: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  band: { paddingVertical: 88, alignItems: 'center', gap: 16 },
  bandBody: { maxWidth: 460 },
  plans: { gap: 20, marginTop: 24, width: '100%', maxWidth: 1000, alignSelf: 'center' },
  plan: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 28, gap: 8 },
  planHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pill: { paddingHorizontal: 10, height: 22, borderRadius: 980, justifyContent: 'center' },
  planFeatures: { gap: 8, marginVertical: 20 },
  fineprint: { marginTop: 20, maxWidth: 420 },
  finalCta: { marginTop: 8 },
  footer: {
    paddingVertical: 32,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
    alignItems: 'center',
  },
  footerLinks: { flexDirection: 'row', gap: 20 },
});
