/**
 * Purpose: High-contrast 3D card showing the target word, illustration, and hint button.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SpeechChallengeItem } from '../types';

interface TargetImageCardProps {
  item: SpeechChallengeItem;
  onReplayPrompt?: () => void;
  showHint?: boolean;
}

export const TargetImageCard: React.FC<TargetImageCardProps> = React.memo(
  ({ item, onReplayPrompt, showHint }) => {
    return (
      <View style={styles.cardContainer}>
        {/* Glass Highlight */}
        <View style={styles.innerHighlight} />

        {/* Large Emoji / Illustration */}
        <View style={styles.imageBacking}>
          <Text style={styles.imageText}>{item.image}</Text>
        </View>

        {/* Word Display */}
        <View style={styles.wordRow}>
          <Text style={styles.targetWordText}>{item.displayWord}</Text>
          {onReplayPrompt && (
            <Pressable
              onPress={onReplayPrompt}
              accessibilityLabel={`Listen to ${item.displayWord}`}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.speakerButton,
                pressed && { transform: [{ scale: 0.92 }] },
              ]}
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </Pressable>
          )}
        </View>

        {/* Optional Phonetic Hint */}
        {showHint && item.phoneticHint && (
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>💡 {item.phoneticHint}</Text>
          </View>
        )}
      </View>
    );
  }
);

TargetImageCard.displayName = 'TargetImageCard';

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#FBCFE8',
    borderBottomWidth: 8,
    borderBottomColor: '#F472B6',
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 3,
    left: 12,
    right: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(244, 114, 182, 0.25)',
  },
  imageBacking: {
    width: 110,
    height: 110,
    borderRadius: 30,
    backgroundColor: '#FDF2F8',
    borderWidth: 3,
    borderColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#F472B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  imageText: {
    fontSize: 64,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  targetWordText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#831843',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  speakerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FCE7F3',
    borderWidth: 2,
    borderColor: '#F472B6',
    borderBottomWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerIcon: {
    fontSize: 18,
  },
  hintPill: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  hintText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
});
