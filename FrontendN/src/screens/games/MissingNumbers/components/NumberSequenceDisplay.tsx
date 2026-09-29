/**
 * Purpose: Animated number sequence train display for Missing Numbers (Age 5).
 * Module: Missing Numbers — Components
 * Folder: frontend/src/screens/games/MissingNumbers/components
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

export interface NumberSequenceDisplayProps {
  sequence: (number | null)[];
  missingIndex: number;
  revealedNumber?: number | null;
  onHearSequence?: () => void;
  isCorrectRevealed?: boolean;
}

export const NumberSequenceDisplay: React.FC<NumberSequenceDisplayProps> = React.memo(
  ({ sequence, missingIndex, revealedNumber, onHearSequence, isCorrectRevealed }) => {
    const { width } = useWindowDimensions();
    const pulseAnim = useSharedValue(1);
    const popAnim = useSharedValue(1);

    // Pulse the missing slot when waiting
    useEffect(() => {
      if (revealedNumber === null || revealedNumber === undefined) {
        pulseAnim.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 900 }),
            withTiming(0.96, { duration: 900 })
          ),
          -1,
          true
        );
      } else {
        pulseAnim.value = 1;
      }
    }, [revealedNumber, pulseAnim]);

    // Pop animation on reveal
    useEffect(() => {
      if (isCorrectRevealed) {
        popAnim.value = withSequence(
          withSpring(1.3, { damping: 5, stiffness: 200 }),
          withSpring(1.0, { damping: 10, stiffness: 150 })
        );
      } else {
        popAnim.value = 1;
      }
    }, [isCorrectRevealed, popAnim]);

    const missingPulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseAnim.value }],
    }));

    const revealedPopStyle = useAnimatedStyle(() => ({
      transform: [{ scale: popAnim.value }],
    }));

    // Calculate dynamic card dimensions based on sequence length (4 or 5 cards)
    const cardCount = sequence.length;
    const maxContainerWidth = Math.min(width - 36, 440);
    const cardWidth = Math.min(
      Math.floor((maxContainerWidth - (cardCount - 1) * 10) / cardCount),
      78
    );
    const cardHeight = Math.min(Math.round(cardWidth * 1.25), 98);

    return (
      <View style={styles.container}>
        {/* Sequence Train Track */}
        <View style={styles.cardsRow}>
          {sequence.map((num, idx) => {
            const isMissingSlot = idx === missingIndex;

            if (isMissingSlot) {
              if (revealedNumber !== null && revealedNumber !== undefined) {
                return (
                  <Animated.View
                    key={`slot_${idx}`}
                    style={[
                      styles.card,
                      styles.revealedCard,
                      { width: cardWidth, height: cardHeight },
                      revealedPopStyle,
                    ]}
                  >
                    <Text style={[styles.numberText, styles.revealedText]}>
                      {revealedNumber}
                    </Text>
                    <View style={styles.badgeSuccess}>
                      <Text style={styles.badgeSuccessText}>✨</Text>
                    </View>
                  </Animated.View>
                );
              }

              return (
                <Animated.View
                  key={`slot_${idx}`}
                  style={[
                    styles.card,
                    styles.missingSlot,
                    { width: cardWidth, height: cardHeight },
                    missingPulseStyle,
                  ]}
                >
                  <Text style={styles.questionMarkText}>?</Text>
                </Animated.View>
              );
            }

            return (
              <View
                key={`num_${idx}_${num}`}
                style={[
                  styles.card,
                  styles.filledCard,
                  { width: cardWidth, height: cardHeight },
                ]}
              >
                <Text style={styles.numberText}>{num}</Text>
              </View>
            );
          })}
        </View>

        {/* Audio Speaker Button */}
        {onHearSequence && (
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={onHearSequence}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Listen to number sequence"
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

NumberSequenceDisplay.displayName = 'NumberSequenceDisplay';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 14,
    width: '100%',
  },
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  card: {
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  filledCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#06B6D4',
    borderBottomWidth: 6,
    borderBottomColor: '#0891B2',
  },
  missingSlot: {
    backgroundColor: '#FEF3C7',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#F59E0B',
    borderBottomWidth: 6,
    borderBottomColor: '#D97706',
  },
  revealedCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 3,
    borderColor: '#10B981',
    borderBottomWidth: 6,
    borderBottomColor: '#059669',
  },
  numberText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0E7490',
  },
  revealedText: {
    color: '#047857',
  },
  questionMarkText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#D97706',
  },
  badgeSuccess: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FDE047',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CA8A04',
  },
  badgeSuccessText: {
    fontSize: 12,
  },
  speakerButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#A5F3FC',
    shadowColor: '#0891B2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speakerIcon: {
    fontSize: 22,
  },
});
