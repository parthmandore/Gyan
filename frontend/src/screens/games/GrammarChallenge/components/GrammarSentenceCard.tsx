/**
 * Purpose: Large, child-friendly sentence and word display card for Grammar Challenge.
 *          Renders prompt, visual emoji/icon, and sentence with highlighted blank slot
 *          and audio playback button.
 * Module: Grammar Challenge — Components
 * Folder: frontend/src/screens/games/GrammarChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GrammarTopic } from '../types';

export interface GrammarSentenceCardProps {
  sentence: string;
  topic: GrammarTopic;
  promptText: string;
  visualIcon?: string;
  onHear?: () => void;
}

const TOPIC_BADGES: Record<GrammarTopic, { badge: string; color: string; bg: string }> = {
  noun_or_verb: { badge: '📝 Word Type', color: '#1D4ED8', bg: '#EFF6FF' },
  singular_or_plural: { badge: '🔢 How Many?', color: '#047857', bg: '#ECFDF5' },
  complete_the_sentence: { badge: '✏️ Fill In', color: '#7C3AED', bg: '#F5F3FF' },
  articles_determiners: { badge: '🔤 Determiner', color: '#B45309', bg: '#FEF3C7' },
  pronouns: { badge: '👤 Pronoun', color: '#DB2777', bg: '#FDF2F8' },
  prepositions: { badge: '📍 Position', color: '#0891B2', bg: '#ECFEFF' },
  basic_tenses: { badge: '⏱️ Time & Tense', color: '#6366F1', bg: '#EEF2FF' },
  sentence_correction: { badge: '✔️ Fix Sentence', color: '#059669', bg: '#F0FDF4' },
};

export const GrammarSentenceCard: React.FC<GrammarSentenceCardProps> = React.memo(
  ({ sentence, topic, promptText, visualIcon, onHear }) => {
    const badgeInfo = TOPIC_BADGES[topic] || TOPIC_BADGES.complete_the_sentence;

    return (
      <View style={styles.cardContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: badgeInfo.bg }]}>
            <Text style={[styles.badgeText, { color: badgeInfo.color }]}>
              {badgeInfo.badge}
            </Text>
          </View>

          {onHear && (
            <TouchableOpacity
              style={styles.speakerBtn}
              onPress={onHear}
              accessibilityLabel="Listen to sentence"
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Prompt */}
        <Text style={styles.promptText}>{promptText}</Text>

        {/* Visual Icon / Stimulus Card */}
        {visualIcon && (
          <View style={styles.iconWrapper}>
            <Text style={styles.visualIconText}>{visualIcon}</Text>
          </View>
        )}

        {/* Sentence Text */}
        <View style={styles.sentenceWrapper}>
          <Text style={styles.sentenceText}>{sentence}</Text>
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
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
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
  promptText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  visualIconText: {
    fontSize: 34,
  },
  sentenceWrapper: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentenceText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 32,
  },
});
