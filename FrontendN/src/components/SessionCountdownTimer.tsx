/**
 * Purpose: Child-friendly continuous session countdown timer for educational games.
 *          Starts with 90 seconds (configurable), runs continuously across rounds,
 *          pauses during educational modals/overlays, and invokes onTimeExpired when reaching 0.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Typography } from '../theme/typography';
import { Colors } from '../theme/colors';

export interface SessionCountdownTimerProps {
  initialSeconds?: number;
  onTimeExpired?: () => void;
  onExpire?: () => void;
  isPaused?: boolean;
  onSecondsChange?: (secondsLeft: number) => void;
  style?: ViewStyle;
}

export const DEFAULT_SESSION_DURATION_SECONDS = 90;

export const SessionCountdownTimer: React.FC<SessionCountdownTimerProps> = React.memo(
  ({
    initialSeconds = DEFAULT_SESSION_DURATION_SECONDS,
    onTimeExpired,
    onExpire,
    isPaused = false,
    onSecondsChange,
    style,
  }) => {
    const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
    const hasExpiredRef = useRef<boolean>(false);
    const expireHandler = onTimeExpired || onExpire || (() => {});
    const onTimeExpiredRef = useRef(expireHandler);
    onTimeExpiredRef.current = expireHandler;
    const onSecondsChangeRef = useRef(onSecondsChange);
    onSecondsChangeRef.current = onSecondsChange;

    useEffect(() => {
      if (isPaused || hasExpiredRef.current) return;

      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!hasExpiredRef.current) {
              hasExpiredRef.current = true;
              onTimeExpiredRef.current();
            }
            onSecondsChangeRef.current?.(0);
            return 0;
          }
          const next = prev - 1;
          onSecondsChangeRef.current?.(next);
          return next;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [isPaused]);

    // Format mm:ss
    const minutes = Math.floor(secondsLeft / 60);
    const remainderSeconds = secondsLeft % 60;
    const formattedTime = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;

    const isLowTime = secondsLeft <= 15;

    return (
      <View
        style={[
          styles.container,
          isLowTime ? styles.containerLow : styles.containerNormal,
          style,
        ]}
        accessibilityLabel={`Time remaining: ${secondsLeft} seconds`}
        accessibilityRole="timer"
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.icon}>⏱️</Text>
        <Text style={[styles.timerText, isLowTime && styles.timerTextLow]}>
          {formattedTime}
        </Text>
      </View>
    );
  }
);

SessionCountdownTimer.displayName = 'SessionCountdownTimer';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  containerNormal: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  containerLow: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  icon: {
    fontSize: 14,
    marginRight: 5,
  },
  timerText: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
    color: '#334155',
  },
  timerTextLow: {
    color: '#D97706',
  },
});
