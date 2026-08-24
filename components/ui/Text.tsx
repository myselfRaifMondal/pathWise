import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { FONT } from '@/theme/tokens';

type Tone = 'fg' | 'fg2' | 'fg3' | 'red' | 'green';

export type PWTextProps = TextProps & {
  size?: number;
  weight?: TextStyle['fontWeight'];
  tone?: Tone;
  /** The design tightens tracking as type gets larger. */
  tracking?: number;
};

export function Text({
  size = 13,
  weight = '400',
  tone = 'fg',
  tracking,
  style,
  ...rest
}: PWTextProps) {
  const theme = useTheme();
  const letterSpacing = tracking ?? (size >= 34 ? -size * 0.022 : size >= 17 ? -size * 0.01 : -0.05);

  return (
    <RNText
      {...rest}
      style={[
        {
          fontFamily: FONT,
          fontSize: size,
          fontWeight: weight,
          color: theme.colors[tone],
          letterSpacing,
        },
        style,
      ]}
    />
  );
}
