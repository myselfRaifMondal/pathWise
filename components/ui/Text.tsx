import React from 'react';
import {
  Text as RNText,
  useWindowDimensions,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { isWeb, nativeTypeStyle, type TypeRole } from '@/theme/responsive';
import { FONT } from '@/theme/tokens';

type Tone = 'fg' | 'fg2' | 'fg3' | 'red' | 'green';

export type PWTextProps = TextProps & {
  /**
   * Web only. React Native Web renders a real <a> when this is set, which keeps
   * links crawlable and middle-clickable; native ignores the prop, so pair it
   * with onPress there.
   */
  href?: string;
  hrefAttrs?: { rel?: string; target?: string; download?: boolean };
  /**
   * A role from the shared type scale. Preferred over `size` for anything whose
   * size should respond to the viewport. On web the size, weight, line-height,
   * tracking and measure all come from CSS; on native they are computed.
   */
  variant?: TypeRole;
  /** Fixed size in px, for UI chrome that does not scale. */
  size?: number;
  weight?: TextStyle['fontWeight'];
  tone?: Tone;
  /** Tracking in px. Defaults to a size-appropriate value. */
  tracking?: number;
};

export function Text({
  variant,
  size = 13,
  weight,
  tone = 'fg',
  tracking,
  style,
  ...rest
}: PWTextProps) {
  // `href`/`hrefAttrs` travel in ...rest; react-native-web reads them, native
  // drops them. No platform branch needed.
  const theme = useTheme();
  const { width } = useWindowDimensions();

  const base: TextStyle = { fontFamily: FONT, color: theme.colors[tone] };

  if (variant) {
    // On web the stylesheet in app/+html.tsx owns every metric, so nothing about
    // size is set here — that is what keeps the static HTML correct without
    // depending on hydration. `dataSet` becomes data-pw="…" for CSS to match.
    const sized = isWeb ? {} : nativeTypeStyle(variant, width);
    return (
      <RNText
        {...rest}
        {...(isWeb ? { dataSet: { pw: variant } } : null)}
        style={[base, sized, weight ? { fontWeight: weight } : null, style]}
      />
    );
  }

  const letterSpacing =
    tracking ?? (size >= 34 ? -size * 0.022 : size >= 17 ? -size * 0.01 : -0.05);

  return (
    <RNText
      {...rest}
      style={[
        base,
        { fontSize: size, fontWeight: weight ?? '400', letterSpacing },
        style,
      ]}
    />
  );
}
