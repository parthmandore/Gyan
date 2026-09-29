/**
 * Purpose: Chunky tactile multiple-choice number card for Math Challenge.
 *          Provides instant visual and spring tactile feedback when tapped.
 * Module: Math Challenge — Components
 * Folder: frontend/src/screens/games/MathChallenge/components
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigTouchTarget } from '../../../../components/BigTouchTarget';
import { MathOption } from '../types';

export interface NumberOptionCardProps {
  option: MathOption;
  status: 'idle' | 'correct' | 'wrong' | 'disabled';
  onPress: () => void;
  disabled?: boolean;
}

export const NumberOptionCard: React.FC<NumberOptionCardProps> = React.memo(
  ({ option, status, onPress, disabled = false }) => {
    const isCorrect = status === 'correct';
    const isWrong = status === 'wrong';
    const isDisabled = disabled || status === 'disabled';

    return (
      <View style={styles.wrapper}>
        <BigTouchTarget
          onPress={onPress}
          disabled={isDisabled || isCorrect}
          accessibilityLabel={`Answer option ${option.label}`}
          accessibilityRole="button"
          style={[
            styles.card,
            isCorrect && styles.cardCorrect,
            isWrong && styles.cardWrong,
            isDisabled && !isCorrect && !isWrong && styles.cardDisabled,
          ]}
        >
          <Text
            style={[
              styles.numberText,
              isCorrect && styles.textCorrect,
              isWrong && styles.textWrong,
            ]}
          >
            {option.label}
          </Text>

          {isCorrect && <Text style={styles.statusBadge}>✓</Text>}
          {isWrong && <Text style={styles.statusBadge}>✕</Text>}
        </BigTouchTarget>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    width: '48%',
    marginBottom: 14,
  },
  card: {
    width: '100%',
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  cardCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  cardWrong: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  cardDisabled: {
    opacity: 0.45,
  },
  numberText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E293B',
  },
  textCorrect: {
    color: '#FFFFFF',
  },
  textWrong: {
    color: '#DC2626',
  },
  statusBadge: {
    position: 'absolute',
    top: 6,
    right: 10,
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
