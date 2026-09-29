/**
 * Purpose: Extra-large, chunky number option card with playful tactile animations,
 *          3D button bevel, and correct/wrong feedback states for Age 5 children.
 * Module: Number Counting — Components
 * Folder: frontend/src/screens/games/NumberCounting/components
 */

import React, { useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
} from 'react-native';
import { CountingOption } from '../types';

interface CountingOptionCardProps {
  option: CountingOption;
  status: 'idle' | 'correct' | 'wrong';
  disabled: boolean;
  onPress: (option: CountingOption) => void;
}

export const CountingOptionCard: React.FC<CountingOptionCardProps> = React.memo(
  ({ option, status, disabled, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const wobbleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (status === 'correct') {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (status === 'wrong') {
        Animated.sequence([
          Animated.timing(wobbleAnim, {
            toValue: -10,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 10,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: -6,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 6,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        scaleAnim.setValue(1);
        wobbleAnim.setValue(0);
      }
    }, [status]);

    const handlePressIn = () => {
      if (disabled) return;
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        speed: 30,
        bounciness: 0,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      if (disabled) return;
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 20,
        bounciness: 8,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.wrapper,
          {
            transform: [{ scale: scaleAnim }, { translateX: wobbleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => onPress(option)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || status !== 'idle'}
          style={[
            styles.card,
            status === 'correct' && styles.cardCorrect,
            status === 'wrong' && styles.cardWrong,
          ]}
          accessibilityLabel={`Option ${option.label}`}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.numberText,
              status === 'correct' && styles.numberTextCorrect,
              status === 'wrong' && styles.numberTextWrong,
            ]}
          >
            {option.label}
          </Text>

          {status === 'correct' && (
            <View style={styles.badgeSuccess}>
              <Text style={styles.badgeSuccessText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    maxWidth: 105,
    marginHorizontal: 6,
  },
  card: {
    minHeight: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#0284C7',
    borderBottomWidth: 6,
    borderBottomColor: '#0369A1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  cardCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    borderBottomColor: '#047857',
    shadowColor: '#10B981',
  },
  cardWrong: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
    opacity: 0.6,
  },
  numberText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
  },
  numberTextCorrect: {
    color: '#FFFFFF',
  },
  numberTextWrong: {
    color: '#94A3B8',
  },
  badgeSuccess: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  badgeSuccessText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
