/**
 * Ported verbatim from `PathWise Minimal App.dc.html` (THEMES.dark / THEMES.light).
 * The design expressed these as CSS custom properties; React Native has no
 * custom properties, so they become a typed object resolved through context.
 * Alpha values are written as 0.x — React Native rejects the CSS `.x` shorthand.
 */

export type ThemeName = 'dark' | 'light';

export type Palette = {
  /** App background */
  page: string;
  /** Landing page background — white in light mode, unlike `page` */
  land: string;
  /** Alternating band on the landing page */
  band: string;
  /** Translucent sticky nav */
  nav: string;
  /** Primary text */
  fg: string;
  /** Secondary text */
  fg2: string;
  /** Tertiary text */
  fg3: string;
  /** Standard hairline */
  line: string;
  /** Faintest hairline */
  line0: string;
  /** Emphasised hairline, e.g. a focused input */
  line2: string;
  card: string;
  sheet: string;
  hover: string;
  hover2: string;
  tint: string;
  inset: string;
  /** Filled button background / foreground */
  btnbg: string;
  btnfg: string;
  red: string;
  green: string;
};

export type BadgeTone = 'neutral' | 'green' | 'red';
export type BadgeStyle = { bg: string; fg: string };

export type Theme = {
  name: ThemeName;
  colors: Palette;
  badge: Record<BadgeTone, BadgeStyle>;
  tab: { activeBg: string; activeFg: string; fg: string };
};

export const DARK: Theme = {
  name: 'dark',
  colors: {
    page: '#000000',
    land: '#000000',
    band: '#0a0a0a',
    nav: 'rgba(0,0,0,0.8)',
    fg: '#f5f5f7',
    fg2: '#86868b',
    fg3: '#6e6e73',
    line: 'rgba(255,255,255,0.1)',
    line0: 'rgba(255,255,255,0.05)',
    line2: 'rgba(255,255,255,0.3)',
    card: '#1c1c1e',
    sheet: '#1c1c1e',
    hover: 'rgba(255,255,255,0.05)',
    hover2: '#2c2c2e',
    tint: 'rgba(255,255,255,0.08)',
    inset: 'rgba(255,255,255,0.06)',
    btnbg: '#f5f5f7',
    btnfg: '#000000',
    red: '#ff453a',
    green: '#30d158',
  },
  badge: {
    neutral: { bg: 'rgba(255,255,255,0.1)', fg: '#d2d2d7' },
    green: { bg: 'rgba(48,209,88,0.18)', fg: '#30d158' },
    red: { bg: 'rgba(255,69,58,0.18)', fg: '#ff453a' },
  },
  tab: { activeBg: '#f5f5f7', activeFg: '#000000', fg: '#86868b' },
};

export const LIGHT: Theme = {
  name: 'light',
  colors: {
    page: '#f5f5f7',
    land: '#ffffff',
    band: '#f5f5f7',
    nav: 'rgba(255,255,255,0.8)',
    fg: '#1d1d1f',
    fg2: '#6e6e73',
    fg3: '#86868b',
    line: 'rgba(0,0,0,0.08)',
    line0: 'rgba(0,0,0,0.05)',
    line2: 'rgba(0,0,0,0.25)',
    card: '#ffffff',
    sheet: '#ffffff',
    hover: 'rgba(0,0,0,0.03)',
    hover2: '#f0f0f2',
    tint: 'rgba(0,0,0,0.05)',
    inset: 'rgba(0,0,0,0.04)',
    btnbg: '#1d1d1f',
    btnfg: '#ffffff',
    red: '#d70015',
    green: '#248a3d',
  },
  badge: {
    neutral: { bg: 'rgba(0,0,0,0.06)', fg: '#515154' },
    green: { bg: 'rgba(36,138,61,0.12)', fg: '#248a3d' },
    red: { bg: 'rgba(215,0,21,0.1)', fg: '#d70015' },
  },
  tab: { activeBg: '#1d1d1f', activeFg: '#ffffff', fg: '#6e6e73' },
};

export const THEMES: Record<ThemeName, Theme> = { dark: DARK, light: LIGHT };

/** The design's system font stack, minus the CSS-only fallbacks. */
export const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Stage order drives both the board columns and the analytics funnel. */
export const STAGES = ['Saved', 'Applied', 'Screening', 'Interview', 'Offer', 'Rejected'] as const;
export type Stage = (typeof STAGES)[number];

export function badgeToneFor(stage: Stage): BadgeTone {
  if (stage === 'Offer') return 'green';
  if (stage === 'Rejected') return 'red';
  return 'neutral';
}
