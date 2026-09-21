/**
 * Purpose: Primary 5-round gameplay screen for Colour Challenge.
 *          Age 5: Visual colour matching with large tactile cards.
 *          Age 6 & 7: Colour speaking & pronunciation with Whisper STT & fallback cards.
 * Module: Colour Challenge — Screens
 * Folder: frontend/src/screens/games/ColourChallenge
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Platform,
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
import { ColourVisualTarget } from './components/ColourVisualTarget';
import { ColourCard } from './components/ColourCard';
import { StorybookMicrophoneButton, MicButtonVisualState } from '../SpeechWordChallenge/components/StorybookMicrophoneButton';
import { SpeechFeedbackBadge } from '../SpeechWordChallenge/components/SpeechFeedbackBadge';

import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useColourChallengeStore } from './store/useColourChallengeStore';
import { generateColourRounds, TOTAL_COLOUR_ROUNDS } from './logic/roundGenerator';
import { ColorOption, ColorRound } from './types';
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
  const roundIndex = useColourChallengeStore((s) => s.roundIndex);
  const rounds = useColourChallengeStore((s) => s.rounds);
  const score = useColourChallengeStore((s) => s.score);
  const itemsCorrect = useColourChallengeStore((s) => s.itemsCorrect);
  const sessionStartTime = useColourChallengeStore((s) => s.sessionStartTime);
  const startSession = useColourChallengeStore((s) => s.startSession);
  const recordAttempt = useColourChallengeStore((s) => s.recordAttempt);
  const nextRound = useColourChallengeStore((s) => s.nextRound);
  const resetSession = useColourChallengeStore((s) => s.resetSession);

  // Local state
  const [optionStatuses, setOptionStatuses] = useState<Record<string, 'idle' | 'correct' | 'wrong' | 'disabled'>>({});
  const [attemptCount, setAttemptCount] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [lastWrongChoice, setLastWrongChoice] = useState<string>('');
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [sessionId] = useState(() => `col_${Date.now()}`);

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
    permissionGranted,
  } = useAudioRecorder();

  const autoStopTimeoutRef = useRef<any>(null);
  const transitionTimeoutRef = useRef<any>(null);

  // Initialize rounds on mount
  useEffect(() => {
    const generatedRounds = generateColourRounds(selectedAge, learningLanguage);
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

  const currentRound: ColorRound | undefined = rounds[roundIndex];

  // Speak instruction prompt at start of each round
  useEffect(() => {
    if (!currentRound) return;

    setOptionStatuses({});
    setAttemptCount(1);
    setIsRoundLocked(false);
    setFeedbackStatus(null);
    setRecognizedWord(null);

    const prompt = isSpeechMode
      ? t('colourChallenge.lookAndSay', { lng: motherTongue })
      : t('colourChallenge.tapMatching', { lng: motherTongue });

    speakPhrase(prompt, { language: motherTongue });
  }, [roundIndex, currentRound, isSpeechMode, motherTongue]);

  // Complete session handler
  const handleCompleteSession = useCallback(
    async (finalCorrectCount: number, isTimeExpired = false) => {
      const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      const totalRounds = rounds.length || TOTAL_COLOUR_ROUNDS;
      const accuracy = Math.round((finalCorrectCount / totalRounds) * 100);

      const xpResult = await xpService.recordSessionCompletionXP({
        sessionId,
        gameId: 'colour_challenge',
        age: selectedAge,
        motherTongue,
        learningLanguage,
        totalQuestions: totalRounds,
        correctAnswers: finalCorrectCount,
        accuracy,
        durationSeconds,
      });

      navigation.navigate('Games', {
        screen: 'ColourChallengeSessionComplete' as any,
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

  // Handle correct resolution for both visual and speech
  const handleRoundSuccess = useCallback(
    async (spokenText?: string, matchedOptionId?: string) => {
      if (isRoundLocked || !currentRound) return;
      setIsRoundLocked(true);

      const targetWord = currentRound.targetColor.names[learningLanguage] || currentRound.targetColor.names.en;

      // 1. Record attempt in store
      recordAttempt({
        roundNumber: currentRound.roundNumber,
        targetColorId: currentRound.targetColor.id,
        targetColorHex: currentRound.targetColor.hex,
        expectedWord: targetWord,
        spokenWord: spokenText,
        selectedOptionId: matchedOptionId || currentRound.targetColor.id,
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
        gameId: 'colour_challenge',
      });

      // 3. Audio & visual celebration
      triggerHapticSuccess();
      setShowCelebration(true);
      setFeedbackStatus('correct');

      // Speak color pronunciation in learning language + friendly praise
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
    async (option: ColorOption) => {
      if (isRoundLocked || !currentRound) return;

      const targetWord = currentRound.targetColor.names[learningLanguage] || currentRound.targetColor.names.en;
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
            targetColorId: currentRound.targetColor.id,
            targetColorHex: currentRound.targetColor.hex,
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
              gameId: 'colour_challenge',
            });
          } catch {}
        } else {
          setIsRoundLocked(true);
          recordAttempt({
            roundNumber: currentRound.roundNumber,
            targetColorId: currentRound.targetColor.id,
            targetColorHex: currentRound.targetColor.hex,
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
              gameId: 'colour_challenge',
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

      // Transcribe via Whisper STT in learningLanguage
      const response = await transcribeAudio(audioBlob, learningLanguage);
      if (response.success && response.recognized_text) {
        const recognized = response.recognized_text.trim();
        setRecognizedWord(recognized);

        const targetItemMock = {
          id: currentRound.targetColor.id,
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

          const targetWord = currentRound.targetColor.names[learningLanguage] || currentRound.targetColor.names.en;

          if (attemptCount === 1) {
            setLastWrongChoice(recognized);
            setShowCorrectionModal(true);
            setAttemptCount(2);

            recordAttempt({
              roundNumber: currentRound.roundNumber,
              targetColorId: currentRound.targetColor.id,
              targetColorHex: currentRound.targetColor.hex,
              expectedWord: targetWord,
              spokenWord: recognized,
              selectedOptionId: currentRound.targetColor.id,
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
                gameId: 'colour_challenge',
              });
            } catch {}
          } else {
            setIsRoundLocked(true);
            recordAttempt({
              roundNumber: currentRound.roundNumber,
              targetColorId: currentRound.targetColor.id,
              targetColorHex: currentRound.targetColor.hex,
              expectedWord: targetWord,
              spokenWord: recognized,
              selectedOptionId: currentRound.targetColor.id,
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
                gameId: 'colour_challenge',
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
  }, [isRoundLocked, currentRound, isRecording, stopRecording, startRecording, learningLanguage, handleRoundSuccess]);

  const handleReplayTargetAudio = useCallback(() => {
    if (!currentRound) return;
    const targetWord = currentRound.targetColor.names[learningLanguage] || currentRound.targetColor.names.en;
    speakWord(targetWord, learningLanguage);
  }, [currentRound, learningLanguage]);

  const handleExitGame = () => {
    stopSpeech();
    cancelRecording();
    setShowExitModal(false);
    handleCompleteSession(itemsCorrect, false);
  };

  const containerWidth = Math.min(screenWidth - 32, 440);

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="rainbow" />
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
      <CartoonBackground theme="rainbow" />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#D97706" />
        <CloudClearanceSpacer />

        {/* Unified Responsive 2-Row GameHUD */}
        <GameHUD
          onQuit={() => setShowExitModal(true)}
          currentRound={roundIndex}
          totalRounds={rounds.length || TOTAL_COLOUR_ROUNDS}
          score={score}
          initialSeconds={90}
          onExpire={handleTimeExpired}
          isPaused={
            isRoundLocked ||
            showCelebration ||
            showExitModal ||
            showCorrectionModal
          }
          containerWidth={containerWidth}
        />

        {/* Non-Scrolling Responsive Gameplay Content */}
        <View style={styles.gameContentContainer}>
          {/* Instruction Cue */}
          <View style={[styles.cueCard, { width: containerWidth }]}>
            <Text style={styles.cueText}>
              {isSpeechMode
                ? t('colourChallenge.lookAndSay')
                : t('colourChallenge.whatColour')}
            </Text>
          </View>

          {/* Central Target Color Swatch */}
          <ColourVisualTarget
            colorItem={currentRound.targetColor}
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
                  : t('colourChallenge.speakNow')}
              </Text>
            </View>
          )}

          {/* 4 Colour Options Grid (Always shown for Age 5, shown as visual fallback for Age 6 & 7) */}
          <View style={[styles.optionsGrid, { width: containerWidth }]}>
            {currentRound.options.map((opt) => (
              <ColourCard
                key={opt.id}
                option={opt}
                status={optionStatuses[opt.id] || 'idle'}
                onPress={() => handleOptionPress(opt)}
                disabled={isRoundLocked}
                showName={false}
                compact={isSpeechMode}
              />
            ))}
          </View>
        </View>

        {/* Celebration Overlay */}
        <CelebrationOverlay
          visible={showCelebration}
          onAnimationComplete={() => {}}
        />

        {/* Quit Confirmation Modal */}
        <QuitGameModal
          visible={showExitModal}
          onContinue={() => setShowExitModal(false)}
          onExit={handleExitGame}
          gameTitle={t('colourChallenge.title', { defaultValue: 'Colour Challenge' })}
          currentRound={roundIndex + 1}
          totalRounds={rounds.length || 5}
        />

        {/* Educational Correction Modal */}
        <EducationalCorrectionModal
          visible={showCorrectionModal}
          targetWord={
            currentRound?.targetColor.names[learningLanguage] ||
            currentRound?.targetColor.names.en ||
            ''
          }
          spokenWord={lastWrongChoice}
          promptFallback={t('colourChallenge.thisIsColor', 'Listen and look closely!')}
          onRetry={() => setShowCorrectionModal(false)}
        />
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 80,
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
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
    borderBottomColor: '#FDE68A',
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
  gameContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 10,
    width: '100%',
  },
  cueCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 4,
    borderBottomColor: '#F59E0B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  cueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#78350F',
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
