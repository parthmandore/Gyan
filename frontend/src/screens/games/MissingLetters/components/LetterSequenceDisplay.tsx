/**
 * Purpose: Visual letter sequence train display with animated missing slot.
 * Module: Missing Letters — Components
 * Folder: frontend/src/screens/games/MissingLetters/components
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

export interface LetterSequenceDisplayProps {
  sequence: (string | null)[];
  missingIndex: number;
  revealedLetter?: string | null;
  onHearSequence?: () => void;
  isCorrectRevealed?: boolean;
}

export const LetterSequenceDisplay: React.FC<LetterSequenceDisplayProps> = React.memo(
  ({ sequence, missingIndex, revealedLetter, onHearSequence, isCorrectRevealed }) => {
    const { width } = useWindowDimensions();
    const pulseAnim = useSharedValue(1);
    const popAnim = useSharedValue(1);

    // Pulse the missing slot when waiting
    useEffect(() => {
      if (!revealedLetter) {
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
    }, [revealedLetter, pulseAnim]);

    // Pop animation when correct letter is revealed
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

    // Dynamic card width based on screen and sequence length (3 or 4 cards)
    const cardCount = sequence.length;
    const maxContainerWidth = Math.min(width - 40, 420);
    const cardWidth = Math.min(Math.floor((maxContainerWidth - (cardCount - 1) * 12) / cardCount), 84);
    const cardHeight = Math.min(Math.round(cardWidth * 1.22), 104);

    return (
      <View style={styles.container}>
        {/* Sequence Track / Train Carriages */}
        <View style={styles.cardsRow}>
          {sequence.map((letter, idx) => {
            const isMissingSlot = idx === missingIndex;

            if (isMissingSlot) {
              if (revealedLetter) {
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
                    <Text style={[styles.letterText, styles.revealedText]}>
                      {revealedLetter}
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
                key={`letter_${idx}_${letter}`}
                style={[styles.card, styles.filledCard, { width: cardWidth, height: cardHeight }]}
              >
                <Text style={styles.letterText}>{letter}</Text>
              </View>
            );
          })}
        </View>

        {/* Audio Speaker Prompt Button */}
        {onHearSequence && (
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={onHearSequence}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Listen to letter sequence"
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

LetterSequenceDisplay.displayName = 'LetterSequenceDisplay';

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
    gap: 10,
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
    borderColor: '#818CF8',
    borderBottomWidth: 6,
    borderBottomColor: '#6366F1',
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
  letterText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1E1B4B',
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
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  speakerIcon: {
    fontSize: 22,
  },
});
