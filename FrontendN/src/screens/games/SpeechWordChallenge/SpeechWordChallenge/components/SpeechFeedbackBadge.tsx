/**
 * Purpose: Friendly pill displaying what the child said and status.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SpeechFeedbackBadgeProps {
  recognizedText: string | null;
  status: 'correct' | 'wrong' | 'empty' | 'listening' | 'transcribing' | 'technical' | null;
}

export const SpeechFeedbackBadge: React.FC<SpeechFeedbackBadgeProps> = React.memo(
  ({ recognizedText, status }) => {
    if (!status && !recognizedText) return null;

    let badgeBg = '#F3F4F6';
    let borderColor = '#D1D5DB';
    let textColor = '#374151';
    let message = '';

    if (status === 'listening') {
      badgeBg = '#FEE2E2';
      borderColor = '#FCA5A5';
      textColor = '#991B1B';
      message = "🎙️ I'm listening...";
    } else if (status === 'transcribing') {
      badgeBg = '#FEF3C7';
      borderColor = '#FCD34D';
      textColor = '#92400E';
      message = '⏳ Checking...';
    } else if (status === 'correct') {
      badgeBg = '#DCFCE7';
      borderColor = '#86EFAC';
      textColor = '#166534';
      message = recognizedText
        ? `✨ Great job! ("${recognizedText}")`
        : '✨ Great job!';
    } else if (status === 'empty') {
      badgeBg = '#FEF3C7';
      borderColor = '#FDE68A';
      textColor = '#92400E';
      message = "👂 I couldn't hear clearly. Try again!";
    } else if (status === 'technical') {
      badgeBg = '#E0F2FE';
      borderColor = '#BAE6FD';
      textColor = '#0369A1';
      message = '🔌 Speech helper is resting. Tap to retry!';
    } else if (status === 'wrong') {
      badgeBg = '#FEE2E2';
      borderColor = '#FCA5A5';
      textColor = '#991B1B';
      message = recognizedText
        ? `Almost! ("${recognizedText}") Try again.`
        : 'Almost! Try again.';
    }

    return (
      <View style={[styles.container, { backgroundColor: badgeBg, borderColor }]}>
        <Text style={[styles.text, { color: textColor }]}>{message}</Text>
      </View>
    );
  }
);

SpeechFeedbackBadge.displayName = 'SpeechFeedbackBadge';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
