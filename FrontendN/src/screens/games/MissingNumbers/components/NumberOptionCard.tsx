/**
 * Purpose: Large tactile option button for number selection in Missing Numbers.
 * Module: Missing Numbers — Components
 * Folder: frontend/src/screens/games/MissingNumbers/components
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
import { MissingNumbersOption } from '../types';

export interface NumberOptionCardProps {
  option: MissingNumbersOption;
  status: 'idle' | 'correct' | 'wrong';
  disabled: boolean;
  onPress: (option: MissingNumbersOption) => void;
  width?: number;
  height?: number;
}

export const NumberOptionCard: React.FC<NumberOptionCardProps> = React.memo(
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
          accessibilityLabel={`Option number ${option.value}`}
        >
          <Text
            style={[
              styles.numberText,
              status === 'correct' && styles.textCorrect,
              status === 'wrong' && styles.textWrong,
            ]}
          >
            {option.value}
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

NumberOptionCard.displayName = 'NumberOptionCard';

const styles = StyleSheet.create({
  wrapper: {
    margin: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#06B6D4',
    borderBottomWidth: 6,
    borderBottomColor: '#0891B2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0891B2',
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
  numberText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0E7490',
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
