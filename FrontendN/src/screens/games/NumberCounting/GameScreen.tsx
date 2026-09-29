/**
 * Purpose: Interactive gameplay screen for Number Counting (Age 5).
 *          Features 5 progressive rounds, visual counting stage separated from cartoon background,
 *          tap-to-count assist, large option buttons, praise feedback, real-time XP, and clean quit guard.
 * Module: Number Counting — Game Screen
 * Folder: frontend/src/screens/games/NumberCounting
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { SessionCountdownTimer } from '../../../components/SessionCountdownTimer';
import { EducationalCorrectionModal } from '../../../components/EducationalCorrectionModal';
import { QuitGameModal } from '../../../components/QuitGameModal';
import { GameHUD } from '../../../components/GameHUD';
import { CountingStage } from './components/CountingStage';
import { CountingOptionCard } from './components/CountingOptionCard';
import { useNumberCountingStore } from './store/useNumberCountingStore';
import {
  generateCountingSession,
  TOTAL_COUNTING_ROUNDS,
} from './logic/countingGameGenerator';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import {
  triggerHapticSuccess,
  triggerHapticWarning,
} from '../../../services/hapticsService';
import { xpService } from '../../../services/xpService';
import { CountingOption, CountingQuestion, SupportedLanguage } from './types';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = (useAppLanguageStore((s) => s.motherTongue) || 'en') as SupportedLanguage;
  const learningLanguage = (useAppLanguageStore((s) => s.learningLanguage) || 'en') as SupportedLanguage;
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

  const {
    sessionId,
    rounds,
    roundIndex,
    itemsCorrect,
    score,
    roundResults,
    attempts,
    sessionStartTime,
    startSession,
    recordAttempt,
    nextRound,
    resetGame,
  } = useNumberCountingStore();

  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong'>
  >({});
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [attemptNum, setAttemptNum] = useState<1 | 2>(1);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [wrongSelectedCount, setWrongSelectedCount] = useState<number | null>(null);
  const isSessionFinishedRef = useRef(false);

  const transitionTimerRef = useRef<any>(null);
  const roundStartTimeRef = useRef<number>(Date.now());
  const isNavigatingAwayRef = useRef(false);

  // Initialize 10 progressive rounds on mount
  useEffect(() => {
    const sessionRounds = generateCountingSession();
    startSession(sessionRounds);
    roundStartTimeRef.current = Date.now();

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      stopSpeech();
    };
  }, [startSession]);

  const currentRound: CountingQuestion | undefined = rounds[roundIndex];

  // Speak question prompt on round change
  const speakCurrentQuestion = useCallback(() => {
    if (!currentRound) return;
    const spoken =
      currentRound.spokenPhrase[learningLanguage] ||
      currentRound.spokenPhrase[motherTongue] ||
      currentRound.spokenPhrase.en;

    speakPhrase(spoken, { language: learningLanguage });
  }, [currentRound, learningLanguage, motherTongue]);

  useEffect(() => {
    if (!currentRound) return;

    // Reset option states
    const initialStatuses: Record<string, 'idle' | 'correct' | 'wrong'> = {};
    currentRound.options.forEach((opt) => {
      initialStatuses[opt.id] = 'idle';
    });
    setOptionStatuses(initialStatuses);
    setIsRoundLocked(false);
    setShowCelebration(false);
    setAttemptNum(1);
    setShowCorrectionModal(false);
    setWrongSelectedCount(null);
    roundStartTimeRef.current = Date.now();

    // Speak prompt after brief delay
    const speechTimeout = setTimeout(() => {
      speakCurrentQuestion();
    }, 450);

    return () => {
      clearTimeout(speechTimeout);
      stopSpeech();
    };
  }, [roundIndex, currentRound, speakCurrentQuestion]);

  const finishSession = useCallback(
    async (finalCorrect: number, isTimeExpired = false) => {
      if (isSessionFinishedRef.current) return;
      isSessionFinishedRef.current = true;
      isNavigatingAwayRef.current = true;
      setIsRoundLocked(true);
      stopSpeech();

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartTime) / 1000)
      );

      let earnedXp = 0;
      try {
        const accuracy = Math.round(
          (finalCorrect / TOTAL_COUNTING_ROUNDS) * 100
        );
        const xpResult = await xpService.recordSessionCompletionXP({
          sessionId,
          gameId: 'number_counting',
          age: selectedAge,
          motherTongue,
          learningLanguage,
          totalQuestions: TOTAL_COUNTING_ROUNDS,
          correctAnswers: finalCorrect,
          accuracy,
          durationSeconds,
        });
        earnedXp = xpResult?.totalSessionXp || finalCorrect * 15;
      } catch {
        earnedXp = finalCorrect * 15;
      }

      navigation.navigate('Games', {
        screen: 'NumberCountingSessionComplete' as any,
        params: {
          score: finalCorrect * 10,
          totalQuestions: TOTAL_COUNTING_ROUNDS,
          correctAnswers: finalCorrect,
          xpEarned: earnedXp,
          durationSeconds,
          isTimeExpired,
        },
      });
    },
    [sessionId, selectedAge, motherTongue, learningLanguage, sessionStartTime, navigation]
  );

  const handleTimeExpired = useCallback(() => {
    finishSession(itemsCorrect, true);
  }, [finishSession, itemsCorrect]);

  // Handle Option Selection
  const handleSelectOption = useCallback(
    async (option: CountingOption) => {
      if (isRoundLocked || !currentRound) return;

      setIsRoundLocked(true);
      const timeTakenMs = Date.now() - roundStartTimeRef.current;
      const isCorrect = option.isCorrect;

      // Update card feedback
      setOptionStatuses((prev) => ({
        ...prev,
        [option.id]: isCorrect ? 'correct' : 'wrong',
      }));

      // Record attempt in store
      recordAttempt({
        roundIndex,
        questionId: currentRound.id,
        selectedNumber: option.number,
        correctNumber: currentRound.targetCount,
        isCorrect,
        timeTakenMs,
      });

      if (isCorrect) {
        triggerHapticSuccess();
        setShowCelebration(true);
        speakPraise(learningLanguage);

        // Record real-time answer XP (15 XP for try 1, 10 XP for retry)
        try {
          await xpService.recordAnswerXP({
            sessionId,
            roundIndex,
            attemptNum,
            isCorrect: true,
            gameId: 'number_counting',
            metadata: {
              targetCount: currentRound.targetCount,
              selectedNumber: option.number,
            },
          });
        } catch {
          // Ignore
        }

        const newCorrect = itemsCorrect + 1;

        transitionTimerRef.current = setTimeout(async () => {
          setShowCelebration(false);

          if (roundIndex + 1 >= TOTAL_COUNTING_ROUNDS) {
            finishSession(newCorrect);
          } else {
            nextRound();
          }
        }, 1400);
      } else {
        triggerHapticWarning();

        if (attemptNum === 1) {
          // Attempt 1: Show educational correction popup + offer retry
          setWrongSelectedCount(option.number);
          setShowCorrectionModal(true);
          setAttemptNum(2);
        } else {
          // Attempt 2: Mark wrong (0 XP) and advance
          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: 2,
              isCorrect: false,
              gameId: 'number_counting',
              metadata: {
                targetCount: currentRound.targetCount,
                selectedNumber: option.number,
              },
            });
          } catch {
            // Ignore
          }

          transitionTimerRef.current = setTimeout(async () => {
            if (roundIndex + 1 >= TOTAL_COUNTING_ROUNDS) {
              finishSession(itemsCorrect);
            } else {
              nextRound();
            }
          }, 1400);
        }
      }
    },
    [
      isRoundLocked,
      currentRound,
      attemptNum,
      roundIndex,
      itemsCorrect,
      learningLanguage,
      recordAttempt,
      nextRound,
      finishSession,
      sessionId,
    ]
  );

  // Clean Navigation Exit Guard
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isNavigatingAwayRef.current) {
        return;
      }

      // Block exit and show dialog
      e.preventDefault();
      setShowQuitModal(true);
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const handleConfirmQuit = () => {
    isNavigatingAwayRef.current = true;
    setShowQuitModal(false);
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    stopSpeech();
    finishSession(itemsCorrect, false);
  };

  const handleCancelQuit = () => {
    setShowQuitModal(false);
  };

  if (!currentRound) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {t('common.loading', 'Loading Counting Challenge...')}
        </Text>
      </View>
    );
  }

  const activeQuestionText =
    currentRound.questionText[learningLanguage] ||
    currentRound.questionText[motherTongue] ||
    currentRound.questionText.en;

  const isTablet = screenWidth >= 600;
  const contentMaxWidth = isTablet ? 560 : 420;

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="orchard" />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <CloudClearanceSpacer />

        {/* Unified Responsive 2-Row GameHUD */}
        <GameHUD
          onQuit={() => setShowQuitModal(true)}
          currentRound={roundIndex + 1}
          totalRounds={TOTAL_COUNTING_ROUNDS}
          score={score}
          initialSeconds={90}
          onTimeExpired={handleTimeExpired}
          isPaused={showCorrectionModal || showCelebration || showQuitModal}
          roundResults={roundResults}
          containerWidth={contentMaxWidth}
        />

      {/* Central Gameplay Area */}
      <View style={[styles.mainArea, { maxWidth: contentMaxWidth }]}>
        {/* Dedicated Counting Stage Container */}
        <CountingStage
          targetCount={currentRound.targetCount}
          objectItem={currentRound.objectItem}
          questionText={activeQuestionText}
          onPressSpeakPrompt={speakCurrentQuestion}
        />

        {/* Number Options Row */}
        <View style={styles.optionsSection}>
          <Text style={styles.optionsPrompt}>
            {t('numberCounting.choosePrompt', 'Select the correct number:')}
          </Text>

          <View style={styles.optionsRow}>
            {currentRound.options.map((option) => (
              <CountingOptionCard
                key={option.id}
                option={option}
                status={optionStatuses[option.id] || 'idle'}
                disabled={isRoundLocked}
                onPress={handleSelectOption}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Cheerful Stars Celebration */}
      <CelebrationOverlay visible={showCelebration} />

      {/* Quit Confirmation Dialog */}
      <QuitGameModal
        visible={showQuitModal}
        onContinue={handleCancelQuit}
        onExit={handleConfirmQuit}
        gameTitle={t('numberCounting.title', { defaultValue: 'Number Counting' })}
        currentRound={roundIndex + 1}
        totalRounds={TOTAL_COUNTING_ROUNDS}
      />

      {/* Educational Correction Modal (Attempt 1 Wrong) */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetValue={String(currentRound.targetCount)}
        selectedWrongValue={wrongSelectedCount !== null ? String(wrongSelectedCount) : undefined}
        itemEmoji={currentRound.objectItem.emoji}
        onDismiss={() => {
          setShowCorrectionModal(false);
          setIsRoundLocked(false);
        }}
      />
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quitButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#64748B',
  },
  starTrailContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  roundBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  roundBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  mainArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  optionsSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
  },
  optionsPrompt: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 10,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
});
