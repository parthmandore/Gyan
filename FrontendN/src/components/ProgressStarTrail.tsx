/**
 * Purpose: Top bar star trail progress indicator matching reference design with zero overflow.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export interface ProgressStarTrailProps {
  current: number;
  total: number;
  roundResults?: Array<'correct' | 'wrong' | 'pending'>;
  accessibilityLabel?: string;
  style?: ViewStyle;
}

interface StarItemProps {
  status: 'correct' | 'wrong' | 'pending';
  isJustEarned: boolean;
}

const StarItem: React.FC<StarItemProps> = React.memo(({ status, isJustEarned }) => {
  const scale = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (isMounted) setReduceMotion(enabled);
      }
    );
    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (status !== 'pending' && isJustEarned && !reduceMotion) {
      scale.value = withSequence(
        withSpring(1.35, { damping: 6, stiffness: 220 }),
        withSpring(1.0, { damping: 10, stiffness: 140 }),
      );
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [status, isJustEarned, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.starContainer, animatedStyle]}>
      {status === 'correct' ? (
        <Text style={styles.filledStarText}>⭐</Text>
      ) : status === 'wrong' ? (
        <Text style={styles.wrongStarText}>★</Text>
      ) : (
        <Text style={styles.unfilledStarText}>☆</Text>
      )}
    </Animated.View>
  );
});

StarItem.displayName = 'StarItem';

export const ProgressStarTrail: React.FC<ProgressStarTrailProps> = React.memo(
  ({ current, total, roundResults, accessibilityLabel, style }) => {
    const { t } = useTranslation();
    const label = accessibilityLabel || t('accessibility.progressLabel', { current, total });

    const renderStars = () => {
      const stars = [];
      for (let i = 1; i <= total; i++) {
        let status: 'correct' | 'wrong' | 'pending' = 'pending';
        if (roundResults && roundResults[i - 1]) {
          status = roundResults[i - 1];
        } else if (i <= current) {
          status = 'correct';
        }
        const isJustEarned = i === current - 1 || i === current;

        stars.push(
          <StarItem
            key={i}
            status={status}
            isJustEarned={isJustEarned}
          />
        );
      }
      return stars;
    };

    return (
      <View
        accessibilityLabel={label}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: total, now: current }}
        style={[styles.trailContainer, style]}
      >
        {renderStars()}
      </View>
    );
  }
);

ProgressStarTrail.displayName = 'ProgressStarTrail';

const styles = StyleSheet.create({
  trailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  starContainer: {
    width: 17,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledStarText: {
    fontSize: 14,
    textShadowColor: 'rgba(253, 224, 71, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  wrongStarText: {
    fontSize: 14,
    color: '#EF4444',
    textShadowColor: 'rgba(239, 68, 68, 0.75)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  unfilledStarText: {
    fontSize: 16,
    color: '#2A5298',
    fontWeight: '300',
  },
});
