/**
 * Purpose: Friendly pill displaying what the child said and status.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppLanguageStore } from '../../../../state/appLanguageStore';

interface SpeechFeedbackBadgeProps {
  recognizedText: string | null;
  status: 'correct' | 'wrong' | 'empty' | 'listening' | 'transcribing' | 'technical' | null;
}

export const SpeechFeedbackBadge: React.FC<SpeechFeedbackBadgeProps> = React.memo(
  ({ recognizedText, status }) => {
    const { t } = useTranslation();
    const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';

    if (!status && !recognizedText) return null;

    let badgeBg = '#F3F4F6';
    let borderColor = '#D1D5DB';
    let textColor = '#374151';
    let message = '';

    if (status === 'listening') {
      badgeBg = '#FEE2E2';
      borderColor = '#FCA5A5';
      textColor = '#991B1B';
      message = `🎙️ ${t('speechWordChallenge.feedback.listening', { lng: motherTongue })}`;
    } else if (status === 'transcribing') {
      badgeBg = '#FEF3C7';
      borderColor = '#FCD34D';
      textColor = '#92400E';
      message = `⏳ ${t('speechWordChallenge.feedback.checking', { lng: motherTongue })}`;
    } else if (status === 'correct') {
      badgeBg = '#DCFCE7';
      borderColor = '#86EFAC';
      textColor = '#166534';
      const greatJob = t('speechWordChallenge.feedback.greatJob', { lng: motherTongue });
      message = recognizedText
        ? `✨ ${greatJob} ("${recognizedText}")`
        : `✨ ${greatJob}`;
    } else if (status === 'empty') {
      badgeBg = '#FEF3C7';
      borderColor = '#FDE68A';
      textColor = '#92400E';
      message = `👂 ${t('speechWordChallenge.feedback.couldNotHear', { lng: motherTongue })}`;
    } else if (status === 'technical') {
      badgeBg = '#E0F2FE';
      borderColor = '#BAE6FD';
      textColor = '#0369A1';
      message = `🔌 ${t('speechWordChallenge.feedback.helperResting', { lng: motherTongue })}`;
    } else if (status === 'wrong') {
      badgeBg = '#FEE2E2';
      borderColor = '#FCA5A5';
      textColor = '#991B1B';
      const almostTryAgain = t('speechWordChallenge.feedback.almostTryAgain', { lng: motherTongue });
      message = recognizedText
        ? `(${recognizedText}) • ${almostTryAgain}`
        : almostTryAgain;
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
