/**
 * Purpose: Large, child-friendly equation display card for Math Challenge.
 *          Renders equations prominently (e.g. 2 + 3 = ?) with an operation badge
 *          and audio speak button.
 * Module: Math Challenge — Components
 * Folder: frontend/src/screens/games/MathChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MathOperation } from '../types';

export interface EquationCardProps {
  equation: string;
  operation: MathOperation;
  onHear?: () => void;
}

const OPERATION_BADGES: Record<MathOperation, { icon: string; color: string; bg: string }> = {
  addition: { icon: '➕', color: '#1D4ED8', bg: '#EFF6FF' },
  subtraction: { icon: '➖', color: '#BE185D', bg: '#FDF2F8' },
  bigger_addition: { icon: '➕', color: '#B45309', bg: '#FEF3C7' },
  multiplication: { icon: '✖️', color: '#6D28D9', bg: '#F5F3FF' },
  division: { icon: '➗', color: '#047857', bg: '#ECFDF5' },
};

export const EquationCard: React.FC<EquationCardProps> = React.memo(
  ({ equation, operation, onHear }) => {
    const badge = OPERATION_BADGES[operation] || OPERATION_BADGES.addition;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
          </View>
          {onHear && (
            <TouchableOpacity
              style={styles.speakerBtn}
              onPress={onHear}
              accessibilityLabel="Listen to equation"
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.equationWrapper}>
          <Text style={styles.equationText}>{equation}</Text>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeIcon: {
    fontSize: 16,
  },
  speakerBtn: {
    backgroundColor: '#F1F5F9',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  speakerIcon: {
    fontSize: 18,
  },
  equationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  equationText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
