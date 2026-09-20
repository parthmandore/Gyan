/**
 * Purpose: Animated SVG Connector Lines for Language Pair Match (Age 6).
 *          Renders smooth, curved connecting lines between matched concept tiles
 *          with glow effect and circular connector dots, matching CapitalSmallMatch.
 * Module: Language Pair Match — Components
 * Folder: frontend/src/screens/games/LanguagePairMatch/components
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
import { MatchCard } from '../types';

export interface TileLayoutPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LanguageMatchConnectorLinesProps {
  matchedConceptIds: string[];
  sourceCards: MatchCard[];
  targetCards: MatchCard[];
  justMatchedConceptId?: string | null;
  width: number;
  height: number;
  tileWidth?: number;
  columnsRowY?: number | null;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
          withTiming(0.4, { duration: 350 })
        );
      } else {
        pathLength.value = 1;
        glowOpacity.value = 0.4;
      }
    }, [isJustMatched, reduceMotion, pathLength, glowOpacity]);

    const animatedGlowProps = useAnimatedProps(() => ({
      strokeDashoffset: (1 - pathLength.value) * 350,
      opacity: glowOpacity.value,
    }));

    const animatedLineProps = useAnimatedProps(() => ({
      strokeDashoffset: (1 - pathLength.value) * 350,
    }));

    return (
      <>
        {/* Glow beam layer */}
        <AnimatedPath
          d={pathData}
          stroke={Colors.connector.glow}
          strokeWidth={8}
          fill="none"
          strokeDasharray="350"
          animatedProps={animatedGlowProps}
          strokeLinecap="round"
        />

        {/* Core solid line layer */}
        <AnimatedPath
          d={pathData}
          stroke={Colors.connector.line}
          strokeWidth={4}
          fill="none"
          strokeDasharray="350"
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

export const LanguageMatchConnectorLines: React.FC<LanguageMatchConnectorLinesProps> = React.memo(
  ({
    matchedConceptIds,
    sourceCards,
    targetCards,
    justMatchedConceptId,
    width,
    height,
    tileWidth = 138,
    columnsRowY = null,
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

    if (matchedConceptIds.length === 0 || width <= 0 || height <= 0) {
      return null;
    }

    // Geometry parameters (72dp tiles + 12dp gap + 24dp column header text)
    const TILE_HEIGHT = 72;
    const TILE_GAP = 12;
    const HEADER_TEXT_OFFSET = 24;
    const pairCount = sourceCards.length;
    const TOTAL_COLUMN_HEIGHT = HEADER_TEXT_OFFSET + pairCount * TILE_HEIGHT + (pairCount - 1) * TILE_GAP;
    
    // Top offset where tiles begin inside gameArea
    const TOP_OFFSET = columnsRowY != null
      ? columnsRowY + HEADER_TEXT_OFFSET
      : Math.max(10, (height - TOTAL_COLUMN_HEIGHT) / 2) + HEADER_TEXT_OFFSET;

    // Anchor points at tile edges facing the runway
    const PADDING_H = 8;
    const x1 = PADDING_H + tileWidth - 2;
    const x2 = width - PADDING_H - tileWidth + 2;

    return (
      <View style={styles.svgOverlay} pointerEvents="none">
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {matchedConceptIds.map((conceptId) => {
            const srcIdx = sourceCards.findIndex((c) => c.conceptId === conceptId);
            const tgtIdx = targetCards.findIndex((c) => c.conceptId === conceptId);
            if (srcIdx < 0 || tgtIdx < 0) return null;

            const y1 = TOP_OFFSET + srcIdx * (TILE_HEIGHT + TILE_GAP) + TILE_HEIGHT / 2;
            const y2 = TOP_OFFSET + tgtIdx * (TILE_HEIGHT + TILE_GAP) + TILE_HEIGHT / 2;

            return (
              <SingleConnectorLine
                key={`connector-${conceptId}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                isJustMatched={justMatchedConceptId === conceptId}
                reduceMotion={reduceMotion}
              />
            );
          })}
        </Svg>
      </View>
    );
  }
);

LanguageMatchConnectorLines.displayName = 'LanguageMatchConnectorLines';

const styles = StyleSheet.create({
  svgOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 15,
  },
});
