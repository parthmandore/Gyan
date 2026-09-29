/**
 * Purpose: Central picture/object card for Find the Correct Word.
 *          Displays large image/emoji with audio pronunciation replay.
 * Module: Find the Correct Word — Components
 * Folder: frontend/src/screens/games/FindTheCorrectWord/components
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { CorrectWordItem } from '../types';

export interface PictureTargetCardProps {
  item: CorrectWordItem;
  onHearWord?: () => void;
  revealedWord?: string | null;
}

export const PictureTargetCard: React.FC<PictureTargetCardProps> = React.memo(
  ({ item, onHearWord, revealedWord }) => {
    const scale = useSharedValue(1);

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1.0);
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <View style={styles.card}>
        {/* Top bar with audio button */}
        <View style={styles.topRow}>
          <View style={styles.badgeHint}>
            <Text style={styles.badgeHintText}>Look at the picture</Text>
          </View>

          {onHearWord && (
            <TouchableOpacity
              style={styles.speakerButton}
              onPress={onHearWord}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Hear pronunciation"
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Central Large Picture/Emoji */}
        <Animated.View style={[styles.imageContainer, animatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={onHearWord}
          >
            <Text style={styles.pictureEmoji}>{item.image}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Meaning or Revealed Word Display */}
        {revealedWord ? (
          <View style={styles.revealedBanner}>
            <Text style={styles.revealedText}>✨ {revealedWord} ✨</Text>
          </View>
        ) : (
          <Text style={styles.hintPrompt}>
            {item.meaning ? item.meaning : 'Which spelling is correct?'}
          </Text>
        )}
      </View>
    );
  }
);

PictureTargetCard.displayName = 'PictureTargetCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeHint: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  badgeHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  speakerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
  },
  speakerIcon: {
    fontSize: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    borderWidth: 2.5,
    borderColor: '#BBF7D0',
  },
  pictureEmoji: {
    fontSize: 72,
  },
  hintPrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  revealedBanner: {
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  revealedText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.5,
  },
});
