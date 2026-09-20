/**
 * Purpose: Primary 5-round interactive gameplay screen for Aptitude & Logical Thinking Games.
 *          Renders adaptive stimulus displays, tactile multiple-choice options,
 *          spring feedback, celebration overlays, audio praise, and centralized XP recording.
 * Module: Aptitude Challenge — Screens
 * Folder: frontend/src/screens/games/AptitudeChallenge
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
import { StimulusDisplay } from './components/StimulusDisplay';
import { AptitudeOptionCard } from './components/AptitudeOptionCard';

import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useAptitudeGameStore } from './store/useAptitudeGameStore';
import { generateAptitudeSession, TOTAL_APTITUDE_ROUNDS } from './logic/questionGenerator';
import {
  AptitudeChallengeStackParamList,
  AptitudeGameType,
  AptitudeOption,
  AptitudeRound,
} from './types';
import { xpService } from '../../../services/xpService';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;
type RouteProps = RouteProp<AptitudeChallengeStackParamList, 'AptitudeChallengeGame'>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 6;

  const gameType: AptitudeGameType = route.params?.gameType || 'pattern_match';

  // Store state
  const roundIndex = useAptitudeGameStore((s) => s.roundIndex);
  const rounds = useAptitudeGameStore((s) => s.rounds);
  const score = useAptitudeGameStore((s) => s.score);
  const itemsCorrect = useAptitudeGameStore((s) => s.itemsCorrect);
  const sessionStartTime = useAptitudeGameStore((s) => s.sessionStartTime);
  const startSession = useAptitudeGameStore((s) => s.startSession);
  const recordAttempt = useAptitudeGameStore((s) => s.recordAttempt);
  const nextRound = useAptitudeGameStore((s) => s.nextRound);
  const resetSession = useAptitudeGameStore((s) => s.resetSession);

  // Local state
  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong' | 'disabled'>
  >({});
  const [attemptCount, setAttemptCount] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [lastWrongOption, setLastWrongOption] = useState<string>('');
  const [correctOptionLabel, setCorrectOptionLabel] = useState<string>('');
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [sessionId] = useState(() => `aptitude_${gameType}_${Date.now()}`);

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize session rounds
  useEffect(() => {
    const newRounds = generateAptitudeSession(gameType);
    startSession(gameType, newRounds);

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    });

    return () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      unsubscribe();
    };
  }, [gameType, startSession, navigation]);

  const currentRound: AptitudeRound | undefined = rounds[roundIndex];

  // Reset round state on round change
  useEffect(() => {
    if (!currentRound) return;

    setOptionStatuses({});
    setAttemptCount(1);
    setIsRoundLocked(false);
    setFeedbackMessage(null);
    setExplanationText(null);

    // Speak the question prompt
    const prompt = t(
      currentRound.question.promptKey,
      currentRound.question.promptFallback
    );
    speakPhrase(prompt, { language: motherTongue });
  }, [currentRound, roundIndex, motherTongue, t]);

  const finishSession = useCallback(
    async (finalCorrectCount: number, isTimeExpired = false) => {
      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartTime) / 1000)
      );
      const accuracy = Math.round((finalCorrectCount / TOTAL_APTITUDE_ROUNDS) * 100);

      let starsEarned = 1;
      let xpEarned = 25;

      try {
        const res = await xpService.recordSessionCompletionXP({
          sessionId,
          gameId: gameType,
          age: selectedAge,
          motherTongue,
          learningLanguage,
          totalQuestions: TOTAL_APTITUDE_ROUNDS,
          correctAnswers: finalCorrectCount,
          accuracy,
          durationSeconds,
        });
        starsEarned = res.starsEarned;
        xpEarned = res.totalSessionXp;
      } catch {
        starsEarned = finalCorrectCount >= 8 ? 3 : finalCorrectCount >= 5 ? 2 : 1;
        xpEarned = starsEarned * 15;
      }

      navigation.navigate('Games', {
        screen: 'AptitudeChallengeSessionComplete' as any,
        params: {
          gameType,
          starsEarned,
          xpEarned,
          itemsCorrect: finalCorrectCount,
          sessionLength: TOTAL_APTITUDE_ROUNDS,
          accuracy,
          isTimeExpired,
        },
      });
    },
    [
      sessionId,
      gameType,
      selectedAge,
      motherTongue,
      learningLanguage,
      sessionStartTime,
      navigation,
    ]
  );

  const handleTimeExpired = useCallback(() => {
    finishSession(itemsCorrect, true);
  }, [finishSession, itemsCorrect]);

  // Handle option selection
  const handleSelectOption = useCallback(
    async (option: AptitudeOption) => {
      if (isRoundLocked || !currentRound) return;

      const isCorrect = option.isCorrect;
      const correctOpt = currentRound.question.options.find((o) => o.isCorrect);
      const correctLabel = correctOpt
        ? (correctOpt.visual ? `${correctOpt.visual} ${correctOpt.label}` : correctOpt.label)
        : '';
      const selectedLabel = option.visual ? `${option.visual} ${option.label}` : option.label;

      if (isCorrect) {
        // Correct answer!
        setIsRoundLocked(true);
        triggerHapticSuccess();

        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'correct',
        }));

        setFeedbackMessage(
          t('aptitudeChallenge.greatJob', "Great job! That's correct! 🎉")
        );

        if (currentRound.question.explanationKey) {
          setExplanationText(
            t(
              currentRound.question.explanationKey,
              currentRound.question.explanationFallback || ''
            )
          );
        }

        setShowCelebration(true);
        speakPraise(learningLanguage);

        recordAttempt({
          roundNumber: roundIndex + 1,
          questionId: currentRound.question.id,
          selectedOptionId: option.id,
          isCorrect: true,
          attemptCount,
        });

        // Record Answer XP (15 XP on attempt 1, 10 XP on attempt 2)
        try {
          await xpService.recordAnswerXP({
            sessionId,
            roundIndex,
            attemptNum: attemptCount,
            isCorrect: true,
            gameId: gameType,
          });
        } catch {
          // Graceful fallback
        }

        const newCorrectCount = itemsCorrect + 1;

        // Transition to next round or completion
        transitionTimeoutRef.current = setTimeout(() => {
          setShowCelebration(false);

          if (roundIndex + 1 >= TOTAL_APTITUDE_ROUNDS) {
            finishSession(newCorrectCount);
          } else {
            nextRound();
          }
        }, 1500);
      } else {
        // Wrong answer
        triggerHapticWarning();

        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'wrong',
        }));

        if (attemptCount === 1) {
          // Attempt 1: Educational correction popup + reveal correct answer + allow 2nd attempt
          setLastWrongOption(selectedLabel);
          setCorrectOptionLabel(correctLabel);
          setShowCorrectionModal(true);
          setAttemptCount(2);

          recordAttempt({
            roundNumber: roundIndex + 1,
            questionId: currentRound.question.id,
            selectedOptionId: option.id,
            isCorrect: false,
            attemptCount: 1,
          });

          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: 1,
              isCorrect: false,
              gameId: gameType,
            });
          } catch {
            // Graceful fallback
          }
        } else {
          // Attempt 2: Mark wrong (0 XP) and advance
          setIsRoundLocked(true);
          setFeedbackMessage(
            t('aptitudeChallenge.tryAgain', 'Good try! Let’s try the next one 🌱')
          );

          recordAttempt({
            roundNumber: roundIndex + 1,
            questionId: currentRound.question.id,
            selectedOptionId: option.id,
            isCorrect: false,
            attemptCount: 2,
          });

          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: 2,
              isCorrect: false,
              gameId: gameType,
            });
          } catch {
            // Graceful fallback
          }

          transitionTimeoutRef.current = setTimeout(() => {
            if (roundIndex + 1 >= TOTAL_APTITUDE_ROUNDS) {
              finishSession(itemsCorrect);
            } else {
              nextRound();
            }
          }, 1500);
        }
      }
    },
    [
      isRoundLocked,
      currentRound,
      roundIndex,
      attemptCount,
      recordAttempt,
      t,
      learningLanguage,
      sessionId,
      gameType,
      itemsCorrect,
      nextRound,
      finishSession,
    ]
  );

  const handleSpeakQuestion = () => {
    if (!currentRound) return;
    const prompt = t(
      currentRound.question.promptKey,
      currentRound.question.promptFallback
    );
    speakPhrase(prompt, { language: motherTongue });
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    stopSpeech();
    if (roundIndex > 0 || itemsCorrect > 0) {
      finishSession(itemsCorrect, false);
    } else {
      resetSession();
      navigation.goBack();
    }
  };

  if (!currentRound) {
    return (
      <SafeAreaView style={styles.container}>
        <CartoonBackground theme="puzzle" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t('common.loading', 'Loading questions...')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const promptText = t(
    currentRound.question.promptKey,
    currentRound.question.promptFallback
  );
  const isTwoOptions = currentRound.question.options.length === 2;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0FDF4" />
      <CartoonBackground theme="puzzle" />

      {/* Cloud & Sun Clearance: ensures sky, clouds, sun and mobile notification panel are 100% free */}
      <CloudClearanceSpacer />

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerBtnWrapper}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel="Quit game session"
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </BigTouchTarget>
        </View>

        {/* Continuous Session Timer */}
        <SessionCountdownTimer
          initialSeconds={90}
          isPaused={
            isRoundLocked ||
            showCelebration ||
            showExitModal ||
            showCorrectionModal
          }
          onExpire={handleTimeExpired}
        />

        {/* Progress Star Trail */}
        <View style={styles.progressContainer}>
          <ProgressStarTrail
            total={TOTAL_APTITUDE_ROUNDS}
            current={roundIndex}
          />
        </View>

        {/* Score / XP Pill */}
        <View style={styles.scorePill}>
          <Text style={styles.scorePillText}>⭐ {score}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          screenWidth > 600 && styles.wideContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Round Counter */}
        <Text style={styles.roundCounterText}>
          {t('aptitudeChallenge.roundCounter', {
            defaultValue: 'Question {{current}} of {{total}}',
            current: roundIndex + 1,
            total: TOTAL_APTITUDE_ROUNDS,
          })}
        </Text>

        {/* Stimulus Display */}
        <StimulusDisplay
          question={currentRound.question}
          gameType={gameType}
          promptText={promptText}
          onHear={handleSpeakQuestion}
        />

        {/* Feedback Message */}
        {feedbackMessage && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            {explanationText && (
              <Text style={styles.explanationText}>{explanationText}</Text>
            )}
          </View>
        )}

        {/* Multiple-Choice Options Grid */}
        <View style={styles.optionsContainer}>
          {currentRound.question.options.map((opt) => (
            <AptitudeOptionCard
              key={opt.id}
              option={opt}
              status={optionStatuses[opt.id] || 'idle'}
              onPress={() => handleSelectOption(opt)}
              disabled={isRoundLocked}
              isTwoOptions={isTwoOptions}
            />
          ))}
        </View>
      </ScrollView>

      {/* Celebration Confetti */}
      <CelebrationOverlay
        visible={showCelebration}
        titleText={t('aptitudeChallenge.greatJob', 'Awesome! 🎉')}
        subtitleText={t('aptitudeChallenge.nextRoundSoon', 'Keep going!')}
      />

      {/* Quit Game Confirmation Modal */}
      <FriendlyModal
        visible={showExitModal}
        title={t('common.leaveGame', 'Leave Game?')}
        onDismiss={() => setShowExitModal(false)}
      >
        <View style={styles.exitModalContent}>
          <Text style={styles.exitModalText}>
            {t(
              'common.leaveGameConfirm',
              'Are you sure you want to leave? Your progress in this session will not be saved.'
            )}
          </Text>
          <View style={styles.exitModalButtons}>
            <BigTouchTarget
              onPress={() => setShowExitModal(false)}
              accessibilityLabel="Stay in game"
              accessibilityRole="button"
              style={styles.stayButton}
            >
              <Text style={styles.stayButtonText}>
                {t('common.keepPlaying', 'Keep Playing')}
              </Text>
            </BigTouchTarget>
            <BigTouchTarget
              onPress={handleConfirmExit}
              accessibilityLabel="Confirm leave game"
              accessibilityRole="button"
              style={styles.leaveButton}
            >
              <Text style={styles.leaveButtonText}>
                {t('common.leave', 'Leave')}
              </Text>
            </BigTouchTarget>
          </View>
        </View>
      </FriendlyModal>
      {/* Educational Correction Modal for Attempt 1 */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetWord={correctOptionLabel}
        spokenWord={lastWrongOption}
        promptFallback={
          currentRound?.question.explanationFallback ||
          t('aptitudeChallenge.lookCarefully', 'Look carefully at the pattern!')
        }
        onRetry={() => setShowCorrectionModal(false)}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  headerBtnWrapper: {
    width: 44,
    height: 44,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748B',
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  scorePillText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B45309',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    alignItems: 'center',
  },
  wideContent: {
    maxWidth: 580,
    alignSelf: 'center',
    width: '100%',
  },
  roundCounterText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  explanationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
    marginTop: 4,
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
  },
  exitModalContent: {
    paddingVertical: 8,
  },
  exitModalText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  exitModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  stayButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#10B981',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stayButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  leaveButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  leaveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
});
