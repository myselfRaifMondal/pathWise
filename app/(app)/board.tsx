import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
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

/** How close to an edge the pointer must get before the board scrolls. */
const EDGE_ZONE = 90;
/** Pixels per tick at the very edge; scales down through the zone. */
const MAX_SCROLL_STEP = 18;
const SCROLL_TICK_MS = 16;

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

  // ---- Edge auto-scroll ----------------------------------------------------
  // Dragging Saved -> Offer means crossing columns that are off-screen, so the
  // board has to come to the pointer. Holding near an edge scrolls the row.

  const scrollRef = useRef<ScrollView>(null);
  // A plain View wraps the ScrollView purely so it can be measured in window
  // space; ScrollView's own ref does not reliably expose measureInWindow.
  const viewportRef = useRef<View>(null);
  const scrollX = useRef(0);
  // Mirrored into a shared value so the dragged card can subtract the scroll
  // it did not ask for and stay under the pointer.
  const scrollOffset = useSharedValue(0);
  const viewportRect = useRef<Rect | null>(null);
  const autoScroll = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentWidth = useRef(0);
  // Captured when a drag begins. It has to be taken then, not read live: the
  // dragged card's own translation inflates the scrollable width, and clamping
  // against that lets the board scroll into empty space past the last column.
  const maxScroll = useRef(0);
  const lastPointerX = useRef(0);

  const stopAutoScroll = useCallback(() => {
    if (autoScroll.current) {
      clearInterval(autoScroll.current);
      autoScroll.current = null;
    }
  }, []);

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

  /** Distance the pointer sits inside an edge zone, signed: <0 left, >0 right. */
  const edgePush = useCallback((pointerX: number) => {
    const rect = viewportRect.current;
    if (!rect) return 0;
    const fromLeft = pointerX - rect.x;
    const fromRight = rect.x + rect.width - pointerX;
    if (fromLeft < EDGE_ZONE) return -(EDGE_ZONE - Math.max(fromLeft, 0)) / EDGE_ZONE;
    if (fromRight < EDGE_ZONE) return (EDGE_ZONE - Math.max(fromRight, 0)) / EDGE_ZONE;
    return 0;
  }, []);

  const updateAutoScroll = useCallback(
    (pointerX: number) => {
      const push = edgePush(pointerX);
      if (push === 0) {
        stopAutoScroll();
        return;
      }
      if (autoScroll.current) return; // already running; speed reads live below
      autoScroll.current = setInterval(() => {
        const current = edgePush(lastPointerX.current);
        if (current === 0) return stopAutoScroll();
        const next = Math.min(
          maxScroll.current,
          Math.max(0, scrollX.current + current * MAX_SCROLL_STEP),
        );
        scrollRef.current?.scrollTo({ x: next, animated: false });
      }, SCROLL_TICK_MS);
    },
    [edgePush, stopAutoScroll],
  );

  const drop = useCallback(
    async (application: DecoratedApplication, x: number, y: number) => {
      stopAutoScroll();
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

      <View ref={viewportRef} collapsable={false}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.columns}
        onContentSizeChange={(width) => {
          contentWidth.current = width;
        }}
        onScroll={(event) => {
          scrollX.current = event.nativeEvent.contentOffset.x;
          scrollOffset.value = scrollX.current;
          measureColumns();
        }}
        // 16 keeps the dragged card glued to the pointer while auto-scrolling;
        // at 64 it visibly lags behind the moving content.
        scrollEventThrottle={16}
        onLayout={(event) => {
          viewportRef.current?.measureInWindow((x, y, width, height) => {
            viewportRect.current = { x, y, width, height };
          });
        }}
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
                  viewportRef.current?.measureInWindow((x, y, width, height) => {
                    viewportRect.current = { x, y, width, height };
                    maxScroll.current = Math.max(0, contentWidth.current - width);
                  });
                  setDragging(application);
                }}
                onDragMove={(x, y) => {
                  lastPointerX.current = x;
                  updateAutoScroll(x);
                  setHovered(stageAt(x, y));
                }}
                onDrop={(x, y) => drop(application, x, y)}
                isDragging={dragging?.id === application.id}
                scrollOffset={scrollOffset}
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
      </View>
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
  scrollOffset,
}: {
  application: DecoratedApplication;
  onOpen: () => void;
  onDragStart: () => void;
  onDragMove: (x: number, y: number) => void;
  onDrop: (x: number, y: number) => void;
  isDragging: boolean;
  scrollOffset: SharedValue<number>;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // Where the row was when the finger went down. The card lives inside the
  // ScrollView, so auto-scrolling slides it out from under the pointer unless
  // the delta is added back.
  const scrollAtStart = useSharedValue(0);
  const active = useSharedValue(0);
  // Gesture-handler measures translation from the moment the pan *activates*,
  // not from the touch down, so the card would sit a threshold's distance
  // behind the pointer for the whole drag. Record both points and cancel it.
  const beginX = useSharedValue(0);
  const activationOffset = useSharedValue(0);

  const pan = Gesture.Pan()
    // On touch the card must not hijack the column's scroll gesture, so a drag
    // begins only after a long press. A pointer has no such ambiguity.
    .activateAfterLongPress(Platform.OS === 'web' ? 0 : 180)
    .onBegin((event) => {
      beginX.value = event.absoluteX;
    })
    .onStart((event) => {
      activationOffset.value = event.absoluteX - beginX.value;
      scrollAtStart.value = scrollOffset.value;
      active.value = 1;
      runOnJS(onDragStart)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      runOnJS(onDragMove)(event.absoluteX, event.absoluteY);
    })
    .onEnd((event) => {
      runOnJS(onDrop)(event.absoluteX, event.absoluteY);
      active.value = 0;
      translateX.value = 0;
      translateY.value = 0;
    })
    .onFinalize(() => {
      active.value = 0;
      translateX.value = 0;
      translateY.value = 0;
    });

  const animated = useAnimatedStyle(() => {
    // Reading scrollOffset here (rather than in onUpdate) means the card keeps
    // pace even when the finger is still and only the board is auto-scrolling.
    const compensation = active.value
      ? scrollOffset.value - scrollAtStart.value + activationOffset.value
      : 0;
    return {
      transform: [
        { translateX: translateX.value + compensation },
        { translateY: translateY.value },
      ],
      zIndex: active.value ? 10 : 0,
    };
  });

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
