/**
 * Purpose: Large, tactile multiple choice option button for Guess the Shape.
 *          Features 3D push feel, satisfying selection feedback, and clear green/red states.
 * Module: Guess the Shape — Components
 * Folder: frontend/src/screens/games/GuessTheShape/components
 */

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { BigTouchTarget } from '../../../../components/BigTouchTarget';
import { ShapeOption } from '../types';

export interface ShapeOptionButtonProps {
  option: ShapeOption;
  status: 'idle' | 'correct' | 'wrong' | 'disabled';
  onPress: (option: ShapeOption) => void;
  disabled?: boolean;
}

export const ShapeOptionButton: React.FC<ShapeOptionButtonProps> = React.memo(({
  option,
  status,
  onPress,
  disabled = false,
}) => {
  const isCorrect = status === 'correct';
  const isWrong = status === 'wrong';
  const isDisabled = disabled || status === 'disabled';

  const containerStyle = [
    styles.button,
    isCorrect && styles.correctButton,
    isWrong && styles.wrongButton,
    isDisabled && styles.disabledButton,
  ];

  const textStyle = [
    styles.text,
    isCorrect && styles.correctText,
    isWrong && styles.wrongText,
    isDisabled && styles.disabledText,
  ];

  return (
    <BigTouchTarget
      onPress={() => onPress(option)}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={option.name}
      style={containerStyle}
    >
      <View style={styles.contentRow}>
        <Text style={textStyle} numberOfLines={1} adjustsFontSizeToFit>
          {option.name}
        </Text>
        {isCorrect && <Text style={styles.badgeEmoji}>✅</Text>}
        {isWrong && <Text style={styles.badgeEmoji}>❌</Text>}
      </View>
    </BigTouchTarget>
  );
});

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 58,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#E2E8F0',
    borderBottomWidth: 5,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 5,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  correctButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderBottomColor: '#047857',
  },
  wrongButton: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderBottomColor: '#B91C1C',
  },
  disabledButton: {
    opacity: 0.55,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderBottomColor: '#CBD5E1',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  correctText: {
    color: '#065F46',
  },
  wrongText: {
    color: '#991B1B',
  },
  disabledText: {
    color: '#94A3B8',
  },
  badgeEmoji: {
    fontSize: 18,
  },
});
