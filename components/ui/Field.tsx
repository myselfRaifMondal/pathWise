import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/theme/ThemeProvider';
import { FONT } from '@/theme/tokens';

export function Field({
  label,
  hint,
  style,
  ...rest
}: TextInputProps & { label?: string; hint?: string }) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.group}>
      {label ? (
        <Text size={12} tone="fg2" weight="500" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        {...rest}
        onFocus={(event) => {
          setFocused(true);
          rest.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          rest.onBlur?.(event);
        }}
        placeholderTextColor={theme.colors.fg2}
        style={[
          styles.input,
          {
            color: theme.colors.fg,
            backgroundColor: theme.colors.inset,
            borderColor: focused ? theme.colors.line2 : theme.colors.line,
          },
          style,
        ]}
      />
      {hint ? (
        <Text size={12} tone="fg3" style={styles.hint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

/** A compact segmented control, used for stage pickers and the theme toggle. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  label?: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.group}>
      {label ? (
        <Text size={12} tone="fg2" weight="500" style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.segmented, { backgroundColor: theme.colors.inset }]}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option)}
              style={[
                styles.segment,
                { backgroundColor: active ? theme.tab.activeBg : 'transparent' },
              ]}
            >
              <Text
                size={13}
                weight="500"
                style={{ color: active ? theme.tab.activeFg : theme.tab.fg }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { marginLeft: 2 },
  input: {
    fontFamily: FONT,
    fontSize: 15,
    letterSpacing: -0.1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  hint: { marginLeft: 2 },
  segmented: { flexDirection: 'row', padding: 3, borderRadius: 980, flexWrap: 'wrap' },
  segment: {
    paddingHorizontal: 14,
    height: 30,
    borderRadius: 980,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
