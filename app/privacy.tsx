import React from 'react';

import { Head } from '@/components/Head';
import { LegalPage } from '@/components/LegalPage';

const CONTACT = 'privacy@pathwise.lol';

export default function Privacy() {
  return (
    <>
      <Head
        title="Privacy Policy — PathWise"
        description="What PathWise collects, why, and how to delete it."
      />
      <LegalPage
        title="Privacy Policy"
        updated="24 August 2026"
        intro="PathWise is an application tracker. It stores what you type into it and nothing else. This page describes exactly what that means."
        sections={[
          {
            heading: 'What we collect',
            body: [
              'Account details: your email address, an optional display name, and a hashed version of your password. Passwords are hashed with PBKDF2 and are never stored or transmitted in readable form.',
              'Application data: whatever you record about the jobs you apply to — role, company, stage, dates, location, notes, and any recruiter contact you choose to save.',
              'A single preference: whether you have chosen the dark or light theme.',
            ],
          },
          {
            heading: 'What we do not collect',
            body: [
              'No analytics, advertising identifiers, location data, contacts, camera or microphone access, or device fingerprinting. PathWise contains no third-party tracking SDKs.',
              'We do not sell or share your data with anyone, and we do not use it to train models.',
            ],
          },
          {
            heading: 'How it is stored',
            body: [
              'Your data lives in a managed PostgreSQL database. Access is authenticated with a signed token; the app holds that token in the iOS Keychain or Android Keystore, and in browser storage on the web.',
              'All traffic between the app and the API is encrypted in transit over HTTPS.',
            ],
          },
          {
            heading: 'Service providers',
            body: [
              'Hosting and database are provided by Vercel and Neon. If you request a password reset, the reset email is delivered by Resend and contains only your email address and a single-use link that expires after one hour.',
              'These providers process data on our behalf and only to run the service.',
            ],
          },
          {
            heading: 'Deleting your data',
            body: [
              'Settings → Delete account permanently removes your account and every application attached to it, immediately and irreversibly. There is no waiting period and no soft-delete copy.',
              'You can also sign out at any time, which removes the stored token from your device without touching your data.',
            ],
          },
          {
            heading: 'Children',
            body: [
              'PathWise is not directed at children under 13, and we do not knowingly collect their data.',
            ],
          },
          {
            heading: 'Changes and contact',
            body: [
              'If this policy changes materially, the updated date above will change and the new version will be published here before it takes effect.',
              `Questions, corrections or data requests: ${CONTACT}.`,
            ],
          },
        ]}
      />
    </>
  );
}
