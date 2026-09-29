/**
 * Purpose: Chunky tactile option card for Grammar Challenge.
 *          Adapts layout for 2 side-by-side choices, 3 choices, or full-width sentences.
 * Module: Grammar Challenge — Components
 * Folder: frontend/src/screens/games/GrammarChallenge/components
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BigTouchTarget } from '../../../../components/BigTouchTarget';
import { GrammarOption } from '../types';

export interface GrammarOptionCardProps {
  option: GrammarOption;
  status: 'idle' | 'correct' | 'wrong' | 'disabled';
  onPress: () => void;
  disabled?: boolean;
  layoutMode?: 'half' | 'full';
}

export const GrammarOptionCard: React.FC<GrammarOptionCardProps> = React.memo(
  ({ option, status, onPress, disabled = false, layoutMode = 'half' }) => {
    const isCorrect = status === 'correct';
    const isWrong = status === 'wrong';
    const isDisabled = disabled || status === 'disabled';
    const isFull = layoutMode === 'full';

    return (
      <View style={[styles.wrapper, isFull && styles.wrapperFull]}>
        <BigTouchTarget
          onPress={onPress}
          disabled={isDisabled || isCorrect}
          accessibilityLabel={`Option ${option.label}`}
          accessibilityRole="button"
          style={[
            styles.card,
            isFull && styles.cardFull,
            isCorrect && styles.cardCorrect,
            isWrong && styles.cardWrong,
            isDisabled && !isCorrect && !isWrong && styles.cardDisabled,
          ]}
        >
          <Text
            style={[
              styles.optionText,
              isFull && styles.optionTextFull,
              isCorrect && styles.textCorrect,
              isWrong && styles.textWrong,
            ]}
            numberOfLines={isFull ? 2 : 1}
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
    marginBottom: 12,
  },
  wrapperFull: {
    width: '100%',
    marginBottom: 10,
  },
  card: {
    width: '100%',
    minHeight: 74,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardFull: {
    minHeight: 64,
    alignItems: 'flex-start',
    paddingHorizontal: 18,
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
  optionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  optionTextFull: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'left',
    paddingRight: 24,
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
    right: 12,
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
