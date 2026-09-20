/**
 * Purpose: Interactive Wrong-Answer Teaching Modal shared across matching games.
 *          Displays the correct pairing side by side with spoken cue
 *          and a large dismiss button. Accepts per-game labels via props.
 * Module: Shared — Components
 * Folder: frontend/src/screens/games/CapitalSmallMatch/components
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { BigTouchTarget } from '../../../../components/BigTouchTarget';
import { Colors } from '../../../../theme/colors';
import { Typography } from '../../../../theme/typography';
import { speakPhrase } from '../../../../services/speechService';

export interface WrongMatchModalProps {
  visible: boolean;
  capital: string;
  lowercase: string;
  onDismiss: () => void;
  /** i18n namespace prefix for this game's wrongMatch keys (e.g. 'capitalSmallMatch' or 'vowelMatraMatch') */
  i18nNamespace?: string;
}

export const WrongMatchModal: React.FC<WrongMatchModalProps> = React.memo(
  ({ visible, capital, lowercase, onDismiss, i18nNamespace }) => {
    const { t } = useTranslation();
    const scale = useSharedValue(0.85);
    const opacity = useSharedValue(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    // Determine i18n keys based on the calling game's namespace
    const ns = i18nNamespace || 'capitalSmallMatch';
    const badgeText = t(`${ns}.wrongMatchBadge`, 'Let\'s Learn Together!');
    const leftLabel = t(`${ns}.wrongMatchLeftLabel`, 'Capital');
    const rightLabel = t(`${ns}.wrongMatchRightLabel`, 'Small');
    const teachText = t(`${ns}.wrongMatchTeach`, { left: capital, right: lowercase, defaultValue: `${capital} and ${lowercase} match together!` });
    const gotItText = t(`${ns}.wrongMatchGotIt`, 'Got it! ▶');
    const speakText = t(`${ns}.wrongMatchSpeak`, { left: capital, right: lowercase, defaultValue: `This is ${capital} and ${lowercase}` });

    useEffect(() => {
      let isMounted = true;
      AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      });
      return () => {
        isMounted = false;
      };
    }, []);

    useEffect(() => {
      if (visible) {
        // Spoken teaching cue — using localized phrase
        speakPhrase(speakText);

        if (reduceMotion) {
          scale.value = 1;
          opacity.value = 1;
        } else {
          opacity.value = withTiming(1, { duration: 250 });
          scale.value = withSpring(1, { damping: 10, stiffness: 180 });
        }
      } else {
        opacity.value = 0;
        scale.value = 0.85;
      }
    }, [visible, capital, lowercase, reduceMotion, opacity, scale, speakText]);

    const cardAnimatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

    if (!visible) return null;

    return (
      <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
        <View
          style={styles.backdrop}
          // Fix Bug 4: proper ARIA attributes for modal dialog
          accessibilityViewIsModal={true}
          aria-modal={true}
          role="dialog"
        >
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            {/* Header Badge */}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeIcon}>💡</Text>
              <Text style={styles.badgeTitle}>{badgeText}</Text>
            </View>

            {/* Letter Pairing Display */}
            <View style={styles.pairingRow}>
              <View style={[styles.letterBox, styles.capitalBox]}>
                <Text style={styles.letterText}>{capital}</Text>
                <Text style={styles.subText}>{leftLabel}</Text>
              </View>

              <Text style={styles.matchArrow}>↔</Text>

              <View style={[styles.letterBox, styles.smallBox]}>
                <Text style={styles.letterText}>{lowercase}</Text>
                <Text style={styles.subText}>{rightLabel}</Text>
              </View>
            </View>

            {/* Teaching Phrase */}
            <Text style={styles.teachingText}>
              {teachText}
            </Text>

            {/* Big Touch Action Button */}
            <BigTouchTarget
              onPress={onDismiss}
              accessibilityLabel={gotItText}
              accessibilityRole="button"
              style={styles.dismissButton}
            >
              <Text style={styles.dismissButtonText}>{gotItText}</Text>
            </BigTouchTarget>
          </Animated.View>
        </View>
      </Modal>
    );
  }
);

WrongMatchModal.displayName = 'WrongMatchModal';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  badgeTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#92400E',
  },
  pairingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  letterBox: {
    width: 84,
    height: 84,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderBottomWidth: 7,
  },
  capitalBox: {
    backgroundColor: '#38BDF8',
    borderColor: '#FFFFFF',
    borderBottomColor: '#0284C7',
  },
  smallBox: {
    backgroundColor: '#F59E0B',
    borderColor: '#FFFFFF',
    borderBottomColor: '#D97706',
  },
  letterText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 36,
    color: '#FFFFFF',
  },
  subText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: -4,
  },
  matchArrow: {
    fontSize: 28,
    color: '#64748B',
    fontWeight: 'bold',
  },
  teachingText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 17,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
  },
  dismissButton: {
    width: '100%',
    height: 56,
    minHeight: 56,
    backgroundColor: '#059669',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dismissButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#FFFFFF',
  },
});
