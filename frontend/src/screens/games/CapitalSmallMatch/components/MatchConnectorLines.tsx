/**
 * Purpose: Animated SVG Connector Lines component for Capital & Small Letter Match.
 *          Renders smooth, curved connecting lines between matched capital and lowercase tiles.
 *          Calculates frame-perfect row-center coordinates guaranteed to anchor between tiles.
 * Module: Capital Small Match — Components
 * Folder: frontend/src/screens/games/CapitalSmallMatch/components
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../../../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface TileLayoutPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MatchConnectorLinesProps {
  matchedCapitals: string[];
  capitalPositions?: Record<string, TileLayoutPosition>;
  lowercasePositions?: Record<string, TileLayoutPosition>;
  capitalRowOrder: number[];
  lowercaseRowOrder: number[];
  roundPairs: Array<{ capital: string; lowercase: string }>;
  justMatchedCapital?: string | null;
  width: number;
  height: number;
}

interface SingleConnectorLineProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isJustMatched: boolean;
  reduceMotion: boolean;
}

const SingleConnectorLine: React.FC<SingleConnectorLineProps> = React.memo(
  ({ x1, y1, x2, y2, isJustMatched, reduceMotion }) => {
    // Smooth horizontal Bezier curve with control points at horizontal midpoint
    const midX = x1 + (x2 - x1) * 0.5;
    const pathData = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

    const pathLength = useSharedValue(reduceMotion || !isJustMatched ? 1 : 0);
    const glowOpacity = useSharedValue(isJustMatched && !reduceMotion ? 0.9 : 0.4);

    useEffect(() => {
      if (isJustMatched && !reduceMotion) {
        pathLength.value = 0;
        pathLength.value = withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        });
        glowOpacity.value = withSequence(
          withTiming(1, { duration: 250 }),
          withTiming(0.4, { duration: 350 }),
        );
      } else {
        pathLength.value = 1;
        glowOpacity.value = 0.4;
      }
    }, [isJustMatched, reduceMotion, pathLength, glowOpacity]);

    const animatedGlowProps = useAnimatedProps(() => ({
      strokeDashoffset: (1 - pathLength.value) * 300,
      opacity: glowOpacity.value,
    }));

    const animatedLineProps = useAnimatedProps(() => ({
      strokeDashoffset: (1 - pathLength.value) * 300,
    }));

    return (
      <>
        {/* Glow beam layer */}
        <AnimatedPath
          d={pathData}
          stroke={Colors.connector.glow}
          strokeWidth={8}
          fill="none"
          strokeDasharray="300"
          animatedProps={animatedGlowProps}
          strokeLinecap="round"
        />

        {/* Core solid line layer */}
        <AnimatedPath
          d={pathData}
          stroke={Colors.connector.line}
          strokeWidth={4}
          fill="none"
          strokeDasharray="300"
          animatedProps={animatedLineProps}
          strokeLinecap="round"
        />

        {/* Start & End Connector Dots */}
        <Circle cx={x1} cy={y1} r={5} fill={Colors.connector.line} />
        <Circle cx={x2} cy={y2} r={5} fill={Colors.connector.line} />
      </>
    );
  }
);

SingleConnectorLine.displayName = 'SingleConnectorLine';

export const MatchConnectorLines: React.FC<MatchConnectorLinesProps> = React.memo(
  ({
    matchedCapitals,
    capitalRowOrder,
    lowercaseRowOrder,
    roundPairs,
    justMatchedCapital,
    width,
    height,
  }) => {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
      let isMounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      });
      return () => {
        isMounted = false;
      };
    }, []);

    if (matchedCapitals.length === 0 || width <= 0 || height <= 0) {
      return null;
    }

    // Geometry parameters (84dp tiles + 12dp gap + 16dp column header text)
    const TILE_SIZE = 84;
    const TILE_GAP = 12;
    const HEADER_TEXT_OFFSET = 24; // text label height + margin
    const TOTAL_COLUMN_HEIGHT = HEADER_TEXT_OFFSET + 4 * TILE_SIZE + 3 * TILE_GAP; // 396px
    const TOP_OFFSET = Math.max(10, (height - TOTAL_COLUMN_HEIGHT) / 2) + HEADER_TEXT_OFFSET;

    // Anchor points at tile edges facing the runway
    const x1 = width * 0.25 + TILE_SIZE / 2 - 4;
    const x2 = width * 0.75 - TILE_SIZE / 2 + 4;

    return (
      <View style={styles.svgOverlay} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {matchedCapitals.map((capital) => {
            const pair = roundPairs.find((p) => p.capital === capital);
            if (!pair) return null;

            // Find display row index in left column (0, 1, 2, or 3)
            const leftDisplayIdx = capitalRowOrder.findIndex(
              (idx) => roundPairs[idx]?.capital === capital
            );

            // Find display row index in right column (0, 1, 2, or 3)
            const rightDisplayIdx = lowercaseRowOrder.findIndex(
              (idx) => roundPairs[idx]?.lowercase === pair.lowercase
            );

            if (leftDisplayIdx < 0 || rightDisplayIdx < 0) return null;

            const y1 = TOP_OFFSET + leftDisplayIdx * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;
            const y2 = TOP_OFFSET + rightDisplayIdx * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

            return (
              <SingleConnectorLine
                key={`connector-${capital}-${pair.lowercase}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                isJustMatched={justMatchedCapital === capital}
                reduceMotion={reduceMotion}
              />
            );
          })}
        </Svg>
      </View>
    );
  }
);

MatchConnectorLines.displayName = 'MatchConnectorLines';

const styles = StyleSheet.create({
  svgOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 15,
  },
});
