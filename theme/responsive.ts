import { Platform, type TextStyle } from 'react-native';

/**
 * One definition of the type scale, used to generate the web stylesheet
 * (app/+html.tsx) and to compute native styles.
 *
 * Why this exists: Expo's static web export prerenders in Node, where there is
 * no `window`, so `useWindowDimensions()` returns 0 and every `width >= 900`
 * check silently takes its narrow branch — which then gets baked into the HTML.
 * On web the browser must decide, so sizes are expressed as CSS `clamp()` and
 * never computed in JS. Native has a real viewport and computes the same curve.
 */

/** Width at which the structural layout switches from stacked to side-by-side. */
export const LAYOUT_BREAKPOINT = 900;
/** Width at which a modal stops being full-bleed. */
export const SHEET_BREAKPOINT = 700;

export type TypeRole =
  | 'hero'
  | 'bandHeading'
  | 'subtitle'
  | 'bandBody'
  | 'screenTitle'
  | 'planPrice';

export type TypeSpec = {
  /** Floor, in px. */
  min: number;
  /** Ceiling, in px. */
  max: number;
  /** Growth rate, in vw. */
  vw: number;
  weight: TextStyle['fontWeight'];
  /** Multiplier, as the design expresses it. */
  lineHeight: number;
  /** Tracking in em, matching the design's `letter-spacing`. */
  tracking: number;
  /** Measure in ch, as the design expresses it. */
  maxWidthCh?: number;
};

/**
 * Values taken from `PathWise Minimal App.dc.html`.
 *
 * One deliberate deviation: the design's hero is `clamp(64px, 8vw, 96px)`, which
 * pins 64px on a phone and overflows a 390px screen. The floor is lowered to
 * 40px so it scales down gracefully. Above ~800px — every width the design was
 * actually drawn at — the two are identical, because 8vw dominates there.
 */
export const TYPE: Record<TypeRole, TypeSpec> = {
  hero: { min: 40, max: 96, vw: 8, weight: '700', lineHeight: 1.02, tracking: -0.02 },
  bandHeading: { min: 28, max: 44, vw: 3.6, weight: '600', lineHeight: 1.08, tracking: -0.02 },
  subtitle: { min: 19, max: 26, vw: 2, weight: '400', lineHeight: 1.35, tracking: -0.01, maxWidthCh: 24 },
  bandBody: { min: 16, max: 21, vw: 1.7, weight: '400', lineHeight: 1.45, tracking: -0.01, maxWidthCh: 34 },
  screenTitle: { min: 28, max: 34, vw: 2.6, weight: '600', lineHeight: 1.1, tracking: -0.02 },
  planPrice: { min: 32, max: 40, vw: 3, weight: '600', lineHeight: 1.1, tracking: -0.02 },
};

/** Approximate width of the "0" glyph, for turning `ch` into px on native. */
const CH_RATIO = 0.52;

export function nativeTypeStyle(role: TypeRole, viewportWidth: number): TextStyle {
  const spec = TYPE[role];
  const fluid = (viewportWidth * spec.vw) / 100;
  const fontSize = Math.round(Math.min(spec.max, Math.max(spec.min, fluid)));
  return {
    fontSize,
    fontWeight: spec.weight,
    lineHeight: Math.round(fontSize * spec.lineHeight),
    letterSpacing: fontSize * spec.tracking,
    ...(spec.maxWidthCh ? { maxWidth: Math.round(spec.maxWidthCh * fontSize * CH_RATIO) } : null),
  };
}

export const isWeb = Platform.OS === 'web';
