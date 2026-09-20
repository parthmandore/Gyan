/**
 * Purpose: Primary 5-round interactive gameplay screen for Educational Mathematics Games.
 *          Renders large equation card, 4 chunky tactile multiple-choice number cards,
 *          spring feedback, celebration overlay, audio praise, and centralized XP recording.
 * Module: Math Challenge — Screens
 * Folder: frontend/src/screens/games/MathChallenge
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { SessionCountdownTimer } from '../../../components/SessionCountdownTimer';
import { EducationalCorrectionModal } from '../../../components/EducationalCorrectionModal';
import { EquationCard } from './components/EquationCard';
import { NumberOptionCard } from './components/NumberOptionCard';

import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useMathChallengeStore } from './store/useMathChallengeStore';
import { generateMathSession, TOTAL_MATH_ROUNDS } from './logic/questionGenerator';
import { MathChallengeStackParamList, MathOperation, MathOption, MathRound } from './types';
import { xpService } from '../../../services/xpService';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;
type RouteProps = RouteProp<MathChallengeStackParamList, 'MathChallengeGame'>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 6;

  const operation: MathOperation = route.params?.operation || 'addition';

  // Store state
  const roundIndex = useMathChallengeStore((s) => s.roundIndex);
  const rounds = useMathChallengeStore((s) => s.rounds);
  const score = useMathChallengeStore((s) => s.score);
  const itemsCorrect = useMathChallengeStore((s) => s.itemsCorrect);
  const sessionStartTime = useMathChallengeStore((s) => s.sessionStartTime);
  const startSession = useMathChallengeStore((s) => s.startSession);
  const recordAttempt = useMathChallengeStore((s) => s.recordAttempt);
  const nextRound = useMathChallengeStore((s) => s.nextRound);
  const resetSession = useMathChallengeStore((s) => s.resetSession);

  // Local state
  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong' | 'disabled'>
  >({});
  const [attemptCount, setAttemptCount] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [sessionId] = useState(() => `math_${operation}_${Date.now()}`);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [wrongSelectedValue, setWrongSelectedValue] = useState<number | null>(null);
  const isSessionFinishedRef = useRef(false);

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize session rounds
  useEffect(() => {
    const newRounds = generateMathSession(operation);
    startSession(operation, newRounds);

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    });

    return () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      unsubscribe();
    };
  }, [operation, startSession, navigation]);

  const currentRound: MathRound | undefined = rounds[roundIndex];

  // Reset round state on round change
  useEffect(() => {
    setOptionStatuses({});
    setAttemptCount(1);
    setIsRoundLocked(false);
    setFeedbackMessage(null);
    setShowCorrectionModal(false);
    setWrongSelectedValue(null);
  }, [roundIndex]);

  const handleHearEquation = () => {
    if (!currentRound) return;
    const q = currentRound.question;
    const spoken = `${q.operand1} ${q.symbol} ${q.operand2}`;
    speakPhrase(spoken, { language: learningLanguage });
  };

  const finishSession = useCallback(
    async (finalCorrectCount: number, isTimeExpired = false) => {
      if (isSessionFinishedRef.current) return;
      isSessionFinishedRef.current = true;
      setIsRoundLocked(true);
      stopSpeech();

      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const accuracy = Math.round((finalCorrectCount / TOTAL_MATH_ROUNDS) * 100);

      const xpResult = await xpService.recordSessionCompletionXP({
        sessionId,
        gameId: operation,
        age: selectedAge,
        motherTongue,
        learningLanguage,
        totalQuestions: TOTAL_MATH_ROUNDS,
        correctAnswers: finalCorrectCount,
        accuracy,
        durationSeconds,
      });

      navigation.navigate('Games', {
        screen: 'MathChallengeSessionComplete' as any,
        params: {
          operation,
          starsEarned: xpResult.starsEarned,
          xpEarned: xpResult.totalSessionXp,
          itemsCorrect: finalCorrectCount,
          sessionLength: TOTAL_MATH_ROUNDS,
          accuracy,
          isTimeExpired,
        },
      });
    },
    [sessionId, operation, selectedAge, motherTongue, learningLanguage, sessionStartTime, navigation]
  );

  const handleTimeExpired = useCallback(() => {
    finishSession(itemsCorrect, true);
  }, [finishSession, itemsCorrect]);

  const handleOptionPress = useCallback(
    async (option: MathOption) => {
      if (isRoundLocked || !currentRound) return;

      if (option.isCorrect) {
        setIsRoundLocked(true);
        triggerHapticSuccess();
        setShowCelebration(true);
        setFeedbackMessage(t('mathChallenge.greatJob', "Great job! That's correct! 🎉"));

        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'correct',
        }));

        recordAttempt({
          roundNumber: currentRound.roundNumber,
          questionId: currentRound.question.id,
          selectedValue: option.value,
          correctValue: currentRound.question.correctAnswer,
          isCorrect: true,
          attemptCount,
        });

        // Award XP via centralized xpService (15 XP for try 1, 10 XP for retry)
        await xpService.recordAnswerXP({
          sessionId,
          roundIndex,
          attemptNum: attemptCount,
          isCorrect: true,
          gameId: operation,
        });

        speakPraise(learningLanguage);

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
        triggerHapticWarning();
        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'wrong',
        }));

        if (attemptCount === 1) {
          // Attempt 1: Educational correction popup + reveal correct answer + give 2nd attempt
          setWrongSelectedValue(option.value);
          setShowCorrectionModal(true);
          setAttemptCount(2);
        } else {
          // Attempt 2: Mark wrong (0 XP) and advance
          recordAttempt({
            roundNumber: currentRound.roundNumber,
            questionId: currentRound.question.id,
            selectedValue: option.value,
            correctValue: currentRound.question.correctAnswer,
            isCorrect: false,
            attemptCount: 2,
          });

          await xpService.recordAnswerXP({
            sessionId,
            roundIndex,
            attemptNum: 2,
            isCorrect: false,
            gameId: operation,
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
      attemptCount,
      recordAttempt,
      sessionId,
      roundIndex,
      operation,
      learningLanguage,
      itemsCorrect,
      rounds.length,
      nextRound,
      t,
      finishSession,
    ]
  );

  const handleExitConfirm = () => {
    setShowExitModal(false);
    if (roundIndex > 0 || itemsCorrect > 0) {
      finishSession(itemsCorrect, false);
    } else {
      resetSession();
      navigation.goBack();
    }
  };

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="math" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Math Challenge...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const containerWidth = Math.min(screenWidth - 32, 440);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="math" />
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
      <SafeAreaView style={styles.safeArea}>
        <CloudClearanceSpacer />
        {/* Header Bar */}
        <View style={[styles.headerBar, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel="Exit game"
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </BigTouchTarget>

          {/* Session Timer */}
          <SessionCountdownTimer
            initialSeconds={90}
            onTimeExpired={handleTimeExpired}
            isPaused={showCorrectionModal || showCelebration || showExitModal}
          />

          <View style={styles.progressWrapper}>
            <ProgressStarTrail
              current={roundIndex}
              total={TOTAL_MATH_ROUNDS}
            />
          </View>

          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>⭐ {score} XP</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Prompt Subtitle */}
          <Text style={styles.promptTitle}>
            {t('mathChallenge.whatIsTheAnswer', 'What is the answer?')}
          </Text>

          {/* Equation Display Card */}
          <View style={{ width: containerWidth }}>
            <EquationCard
              equation={currentRound.question.equation}
              operation={operation}
              onHear={handleHearEquation}
            />
          </View>

          {/* Feedback Toast */}
          {feedbackMessage && (
            <View style={[styles.feedbackBanner, { width: containerWidth }]}>
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          )}

          {/* 4 Chunky Multiple Choice Options (2x2 Grid) */}
          <View style={[styles.optionsGrid, { width: containerWidth }]}>
            {currentRound.question.options.map((option) => (
              <NumberOptionCard
                key={option.id}
                option={option}
                status={optionStatuses[option.id] || 'idle'}
                onPress={() => handleOptionPress(option)}
                disabled={isRoundLocked}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Exit Confirmation Modal */}
      <FriendlyModal
        visible={showExitModal}
        title="Quit Game?"
        onDismiss={() => setShowExitModal(false)}
      >
        <Text style={styles.exitModalText}>
          Are you sure you want to exit? Your progress in this session will not be saved.
        </Text>
        <View style={styles.exitModalActions}>
          <BigTouchTarget
            onPress={() => setShowExitModal(false)}
            accessibilityLabel="Keep Playing"
            style={styles.keepPlayingBtn}
          >
            <Text style={styles.keepPlayingBtnText}>Keep Playing</Text>
          </BigTouchTarget>
          <BigTouchTarget
            onPress={handleExitConfirm}
            accessibilityLabel="Quit Game"
            style={styles.quitGameBtn}
          >
            <Text style={styles.quitGameBtnText}>Quit Game</Text>
          </BigTouchTarget>
        </View>
      </FriendlyModal>

      {/* Celebration Overlay on Success */}
      <CelebrationOverlay visible={showCelebration} />

      {/* Educational Correction Modal (Attempt 1 Wrong) */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetValue={String(currentRound.question.correctAnswer)}
        selectedWrongValue={wrongSelectedValue !== null ? String(wrongSelectedValue) : undefined}
        explanation={`${currentRound.question.operand1} ${currentRound.question.symbol} ${currentRound.question.operand2} = ${currentRound.question.correctAnswer}`}
        onDismiss={() => {
          setShowCorrectionModal(false);
          setIsRoundLocked(false);
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignSelf: 'center',
  },
  exitButton: {
    backgroundColor: '#FEE2E2',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  progressWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  scorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  scorePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 12,
    textAlign: 'center',
  },
  feedbackBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  exitModalText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  exitModalActions: {
    gap: 12,
    width: '100%',
  },
  keepPlayingBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
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
