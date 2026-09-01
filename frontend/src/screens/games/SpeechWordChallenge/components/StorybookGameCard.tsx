/**
 * Purpose: Hero Storybook Game Card showcasing the educational challenge item.
 *          Age 5: Shows Large Letter + Optional illustration badge.
 *          Age 6: Shows Large Educational Image; expected answer word is completely hidden!
 * Module: Speech Word Challenge — Components
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SpeechChallengeItem } from '../types';
import { MascotCharacter, MascotState } from '../../../../components/MascotCharacter';
import { Typography } from '../../../../theme/typography';

interface StorybookGameCardProps {
  item: SpeechChallengeItem;
  age?: number;
  mascotState?: MascotState;
  onReplayPrompt?: () => void;
  showHint?: boolean;
  instructionText?: string;
}

export const StorybookGameCard: React.FC<StorybookGameCardProps> = React.memo(
  ({
    item,
    age = 5,
    mascotState = 'idle',
    onReplayPrompt,
    showHint = false,
    instructionText = 'Say the word',
  }) => {
    const isLetterMode = item.mode === 'letters' || age === 5;

    return (
      <View style={styles.cardContainer}>
        {/* Glass Highlight Ribbon */}
        <View style={styles.highlightRibbon} />

        {/* Mascot + Instruction Area */}
        <View style={styles.instructionBanner}>
          <View style={styles.mascotWrapper}>
            <MascotCharacter state={mascotState} style={styles.mascot} />
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.instructionText}>{instructionText}</Text>
            {onReplayPrompt && (
              <Pressable
                onPress={onReplayPrompt}
                accessibilityLabel="Listen to instruction"
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.audioReplayBtn,
                  pressed && { transform: [{ scale: 0.92 }] },
                ]}
              >
                <Text style={styles.speakerIcon}>🔊</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Hero Visual Stage */}
        <View style={styles.heroVisualStage}>
          <View style={styles.innerRadialBacking} />

          {isLetterMode ? (
            /* Age 5: Large Letter + Associated Emojis */
            <View style={styles.letterStage}>
              <Text style={styles.heroLetterText}>{item.displayLetter || item.expectedWord.toUpperCase()}</Text>
              {item.image ? (
                <View style={styles.letterAssociatedBadge}>
                  <Text style={styles.associatedEmoji}>{item.image}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            /* Age 6: Large Image Only (Expected Word Hidden!) */
            <View style={styles.wordStage}>
              <Text style={styles.heroImageText}>{item.image}</Text>
            </View>
          )}
        </View>

        {/* Age 5 Label / Age 6 Hidden Word Area */}
        {isLetterMode && (
          <View style={styles.letterPromptRow}>
            <Text style={styles.letterPromptText}>⭐ {item.displayLetter || item.expectedWord.toUpperCase()} ⭐</Text>
          </View>
        )}

        {/* Optional Gentle Phonetic Hint on Retry */}
        {showHint && item.phoneticHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>💡 {item.phoneticHint}</Text>
          </View>
        )}
      </View>
    );
  }
);

StorybookGameCard.displayName = 'StorybookGameCard';

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFDF9',
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#FED7AA',
    borderBottomWidth: 8,
    borderBottomColor: '#FDBA74',
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#9A3412',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  highlightRibbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    gap: 8,
  },
  mascotWrapper: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascot: {
    width: 54,
    height: 54,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FDE68A',
    borderBottomWidth: 3,
    borderBottomColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  instructionText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#78350F',
    flex: 1,
  },
  audioReplayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginLeft: 6,
  },
  speakerIcon: {
    fontSize: 15,
  },
  heroVisualStage: {
    width: 170,
    height: 150,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFEDD5',
    borderBottomWidth: 5,
    borderBottomColor: '#FED7AA',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 4,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  innerRadialBacking: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF7ED',
  },
  letterStage: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroLetterText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 72,
    color: '#EA580C',
    textShadowColor: 'rgba(234, 88, 12, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  letterAssociatedBadge: {
    position: 'absolute',
    bottom: -8,
    right: -24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FED7AA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  associatedEmoji: {
    fontSize: 22,
  },
  wordStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImageText: {
    fontSize: 84,
  },
  letterPromptRow: {
    marginTop: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  letterPromptText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#9A3412',
  },
  hintContainer: {
    marginTop: 8,
    backgroundColor: '#FEF9C3',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  hintText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#854D0E',
  },
});
