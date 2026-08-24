import React from 'react';
import { Platform } from 'react-native';

/**
 * Per-route document metadata for the static web export. `expo export --platform
 * web` writes one HTML file per route, so this is what crawlers and app-store
 * reviewers see. On native it renders nothing.
 */
export function Head({ title, description }: { title: string; description: string }) {
  if (Platform.OS !== 'web') return null;

  // expo-router/head is web-only; requiring it lazily keeps it out of native bundles.
  const ExpoHead = require('expo-router/head').default;
  return (
    <ExpoHead>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="PathWise" />
      <meta name="twitter:card" content="summary_large_image" />
    </ExpoHead>
  );
}
