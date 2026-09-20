/**
 * Purpose: Primary 10-round interactive gameplay screen for Guess the Shape.
 *          Features 90-second total session timer, visual recognition target,
 *          large option buttons, two-attempt educational correction loop,
 *          and celebration overlays.
 * Module: Guess the Shape — Screens
 * Folder: frontend/src/screens/games/GuessTheShape
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { SessionCountdownTimer } from '../../../components/SessionCountdownTimer';
import { EducationalCorrectionModal } from '../../../components/EducationalCorrectionModal';
import { ShapeVisualTarget } from './components/ShapeVisualTarget';
import { ShapeOptionButton } from './components/ShapeOptionButton';

import { useAppLanguageStore, AppLanguage } from '../../../state/appLanguageStore';
import { useGuessTheShapeStore } from './store/useGuessTheShapeStore';
import { generateGuessShapeQuestions, TOTAL_GUESS_SHAPE_ROUNDS } from './logic/questionGenerator';
import { ShapeOption, ShapeQuestion } from './types';
import { xpService } from '../../../services/xpService';
import { speakPhrase, stopSpeech, speakWord } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = (useAppLanguageStore((s) => s.motherTongue) || 'en') as AppLanguage;
  const learningLanguage = (useAppLanguageStore((s) => s.learningLanguage) || 'en') as AppLanguage;
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 6;

  // Store state
  const roundIndex = useGuessTheShapeStore((s) => s.roundIndex);
  const rounds = useGuessTheShapeStore((s) => s.rounds);
  const score = useGuessTheShapeStore((s) => s.score);
  const itemsCorrect = useGuessTheShapeStore((s) => s.itemsCorrect);
  const sessionStartTime = useGuessTheShapeStore((s) => s.sessionStartTime);
  const attempts = useGuessTheShapeStore((s) => s.attempts);
  const startSession = useGuessTheShapeStore((s) => s.startSession);
  const recordAttempt = useGuessTheShapeStore((s) => s.recordAttempt);
  const nextRound = useGuessTheShapeStore((s) => s.nextRound);
  const resetGame = useGuessTheShapeStore((s) => s.resetGame);

  // Local round state
  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong' | 'disabled'>
  >({});
  const [attemptCount, setAttemptCount] = useState<1 | 2>(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [lastWrongChoice, setLastWrongChoice] = useState<string>('');
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [sessionId] = useState(() => `gts_${Date.now()}`);

  const transitionTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Initialize session questions on mount
  useEffect(() => {
    isMountedRef.current = true;
    const generatedRounds = generateGuessShapeQuestions(selectedAge, learningLanguage);
    startSession(generatedRounds);

    return () => {
      isMountedRef.current = false;
      stopSpeech();
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [selectedAge, learningLanguage, startSession]);

  const currentRound: ShapeQuestion | undefined = rounds[roundIndex];

  // Speak prompt on new round
  useEffect(() => {
    if (!currentRound) return;

    setOptionStatuses({});
    setAttemptCount(1);
    setIsRoundLocked(false);

    const prompt = t(
      'guessTheShape.whatShapeIsThis',
      'What shape is this? Look and choose its name!'
    );
    speakPhrase(prompt, { language: motherTongue });
  }, [roundIndex, currentRound, motherTongue, t]);

  // Complete session handler
  const handleCompleteSession = useCallback(
    async (finalCorrectCount: number, isTimeExpired = false) => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      stopSpeech();

      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const totalRounds = rounds.length || TOTAL_GUESS_SHAPE_ROUNDS;
      const accuracy = Math.round((finalCorrectCount / totalRounds) * 100);

      let starsEarned = 1;
      let xpEarned = 50;

      try {
        const xpResult = await xpService.recordSessionCompletionXP({
          sessionId,
          gameId: 'guess_the_shape',
          age: selectedAge,
          motherTongue,
          learningLanguage,
          totalQuestions: totalRounds,
          correctAnswers: finalCorrectCount,
          accuracy,
          durationSeconds,
        });
        starsEarned = xpResult.starsEarned;
        xpEarned = xpResult.totalSessionXp;
      } catch {
        starsEarned = finalCorrectCount >= 8 ? 3 : finalCorrectCount >= 5 ? 2 : 1;
        xpEarned = starsEarned * 15;
      }

      navigation.navigate('Games', {
        screen: 'GuessTheShapeSessionComplete' as any,
        params: {
          starsEarned,
          xpEarned,
          itemsCorrect: finalCorrectCount,
          sessionLength: totalRounds,
          accuracy,
          isTimeExpired,
        },
      });
    },
    [
      sessionId,
      selectedAge,
      motherTongue,
      learningLanguage,
      rounds.length,
      sessionStartTime,
      navigation,
    ]
  );

  // 90s Countdown Timer expiration
  const handleTimeExpired = useCallback(() => {
    handleCompleteSession(itemsCorrect, true);
  }, [handleCompleteSession, itemsCorrect]);

  // Handle option selection
  const handleOptionPress = useCallback(
    async (option: ShapeOption) => {
      if (isRoundLocked || !currentRound) return;

      const targetWord = currentRound.correctAnswer;
      const chosenWord = option.name;

      if (option.isCorrect) {
        // Correct answer
        setIsRoundLocked(true);
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'correct' }));
        triggerHapticSuccess();
        setShowCelebration(true);

        // Record attempt
        recordAttempt({
          roundNumber: currentRound.roundNumber,
          targetShapeId: currentRound.targetShape.id,
          expectedWord: targetWord,
          chosenWord,
          selectedOptionId: option.id,
          isCorrect: true,
          attemptCount,
          timestamp: Date.now(),
        });

        // XP award
        try {
          await xpService.recordAnswerXP({
            sessionId,
            roundIndex,
            attemptNum: attemptCount,
            isCorrect: true,
            gameId: 'guess_the_shape',
          });
        } catch {}

        // Pronounce correct shape name + praise
        speakWord(targetWord, learningLanguage);
        setTimeout(() => {
          speakPraise(motherTongue);
        }, 600);

        // Advance
        transitionTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setShowCelebration(false);
          const newCorrectCount = itemsCorrect + 1;

          if (roundIndex + 1 < rounds.length) {
            nextRound();
          } else {
            handleCompleteSession(newCorrectCount);
          }
        }, 1400);
      } else {
        // Wrong answer
        triggerHapticWarning();
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'wrong' }));

        if (attemptCount === 1) {
          // Attempt 1: Educational feedback modal + give 2nd attempt
          setLastWrongChoice(chosenWord);
          setShowCorrectionModal(true);
          setAttemptCount(2);

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            targetShapeId: currentRound.targetShape.id,
            expectedWord: targetWord,
            chosenWord,
            selectedOptionId: option.id,
            isCorrect: false,
            attemptCount: 1,
            timestamp: Date.now(),
          });

          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: 1,
              isCorrect: false,
              gameId: 'guess_the_shape',
            });
          } catch {}
        } else {
          // Attempt 2: Final wrong (0 XP) -> reveal correct & advance
          setIsRoundLocked(true);
          setOptionStatuses((prev) => ({
            ...prev,
            [option.id]: 'wrong',
            [currentRound.targetShape.id]: 'correct',
          }));

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            targetShapeId: currentRound.targetShape.id,
            expectedWord: targetWord,
            chosenWord,
            selectedOptionId: option.id,
            isCorrect: false,
            attemptCount: 2,
            timestamp: Date.now(),
          });

          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: 2,
              isCorrect: false,
              gameId: 'guess_the_shape',
            });
          } catch {}

          transitionTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            if (roundIndex + 1 < rounds.length) {
              nextRound();
            } else {
              handleCompleteSession(itemsCorrect);
            }
          }, 1500);
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
      itemsCorrect,
      learningLanguage,
      motherTongue,
      rounds.length,
      nextRound,
      handleCompleteSession,
    ]
  );

  // Audio replay button on the shape card
  const handleReplayShapeAudio = useCallback(() => {
    if (!currentRound) return;
    const targetWord = currentRound.correctAnswer;
    speakWord(targetWord, learningLanguage);
  }, [currentRound, learningLanguage]);

  // Exit handling: If child played any rounds, route to results report
  const handleExitGame = () => {
    stopSpeech();
    setShowExitModal(false);
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    if (roundIndex > 0 || itemsCorrect > 0 || attempts.length > 0) {
      handleCompleteSession(itemsCorrect, false);
    } else {
      resetGame();
      navigation.navigate('GameCatalog' as any);
    }
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="geometry" />
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="geometry" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* Cloud & Sun Clearance: ensures sky, clouds, sun and mobile notification panel are 100% free */}
        <CloudClearanceSpacer />

        {/* Top Control Bar: Exit, 90s Timer, Progress Trail, XP Pill */}
        <View style={[styles.topBar, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel={t('common.close', 'Exit game')}
            accessibilityRole="button"
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </BigTouchTarget>

          {/* 90-Second Continuous Total Session Timer */}
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

          {/* 10-Star Progress Trail */}
          <View style={styles.progressTrailWrapper}>
            <ProgressStarTrail
              current={roundIndex}
              total={rounds.length || TOTAL_GUESS_SHAPE_ROUNDS}
            />
          </View>

          {/* Live Score Pill */}
          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>⭐ {score} XP</Text>
          </View>
        </View>

        {/* Scrollable Gameplay Canvas */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Cue Card */}
          <View style={[styles.cueCard, { width: containerWidth }]}>
            <Text style={styles.cueText}>
              {t('guessTheShape.whatShapeIsThis', 'What shape is this? 🔍')}
            </Text>
          </View>

          {/* Central Target Shape Illustration */}
          <View style={{ width: containerWidth }}>
            <ShapeVisualTarget
              shape={currentRound.targetShape}
              age={selectedAge}
              onAudioPress={handleReplayShapeAudio}
            />
          </View>

          {/* Multiple Choice Options Grid (3-4 buttons) */}
          <View style={[styles.optionsContainer, { width: containerWidth }]}>
            {currentRound.options.map((option) => (
              <ShapeOptionButton
                key={option.id}
                option={option}
                status={optionStatuses[option.id] || 'idle'}
                onPress={handleOptionPress}
                disabled={isRoundLocked}
              />
            ))}
          </View>
        </ScrollView>

        {/* Celebration Overlay */}
        <CelebrationOverlay
          visible={showCelebration}
          onAnimationComplete={() => {}}
        />

        {/* Quit Confirmation Modal */}
        <FriendlyModal
          visible={showExitModal}
          title={t('common.close', 'Exit game?')}
          onDismiss={() => setShowExitModal(false)}
        >
          <Text style={styles.modalText}>
            {t(
              'common.leaveGameConfirm',
              'Do you want to leave the game? Your progress will be saved in your report!'
            )}
          </Text>
          <View style={styles.modalButtonsRow}>
            <BigTouchTarget
              onPress={() => setShowExitModal(false)}
              accessibilityLabel={t('common.keepPlaying', 'Keep Playing')}
              accessibilityRole="button"
              style={styles.cancelExitButton}
            >
              <Text style={styles.cancelExitText}>
                {t('common.keepPlaying', 'Keep Playing 🌱')}
              </Text>
            </BigTouchTarget>
            <BigTouchTarget
              onPress={handleExitGame}
              accessibilityLabel={t('common.exit', 'Exit')}
              accessibilityRole="button"
              style={styles.confirmExitButton}
            >
              <Text style={styles.confirmExitText}>
                {t('common.exit', 'Exit 🚪')}
              </Text>
            </BigTouchTarget>
          </View>
        </FriendlyModal>

        {/* Two-Attempt Educational Correction Modal */}
        <EducationalCorrectionModal
          visible={showCorrectionModal}
          targetWord={currentRound.correctAnswer}
          spokenWord={lastWrongChoice}
          promptFallback={t(
            'guessTheShape.educationalHint',
            'Look closely at the sides and corners!'
          )}
          onRetry={() => setShowCorrectionModal(false)}
        />
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 80,
    fontSize: 18,
    fontWeight: '700',
    color: '#4338CA',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomWidth: 4,
    borderBottomColor: '#C7D2FE',
    marginTop: 6,
    elevation: 4,
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  progressTrailWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  scorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 32,
  },
  cueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    alignItems: 'center',
    marginBottom: 4,
  },
  cueText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E1B4B',
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 8,
    gap: 4,
  },
  modalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelExitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelExitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  confirmExitButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  confirmExitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
