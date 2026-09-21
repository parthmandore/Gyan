/**
 * Purpose: Primary 5-round interactive gameplay screen for Basic Grammar Games.
 *          Renders sentence cards, chunky tactile option buttons, celebration overlays,
 *          audio praise, and centralized XP recording.
 * Module: Grammar Challenge — Screens
 * Folder: frontend/src/screens/games/GrammarChallenge
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CartoonBackground, CloudClearanceSpacer } from '../../../components/CartoonBackground';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { QuitGameModal } from '../../../components/QuitGameModal';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { SessionCountdownTimer } from '../../../components/SessionCountdownTimer';
import { EducationalCorrectionModal } from '../../../components/EducationalCorrectionModal';
import { GameHUD } from '../../../components/GameHUD';
import { GrammarSentenceCard } from './components/GrammarSentenceCard';
import { GrammarOptionCard } from './components/GrammarOptionCard';

import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useGrammarGameStore } from './store/useGrammarGameStore';
import { generateGrammarSession, TOTAL_GRAMMAR_ROUNDS } from './logic/questionGenerator';
import {
  GrammarChallengeStackParamList,
  GrammarTopic,
  GrammarOption,
  GrammarRound,
} from './types';
import { xpService } from '../../../services/xpService';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;
type RouteProps = RouteProp<GrammarChallengeStackParamList, 'GrammarChallengeGame'>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProps>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 6;

  const topic: GrammarTopic = route.params?.topic || 'noun_or_verb';

  // Store state
  const roundIndex = useGrammarGameStore((s) => s.roundIndex);
  const rounds = useGrammarGameStore((s) => s.rounds);
  const score = useGrammarGameStore((s) => s.score);
  const itemsCorrect = useGrammarGameStore((s) => s.itemsCorrect);
  const sessionStartTime = useGrammarGameStore((s) => s.sessionStartTime);
  const startSession = useGrammarGameStore((s) => s.startSession);
  const recordAttempt = useGrammarGameStore((s) => s.recordAttempt);
  const nextRound = useGrammarGameStore((s) => s.nextRound);
  const resetSession = useGrammarGameStore((s) => s.resetSession);

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
  const [sessionId] = useState(() => `grammar_${topic}_${Date.now()}`);

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize session rounds with selected learningLanguage
  useEffect(() => {
    const newRounds = generateGrammarSession(topic, learningLanguage);
    startSession(topic, newRounds);

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    });

    return () => {
      stopSpeech();
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      unsubscribe();
    };
  }, [topic, learningLanguage, startSession, navigation]);

  const currentRound: GrammarRound | undefined = rounds[roundIndex];

  // Reset round state on round change
  useEffect(() => {
    if (!currentRound) return;

    setOptionStatuses({});
    setAttemptCount(1);
    setIsRoundLocked(false);
    setFeedbackMessage(null);
    setExplanationText(null);

    // Speak the prompt and sentence
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
      const accuracy = Math.round((finalCorrectCount / TOTAL_GRAMMAR_ROUNDS) * 100);

      let starsEarned = 1;
      let xpEarned = 25;

      try {
        const res = await xpService.recordSessionCompletionXP({
          sessionId,
          gameId: topic,
          age: selectedAge,
          motherTongue,
          learningLanguage,
          totalQuestions: TOTAL_GRAMMAR_ROUNDS,
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
        screen: 'GrammarChallengeSessionComplete' as any,
        params: {
          topic,
          starsEarned,
          xpEarned,
          itemsCorrect: finalCorrectCount,
          sessionLength: TOTAL_GRAMMAR_ROUNDS,
          accuracy,
          isTimeExpired,
        },
      });
    },
    [
      sessionId,
      topic,
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
    async (option: GrammarOption) => {
      if (isRoundLocked || !currentRound) return;

      const isCorrect = option.isCorrect;
      const correctOpt = currentRound.question.options.find((o) => o.isCorrect);
      const correctLabel = correctOpt ? correctOpt.label : '';
      const selectedLabel = option.label;

      if (isCorrect) {
        // Correct answer!
        setIsRoundLocked(true);
        triggerHapticSuccess();

        setOptionStatuses((prev) => ({
          ...prev,
          [option.id]: 'correct',
        }));

        setFeedbackMessage(
          t('grammarChallenge.greatJob', "Great job! That's correct! 🎉")
        );

        if (currentRound.question.explanation) {
          setExplanationText(currentRound.question.explanation);
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
            gameId: topic,
          });
        } catch {
          // Graceful fallback
        }

        const newCorrectCount = itemsCorrect + 1;

        // Transition to next round or completion
        transitionTimeoutRef.current = setTimeout(() => {
          setShowCelebration(false);

          if (roundIndex + 1 >= TOTAL_GRAMMAR_ROUNDS) {
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
              gameId: topic,
            });
          } catch {
            // Graceful fallback
          }
        } else {
          // Attempt 2: Mark wrong (0 XP) and advance
          setIsRoundLocked(true);
          setFeedbackMessage(
            t('grammarChallenge.tryAgain', 'Good try! Let’s try the next one 🌱')
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
              gameId: topic,
            });
          } catch {
            // Graceful fallback
          }

          transitionTimeoutRef.current = setTimeout(() => {
            if (roundIndex + 1 >= TOTAL_GRAMMAR_ROUNDS) {
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
      topic,
      itemsCorrect,
      nextRound,
      finishSession,
    ]
  );

  const handleSpeakSentence = () => {
    if (!currentRound) return;
    speakPhrase(currentRound.question.sentence, { language: learningLanguage });
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    stopSpeech();
    finishSession(itemsCorrect, false);
  };

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="library" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>
              {t('common.loading', 'Loading questions...')}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const promptText = t(
    currentRound.question.promptKey,
    currentRound.question.promptFallback
  );

  // Layout mode: 2 options -> half width side-by-side; 3+ options or sentence correction -> full width
  const isFullLayout =
    topic === 'sentence_correction' || currentRound.question.options.length > 2;
  const contentWidth = Math.min(screenWidth - 24, 440);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="library" />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <CloudClearanceSpacer />

        {/* Unified Responsive 2-Row GameHUD */}
        <GameHUD
          onQuit={() => setShowExitModal(true)}
          currentRound={roundIndex}
          totalRounds={TOTAL_GRAMMAR_ROUNDS}
          score={score}
          initialSeconds={90}
          onExpire={handleTimeExpired}
          isPaused={
            isRoundLocked ||
            showCelebration ||
            showExitModal ||
            showCorrectionModal
          }
          containerWidth={contentWidth}
        />

        {/* Non-Scrolling Responsive Playable Area */}
        <View style={[styles.gameContentContainer, { width: contentWidth }]}>
          {/* Round Counter */}
          <View style={styles.roundPill}>
            <Text style={styles.roundCounterText}>
              {t('grammarChallenge.roundCounter', {
                defaultValue: 'Question {{current}} / {{total}}',
                current: roundIndex + 1,
                total: TOTAL_GRAMMAR_ROUNDS,
              })}
            </Text>
          </View>

          {/* Sentence Display Card */}
          <GrammarSentenceCard
            sentence={currentRound.question.sentence}
            topic={topic}
            promptText={promptText}
            visualIcon={currentRound.question.visualIcon}
            onHear={handleSpeakSentence}
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

          {/* Options Grid */}
          <View
            style={[
              styles.optionsContainer,
              isFullLayout && styles.optionsContainerColumn,
            ]}
          >
            {currentRound.question.options.map((opt) => (
              <GrammarOptionCard
                key={opt.id}
                option={opt}
                status={optionStatuses[opt.id] || 'idle'}
                onPress={() => handleSelectOption(opt)}
                disabled={isRoundLocked}
                layoutMode={isFullLayout ? 'full' : 'half'}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>

      {/* Celebration Confetti */}
      <CelebrationOverlay
        visible={showCelebration}
        titleText={t('grammarChallenge.greatJob', 'Awesome! 🎉')}
        subtitleText={t('grammarChallenge.nextRoundSoon', 'Keep going!')}
      />

      {/* Quit Game Confirmation Modal */}
      <QuitGameModal
        visible={showExitModal}
        onContinue={() => setShowExitModal(false)}
        onExit={handleConfirmExit}
        gameTitle={t('grammarChallenge.title', { defaultValue: 'Grammar Challenge' })}
        currentRound={roundIndex + 1}
        totalRounds={rounds.length || 5}
      />
      {/* Educational Correction Modal for Attempt 1 */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetWord={correctOptionLabel}
        spokenWord={lastWrongOption}
        promptFallback={
          currentRound?.question.explanation ||
          t('grammarChallenge.lookCarefully', 'Look carefully at the sentence!')
        }
        onRetry={() => setShowCorrectionModal(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  gameContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    alignSelf: 'center',
    paddingBottom: 12,
  },
  roundPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  roundCounterText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
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
  optionsContainerColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
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
