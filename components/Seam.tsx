import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

/**
 * A soft transition between two landing sections.
 *
 * The bands only differ by a few percent (#ffffff vs #f5f5f7 in light,
 * #000000 vs #0a0a0a in dark), but butted straight against each other they
 * read as a hard rule across the page. A tall strip fading one into the other
 * removes the line without changing the banded rhythm.
 *
 * Height matters: over a short distance a gradient between two near-identical
 * colours quantises into visible steps on an 8-bit display. 120px keeps each
 * step below one level.
 */
export function Seam({
  from,
  to,
  height = 120,
}: {
  from: string;
  to: string;
  height?: number;
}) {
  return (
    <LinearGradient
      colors={[from, to]}
      // Full-bleed on purpose — inside a section's horizontal padding the old
      // hard edge would still show in the gutters.
      style={[styles.seam, { height }]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  seam: { width: '100%' },
});
