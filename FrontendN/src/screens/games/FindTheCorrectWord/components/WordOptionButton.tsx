/**
 * Purpose: Tactile 3D option button for selecting words in Find the Correct Word.
 * Module: Find the Correct Word — Components
 * Folder: frontend/src/screens/games/FindTheCorrectWord/components
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
import { WordChoiceOption } from '../types';

export interface WordOptionButtonProps {
  option: WordChoiceOption;
  status: 'idle' | 'correct' | 'wrong' | 'disabled';
  disabled: boolean;
  onPress: (option: WordChoiceOption) => void;
  width?: number | string;
}

export const WordOptionButton: React.FC<WordOptionButtonProps> = React.memo(
  ({ option, status, disabled, onPress, width = '100%' }) => {
    const scale = useSharedValue(1);
    const shakeX = useSharedValue(0);

    useEffect(() => {
      if (status === 'correct') {
        scale.value = withSequence(
          withSpring(1.08, { damping: 6, stiffness: 200 }),
          withSpring(1.0, { damping: 10, stiffness: 150 })
        );
      } else if (status === 'wrong') {
        shakeX.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(0, { duration: 50 })
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
      <Animated.View style={[styles.wrapper, { width: width as any }, animatedStyle]}>
        <TouchableOpacity
          style={[
            styles.button,
            status === 'correct' && styles.buttonCorrect,
            status === 'wrong' && styles.buttonWrong,
            disabled && styles.buttonDisabled,
          ]}
          onPress={() => onPress(option)}
          disabled={disabled || status !== 'idle'}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Option: ${option.word}`}
        >
          <Text
            style={[
              styles.wordText,
              status === 'correct' && styles.textCorrect,
              status === 'wrong' && styles.textWrong,
              disabled && styles.textDisabled,
            ]}
          >
            {option.word}
          </Text>

          {status === 'correct' && (
            <View style={styles.badgeCorrect}>
              <Text style={styles.badgeText}>✓</Text>
            </View>
          )}
          {status === 'wrong' && (
            <View style={styles.badgeWrong}>
              <Text style={styles.badgeText}>✕</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

WordOptionButton.displayName = 'WordOptionButton';

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#10B981',
    borderBottomWidth: 5,
    borderBottomColor: '#059669',
    shadowColor: '#065F46',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  wordText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  buttonCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderBottomColor: '#059669',
  },
  textCorrect: {
    color: '#047857',
  },
  buttonWrong: {
    backgroundColor: '#FFF1F2',
    borderColor: '#F43F5E',
    borderBottomColor: '#BE123C',
  },
  textWrong: {
    color: '#BE123C',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    color: '#94A3B8',
  },
  badgeCorrect: {
    position: 'absolute',
    top: -6,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrong: {
    position: 'absolute',
    top: -6,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
