/**
 * Purpose: Primary 10-round interactive gameplay screen for Odd Word Out (Age 7).
 *          Features 90-second continuous session timer, category cue card,
 *          large 3D word option buttons, two-attempt educational correction loop,
 *          and celebration overlays.
 * Module: Odd Word Out — Screens
 * Folder: frontend/src/screens/games/OddWordOut
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { QuitGameModal } from '../../../components/QuitGameModal';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { SessionCountdownTimer } from '../../../components/SessionCountdownTimer';
import { EducationalCorrectionModal } from '../../../components/EducationalCorrectionModal';
import { GameHUD } from '../../../components/GameHUD';
import { CategoryCueCard } from './components/CategoryCueCard';
import { WordChoiceButton } from './components/WordChoiceButton';

import { useAppLanguageStore, AppLanguage } from '../../../state/appLanguageStore';
import { useOddWordOutStore } from './store/useOddWordOutStore';
import {
  generateOddWordOutQuestions,
  TOTAL_ODD_WORD_OUT_ROUNDS,
} from './logic/questionGenerator';
import { WordChoiceOption, OddWordQuestion } from './types';
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

  // Store state
  const roundIndex = useOddWordOutStore((s) => s.roundIndex);
  const rounds = useOddWordOutStore((s) => s.rounds);
  const score = useOddWordOutStore((s) => s.score);
  const itemsCorrect = useOddWordOutStore((s) => s.itemsCorrect);
  const sessionStartTime = useOddWordOutStore((s) => s.sessionStartTime);
  const attempts = useOddWordOutStore((s) => s.attempts);
  const startSession = useOddWordOutStore((s) => s.startSession);
  const recordAttempt = useOddWordOutStore((s) => s.recordAttempt);
  const nextRound = useOddWordOutStore((s) => s.nextRound);
  const resetGame = useOddWordOutStore((s) => s.resetGame);

  // Local round state
  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong' | 'disabled'>
  >({});
  const [revealedOddWord, setRevealedOddWord] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState<1 | 2>(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [lastWrongChoice, setLastWrongChoice] = useState<string>('');
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [sessionId] = useState(() => `owo_${Date.now()}`);

  const transitionTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Initialize session questions on mount
  useEffect(() => {
    isMountedRef.current = true;
    const generatedRounds = generateOddWordOutQuestions(learningLanguage);
    startSession(generatedRounds);

    return () => {
      isMountedRef.current = false;
      stopSpeech();
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [learningLanguage, startSession]);

  const currentRound: OddWordQuestion | undefined = rounds[roundIndex];

  // Reset round state & speak prompt on new round
  useEffect(() => {
    if (!currentRound) return;

    setOptionStatuses({});
    setRevealedOddWord(null);
    setAttemptCount(1);
    setIsRoundLocked(false);

    const prompt = t(
      'oddWordOut.questionPrompt',
      'Which word is different? Tap the odd word out!'
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
      const totalRounds = rounds.length || TOTAL_ODD_WORD_OUT_ROUNDS;
      const accuracy = Math.round((finalCorrectCount / totalRounds) * 100);

      let starsEarned = 1;
      let xpEarned = 50;

      try {
        const xpResult = await xpService.recordSessionCompletionXP({
          sessionId,
          gameId: 'odd_word_out',
          age: 7,
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
        screen: 'OddWordOutSessionComplete' as any,
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

  // Pronounce prompt handler
  const handleHearPrompt = useCallback(() => {
    if (!currentRound) return;
    const prompt = t(
      'oddWordOut.questionPrompt',
      'Which word is different? Tap the odd word out!'
    );
    speakPhrase(prompt, { language: motherTongue });
  }, [currentRound, motherTongue, t]);

  // Handle option selection
  const handleOptionPress = useCallback(
    async (option: WordChoiceOption) => {
      if (isRoundLocked || !currentRound) return;

      const targetWord = currentRound.correctAnswer;
      const chosenWord = option.word;

      if (option.isOdd) {
        // Correct answer (the odd word)
        setIsRoundLocked(true);
        setRevealedOddWord(targetWord);
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'correct' }));
        triggerHapticSuccess();
        setShowCelebration(true);

        // Record attempt
        recordAttempt({
          roundNumber: currentRound.roundNumber,
          category: currentRound.targetItem.categoryName,
          expectedOddWord: targetWord,
          chosenWord,
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
            gameId: 'odd_word_out',
          });
        } catch {}

        // Pronounce odd word + praise
        speakWord(targetWord, learningLanguage);
        setTimeout(() => {
          speakPraise(motherTongue);
        }, 700);

        // Advance to next round
        transitionTimeoutRef.current = setTimeout(() => {
          if (!isMountedRef.current) return;
          setShowCelebration(false);
          const newCorrectCount = itemsCorrect + 1;

          if (roundIndex + 1 < rounds.length) {
            nextRound();
          } else {
            handleCompleteSession(newCorrectCount);
          }
        }, 1700);
      } else {
        // Wrong answer
        triggerHapticWarning();
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'wrong' }));

        if (attemptCount === 1) {
          // Attempt 1: Educational feedback modal + grant 2nd attempt
          setLastWrongChoice(chosenWord);
          setShowCorrectionModal(true);
          setAttemptCount(2);

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            category: currentRound.targetItem.categoryName,
            expectedOddWord: targetWord,
            chosenWord,
            isCorrect: false,
            attemptCount: 1,
            timestamp: Date.now(),
          });
        } else {
          // Attempt 2: 0 XP, show correct odd word visually, advance
          setIsRoundLocked(true);
          setRevealedOddWord(targetWord);

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            category: currentRound.targetItem.categoryName,
            expectedOddWord: targetWord,
            chosenWord,
            isCorrect: false,
            attemptCount: 2,
            timestamp: Date.now(),
          });

          // Pronounce correct odd word
          speakWord(targetWord, learningLanguage);

          transitionTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            if (roundIndex + 1 < rounds.length) {
              nextRound();
            } else {
              handleCompleteSession(itemsCorrect);
            }
          }, 2000);
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
      learningLanguage,
      motherTongue,
      itemsCorrect,
      rounds.length,
      nextRound,
      handleCompleteSession,
    ]
  );

  // Dismiss educational correction modal
  const handleDismissCorrection = useCallback(() => {
    setShowCorrectionModal(false);
    // Disable the chosen wrong option so child cannot tap it again
    setOptionStatuses((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        if (updated[k] === 'wrong') {
          updated[k] = 'disabled';
        }
      });
      return updated;
    });
    setIsRoundLocked(false);
  }, []);

  // Early quit handler: shows report of current progress
  const handleConfirmExit = () => {
    setShowExitModal(false);
    handleCompleteSession(itemsCorrect, false);
  };

  const containerWidth = Math.min(screenWidth - 32, 420);

  if (!currentRound) {
    return (
      <View style={styles.loadingContainer}>
        <CartoonBackground theme="orchard" />
        <Text style={styles.loadingText}>
          {t('common.loading', 'Loading challenge...')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="orchard" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
        <CloudClearanceSpacer />

        {/* Unified Responsive 2-Row GameHUD */}
        <GameHUD
          onQuit={() => setShowExitModal(true)}
          currentRound={roundIndex}
          totalRounds={rounds.length || TOTAL_ODD_WORD_OUT_ROUNDS}
          score={score}
          initialSeconds={90}
          onExpire={handleTimeExpired}
          isPaused={showCorrectionModal || showExitModal || showCelebration}
          containerWidth={containerWidth}
        />

        {/* Non-Scrolling Responsive Gameplay Content */}
        <View style={styles.gameContentContainer}>
          {/* Round Subtitle */}
          <View style={[styles.roundBadgeContainer, { width: containerWidth }]}>
            <Text style={styles.roundBadgeText}>
              {t('common.round', 'Round')} {roundIndex + 1} /{' '}
              {rounds.length || TOTAL_ODD_WORD_OUT_ROUNDS}
            </Text>
          </View>

          {/* Category Cue Card */}
          <View style={{ width: containerWidth }}>
            <CategoryCueCard
              item={currentRound.targetItem}
              promptText={t(
                'oddWordOut.questionPrompt',
                'Which word is different?'
              )}
              onHearPrompt={handleHearPrompt}
              revealedOddWord={revealedOddWord}
            />
          </View>

          {/* Multiple-Choice Word Options (4 Choices) */}
          <View style={[styles.optionsContainer, { width: containerWidth }]}>
            {currentRound.options.map((option) => (
              <WordChoiceButton
                key={option.id}
                option={option}
                status={optionStatuses[option.id] || 'idle'}
                disabled={isRoundLocked || optionStatuses[option.id] === 'disabled'}
                onPress={handleOptionPress}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>

      {/* Celebration animation overlay on correct answer */}
      <CelebrationOverlay
        visible={showCelebration}
        onAnimationComplete={() => {}}
      />

      {/* Educational Correction Modal on 1st wrong attempt */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetWord={currentRound.correctAnswer}
        spokenWord={lastWrongChoice}
        promptFallback={currentRound.targetItem.explanation}
        onRetry={handleDismissCorrection}
      />

      {/* Exit Confirmation Modal */}
      <QuitGameModal
        visible={showExitModal}
        onContinue={() => setShowExitModal(false)}
        onExit={handleConfirmExit}
        gameTitle={t('oddWordOut.title', { defaultValue: 'Odd Word Out' })}
        currentRound={roundIndex + 1}
        totalRounds={rounds.length || 10}
      />
    </View>
  );
});

GameScreen.displayName = 'OddWordOutGameScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F3FF',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6D28D9',
  },
  topBar: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  exitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748B',
  },
  scoreBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C4B5FD',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6D28D9',
  },
  trailContainer: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  gameContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 12,
    width: '100%',
  },
  roundBadgeContainer: {
    alignItems: 'center',
    marginVertical: 4,
  },
  roundBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7C3AED',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    marginTop: 6,
    paddingHorizontal: 8,
  },
  exitModalBody: {
    paddingVertical: 10,
  },
  exitModalText: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  exitModalActions: {
    gap: 12,
  },
  keepPlayingBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  keepPlayingText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exitReportBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  exitReportText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
});
