/**
 * Purpose: Interactive gameplay screen for Missing Letters (Age 5).
 *          Shows an animated letter sequence train with 1 missing slot,
 *          evaluates child tap selection, provides audio and tactile feedback,
 *          records real-time XP, and auto-transitions after 5 rounds.
 * Module: Missing Letters — Game Screen
 * Folder: frontend/src/screens/games/MissingLetters
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
import { LetterSequenceDisplay } from './components/LetterSequenceDisplay';
import { LetterOptionCard } from './components/LetterOptionCard';
import { useMissingLettersStore } from './store/useMissingLettersStore';
import {
  generateMissingLettersSession,
  TOTAL_MISSING_LETTERS_ROUNDS,
} from './logic/sequenceGenerator';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import {
  triggerHapticSuccess,
  triggerHapticWarning,
} from '../../../services/hapticsService';
import { xpService } from '../../../services/xpService';
import { MissingLettersOption, MissingLettersRound } from './types';
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
  } = useMissingLettersStore();

  const [optionStatuses, setOptionStatuses] = useState<
    Record<string, 'idle' | 'correct' | 'wrong'>
  >({});
  const [revealedLetter, setRevealedLetter] = useState<string | null>(null);
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [attemptNum, setAttemptNum] = useState<1 | 2>(1);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [wrongSelectedLetter, setWrongSelectedLetter] = useState<string | null>(null);
  const isSessionFinishedRef = useRef(false);

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize session rounds
  useEffect(() => {
    const newRounds = generateMissingLettersSession(learningLanguage);
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
  }, [learningLanguage, startSession, navigation]);

  const currentRound: MissingLettersRound | undefined = rounds[roundIndex];

  // Reset round state on round change
  useEffect(() => {
    setOptionStatuses({});
    setRevealedLetter(null);
    setIsRoundLocked(false);
    setFeedbackMessage(null);
    setAttemptNum(1);
    setShowCorrectionModal(false);
    setWrongSelectedLetter(null);
  }, [roundIndex]);

  // Audio prompt to hear sequence
  const handleHearSequence = useCallback(() => {
    if (!currentRound) return;
    speakPhrase(currentRound.question.spokenSequence, { language: learningLanguage });
  }, [currentRound, learningLanguage]);

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
        (finalCorrectCount / TOTAL_MISSING_LETTERS_ROUNDS) * 100
      );

      const xpResult = await xpService.recordSessionCompletionXP({
        sessionId,
        gameId: 'missing_letters',
        age: selectedAge,
        motherTongue,
        learningLanguage,
        totalQuestions: TOTAL_MISSING_LETTERS_ROUNDS,
        correctAnswers: finalCorrectCount,
        accuracy,
        durationSeconds,
      });

      navigation.navigate('Games', {
        screen: 'MissingLettersSessionComplete' as any,
        params: {
          starsEarned: xpResult.starsEarned,
          xpEarned: xpResult.totalSessionXp,
          itemsCorrect: finalCorrectCount,
          sessionLength: TOTAL_MISSING_LETTERS_ROUNDS,
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
    async (option: MissingLettersOption) => {
      if (isRoundLocked || !currentRound) return;

      setIsRoundLocked(true);

      if (option.isCorrect) {
        // --- CORRECT SELECTION ---
        triggerHapticSuccess();
        setShowCelebration(true);
        setRevealedLetter(option.letter);
        setFeedbackMessage(
          t('missingLetters.greatJob', "Great job! That's the right letter! 🎉")
        );

        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'correct',
        }));

        recordAttempt({
          roundNumber: currentRound.roundNumber,
          questionId: currentRound.question.id,
          selectedLetter: option.letter,
          correctLetter: currentRound.question.correctLetter,
          isCorrect: true,
          attemptCount: attemptNum,
          timestamp: Date.now(),
        });

        // Award answer XP (15 XP for 1st try, 10 XP for retry)
        await xpService.recordAnswerXP({
          sessionId,
          roundIndex,
          attemptNum,
          isCorrect: true,
          gameId: 'missing_letters',
          metadata: {
            letter: option.letter,
            language: learningLanguage,
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
          setWrongSelectedLetter(option.letter);
          setShowCorrectionModal(true);
          setAttemptNum(2);
        } else {
          // Attempt 2: Mark wrong (0 XP) and advance
          setFeedbackMessage(
            t('missingLetters.tryAgain', "Good try! Let's see the next one! 🌱")
          );

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            questionId: currentRound.question.id,
            selectedLetter: option.letter,
            correctLetter: currentRound.question.correctLetter,
            isCorrect: false,
            attemptCount: 2,
            timestamp: Date.now(),
          });

          await xpService.recordAnswerXP({
            sessionId,
            roundIndex,
            attemptNum: 2,
            isCorrect: false,
            gameId: 'missing_letters',
            metadata: {
              letter: option.letter,
              language: learningLanguage,
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
      learningLanguage,
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
    finishSession(itemsCorrect, false);
  };

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="alphabet" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Missing Letters...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const containerWidth = Math.min(screenWidth - 28, 440);
  const optionCardWidth = Math.min(Math.floor((containerWidth - 40) / 2), 120);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="alphabet" />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <CloudClearanceSpacer />

        {/* Unified Responsive 2-Row GameHUD */}
        <GameHUD
          onQuit={() => setShowExitModal(true)}
          currentRound={roundIndex + 1}
          totalRounds={TOTAL_MISSING_LETTERS_ROUNDS}
          score={score}
          initialSeconds={90}
          onTimeExpired={handleTimeExpired}
          isPaused={showCorrectionModal || showCelebration || showExitModal}
          roundResults={roundResults}
          containerWidth={containerWidth}
        />

        {/* Main Game Stage */}
        <View style={[styles.stageContainer, { width: containerWidth }]}>
          {/* Prompt Label in high-contrast card */}
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>
              {t('missingLetters.whichLetterIsMissing', 'Which letter is missing?')}
            </Text>
          </View>

          {/* Letter Sequence Track Display */}
          <LetterSequenceDisplay
            sequence={currentRound.question.sequence}
            missingIndex={currentRound.question.missingIndex}
            revealedLetter={revealedLetter}
            onHearSequence={handleHearSequence}
            isCorrectRevealed={!!revealedLetter}
          />

          {/* Feedback Message Bar */}
          {feedbackMessage ? (
            <View
              style={[
                styles.feedbackBar,
                revealedLetter ? styles.feedbackBarCorrect : styles.feedbackBarWrong,
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
              <LetterOptionCard
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
      <QuitGameModal
        visible={showExitModal}
        onContinue={() => setShowExitModal(false)}
        onExit={handleQuitGame}
        gameTitle={t('missingLetters.title', { defaultValue: 'Missing Letters' })}
        currentRound={roundIndex + 1}
        totalRounds={TOTAL_MISSING_LETTERS_ROUNDS}
      />

      {/* Educational Correction Modal (Attempt 1 Wrong) */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetValue={currentRound.question.correctLetter}
        selectedWrongValue={wrongSelectedLetter || undefined}
        onDismiss={() => {
          setShowCorrectionModal(false);
          setIsRoundLocked(false);
        }}
      />
    </View>
  );
});

GameScreen.displayName = 'MissingLettersGameScreen';

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
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
    color: '#4338CA',
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
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
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
    borderColor: '#C7D2FE',
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
  promptContainer: {
    alignSelf: 'center',
  },
  promptText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E1B4B',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    shadowColor: '#4338CA',
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
    color: '#1E1B4B',
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
    borderColor: '#C7D2FE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1B4B',
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
    backgroundColor: '#4F46E5',
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
