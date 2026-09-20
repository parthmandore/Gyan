/**
 * Purpose: Chunky tactile multiple-choice option card for Aptitude & Logic games.
 *          Supports text, numbers, emojis, and visual symbols with instant tactile
 *          and color feedback for correct/incorrect selections.
 * Module: Aptitude Challenge — Components
 * Folder: frontend/src/screens/games/AptitudeChallenge/components
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigTouchTarget } from '../../../../components/BigTouchTarget';
import { AptitudeOption } from '../types';

export interface AptitudeOptionCardProps {
  option: AptitudeOption;
  status: 'idle' | 'correct' | 'wrong' | 'disabled';
  onPress: () => void;
  disabled?: boolean;
  isTwoOptions?: boolean;
}

export const AptitudeOptionCard: React.FC<AptitudeOptionCardProps> = React.memo(
  ({ option, status, onPress, disabled = false, isTwoOptions = false }) => {
    const isCorrect = status === 'correct';
    const isWrong = status === 'wrong';
    const isDisabled = disabled || status === 'disabled';

    return (
      <View style={[styles.wrapper, isTwoOptions && styles.wrapperTwo]}>
        <BigTouchTarget
          onPress={onPress}
          disabled={isDisabled || isCorrect}
          accessibilityLabel={`Option ${option.label || option.visual || ''}`}
          accessibilityRole="button"
          style={[
            styles.card,
            isCorrect && styles.cardCorrect,
            isWrong && styles.cardWrong,
            isDisabled && !isCorrect && !isWrong && styles.cardDisabled,
          ]}
        >
          {option.visual && (
            <Text style={[styles.visualText, isCorrect && styles.textCorrect]}>
              {option.visual}
            </Text>
          )}

          {option.label && option.label !== option.visual && (
            <Text
              style={[
                styles.labelText,
                isCorrect && styles.textCorrect,
                isWrong && styles.textWrong,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          )}

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
  wrapperTwo: {
    width: '46%',
  },
  card: {
    width: '100%',
    height: 94,
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
    paddingHorizontal: 8,
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
  visualText: {
    fontSize: 34,
    textAlign: 'center',
  },
  labelText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
    textAlign: 'center',
  },
  textCorrect: {
    color: '#FFFFFF',
  },
  textWrong: {
    color: '#DC2626',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 10,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
