/**
 * Purpose: Adaptive visual stimulus display for Aptitude & Logical Thinking games.
 *          Renders sequences, comparison numbers, cause-and-effect pipelines,
 *          and matrices with child-friendly cards, high contrast, and animated effects.
 * Module: Aptitude Challenge — Components
 * Folder: frontend/src/screens/games/AptitudeChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AptitudeQuestion, AptitudeGameType } from '../types';

export interface StimulusDisplayProps {
  question: AptitudeQuestion;
  gameType: AptitudeGameType;
  promptText: string;
  onHear?: () => void;
}

const GAME_THEMES: Record<AptitudeGameType, { color: string; bg: string; badge: string }> = {
  pattern_match: { color: '#7C3AED', bg: '#F5F3FF', badge: '🧩 Pattern' },
  bigger_smaller: { color: '#2563EB', bg: '#EFF6FF', badge: '⚖️ Compare' },
  what_comes_next: { color: '#059669', bg: '#ECFDF5', badge: '➡️ Next' },
  number_pattern: { color: '#D97706', bg: '#FEF3C7', badge: '🔢 Sequence' },
  odd_one_out: { color: '#DB2777', bg: '#FDF2F8', badge: '🔍 Odd One' },
  logical_sequence: { color: '#0891B2', bg: '#ECFEFF', badge: '⏳ Logic' },
  visual_reasoning: { color: '#4F46E5', bg: '#EEF2FF', badge: '🧠 Reason' },
};

export const StimulusDisplay: React.FC<StimulusDisplayProps> = React.memo(
  ({ question, gameType, promptText, onHear }) => {
    const theme = GAME_THEMES[gameType] || GAME_THEMES.pattern_match;

    const renderStimulusBody = () => {
      switch (question.stimulusLayout) {
        case 'matrix': {
          // 2x2 grid
          return (
            <View style={styles.matrixContainer}>
              <View style={styles.matrixRow}>
                {question.stimulusTokens.slice(0, 2).map((tok) => (
                  <View
                    key={tok.id}
                    style={[styles.matrixCell, tok.isPlaceholder && styles.placeholderCell]}
                  >
                    <Text style={styles.tokenVisual}>{tok.visual}</Text>
                    {tok.label && <Text style={styles.tokenLabel}>{tok.label}</Text>}
                  </View>
                ))}
              </View>
              <View style={styles.matrixRow}>
                {question.stimulusTokens.slice(2, 4).map((tok) => (
                  <View
                    key={tok.id}
                    style={[styles.matrixCell, tok.isPlaceholder && styles.placeholderCell]}
                  >
                    <Text style={styles.tokenVisual}>{tok.visual}</Text>
                    {tok.label && <Text style={styles.tokenLabel}>{tok.label}</Text>}
                  </View>
                ))}
              </View>
            </View>
          );
        }

        case 'cause_effect': {
          // Horizontal flow with arrows
          return (
            <View style={styles.pipelineContainer}>
              {question.stimulusTokens.map((tok, idx) => (
                <React.Fragment key={tok.id}>
                  <View
                    style={[
                      styles.pipelineCard,
                      tok.isPlaceholder && styles.placeholderCard,
                    ]}
                  >
                    <Text style={styles.tokenVisual}>{tok.visual}</Text>
                    {tok.label && <Text style={styles.tokenLabel}>{tok.label}</Text>}
                  </View>
                  {idx < question.stimulusTokens.length - 1 && (
                    <Text style={styles.arrowText}>➔</Text>
                  )}
                </React.Fragment>
              ))}
            </View>
          );
        }

        case 'comparison': {
          // 2 or 3 large cards to compare
          return (
            <View style={styles.comparisonContainer}>
              {question.stimulusTokens.map((tok, idx) => (
                <View key={tok.id} style={styles.comparisonCard}>
                  <Text style={styles.comparisonNumber}>{tok.visual}</Text>
                </View>
              ))}
            </View>
          );
        }

        case 'cards_grid': {
          // Display items for Odd One Out
          return (
            <View style={styles.gridPreviewContainer}>
              <Text style={styles.gridInstructionText}>
                {promptText}
              </Text>
            </View>
          );
        }

        case 'sequence':
        default: {
          // Standard horizontal sequence
          return (
            <View style={styles.sequenceContainer}>
              {question.stimulusTokens.map((tok) => (
                <View
                  key={tok.id}
                  style={[
                    styles.tokenPill,
                    tok.isPlaceholder && styles.placeholderPill,
                  ]}
                >
                  <Text style={styles.sequenceVisual}>{tok.visual}</Text>
                </View>
              ))}
            </View>
          );
        }
      }
    };

    return (
      <View style={styles.cardContainer}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: theme.bg }]}>
            <Text style={[styles.badgeText, { color: theme.color }]}>{theme.badge}</Text>
          </View>
          {onHear && (
            <TouchableOpacity
              style={styles.speakerBtn}
              onPress={onHear}
              accessibilityLabel="Listen to question"
            >
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Prompt */}
        <Text style={styles.promptText}>{promptText}</Text>

        {/* Dynamic Stimulus Layout */}
        <View style={styles.stimulusWrapper}>{renderStimulusBody()}</View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 2,
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
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  speakerBtn: {
    backgroundColor: '#F1F5F9',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  speakerIcon: {
    fontSize: 17,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 14,
  },
  stimulusWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sequence layout
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  tokenPill: {
    minWidth: 46,
    height: 52,
    paddingHorizontal: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderPill: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  sequenceVisual: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Comparison layout
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 6,
  },
  comparisonCard: {
    minWidth: 80,
    height: 84,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1E40AF',
  },

  // Cause-and-Effect / Pipeline layout
  pipelineContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  pipelineCard: {
    minWidth: 54,
    height: 64,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  arrowText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#94A3B8',
  },
  tokenVisual: {
    fontSize: 24,
    textAlign: 'center',
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },

  // Matrix layout
  matrixContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 10,
    gap: 8,
  },
  matrixRow: {
    flexDirection: 'row',
    gap: 8,
  },
  matrixCell: {
    width: 68,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderCell: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },

  // Cards grid instruction
  gridPreviewContainer: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  gridInstructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
});
