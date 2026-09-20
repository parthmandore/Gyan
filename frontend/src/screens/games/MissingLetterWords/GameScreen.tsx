/**
 * Purpose: Primary 10-round interactive gameplay screen for Missing Letter Words.
 *          Features 90-second continuous session timer, animated missing slot word display,
 *          large 3D letter option buttons, two-attempt educational correction loop,
 *          and celebration overlays.
 * Module: Missing Letter Words — Screens
 * Folder: frontend/src/screens/games/MissingLetterWords
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
import { WordDisplayCard } from './components/WordDisplayCard';
import { LetterOptionButton } from './components/LetterOptionButton';

import { useAppLanguageStore, AppLanguage } from '../../../state/appLanguageStore';
import { useMissingLetterWordsStore } from './store/useMissingLetterWordsStore';
import {
  generateMissingLetterWordQuestions,
  TOTAL_MISSING_LETTER_WORDS_ROUNDS,
} from './logic/questionGenerator';
import { WordOption, WordQuestion } from './types';
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
  const roundIndex = useMissingLetterWordsStore((s) => s.roundIndex);
  const rounds = useMissingLetterWordsStore((s) => s.rounds);
  const score = useMissingLetterWordsStore((s) => s.score);
  const itemsCorrect = useMissingLetterWordsStore((s) => s.itemsCorrect);
  const sessionStartTime = useMissingLetterWordsStore((s) => s.sessionStartTime);
  const attempts = useMissingLetterWordsStore((s) => s.attempts);
  const startSession = useMissingLetterWordsStore((s) => s.startSession);
  const recordAttempt = useMissingLetterWordsStore((s) => s.recordAttempt);
  const nextRound = useMissingLetterWordsStore((s) => s.nextRound);
  const resetGame = useMissingLetterWordsStore((s) => s.resetGame);

  // Local round state
  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong' | 'disabled'>
  >({});
  const [revealedLetter, setRevealedLetter] = useState<string | null>(null);
  const [isCorrectRevealed, setIsCorrectRevealed] = useState(false);
  const [attemptCount, setAttemptCount] = useState<1 | 2>(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [lastWrongChoice, setLastWrongChoice] = useState<string>('');
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [sessionId] = useState(() => `mlw_${Date.now()}`);

  const transitionTimeoutRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Initialize session questions on mount
  useEffect(() => {
    isMountedRef.current = true;
    const generatedRounds = generateMissingLetterWordQuestions(selectedAge, learningLanguage);
    startSession(generatedRounds);

    return () => {
      isMountedRef.current = false;
      stopSpeech();
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [selectedAge, learningLanguage, startSession]);

  const currentRound: WordQuestion | undefined = rounds[roundIndex];

  // Reset round state & speak prompt on new round
  useEffect(() => {
    if (!currentRound) return;

    setOptionStatuses({});
    setRevealedLetter(null);
    setIsCorrectRevealed(false);
    setAttemptCount(1);
    setIsRoundLocked(false);

    const prompt = t(
      'missingLetterWords.findMissingLetterPrompt',
      'What letter is missing? Choose the correct letter!'
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
      const totalRounds = rounds.length || TOTAL_MISSING_LETTER_WORDS_ROUNDS;
      const accuracy = Math.round((finalCorrectCount / totalRounds) * 100);

      let starsEarned = 1;
      let xpEarned = 50;

      try {
        const xpResult = await xpService.recordSessionCompletionXP({
          sessionId,
          gameId: 'missing_letter_words',
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
        screen: 'MissingLetterWordsSessionComplete' as any,
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

  // Pronounce word handler
  const handleHearWord = useCallback(() => {
    if (!currentRound) return;
    speakWord(currentRound.targetWord.word, learningLanguage);
  }, [currentRound, learningLanguage]);

  // Handle option selection
  const handleOptionPress = useCallback(
    async (option: WordOption) => {
      if (isRoundLocked || !currentRound) return;

      const targetLetter = currentRound.correctAnswer;
      const fullWord = currentRound.targetWord.word;

      if (option.isCorrect) {
        // Correct answer
        setIsRoundLocked(true);
        setRevealedLetter(targetLetter);
        setIsCorrectRevealed(true);
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'correct' }));
        triggerHapticSuccess();
        setShowCelebration(true);

        // Record attempt
        recordAttempt({
          roundNumber: currentRound.roundNumber,
          word: fullWord,
          expectedLetter: targetLetter,
          chosenLetter: option.letter,
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
            gameId: 'missing_letter_words',
          });
        } catch {}

        // Pronounce completed word + praise
        speakWord(fullWord, learningLanguage);
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
        }, 1600);
      } else {
        // Wrong answer
        triggerHapticWarning();
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'wrong' }));

        if (attemptCount === 1) {
          // Attempt 1: Educational feedback modal + grant 2nd attempt
          setLastWrongChoice(option.letter);
          setShowCorrectionModal(true);
          setAttemptCount(2);

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            word: fullWord,
            expectedLetter: targetLetter,
            chosenLetter: option.letter,
            isCorrect: false,
            attemptCount: 1,
            timestamp: Date.now(),
          });
        } else {
          // Attempt 2: 0 XP, show correct completed word visually, advance
          setIsRoundLocked(true);
          setRevealedLetter(targetLetter);
          setIsCorrectRevealed(false);

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            word: fullWord,
            expectedLetter: targetLetter,
            chosenLetter: option.letter,
            isCorrect: false,
            attemptCount: 2,
            timestamp: Date.now(),
          });

          // Pronounce correct full word
          speakWord(fullWord, learningLanguage);

          transitionTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            if (roundIndex + 1 < rounds.length) {
              nextRound();
            } else {
              handleCompleteSession(itemsCorrect);
            }
          }, 1800);
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
        <StatusBar barStyle="light-content" backgroundColor="#D97706" />
        <CloudClearanceSpacer />

        {/* Top Control Bar with 90-Second Session Countdown Timer */}
        <View style={[styles.topBar, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel={t('common.exit', 'Exit')}
            accessibilityRole="button"
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </BigTouchTarget>

          {/* Continuous Session Timer */}
          <SessionCountdownTimer
            initialSeconds={90}
            isPaused={showCorrectionModal || showExitModal || showCelebration}
            onExpire={handleTimeExpired}
          />

          {/* XP Score Badge */}
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>⭐ {score}</Text>
          </View>
        </View>

        {/* 10-Round Star Trail */}
        <View style={[styles.trailContainer, { width: containerWidth }]}>
          <ProgressStarTrail
            current={roundIndex}
            total={rounds.length || TOTAL_MISSING_LETTER_WORDS_ROUNDS}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Question Prompt */}
          <View style={[styles.promptContainer, { width: containerWidth }]}>
            <Text style={styles.promptRound}>
              {t('common.round', 'Round')} {roundIndex + 1} /{' '}
              {rounds.length || TOTAL_MISSING_LETTER_WORDS_ROUNDS}
            </Text>
            <Text style={styles.promptQuestion}>
              {t(
                'missingLetterWords.chooseMissingLetter',
                'Which letter is missing? Tap the correct letter!'
              )}
            </Text>
          </View>

          {/* Visual Word Card with Missing Slot and Reveal */}
          <View style={{ width: containerWidth }}>
            <WordDisplayCard
              item={currentRound.targetWord}
              revealedLetter={revealedLetter}
              isCorrectRevealed={isCorrectRevealed}
              onHearWord={handleHearWord}
            />
          </View>

          {/* Multiple-Choice Letter Option Buttons */}
          <View style={[styles.optionsGrid, { width: containerWidth }]}>
            {currentRound.options.map((option) => (
              <LetterOptionButton
                key={option.id}
                option={option}
                status={optionStatuses[option.id] || 'idle'}
                disabled={isRoundLocked || optionStatuses[option.id] === 'disabled'}
                onPress={handleOptionPress}
                width={76}
                height={76}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Celebration animation overlay on correct answer */}
      <CelebrationOverlay
        visible={showCelebration}
        onAnimationComplete={() => {}}
      />

      {/* Educational Correction Modal on 1st wrong attempt */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetWord={`${currentRound.correctAnswer} (${currentRound.targetWord.word})`}
        spokenWord={lastWrongChoice}
        promptFallback={t(
          'missingLetterWords.correctionExplanation',
          'Look at the word carefully and pick the missing letter!'
        )}
        onRetry={handleDismissCorrection}
      />

      {/* Exit Confirmation Modal */}
      <FriendlyModal
        visible={showExitModal}
        title={t('common.pauseGame', 'Pause Challenge?')}
        onDismiss={() => setShowExitModal(false)}
      >
        <View style={styles.exitModalBody}>
          <Text style={styles.exitModalText}>
            {t(
              'common.exitConfirmExplanation',
              'Do you want to stop now? Your score and report will be saved!'
            )}
          </Text>

          <View style={styles.exitModalActions}>
            <BigTouchTarget
              onPress={() => setShowExitModal(false)}
              accessibilityLabel={t('common.keepPlaying', 'Keep Playing')}
              accessibilityRole="button"
              style={styles.keepPlayingBtn}
            >
              <Text style={styles.keepPlayingText}>
                ▶ {t('common.keepPlaying', 'Keep Playing')}
              </Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handleConfirmExit}
              accessibilityLabel={t('common.viewReport', 'View Report & Exit')}
              accessibilityRole="button"
              style={styles.exitReportBtn}
            >
              <Text style={styles.exitReportText}>
                📊 {t('common.viewReport', 'View Report & Exit')}
              </Text>
            </BigTouchTarget>
          </View>
        </View>
      </FriendlyModal>
    </View>
  );
});

GameScreen.displayName = 'MissingLetterWordsGameScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#B45309',
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#B45309',
  },
  trailContainer: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  promptContainer: {
    alignItems: 'center',
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  promptRound: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  promptQuestion: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D97706',
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
