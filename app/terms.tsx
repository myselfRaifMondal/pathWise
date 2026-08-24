import React from 'react';

import { Head } from '@/components/Head';
import { LegalPage } from '@/components/LegalPage';

export default function Terms() {
  return (
    <>
      <Head title="Terms of Service — PathWise" description="The terms for using PathWise." />
      <LegalPage
        title="Terms of Service"
        updated="24 August 2026"
        intro="These terms cover your use of PathWise on the web, iOS and Android."
        sections={[
          {
            heading: 'Your account',
            body: [
              'You need an account to save applications. Keep your password to yourself; you are responsible for what happens under your account.',
              'One person per account. You must be old enough to form a binding contract where you live.',
            ],
          },
          {
            heading: 'Your data is yours',
            body: [
              'You keep all rights to what you put into PathWise. We claim no ownership over your applications, notes or contacts.',
              'You can delete your account, and everything in it, from Settings at any time.',
            ],
          },
          {
            heading: 'Acceptable use',
            body: [
              'Do not attempt to access other people’s accounts, disrupt the service, or use it to store unlawful content.',
              'We may suspend an account that is being used to attack the service or harm other users.',
            ],
          },
          {
            heading: 'Availability',
            body: [
              'PathWise is provided as-is. We aim to keep it running and to keep your data safe, but we do not guarantee uninterrupted availability, and we are not liable for indirect or consequential losses arising from downtime or data loss.',
              'Keep your own copy of anything you cannot afford to lose.',
            ],
          },
          {
            heading: 'Paid plans',
            body: [
              'Paid plans, where offered, are billed in advance and can be cancelled at any time; cancelling stops future charges and leaves your data intact on the free tier limits.',
            ],
          },
          {
            heading: 'Changes',
            body: [
              'If these terms change materially, the updated date above will change and the new version will be published here before it takes effect. Continuing to use PathWise after that means you accept the change.',
            ],
          },
        ]}
      />
    </>
  );
}
