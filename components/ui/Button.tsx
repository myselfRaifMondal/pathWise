import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';

export type ButtonVariant = 'filled' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

const HEIGHTS: Record<ButtonSize, number> = { sm: 32, md: 40, lg: 48 };
const PADDING: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 26 };
const FONT_SIZE: Record<ButtonSize, number> = { sm: 13, md: 14, lg: 16 };

export function Button({
  label,
  onPress,
  variant = 'filled',
  size = 'sm',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const inert = disabled || loading;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    filled: { bg: theme.colors.btnbg, fg: theme.colors.btnfg, border: 'transparent' },
    outline: { bg: 'transparent', fg: theme.colors.fg, border: theme.colors.line },
    ghost: { bg: 'transparent', fg: theme.colors.fg2, border: 'transparent' },
    destructive: { bg: 'transparent', fg: theme.colors.red, border: theme.colors.line },
  };
  const tone = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inert, busy: loading }}
      disabled={inert}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: HEIGHTS[size],
          paddingHorizontal: PADDING[size],
          backgroundColor: tone.bg,
          borderColor: tone.border,
          borderWidth: tone.border === 'transparent' ? 0 : StyleSheet.hairlineWidth,
          opacity: inert ? 0.45 : pressed ? 0.75 : 1,
          // Not inherited from the parent's alignItems on purpose: React Native
        // defaults that to 'stretch', which would make every button full width.
        // Pass style={{ alignSelf: 'center' }} to centre one — style wins.
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={tone.fg} />
      ) : (
        <Text size={FONT_SIZE[size]} weight="500" style={{ color: tone.fg }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    // The design uses 980px, i.e. a full pill regardless of height.
    borderRadius: 980,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
