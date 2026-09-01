/**
 * Purpose: Hero Storybook Game Card showcasing the educational target object,
 *          instruction banner, and mascot companion.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SpeechChallengeItem } from '../types';
import { MascotCharacter, MascotState } from '../../../../components/MascotCharacter';
import { Typography } from '../../../../theme/typography';

interface StorybookGameCardProps {
  item: SpeechChallengeItem;
  mascotState?: MascotState;
  onReplayPrompt?: () => void;
  showHint?: boolean;
  instructionText?: string;
}

export const StorybookGameCard: React.FC<StorybookGameCardProps> = React.memo(
  ({
    item,
    mascotState = 'idle',
    onReplayPrompt,
    showHint = false,
    instructionText = 'Say the word',
  }) => {
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
                accessibilityLabel="Listen again"
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

        {/* Hero Educational Image Stage */}
        <View style={styles.heroImageStage}>
          <View style={styles.innerRadialBacking} />
          <Text style={styles.heroImageText}>{item.image}</Text>
        </View>

        {/* Target Word Text */}
        <View style={styles.wordDisplayRow}>
          <Text style={styles.displayWordText}>{item.displayWord}</Text>
        </View>

        {/* Optional Gentle Phonetic Hint */}
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
    top: 4,
    left: 16,
    right: 16,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    gap: 8,
  },
  mascotWrapper: {
    width: 60,
    height: 60,
  },
  mascot: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  speechBubble: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FDE68A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  audioReplayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  speakerIcon: {
    fontSize: 16,
  },
  heroImageStage: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#FFF7ED',
    borderWidth: 4,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 6,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  innerRadialBacking: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FEF3C7',
    opacity: 0.6,
  },
  heroImageText: {
    fontSize: 88,
    textAlign: 'center',
  },
  wordDisplayRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  displayWordText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 30,
    color: '#7C2D12',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  hintContainer: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  hintText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#B45309',
  },
});
