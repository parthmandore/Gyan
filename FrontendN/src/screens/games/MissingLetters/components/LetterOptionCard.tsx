/**
 * Purpose: Large tactile option button for letter selection in Missing Letters.
 * Module: Missing Letters — Components
 * Folder: frontend/src/screens/games/MissingLetters/components
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { MissingLettersOption } from '../types';

export interface LetterOptionCardProps {
  option: MissingLettersOption;
  status: 'idle' | 'correct' | 'wrong';
  disabled: boolean;
  onPress: (option: MissingLettersOption) => void;
  width?: number;
  height?: number;
}

export const LetterOptionCard: React.FC<LetterOptionCardProps> = React.memo(
  ({ option, status, disabled, onPress, width = 80, height = 80 }) => {
    const scale = useSharedValue(1);
    const shakeX = useSharedValue(0);

    // Animation on status change
    useEffect(() => {
      if (status === 'correct') {
        scale.value = withSequence(
          withSpring(1.22, { damping: 5, stiffness: 200 }),
          withSpring(1.0, { damping: 10, stiffness: 150 })
        );
      } else if (status === 'wrong') {
        shakeX.value = withSequence(
          withTiming(-8, { duration: 60 }),
          withTiming(8, { duration: 60 }),
          withTiming(-6, { duration: 60 }),
          withTiming(6, { duration: 60 }),
          withTiming(0, { duration: 60 })
        );
      } else {
        scale.value = 1;
        shakeX.value = 0;
      }
    }, [status, scale, shakeX]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }, { translateX: shakeX.value }],
    }));

    return (
      <Animated.View style={[styles.wrapper, animatedStyle]}>
        <TouchableOpacity
          style={[
            styles.card,
            { width, height },
            status === 'correct' && styles.cardCorrect,
            status === 'wrong' && styles.cardWrong,
          ]}
          onPress={() => onPress(option)}
          disabled={disabled || status !== 'idle'}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Option letter ${option.letter}`}
        >
          <Text
            style={[
              styles.letterText,
              status === 'correct' && styles.textCorrect,
              status === 'wrong' && styles.textWrong,
            ]}
          >
            {option.letter}
          </Text>

          {/* Gentle indicator icon */}
          {status === 'correct' && (
            <View style={styles.iconBadgeCorrect}>
              <Text style={styles.iconText}>✓</Text>
            </View>
          )}
          {status === 'wrong' && (
            <View style={styles.iconBadgeWrong}>
              <Text style={styles.iconText}>✕</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

LetterOptionCard.displayName = 'LetterOptionCard';

const styles = StyleSheet.create({
  wrapper: {
    margin: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#A855F7',
    borderBottomWidth: 6,
    borderBottomColor: '#7E22CE',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B21A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  cardCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderBottomColor: '#059669',
  },
  cardWrong: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderBottomColor: '#D97706',
    opacity: 0.85,
  },
  letterText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  textCorrect: {
    color: '#047857',
  },
  textWrong: {
    color: '#B45309',
  },
  iconBadgeCorrect: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadgeWrong: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
