import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { BoardCard, CARD_WIDTH } from '@/components/BoardCard';
import { Head } from '@/components/Head';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/ui/Text';
import { useApplications } from '@/state/ApplicationsProvider';
import { useToast } from '@/state/ToastProvider';
import { useDerived, type DecoratedApplication } from '@/state/useDerived';
import { useTheme } from '@/theme/ThemeProvider';
import type { Stage } from '@/theme/tokens';

type Rect = { x: number; y: number; width: number; height: number };

export default function Board() {
  const theme = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { applications, moveToStage } = useApplications();
  const derived = useDerived(applications, theme);

  // Absolute window rects for each column, re-measured when a drag starts so
  // horizontal scrolling never invalidates the hit test.
  const columnRefs = useRef<Partial<Record<Stage, View | null>>>({});
  const columnRects = useRef<Partial<Record<Stage, Rect>>>({});
  const [dragging, setDragging] = useState<DecoratedApplication | null>(null);
  const [hovered, setHovered] = useState<Stage | null>(null);

  const measureColumns = useCallback(() => {
    (Object.keys(columnRefs.current) as Stage[]).forEach((stage) => {
      columnRefs.current[stage]?.measureInWindow((x, y, width, height) => {
        columnRects.current[stage] = { x, y, width, height };
      });
    });
  }, []);

  const stageAt = useCallback((x: number, y: number): Stage | null => {
    const entries = Object.entries(columnRects.current) as [Stage, Rect][];
    for (const [stage, rect] of entries) {
      if (x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height) {
        return stage;
      }
    }
    return null;
  }, []);

  const drop = useCallback(
    async (application: DecoratedApplication, x: number, y: number) => {
      const target = stageAt(x, y);
      setDragging(null);
      setHovered(null);
      if (!target || target === application.stage) return;
      try {
        await moveToStage(application.id, target);
        toast(`${application.company} moved to ${target}`);
      } catch {
        toast('Could not move that application');
      }
    },
    [moveToStage, stageAt, toast],
  );

  return (
    <Screen title="Board">
      <Head title="Board — PathWise" description="Drag each application between the six stages." />
      <Text size={13} tone="fg2" style={styles.hint}>
        {Platform.OS === 'web'
          ? 'Drag a card to another column to move it forward.'
          : 'Press and hold a card, then drag it to another column.'}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columns}
        onScroll={measureColumns}
        scrollEventThrottle={64}
      >
        {derived.columns.map((column) => (
          <View
            key={column.stage}
            ref={(node) => {
              columnRefs.current[column.stage] = node;
            }}
            onLayout={measureColumns}
            style={[
              styles.column,
              {
                backgroundColor:
                  hovered === column.stage ? theme.colors.hover2 : theme.colors.line0,
                borderColor: hovered === column.stage ? theme.colors.line2 : 'transparent',
              },
            ]}
          >
            <View style={styles.columnHead}>
              <Text size={13} weight="600">
                {column.stage}
              </Text>
              <Text size={12} tone="fg2">
                {column.count}
              </Text>
            </View>

            {column.items.map((application) => (
              <DraggableCard
                key={application.id}
                application={application}
                onOpen={() => router.push(`/application/${application.id}`)}
                onDragStart={() => {
                  measureColumns();
                  setDragging(application);
                }}
                onDragMove={(x, y) => setHovered(stageAt(x, y))}
                onDrop={(x, y) => drop(application, x, y)}
                isDragging={dragging?.id === application.id}
              />
            ))}

            {column.items.length === 0 ? (
              <Text size={12} tone="fg3" style={styles.emptyColumn}>
                Nothing here
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

function DraggableCard({
  application,
  onOpen,
  onDragStart,
  onDragMove,
  onDrop,
  isDragging,
}: {
  application: DecoratedApplication;
  onOpen: () => void;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
  isDragging: boolean;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    // On touch the card must not hijack the column's scroll gesture, so a drag
    // begins only after a long press. A pointer has no such ambiguity.
    .activateAfterLongPress(Platform.OS === 'web' ? 0 : 180)
    .onStart(() => {
      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      runOnJS(onDragMove)(event.absoluteX, event.absoluteY);
    })
    .onEnd((event) => {
      runOnJS(onDrop)(event.absoluteX, event.absoluteY);
      translateX.value = 0;
      translateY.value = 0;
    })
    .onFinalize(() => {
      translateX.value = 0;
      translateY.value = 0;
    });

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: translateX.value !== 0 || translateY.value !== 0 ? 10 : 0,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animated}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${application.role} at ${application.company}, stage ${application.stage}`}
          onPress={onOpen}
        >
          <BoardCard application={application} dragging={isDragging} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hint: { marginBottom: 16 },
  columns: { gap: 12, paddingBottom: 8 },
  column: {
    width: CARD_WIDTH + 24,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
    minHeight: 220,
  },
  columnHead: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  emptyColumn: { paddingVertical: 12, textAlign: 'center' },
});
