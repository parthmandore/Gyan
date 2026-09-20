/**
 * Purpose: Primary 5-round gameplay screen for Shape Challenge.
 *          Age 5: Visual geometric shape matching.
 *          Age 6 & 7: Shape naming and pronunciation with Whisper STT & fallback cards.
 * Module: Shape Challenge — Screens
 * Folder: frontend/src/screens/games/ShapeChallenge
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
import { ShapeCard } from './components/ShapeCard';
import { StorybookMicrophoneButton, MicButtonVisualState } from '../SpeechWordChallenge/components/StorybookMicrophoneButton';
import { SpeechFeedbackBadge } from '../SpeechWordChallenge/components/SpeechFeedbackBadge';

import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useShapeChallengeStore } from './store/useShapeChallengeStore';
import { generateShapeRounds, TOTAL_SHAPE_ROUNDS } from './logic/roundGenerator';
import { ShapeOption, ShapeRound } from './types';
import { xpService } from '../../../services/xpService';
import { speakPhrase, stopSpeech, speakWord } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { useAudioRecorder } from '../SpeechWordChallenge/hooks/useAudioRecorder';
import { transcribeAudio } from '../../../services/sttService';
import { isAnswerCorrect } from '../SpeechWordChallenge/utils/speechAnswerMatcher';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

  const isSpeechMode = selectedAge >= 6;

  // Store state
  const roundIndex = useShapeChallengeStore((s) => s.roundIndex);
  const rounds = useShapeChallengeStore((s) => s.rounds);
  const score = useShapeChallengeStore((s) => s.score);
  const itemsCorrect = useShapeChallengeStore((s) => s.itemsCorrect);
  const sessionStartTime = useShapeChallengeStore((s) => s.sessionStartTime);
  const startSession = useShapeChallengeStore((s) => s.startSession);
  const recordAttempt = useShapeChallengeStore((s) => s.recordAttempt);
  const nextRound = useShapeChallengeStore((s) => s.nextRound);
  const resetSession = useShapeChallengeStore((s) => s.resetSession);

  // Local state
  const [optionStatuses, setOptionStatuses] = useState<Record<string, 'idle' | 'correct' | 'wrong' | 'disabled'>>({});
  const [attemptCount, setAttemptCount] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [lastWrongChoice, setLastWrongChoice] = useState<string>('');
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [sessionId] = useState(() => `shp_${Date.now()}`);

  // STT / Mic state for Age 6 & 7
  const [feedbackStatus, setFeedbackStatus] = useState<
    'correct' | 'wrong' | 'empty' | 'listening' | 'transcribing' | 'technical' | null
  >(null);
  const [recognizedWord, setRecognizedWord] = useState<string | null>(null);

  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const autoStopTimeoutRef = useRef<any>(null);
  const transitionTimeoutRef = useRef<any>(null);

  // Initialize rounds on mount
  useEffect(() => {
    const generatedRounds = generateShapeRounds(selectedAge, learningLanguage);
    startSession(generatedRounds);

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
      cancelRecording();
    });

    return () => {
      unsubscribe();
      stopSpeech();
      cancelRecording();
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, [selectedAge, learningLanguage]);

  const currentRound: ShapeRound | undefined = rounds[roundIndex];

  // Speak instruction prompt at start of each round
  useEffect(() => {
    if (!currentRound) return;

    setOptionStatuses({});
    setAttemptCount(1);
    setIsRoundLocked(false);
    setFeedbackStatus(null);
    setRecognizedWord(null);

    const prompt = isSpeechMode
      ? t('shapeChallenge.lookAndSay', { lng: motherTongue })
      : t('shapeChallenge.tapMatching', { lng: motherTongue });

    speakPhrase(prompt, { language: motherTongue });
  }, [roundIndex, currentRound, isSpeechMode, motherTongue]);

  // Complete session handler
  const handleCompleteSession = useCallback(
    async (finalCorrectCount: number, isTimeExpired = false) => {
      const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      const totalRounds = rounds.length || TOTAL_SHAPE_ROUNDS;
      const accuracy = Math.round((finalCorrectCount / totalRounds) * 100);

      const xpResult = await xpService.recordSessionCompletionXP({
        sessionId,
        gameId: 'shape_challenge',
        age: selectedAge,
        motherTongue,
        learningLanguage,
        totalQuestions: totalRounds,
        correctAnswers: finalCorrectCount,
        accuracy,
        durationSeconds,
      });

      navigation.navigate('Games', {
        screen: 'ShapeChallengeSessionComplete' as any,
        params: {
          starsEarned: xpResult.starsEarned,
          xpEarned: xpResult.totalSessionXp,
          itemsCorrect: finalCorrectCount,
          sessionLength: totalRounds,
          accuracy,
          isTimeExpired,
        },
      });
    },
    [sessionId, selectedAge, motherTongue, learningLanguage, rounds.length, sessionStartTime, navigation]
  );

  const handleTimeExpired = useCallback(() => {
    handleCompleteSession(itemsCorrect, true);
  }, [handleCompleteSession, itemsCorrect]);

  // Handle correct resolution
  const handleRoundSuccess = useCallback(
    async (spokenText?: string, matchedOptionId?: string) => {
      if (isRoundLocked || !currentRound) return;
      setIsRoundLocked(true);

      const targetWord = currentRound.targetShape.names[learningLanguage] || currentRound.targetShape.names.en;

      // 1. Record attempt in store
      recordAttempt({
        roundNumber: currentRound.roundNumber,
        targetShapeId: currentRound.targetShape.id,
        expectedWord: targetWord,
        spokenWord: spokenText,
        selectedOptionId: matchedOptionId || currentRound.targetShape.id,
        isCorrect: true,
        attemptCount,
        mode: isSpeechMode ? 'speech' : 'visual',
      });

      // 2. Award XP via xpService
      await xpService.recordAnswerXP({
        sessionId,
        roundIndex,
        attemptNum: attemptCount,
        isCorrect: true,
        gameId: 'shape_challenge',
      });

      // 3. Audio & visual celebration
      triggerHapticSuccess();
      setShowCelebration(true);
      setFeedbackStatus('correct');

      // Speak shape pronunciation in learning language + praise
      speakWord(targetWord, learningLanguage);
      setTimeout(() => {
        speakPraise(learningLanguage);
      }, 500);

      // 4. Advance or complete after animation
      transitionTimeoutRef.current = setTimeout(() => {
        setShowCelebration(false);
        const newCorrectCount = itemsCorrect + 1;

        if (roundIndex + 1 < rounds.length) {
          nextRound();
        } else {
          handleCompleteSession(newCorrectCount);
        }
      }, 1400);
    },
    [
      isRoundLocked,
      currentRound,
      learningLanguage,
      recordAttempt,
      attemptCount,
      isSpeechMode,
      sessionId,
      roundIndex,
      itemsCorrect,
      rounds.length,
      nextRound,
      handleCompleteSession,
    ]
  );

  // Age 5: Option tap handler
  const handleOptionPress = useCallback(
    async (option: ShapeOption) => {
      if (isRoundLocked || !currentRound) return;

      const targetWord = currentRound.targetShape.names[learningLanguage] || currentRound.targetShape.names.en;
      const chosenWord = option.name;

      if (option.isCorrect) {
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'correct' }));
        handleRoundSuccess(undefined, option.id);
      } else {
        triggerHapticWarning();
        setOptionStatuses((prev) => ({ ...prev, [option.id]: 'wrong' }));

        if (attemptCount === 1) {
          setLastWrongChoice(chosenWord);
          setShowCorrectionModal(true);
          setAttemptCount(2);

          recordAttempt({
            roundNumber: currentRound.roundNumber,
            targetShapeId: currentRound.targetShape.id,
            expectedWord: targetWord,
            spokenWord: chosenWord,
            selectedOptionId: option.id,
            isCorrect: false,
            attemptCount: 1,
            mode: 'visual',
          });

          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: 1,
              isCorrect: false,
              gameId: 'shape_challenge',
            });
          } catch {}
        } else {
          setIsRoundLocked(true);
          recordAttempt({
            roundNumber: currentRound.roundNumber,
            targetShapeId: currentRound.targetShape.id,
            expectedWord: targetWord,
            spokenWord: chosenWord,
            selectedOptionId: option.id,
            isCorrect: false,
            attemptCount: 2,
            mode: 'visual',
          });

          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: 2,
              isCorrect: false,
              gameId: 'shape_challenge',
            });
          } catch {}

          transitionTimeoutRef.current = setTimeout(() => {
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
      learningLanguage,
      attemptCount,
      handleRoundSuccess,
      recordAttempt,
      sessionId,
      roundIndex,
      rounds.length,
      nextRound,
      handleCompleteSession,
      itemsCorrect,
    ]
  );

  // Age 6 & 7: Mic button press handler
  const handleToggleMic = useCallback(async () => {
    if (isRoundLocked || !currentRound) return;

    if (isRecording) {
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
      setFeedbackStatus('transcribing');

      const audioBlob = await stopRecording();
      if (!audioBlob) {
        setFeedbackStatus('empty');
        return;
      }

      const response = await transcribeAudio(audioBlob, learningLanguage);
      if (response.success && response.recognized_text) {
        const recognized = response.recognized_text.trim();
        setRecognizedWord(recognized);

        const targetItemMock = {
          id: currentRound.targetShape.id,
          expectedWord: currentRound.expectedWord,
          displayWord: currentRound.expectedWord,
          acceptedVariants: currentRound.acceptedVariants,
        };

        const matchResult = isAnswerCorrect(recognized, targetItemMock as any);

        if (matchResult.isCorrect) {
          handleRoundSuccess(recognized);
        } else {
          triggerHapticWarning();
          setFeedbackStatus('wrong');

          const targetWord = currentRound.targetShape.names[learningLanguage] || currentRound.targetShape.names.en;

          if (attemptCount === 1) {
            setLastWrongChoice(recognized);
            setShowCorrectionModal(true);
            setAttemptCount(2);

            recordAttempt({
              roundNumber: currentRound.roundNumber,
              targetShapeId: currentRound.targetShape.id,
              expectedWord: targetWord,
              spokenWord: recognized,
              selectedOptionId: currentRound.targetShape.id,
              isCorrect: false,
              attemptCount: 1,
              mode: 'speech',
            });

            try {
              await xpService.recordAnswerXP({
                sessionId,
                roundIndex,
                attemptNum: 1,
                isCorrect: false,
                gameId: 'shape_challenge',
              });
            } catch {}
          } else {
            setIsRoundLocked(true);
            recordAttempt({
              roundNumber: currentRound.roundNumber,
              targetShapeId: currentRound.targetShape.id,
              expectedWord: targetWord,
              spokenWord: recognized,
              selectedOptionId: currentRound.targetShape.id,
              isCorrect: false,
              attemptCount: 2,
              mode: 'speech',
            });

            try {
              await xpService.recordAnswerXP({
                sessionId,
                roundIndex,
                attemptNum: 2,
                isCorrect: false,
                gameId: 'shape_challenge',
              });
            } catch {}

            transitionTimeoutRef.current = setTimeout(() => {
              if (roundIndex + 1 < rounds.length) {
                nextRound();
              } else {
                handleCompleteSession(itemsCorrect);
              }
            }, 1500);
          }
        }
      } else if (response.error_type === 'TIMEOUT' || response.error_type === 'CONNECTION_REFUSED') {
        setFeedbackStatus('technical');
      } else {
        setFeedbackStatus('empty');
      }
    } else {
      stopSpeech();
      const started = await startRecording();
      if (started) {
        setFeedbackStatus('listening');
        autoStopTimeoutRef.current = setTimeout(() => {
          handleToggleMic();
        }, 4000);
      }
    }
  }, [
    isRoundLocked,
    currentRound,
    isRecording,
    stopRecording,
    startRecording,
    learningLanguage,
    attemptCount,
    handleRoundSuccess,
    recordAttempt,
    sessionId,
    roundIndex,
    rounds.length,
    nextRound,
    handleCompleteSession,
    itemsCorrect,
  ]);

  const handleReplayTargetAudio = useCallback(() => {
    if (!currentRound) return;
    const targetWord = currentRound.targetShape.names[learningLanguage] || currentRound.targetShape.names.en;
    speakWord(targetWord, learningLanguage);
  }, [currentRound, learningLanguage]);

  const handleExitGame = () => {
    stopSpeech();
    cancelRecording();
    setShowExitModal(false);
    if (roundIndex > 0 || itemsCorrect > 0) {
      handleCompleteSession(itemsCorrect, false);
    } else {
      resetSession();
      navigation.navigate('GameCatalog');
    }
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="geometry" />
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </SafeAreaView>
      </View>
    );
  }

  const micState: MicButtonVisualState = isRecording
    ? 'recording'
    : feedbackStatus === 'transcribing'
    ? 'processing'
    : feedbackStatus === 'correct'
    ? 'success'
    : feedbackStatus === 'wrong'
    ? 'retry'
    : 'idle';

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="geometry" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#2563EB" />
        <CloudClearanceSpacer />

        {/* Top Progress & Score Bar */}
        <View style={[styles.topBar, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </BigTouchTarget>

          {/* Continuous Session Timer (90s) */}
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

          <View style={styles.progressTrailWrapper}>
            <ProgressStarTrail
              current={roundIndex}
              total={rounds.length || TOTAL_SHAPE_ROUNDS}
            />
          </View>

          <View style={styles.scorePill}>
            <Text style={styles.scoreText}>⭐ {score} XP</Text>
          </View>
        </View>

        {/* Main Gameplay Scroll Area */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instruction Cue */}
          <View style={[styles.cueCard, { width: containerWidth }]}>
            <Text style={styles.cueText}>
              {isSpeechMode
                ? t('shapeChallenge.lookAndSay')
                : t('shapeChallenge.whatShape')}
            </Text>
          </View>

          {/* Central Target Shape */}
          <ShapeVisualTarget
            shapeItem={currentRound.targetShape}
            learningLanguage={learningLanguage}
            showWord={isSpeechMode && isRoundLocked}
            onPressAudio={handleReplayTargetAudio}
          />

          {/* Speech Feedback Badge if in speech mode */}
          {isSpeechMode && feedbackStatus && (
            <View style={styles.feedbackBadgeWrapper}>
              <SpeechFeedbackBadge status={feedbackStatus} recognizedText={recognizedWord} />
              {recognizedWord && feedbackStatus === 'wrong' && (
                <Text style={styles.heardText}>
                  {t('speechWordChallenge.debugHeard', { heard: recognizedWord })}
                </Text>
              )}
            </View>
          )}

          {/* Age 6 & 7: Tactile Microphone Button */}
          {isSpeechMode && (
            <View style={styles.micButtonContainer}>
              <StorybookMicrophoneButton
                state={micState}
                onPress={handleToggleMic}
                disabled={isRoundLocked}
              />
              <Text style={styles.micHintText}>
                {isRecording
                  ? t('speechWordChallenge.feedback.listening')
                  : t('shapeChallenge.speakNow')}
              </Text>
            </View>
          )}

          {/* 4 Shape Options Grid */}
          <View style={[styles.optionsGrid, { width: containerWidth }]}>
            {currentRound.options.map((opt) => (
              <ShapeCard
                key={opt.id}
                option={opt}
                status={optionStatuses[opt.id] || 'idle'}
                onPress={() => handleOptionPress(opt)}
                disabled={isRoundLocked}
                showName={false}
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
          title={t('common.close')}
          onDismiss={() => setShowExitModal(false)}
        >
          <Text style={styles.modalText}>{t('capitalSmallMatch.quitConfirm') || 'Do you want to leave the game?'}</Text>
          <View style={styles.modalButtonsRow}>
            <BigTouchTarget
              onPress={() => setShowExitModal(false)}
              accessibilityLabel={t('common.retry')}
              accessibilityRole="button"
              style={styles.cancelExitButton}
            >
              <Text style={styles.cancelExitText}>{t('common.gotIt')}</Text>
            </BigTouchTarget>
            <BigTouchTarget
              onPress={handleExitGame}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
              style={styles.confirmExitButton}
            >
              <Text style={styles.confirmExitText}>Exit</Text>
            </BigTouchTarget>
          </View>
        </FriendlyModal>

        {/* Educational Correction Modal */}
        <EducationalCorrectionModal
          visible={showCorrectionModal}
          targetWord={
            currentRound?.targetShape.names[learningLanguage] ||
            currentRound?.targetShape.names.en ||
            ''
          }
          spokenWord={lastWrongChoice}
          promptFallback={t('shapeChallenge.thisIsShape', 'Look closely at the sides and corners!')}
          onRetry={() => setShowCorrectionModal(false)}
        />
      </SafeAreaView>
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
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 80,
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 4,
    borderBottomColor: '#BFDBFE',
    marginTop: 6,
    elevation: 4,
  },
  exitButton: {
    backgroundColor: '#F1F5F9',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#475569',
  },
  progressTrailWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#B45309',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 36,
  },
  cueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 4,
    borderBottomColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  cueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  feedbackBadgeWrapper: {
    alignItems: 'center',
    marginVertical: 6,
  },
  heardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
  },
  micButtonContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  micHintText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  cancelExitButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 14,
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
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmExitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
