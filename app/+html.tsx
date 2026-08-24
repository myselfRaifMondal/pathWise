import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

import { WEB_STYLESHEET } from '@/theme/webStyles';

/**
 * Root HTML for every statically exported page. Web only — this file is never
 * bundled for native.
 *
 * The responsive stylesheet lives here rather than in component styles because
 * the static export runs in Node with no `window`: anything that asks
 * JavaScript for the viewport at render time gets 0 and bakes the wrong layout
 * into the HTML. CSS is evaluated by the browser, so it is correct on first
 * paint and needs no hydration.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#000000" />

        {/* Expo's reset: lets body scroll normally instead of being locked. */}
        <ScrollViewStyleReset />

        <style
          id="pathwise-responsive"
          dangerouslySetInnerHTML={{ __html: BASE_STYLES + WEB_STYLESHEET }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

/**
 * Painted before React mounts, so the page never flashes white on a dark theme.
 * `color-scheme` also makes native form controls and scrollbars match.
 */
const BASE_STYLES = `
:root { color-scheme: light dark; }
body { background-color: #000000; }
@media (prefers-color-scheme: light) {
  body { background-color: #f5f5f7; }
}
`;
