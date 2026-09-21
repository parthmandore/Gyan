/**
 * Purpose: Centralized, responsive, non-overlapping HUD component for all Gyan games.
 *          Implements a standardized 2-row layout:
 *          - Row 1: Quit button (left), Session Countdown Timer (center), Score Pill (right)
 *          - Row 2: Centered ProgressStarTrail
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BigTouchTarget } from './BigTouchTarget';
import { SessionCountdownTimer } from './SessionCountdownTimer';
import { ProgressStarTrail } from './ProgressStarTrail';

export interface GameHUDProps {
  onQuit: () => void;
  currentRound: number;
  totalRounds: number;
  score: number;
  initialSeconds?: number;
  onTimeExpired?: () => void;
  onExpire?: () => void;
  isPaused?: boolean;
  roundResults?: Array<'correct' | 'wrong' | 'pending'>;
  scoreSuffix?: string;
  containerWidth?: number;
  timerDisabled?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = React.memo(
  ({
    onQuit,
    currentRound,
    totalRounds,
    score,
    initialSeconds = 90,
    onTimeExpired,
    onExpire,
    isPaused = false,
    roundResults,
    scoreSuffix = 'XP',
    containerWidth,
    timerDisabled = false,
  }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();
    const effectiveWidth = containerWidth || Math.min(windowWidth - 24, 440);

    // On Android, ensure we properly clear the translucent status bar
    const topPadding = Platform.OS === 'android'
      ? Math.max(insets.top, StatusBar.currentHeight || 0, 10) + 4
      : 4;

    return (
      <View style={[styles.hudContainer, { width: effectiveWidth, paddingTop: topPadding }]}>
        {/* ROW 1: [Quit]  [Timer]  [Score XP] */}
        <View style={styles.rowTop}>
          <BigTouchTarget
            onPress={onQuit}
            accessibilityLabel={t('game.quitGame', { defaultValue: 'Quit game' })}
            style={styles.quitButton}
          >
            <Text style={styles.quitButtonText}>✕</Text>
          </BigTouchTarget>

          {!timerDisabled && (
            <View style={styles.timerWrapper}>
              <SessionCountdownTimer
                initialSeconds={initialSeconds}
                onTimeExpired={onTimeExpired || onExpire}
                onExpire={onExpire || onTimeExpired}
                isPaused={isPaused}
              />
            </View>
          )}

          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>
              ⭐ {score} {scoreSuffix}
            </Text>
          </View>
        </View>

        {/* ROW 2: Star Trail */}
        <View style={styles.rowStars}>
          <ProgressStarTrail
            current={currentRound}
            total={totalRounds}
            roundResults={roundResults}
          />
        </View>
      </View>
    );
  }
);

GameHUD.displayName = 'GameHUD';

const styles = StyleSheet.create({
  hudContainer: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 2,
    zIndex: 30,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  quitButton: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quitButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  timerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  scorePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  rowStars: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingVertical: 2,
  },
});
