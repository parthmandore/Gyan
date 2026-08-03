/**
 * Purpose: Animated finger trail overlay for drag-and-drop matching.
 *          Renders a soft, glowing Bezier trail and leading touch indicator using SVG.
 *          Respects reduced motion by suppressing decorative trail rendering when active.
 * Module: Capital Small Match — Components
 * Folder: frontend/src/screens/games/CapitalSmallMatch/components
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, AccessibilityInfo } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export interface TouchPoint {
  x: number;
  y: number;
}

export interface FingerTrailOverlayProps {
  points: TouchPoint[];
  width: number;
  height: number;
  active: boolean;
}

export const FingerTrailOverlay: React.FC<FingerTrailOverlayProps> = React.memo(
  ({ points, width, height, active }) => {
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
      let mounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      });
      return () => { mounted = false; };
    }, []);

    if (!active || points.length <= 1 || width === 0 || height === 0 || reduceMotion) {
      return null;
    }

    const currentHead = points[points.length - 1];

    // Build smooth Bezier SVG path data from touch sample points
    let pathData = '';
    if (points.length === 1) {
      pathData = `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
    } else {
      pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const pPrev = points[i - 1];
        const pCurr = points[i];
        const midX = (pPrev.x + pCurr.x) / 2;
        const midY = (pPrev.y + pCurr.y) / 2;
        pathData += ` Q ${pPrev.x} ${pPrev.y}, ${midX} ${midY}`;
      }
    }

    return (
      <View style={styles.container} pointerEvents="none">
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {/* Outer Soft Glow Line */}
          <Path
            d={pathData}
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Core Vibrant Line */}
          <Path
            d={pathData}
            stroke="#38BDF8"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Leading Touch Head Indicator */}
          {currentHead && (
            <>
              <Circle
                cx={currentHead.x}
                cy={currentHead.y}
                r={12}
                fill="rgba(56, 189, 248, 0.35)"
              />
              <Circle
                cx={currentHead.x}
                cy={currentHead.y}
                r={6}
                fill="#FFFFFF"
              />
            </>
          )}
        </Svg>
      </View>
    );
  }
);

FingerTrailOverlay.displayName = 'FingerTrailOverlay';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});
