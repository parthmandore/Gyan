/**
 * Purpose: Interactive gameplay screen for Missing Numbers (Age 5).
 *          Shows an animated counting sequence train with 1 missing slot,
 *          evaluates child tap selection, provides audio and tactile feedback,
 *          records real-time XP, and auto-transitions after 5 rounds.
 * Module: Missing Numbers — Game Screen
 * Folder: frontend/src/screens/games/MissingNumbers
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { SessionCountdownTimer } from '../../../components/SessionCountdownTimer';
import { EducationalCorrectionModal } from '../../../components/EducationalCorrectionModal';
import { NumberSequenceDisplay } from './components/NumberSequenceDisplay';
import { NumberOptionCard } from './components/NumberOptionCard';
import { useMissingNumbersStore } from './store/useMissingNumbersStore';
import {
  generateMissingNumbersSession,
  TOTAL_MISSING_NUMBERS_ROUNDS,
} from './logic/numberSequenceGenerator';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import {
  triggerHapticSuccess,
  triggerHapticWarning,
} from '../../../services/hapticsService';
import { xpService } from '../../../services/xpService';
import { MissingNumbersOption, MissingNumbersRound } from './types';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

  const {
    sessionId,
    rounds,
    roundIndex,
    itemsCorrect,
    score,
    roundResults,
    sessionStartTime,
    startSession,
    recordAttempt,
    nextRound,
    resetGame,
  } = useMissingNumbersStore();

  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong'>
  >({});
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [attemptNum, setAttemptNum] = useState<1 | 2>(1);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [wrongSelectedNumber, setWrongSelectedNumber] = useState<number | null>(null);
  const isSessionFinishedRef = useRef(false);

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize session rounds
  useEffect(() => {
    const newRounds = generateMissingNumbersSession();
    startSession(newRounds);

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    });

    return () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      unsubscribe();
    };
  }, [startSession, navigation]);

  const currentRound: MissingNumbersRound | undefined = rounds[roundIndex];

  // Reset round state on round change
  useEffect(() => {
    setOptionStatuses({});
    setRevealedNumber(null);
    setIsRoundLocked(false);
    setFeedbackMessage(null);
    setAttemptNum(1);
    setShowCorrectionModal(false);
    setWrongSelectedNumber(null);
  }, [roundIndex]);

  // Audio prompt to hear sequence in child's mother tongue / language
  const handleHearSequence = useCallback(() => {
    if (!currentRound) return;
    const phrase =
      currentRound.question.spokenPhrases[motherTongue] ||
      currentRound.question.spokenPhrases.en;
    speakPhrase(phrase, { language: motherTongue });
  }, [currentRound, motherTongue]);

  const finishSession = useCallback(
    async (finalCorrectCount: number, isTimeExpired = false) => {
      if (isSessionFinishedRef.current) return;
      isSessionFinishedRef.current = true;
      setIsRoundLocked(true);
      stopSpeech();

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartTime) / 1000)
      );
      const accuracy = Math.round(
        (finalCorrectCount / TOTAL_MISSING_NUMBERS_ROUNDS) * 100
      );

      const xpResult = await xpService.recordSessionCompletionXP({
        sessionId,
        gameId: 'missing_numbers',
        age: selectedAge,
        motherTongue,
        learningLanguage,
        totalQuestions: TOTAL_MISSING_NUMBERS_ROUNDS,
        correctAnswers: finalCorrectCount,
        accuracy,
        durationSeconds,
      });

      navigation.navigate('Games', {
        screen: 'MissingNumbersSessionComplete' as any,
        params: {
          starsEarned: xpResult.starsEarned,
          xpEarned: xpResult.totalSessionXp,
          itemsCorrect: finalCorrectCount,
          sessionLength: TOTAL_MISSING_NUMBERS_ROUNDS,
          accuracy,
          isTimeExpired,
        },
      });
    },
    [sessionId, selectedAge, motherTongue, learningLanguage, sessionStartTime, navigation]
  );

  const handleTimeExpired = useCallback(() => {
    finishSession(itemsCorrect, true);
  }, [finishSession, itemsCorrect]);

  // Handle option selection
  const handleOptionPress = useCallback(
    async (option: MissingNumbersOption) => {
      if (isRoundLocked || !currentRound) return;

      setIsRoundLocked(true);

      if (option.isCorrect) {
        // --- CORRECT SELECTION ---
        triggerHapticSuccess();
        setShowCelebration(true);
        setRevealedNumber(option.value);
        setFeedbackMessage(
          t('missingNumbers.greatJob', "Great job! That's the right number! 🎉")
        );

        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'correct',
        }));

        recordAttempt({
          roundNumber: currentRound.roundNumber,
          questionId: currentRound.question.id,
          selectedValue: option.value,
          correctValue: currentRound.question.correctNumber,
          isCorrect: true,
          attemptCount: attemptNum,
          timestamp: Date.now(),
        });

        // Award answer XP (15 XP for attempt 1, 10 XP for retry)
        await xpService.recordAnswerXP({
          sessionId,
          roundIndex,
          attemptNum,
          isCorrect: true,
          gameId: 'missing_numbers',
          metadata: {
            number: option.value,
          },
        });

        speakPraise(motherTongue);

        const newCorrectCount = itemsCorrect + 1;

        transitionTimeoutRef.current = setTimeout(async () => {
          setShowCelebration(false);

          if (roundIndex + 1 < rounds.length) {
            nextRound();
          } else {
            finishSession(newCorrectCount);
          }
        }, 1400);
      } else {
        // --- WRONG SELECTION ---
        triggerHapticWarning();
        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'wrong',
        }));

        if (attemptNum === 1) {
          // Attempt 1: Educational correction popup + reveal correct answer + give 2nd attempt
          setWrongSelectedNumber(option.value);
          setShowCorrectionModal(true);
          setAttemptNum(2);
        } else {
          // Attempt 2: Mark wrong (0 XP) and advance
          setFeedbackMessage(
            t('missingNumbers.tryAgain', "Good try! Let's see the next one! 🌱")
          );

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            questionId: currentRound.question.id,
            selectedValue: option.value,
            correctValue: currentRound.question.correctNumber,
            isCorrect: false,
            attemptCount: 2,
            timestamp: Date.now(),
          });

          await xpService.recordAnswerXP({
            sessionId,
            roundIndex,
            attemptNum: 2,
            isCorrect: false,
            gameId: 'missing_numbers',
            metadata: {
              number: option.value,
            },
          });

          transitionTimeoutRef.current = setTimeout(async () => {
            if (roundIndex + 1 < rounds.length) {
              nextRound();
            } else {
              finishSession(itemsCorrect);
            }
          }, 1400);
        }
      }
    },
    [
      isRoundLocked,
      currentRound,
      attemptNum,
      sessionId,
      roundIndex,
      motherTongue,
      itemsCorrect,
      rounds.length,
      nextRound,
      recordAttempt,
      t,
      finishSession,
    ]
  );

  const handleQuitGame = () => {
    stopSpeech();
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    setShowExitModal(false);
    if (roundResults.length > 0 || roundIndex > 0 || itemsCorrect > 0) {
      finishSession(itemsCorrect, false);
    } else {
      resetGame();
      navigation.goBack();
    }
  };

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="math" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Missing Numbers...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const containerWidth = Math.min(screenWidth - 28, 440);
  const optionCardWidth = Math.min(Math.floor((containerWidth - 40) / 2), 120);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="math" />
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={[styles.headerBar, { width: containerWidth }]}>
          <TouchableOpacity
            onPress={() => setShowExitModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Exit game"
            style={styles.exitButton}
            activeOpacity={0.7}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </TouchableOpacity>

          {/* Session Timer */}
          <SessionCountdownTimer
            initialSeconds={90}
            onTimeExpired={handleTimeExpired}
            isPaused={showCorrectionModal || showCelebration || showExitModal}
          />

          {/* Star Trail Progress */}
          <View style={styles.progressContainer}>
            <ProgressStarTrail
              current={roundIndex + 1}
              total={TOTAL_MISSING_NUMBERS_ROUNDS}
              roundResults={roundResults}
            />
          </View>

          {/* Live XP / Score Badge */}
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>⭐ {score}</Text>
          </View>
        </View>

        {/* Main Game Stage */}
        <View style={[styles.stageContainer, { width: containerWidth }]}>
          {/* Prompt Label */}
          <Text style={styles.promptText}>
            {t('missingNumbers.whichNumberIsMissing', 'Which number is missing?')}
          </Text>

          {/* Number Sequence Track Display */}
          <NumberSequenceDisplay
            sequence={currentRound.question.sequence}
            missingIndex={currentRound.question.missingIndex}
            revealedNumber={revealedNumber}
            onHearSequence={handleHearSequence}
            isCorrectRevealed={revealedNumber !== null}
          />

          {/* Feedback Message Bar */}
          {feedbackMessage ? (
            <View
              style={[
                styles.feedbackBar,
                revealedNumber !== null
                  ? styles.feedbackBarCorrect
                  : styles.feedbackBarWrong,
              ]}
            >
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          ) : (
            <View style={styles.feedbackPlaceholder} />
          )}

          {/* Options Grid (4 Tactile Option Cards) */}
          <View style={styles.optionsGrid}>
            {currentRound.question.options.map((option) => (
              <NumberOptionCard
                key={option.id}
                option={option}
                status={optionStatuses[option.id] || 'idle'}
                disabled={isRoundLocked}
                onPress={handleOptionPress}
                width={optionCardWidth}
                height={Math.round(optionCardWidth * 0.92)}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>

      {/* Confetti Celebration Overlay */}
      {showCelebration && <CelebrationOverlay visible={showCelebration} />}

      {/* Quit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: containerWidth }]}>
            <Text style={styles.modalTitle}>Leave Game?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to exit? Your progress in this session will not be saved.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.keepPlayingBtn}
                onPress={() => setShowExitModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.keepPlayingBtnText}>Keep Playing 🚀</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quitGameBtn}
                onPress={handleQuitGame}
                activeOpacity={0.8}
              >
                <Text style={styles.quitGameBtnText}>Quit Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Educational Correction Modal (Attempt 1 Wrong) */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetValue={String(currentRound.question.correctNumber)}
        selectedWrongValue={wrongSelectedNumber !== null ? String(wrongSelectedNumber) : undefined}
        onDismiss={() => {
          setShowCorrectionModal(false);
          setIsRoundLocked(false);
        }}
      />
    </View>
  );
});

GameScreen.displayName = 'MissingNumbersGameScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exitButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#475569',
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  xpBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  xpBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
  },
  stageContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
    marginBottom: 4,
  },
  feedbackPlaceholder: {
    height: 38,
  },
  feedbackBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackBarCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  feedbackBarWrong: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#BAE6FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  keepPlayingBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepPlayingBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quitGameBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  quitGameBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
});
