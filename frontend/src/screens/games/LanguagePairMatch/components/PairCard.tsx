/**
 * Purpose: Child-friendly 3D tactile card component for Language Pair Match.
 *          Displays source concepts (emoji + word) and target translations.
 *          Supports idle, selected, matched, and wrong-shake visual states
 *          with accessible WCAG AA contrast.
 * Module: Language Pair Match — Components
 * Folder: frontend/src/screens/games/LanguagePairMatch/components
 */

import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Pressable,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Typography } from '../../../../theme/typography';
import { MatchCard, PairCardState } from '../types';

interface PairCardProps {
  card: MatchCard;
  state: PairCardState;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PairCard: React.FC<PairCardProps> = React.memo(
  ({ card, state, onPress, disabled = false }) => {
    const scale = useSharedValue(1);
    const shakeOffset = useSharedValue(0);

    useEffect(() => {
      if (state === 'selected') {
        scale.value = withSpring(1.05, { damping: 12, stiffness: 220 });
      } else if (state === 'matched') {
        scale.value = withSpring(1.0, { damping: 14 });
      } else if (state === 'wrong') {
        // Gentle non-punitive horizontal shake sequence
        shakeOffset.value = withSequence(
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 60 }),
          withTiming(-6, { duration: 60 }),
          withTiming(6, { duration: 60 }),
          withTiming(0, { duration: 60 })
        );
        scale.value = withTiming(1.0, { duration: 200 });
      } else {
        scale.value = withSpring(1.0, { damping: 14 });
        shakeOffset.value = 0;
      }
    }, [state, scale, shakeOffset]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        { translateX: shakeOffset.value },
      ],
    }));

    const isSource = card.side === 'source';
    const isMatched = state === 'matched';
    const isSelected = state === 'selected';
    const isWrong = state === 'wrong';

    // Compute dynamic border and background styles based on state & side
    const cardBg = isMatched
      ? '#ECFDF5' // Emerald-50
      : isWrong
      ? '#FEF2F2' // Red-50
      : isSelected
      ? (isSource ? '#EFF6FF' : '#FDF4FF') // Blue-50 or Purple-50
      : '#FFFFFF';

    const borderColor = isMatched
      ? '#10B981' // Emerald-500
      : isWrong
      ? '#EF4444' // Red-500
      : isSelected
      ? (isSource ? '#3B82F6' : '#A855F7') // Blue-500 or Purple-500
      : '#E2E8F0'; // Slate-200

    const bevelColor = isMatched
      ? '#059669'
      : isWrong
      ? '#DC2626'
      : isSelected
      ? (isSource ? '#2563EB' : '#9333EA')
      : '#CBD5E1';

    const textColor = isMatched
      ? '#065F46' // Emerald-800
      : isWrong
      ? '#991B1B' // Red-800
      : isSelected
      ? (isSource ? '#1E40AF' : '#6B21A8')
      : '#0F172A'; // Slate-900 (crisp high contrast)

    return (
      <AnimatedPressable
        onPress={onPress}
        disabled={disabled || isMatched}
        accessibilityRole="button"
        accessibilityLabel={`${isSource ? 'Source word' : 'Target word'}: ${card.text}, ${card.image || ''}`}
        accessibilityState={{ selected: isSelected, disabled: isMatched }}
        style={[
          styles.cardContainer,
          {
            backgroundColor: cardBg,
            borderColor: borderColor,
            borderBottomColor: bevelColor,
          },
          animatedStyle,
        ]}
      >
        {/* Top Gloss Highlight Ribbon */}
        <View style={styles.glossHighlight} />

        <View style={styles.contentRow}>
          {/* Emoji illustration on source card */}
          {card.image ? (
            <View style={styles.imageBadge}>
              <Text style={styles.imageEmoji}>{card.image}</Text>
            </View>
          ) : null}

          {/* Word Text (Devanagari or English) */}
          <View style={styles.textWrapper}>
            <Text
              style={[
                styles.wordText,
                { color: textColor },
                isSource ? styles.sourceWordText : styles.targetWordText,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {card.text}
            </Text>
          </View>

          {/* Status Badge Tag */}
          {isMatched && (
            <View style={styles.matchedPill}>
              <Text style={styles.matchedPillText}>✓</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    );
  }
);

PairCard.displayName = 'PairCard';

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    minHeight: 68,
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imageBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageEmoji: {
    fontSize: 26,
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  wordText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    letterSpacing: 0.2,
  },
  sourceWordText: {
    fontSize: 18,
  },
  targetWordText: {
    fontSize: 18,
  },
  matchedPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedPillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
