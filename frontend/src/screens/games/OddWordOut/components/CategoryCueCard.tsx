/**
 * Purpose: Header cue card for Odd Word Out.
 *          Presents the question prompt, category icon, and audio replay.
 * Module: Odd Word Out — Components
 * Folder: frontend/src/screens/games/OddWordOut/components
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OddWordCategoryItem } from '../types';

export interface CategoryCueCardProps {
  item: OddWordCategoryItem;
  promptText: string;
  onHearPrompt?: () => void;
  revealedOddWord?: string | null;
}

export const CategoryCueCard: React.FC<CategoryCueCardProps> = React.memo(
  ({ item, promptText, onHearPrompt, revealedOddWord }) => {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <Text style={styles.iconText}>{item.categoryIcon}</Text>
          </View>

          {onHearPrompt && (
            <TouchableOpacity
              style={styles.speakerButton}
              onPress={onHearPrompt}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Hear question"
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.promptHeading}>{promptText}</Text>

        {revealedOddWord ? (
          <View style={styles.revealedBanner}>
            <Text style={styles.revealedText}>
              🌟 {revealedOddWord} 🌟
            </Text>
            <Text style={styles.explanationText}>{item.explanation}</Text>
          </View>
        ) : (
          <Text style={styles.helperSubtext}>
            3 words belong to the same group. 1 is different!
          </Text>
        )}
      </View>
    );
  }
);

CategoryCueCard.displayName = 'CategoryCueCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#5B21B6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
  },
  iconText: {
    fontSize: 26,
  },
  speakerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
  },
  speakerIcon: {
    fontSize: 20,
  },
  promptHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  helperSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  revealedBanner: {
    marginTop: 8,
    backgroundColor: '#F5F3FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    width: '100%',
  },
  revealedText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#6D28D9',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B21B6',
    textAlign: 'center',
    lineHeight: 18,
  },
});
