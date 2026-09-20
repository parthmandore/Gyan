/**
 * Purpose: Visual word display card for Missing Letter Words.
 *          Renders word letters with an animated missing slot and reveal transition.
 * Module: Missing Letter Words — Components
 * Folder: frontend/src/screens/games/MissingLetterWords/components
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
import { WordChallengeItem } from '../types';

export interface WordDisplayCardProps {
  item: WordChallengeItem;
  revealedLetter?: string | null;
  isCorrectRevealed?: boolean;
  onHearWord?: () => void;
}

export const WordDisplayCard: React.FC<WordDisplayCardProps> = React.memo(
  ({ item, revealedLetter, isCorrectRevealed, onHearWord }) => {
    const { width: screenWidth } = useWindowDimensions();
    const pulseAnim = useSharedValue(1);
    const popAnim = useSharedValue(1);

    // Pulse the missing slot while waiting for selection
    useEffect(() => {
      if (!revealedLetter) {
        pulseAnim.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 800 }),
            withTiming(0.95, { duration: 800 })
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
          withSpring(1.25, { damping: 6, stiffness: 220 }),
          withSpring(1.0, { damping: 12, stiffness: 160 })
        );
      } else {
        popAnim.value = 1;
      }
    }, [isCorrectRevealed, popAnim]);

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseAnim.value }],
    }));

    const popStyle = useAnimatedStyle(() => ({
      transform: [{ scale: popAnim.value }],
    }));

    // Dynamic tile sizing based on part count
    const parts = item.displayParts;
    const maxRowWidth = Math.min(screenWidth - 48, 380);
    const tileWidth = Math.min(Math.floor((maxRowWidth - (parts.length - 1) * 8) / parts.length), 64);
    const tileHeight = Math.min(Math.round(tileWidth * 1.25), 80);

    return (
      <View style={styles.cardContainer}>
        {/* Top bar: Emoji representation & Audio Replay */}
        <View style={styles.headerRow}>
          {item.image ? (
            <View style={styles.emojiBadge}>
              <Text style={styles.emojiText}>{item.image}</Text>
            </View>
          ) : (
            <View style={{ width: 44 }} />
          )}

          {onHearWord && (
            <TouchableOpacity
              style={styles.speakerButton}
              onPress={onHearWord}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Hear word"
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Word Letter Tiles Row */}
        <View style={styles.tilesRow}>
          {parts.map((part, idx) => {
            const isMissingSlot = idx === item.missingIndex;

            if (isMissingSlot) {
              if (revealedLetter) {
                // Revealed letter
                return (
                  <Animated.View
                    key={`slot_${idx}`}
                    style={[
                      styles.tile,
                      styles.revealedTile,
                      { width: tileWidth, height: tileHeight },
                      popStyle,
                    ]}
                  >
                    <Text style={[styles.tileLetter, styles.revealedLetterText]}>
                      {revealedLetter}
                    </Text>
                    <View style={styles.sparkleBadge}>
                      <Text style={styles.sparkleText}>✨</Text>
                    </View>
                  </Animated.View>
                );
              }

              // Empty slot waiting for choice
              return (
                <Animated.View
                  key={`slot_${idx}`}
                  style={[
                    styles.tile,
                    styles.missingSlotTile,
                    { width: tileWidth, height: tileHeight },
                    pulseStyle,
                  ]}
                >
                  <Text style={styles.missingUnderline}>_</Text>
                </Animated.View>
              );
            }

            // Standard given letter
            return (
              <View
                key={`tile_${idx}`}
                style={[
                  styles.tile,
                  styles.standardTile,
                  { width: tileWidth, height: tileHeight },
                ]}
              >
                <Text style={styles.tileLetter}>{part}</Text>
              </View>
            );
          })}
        </View>

        {/* Completed Word Banner when revealed */}
        {revealedLetter ? (
          <Animated.View style={[styles.completedBanner, popStyle]}>
            <Text style={styles.completedBannerText}>
              {item.word} {item.meaning ? `— ${item.meaning}` : ''}
            </Text>
          </Animated.View>
        ) : (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {item.meaning ? item.meaning : 'Tap the missing letter below!'}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

WordDisplayCard.displayName = 'WordDisplayCard';

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  emojiText: {
    fontSize: 28,
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  speakerIcon: {
    fontSize: 20,
  },
  tilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: 8,
    marginVertical: 10,
  },
  tile: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  standardTile: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderBottomWidth: 4,
    borderBottomColor: '#94A3B8',
  },
  tileLetter: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  missingSlotTile: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderBottomWidth: 4,
    borderBottomColor: '#D97706',
  },
  missingUnderline: {
    fontSize: 32,
    fontWeight: '900',
    color: '#D97706',
    marginTop: -8,
  },
  revealedTile: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderBottomWidth: 4,
    borderBottomColor: '#059669',
  },
  revealedLetterText: {
    color: '#047857',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  sparkleText: {
    fontSize: 16,
  },
  completedBanner: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedBannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    textAlign: 'center',
  },
  hintContainer: {
    marginTop: 10,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
});
