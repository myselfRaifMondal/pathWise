import { useWindowDimensions } from 'react-native';

import { LAYOUT_BREAKPOINT, SHEET_BREAKPOINT, isWeb } from '@/theme/responsive';

/**
 * Structural breakpoints for things CSS cannot express — chiefly which of two
 * component trees to render.
 *
 * On web this always reports the wide layout. That is deliberate: the static
 * export has no viewport, so any width-derived answer would be wrong and would
 * be frozen into the HTML. Web layout is handled by the media queries in
 * theme/webStyles.ts instead, which are correct on first paint at every size.
 * Native has a real viewport, so it measures.
 */
export function useResponsive() {
  const { width } = useWindowDimensions();

  if (isWeb) {
    return { wide: true, wideSheet: true, gutter: undefined as number | undefined };
  }

  const wide = width >= LAYOUT_BREAKPOINT;
  return {
    wide,
    wideSheet: width >= SHEET_BREAKPOINT,
    gutter: wide ? 48 : 20,
  };
}
