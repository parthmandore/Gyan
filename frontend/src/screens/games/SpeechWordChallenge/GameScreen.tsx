/**
 * Purpose: Primary 10-round gameplay screen for Speech Word Challenge.
 *          Age 5: Letter Speech Challenge (Letter pronunciation)
 *          Age 6: Word Speech Challenge (Visual identification & pronunciation, expected word hidden)
 *          Unified aesthetic matching AlphabetMatching and VowelMatraMatch with CartoonBackground,
 *          standard top bar, instruction cue card, hero card, and tactile microphone button.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { CartoonBackground } from '../../../components/CartoonBackground';
import { StorybookMicrophoneButton, MicButtonVisualState } from './components/StorybookMicrophoneButton';
import { SpeechFeedbackBadge } from './components/SpeechFeedbackBadge';
import { SpeechReportModal } from './components/SpeechReportModal';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useProgressStore } from '../../../state/useProgressStore';
import { xpService } from '../../../services/xpService';
import { useSpeechWordChallengeStore } from './store/speechWordChallengeStore';
import { getRandomizedRoundItems, getItemsForCategory } from './datasets';
import { SpeechChallengeItem, SpeechRoundAttempt, GameCategory, SpeechWordChallengeStackParamList } from './types';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { transcribeAudio } from '../../../services/sttService';
import { isAnswerCorrect } from './utils/speechAnswerMatcher';
import { speakPhrase, stopSpeech, speakWord, speakLetter } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { RootStackParamList } from '../../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

const ROUND_COUNT = 10;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;
  const route = useRoute<RouteProp<SpeechWordChallengeStackParamList, 'SpeechWordChallengeGame'>>();
  const category = route.params?.category as GameCategory | undefined;
  const isLetterMode = category === 'letters' || (selectedAge === 5 && !category);

  // Store state
  const roundIndex = useSpeechWordChallengeStore((s) => s.roundIndex);
  const score = useSpeechWordChallengeStore((s) => s.score);
  const roundResults = useSpeechWordChallengeStore((s) => s.roundResults);
  const itemsAttempted = useSpeechWordChallengeStore((s) => s.itemsAttempted);
  const itemsCorrect = useSpeechWordChallengeStore((s) => s.itemsCorrect);
  const sessionAttempts = useSpeechWordChallengeStore((s) => s.sessionAttempts);
  const sessionStartTime = useSpeechWordChallengeStore((s) => s.sessionStartTime);
  const recordAnswer = useSpeechWordChallengeStore((s) => s.recordAnswer);
  const recordDetailedAttempt = useSpeechWordChallengeStore((s) => s.recordDetailedAttempt);
  const recordEmptyAttempt = useSpeechWordChallengeStore((s) => s.recordEmptyAttempt);
  const nextRound = useSpeechWordChallengeStore((s) => s.nextRound);

  // Local state
  const [roundsData, setRoundsData] = useState<SpeechChallengeItem[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<
    'correct' | 'wrong' | 'empty' | 'listening' | 'transcribing' | 'technical' | null
  >(null);
  const [roundLocked, setRoundLocked] = useState(false);
  const [roundState, setRoundState] = useState<'idle' | 'recording' | 'processing' | 'answered'>('idle');

  const speakerPulse = useSharedValue(1);
  const heroCardScale = useSharedValue(1);
  const recordingStartTimeRef = useRef<number>(0);
  const autoStopTimeoutRef = useRef<any>(null);
  const promptTimerRef = useRef<any>(null);
  const advanceTimerRef = useRef<any>(null);
  const isGameActiveRef = useRef<boolean>(true);
  const roundStateRef = useRef<'idle' | 'recording' | 'processing' | 'answered'>('idle');
  const silenceRetryCountRef = useRef<number>(0);
  const sessionIdRef = useRef<string>(`speech_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const roundXpEarnedRef = useRef<number>(0);

  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    error: micError,
  } = useAudioRecorder();

  const speakerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakerPulse.value }],
  }));

  const heroCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroCardScale.value }],
  }));

  // Clear all game timers
  const clearAllGameTimers = useCallback(() => {
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  // Initialize 10 random items based on learningLanguage, age, and optional category
  useEffect(() => {
    const items = category
      ? getItemsForCategory(learningLanguage, category, ROUND_COUNT)
      : isLetterMode
      ? getItemsForCategory(learningLanguage, 'letters', ROUND_COUNT)
      : getRandomizedRoundItems(learningLanguage, selectedAge, ROUND_COUNT);
    setRoundsData(items);
  }, [learningLanguage, selectedAge, category, isLetterMode]);

  const currentItem = roundsData[roundIndex] || null;

  // Comprehensive cleanup on unmount and navigation exit
  useEffect(() => {
    isGameActiveRef.current = true;
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      isGameActiveRef.current = false;
      stopSpeech();
      cancelRecording();
      clearAllGameTimers();
    });

    return () => {
      isGameActiveRef.current = false;
      unsubscribe();
      stopSpeech();
      cancelRecording();
      clearAllGameTimers();
    };
  }, [navigation, cancelRecording, clearAllGameTimers]);

  // Speak prompt on new round in motherTongue
  const speakCurrentItem = useCallback(() => {
    if (!isGameActiveRef.current || !currentItem) return;
    stopSpeech();
    speakerPulse.value = withSpring(1.2, { damping: 4 }, () => {
      speakerPulse.value = withSpring(1);
    });

    if (isLetterMode) {
      // Age 5: Generic letter prompt in motherTongue
      const letterPrompt = t('speechWordChallenge.promptLetters');
      speakPhrase(letterPrompt, { language: motherTongue });
    } else {
      // Initial question prompt in motherTongue
      let promptKey = 'promptAnimals';
      if (category === 'fruits') promptKey = 'promptFruits';
      else if (category === 'nature') promptKey = 'promptNature';
      const wordPrompt = t(`speechWordChallenge.${promptKey}`);
      speakPhrase(wordPrompt, { language: motherTongue });
    }
  }, [currentItem, isLetterMode, motherTongue, speakerPulse, category, t]);

  useEffect(() => {
    if (currentItem && !showCelebration && isGameActiveRef.current) {
      setRecognizedText(null);
      setFeedbackStatus(null);
      setRoundLocked(false);
      roundStateRef.current = 'idle';
      setRoundState('idle');
      silenceRetryCountRef.current = 0;
      heroCardScale.value = withSpring(1);
      if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      promptTimerRef.current = setTimeout(() => {
        if (!isGameActiveRef.current) return;
        speakCurrentItem();
      }, 400);
      return () => {
        if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
      };
    }
  }, [roundIndex, currentItem, speakCurrentItem, showCelebration, heroCardScale]);

  // Navigate to session complete when all rounds finish
  const handleSessionEnd = useCallback(async () => {
    isGameActiveRef.current = false;
    clearAllGameTimers();
    cancelRecording();
    stopSpeech();

    const durationSec = sessionStartTime
      ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000))
      : 30;
    // Accuracy based on ROUND_COUNT (10 questions)
    const accuracy =
      ROUND_COUNT > 0 ? Math.round((itemsCorrect / ROUND_COUNT) * 100) : 0;

    const gameId = category ? `speech_${category}` : (isLetterMode ? 'speech_letters' : 'speech_word_challenge');

    // Record session completion to centralized xpService
    const sessionResult = await xpService.recordSessionCompletionXP({
      sessionId: sessionIdRef.current,
      gameId,
      category: category || (isLetterMode ? 'letters' : undefined),
      learningLanguage,
      motherTongue,
      age: selectedAge,
      totalQuestions: ROUND_COUNT,
      correctAnswers: itemsCorrect,
      accuracy,
      durationSeconds: durationSec,
      roundXpEarned: roundXpEarnedRef.current,
    });

    navigation.navigate('Games', {
      screen: 'SpeechWordChallengeSessionComplete' as any,
      params: {
        starsEarned: sessionResult.starsEarned,
        xpEarned: sessionResult.totalSessionXp,
        itemsCorrect,
        sessionLength: ROUND_COUNT,
        accuracy,
        durationSeconds: durationSec,
        category,
      },
    });
  }, [sessionStartTime, itemsCorrect, navigation, cancelRecording, category, isLetterMode, learningLanguage, motherTongue, selectedAge, clearAllGameTimers]);

  // Handle Quit from exit modal
  const handleConfirmQuit = () => {
    isGameActiveRef.current = false;
    clearAllGameTimers();
    cancelRecording();
    stopSpeech();
    setShowExitModal(false);

    if (itemsAttempted > 0) {
      handleSessionEnd();
    } else {
      navigation.navigate('GameCatalog');
    }
  };

  // Handle Mic Press with strict single-submission state guard
  const handleMicToggle = async () => {
    if (!isGameActiveRef.current) return;
    if (roundLocked || roundStateRef.current === 'answered' || roundStateRef.current === 'processing') return;

    if (roundStateRef.current === 'idle') {
      // Start Recording
      roundStateRef.current = 'recording';
      setRoundState('recording');
      setFeedbackStatus('listening');
      recordingStartTimeRef.current = Date.now();
      try {
        const success = await startRecording();
        if (!isGameActiveRef.current) return;
        if (success) {
          // Auto-stop after 3.2 seconds for quick child response
          if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
          autoStopTimeoutRef.current = setTimeout(async () => {
            if (!isGameActiveRef.current) return;
            await handleStopAndEvaluate();
          }, 3200);
        } else {
          // Mic failed to activate (e.g. permission or device busy)
          roundStateRef.current = 'idle';
          setRoundState('idle');
          setFeedbackStatus(null);
        }
      } catch {
        if (!isGameActiveRef.current) return;
        roundStateRef.current = 'idle';
        setRoundState('idle');
        setFeedbackStatus(null);
      }
    } else if (roundStateRef.current === 'recording') {
      // Manually stop recording
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }
      await handleStopAndEvaluate();
    }
  };

  const handleStopAndEvaluate = async () => {
    if (!isGameActiveRef.current) return;
    if (roundStateRef.current === 'processing' || roundStateRef.current === 'answered') return;

    roundStateRef.current = 'processing';
    setRoundState('processing');
    setIsProcessing(true);
    setFeedbackStatus('transcribing');

    const recordingDurationSec =
      recordingStartTimeRef.current > 0
        ? (Date.now() - recordingStartTimeRef.current) / 1000
        : 0;

    const audioData = await stopRecording();
    if (!isGameActiveRef.current) return;

    if (!audioData) {
      setIsProcessing(false);
      roundStateRef.current = 'idle';
      setRoundState('idle');
      setFeedbackStatus('empty');
      return;
    }

    // Call Speech-to-Text API with learningLanguage
    const result = await transcribeAudio(
      audioData,
      learningLanguage as 'en' | 'hi' | 'mr'
    );
    if (!isGameActiveRef.current) return;

    setIsProcessing(false);

    // 1. Technical / Network Failure -> Allow retry per requirement
    if (!result.success) {
      console.warn(`[SpeechWordChallenge] STT Technical Failure (${result.error_type}):`, result.error);
      roundStateRef.current = 'idle';
      setRoundState('idle');
      setFeedbackStatus('technical');
      speakPhrase(t('speechWordChallenge.technicalIssue'), { language: motherTongue });
      return;
    }

    // 2. Empty / Silent Audio -> 1 prompt retry allowed, then consumes single attempt
    if (result.is_empty || !result.recognized_text.trim()) {
      if (silenceRetryCountRef.current < 1) {
        silenceRetryCountRef.current += 1;
        roundStateRef.current = 'idle';
        setRoundState('idle');
        setFeedbackStatus('empty');
        setRecognizedText(null);
        recordEmptyAttempt();
        speakPhrase(t('speechWordChallenge.noSpeech'), { language: motherTongue });
        return;
      }

      // Consumes attempt on continued silence
      if (!currentItem) return;
      roundStateRef.current = 'answered';
      setRoundState('answered');
      setRoundLocked(true);
      setFeedbackStatus('wrong');
      setRecognizedText(null);
      recordAnswer('', false);

      const emptyAttemptRecord: SpeechRoundAttempt = {
        roundNumber: roundIndex + 1,
        expectedAnswer: currentItem.expectedWord,
        displayLabel: currentItem.displayLetter || currentItem.displayWord,
        image: currentItem.image,
        recognizedAnswer: `(${t('speechWordChallenge.noSpeechDetected')})`,
        isCorrect: false,
        language: learningLanguage,
        age: selectedAge,
        timestamp: Date.now(),
        attemptCount: 1,
        durationSeconds: recordingDurationSec,
      };
      recordDetailedAttempt(emptyAttemptRecord);
      speakPhrase(t('speechWordChallenge.noSpeech'), { language: motherTongue });

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        if (!isGameActiveRef.current) return;
        if (roundIndex + 1 >= ROUND_COUNT) {
          handleSessionEnd();
        } else {
          nextRound();
        }
      }, 1800);
      return;
    }

    // 3. Valid STT result -> Consumes the SINGLE attempt! No second attempt allowed.
    const spokenText = result.recognized_text.trim();
    setRecognizedText(spokenText);

    if (!currentItem) return;

    // Immediately lock round so child cannot double submit
    roundStateRef.current = 'answered';
    setRoundState('answered');
    setRoundLocked(true);

    // Evaluate answer
    const match = isAnswerCorrect(spokenText, currentItem);

    // Record session attempt detail
    const attemptRecord: SpeechRoundAttempt = {
      roundNumber: roundIndex + 1,
      expectedAnswer: currentItem.expectedWord,
      displayLabel: currentItem.displayLetter || currentItem.displayWord,
      image: currentItem.image,
      recognizedAnswer: spokenText,
      isCorrect: match.isCorrect,
      language: learningLanguage,
      age: selectedAge,
      timestamp: Date.now(),
      attemptCount: 1,
      durationSeconds: recordingDurationSec,
    };
    recordDetailedAttempt(attemptRecord);

    if (match.isCorrect) {
      // === CORRECT ANSWER ===
      setFeedbackStatus('correct');
      heroCardScale.value = withSpring(1.06);
      recordAnswer(spokenText, true);
      setShowCelebration(true);
      speakPraise(motherTongue);

      // Record answer XP deterministically
      xpService.recordAnswerXP({
        sessionId: sessionIdRef.current,
        roundIndex,
        attemptNum: 1,
        isCorrect: true,
        gameId: category ? `speech_${category}` : (isLetterMode ? 'speech_letters' : 'speech_word_challenge'),
        metadata: {
          word: currentItem.expectedWord,
          category: currentItem.category,
        },
      }).then((res) => {
        if (!isGameActiveRef.current) return;
        roundXpEarnedRef.current += res.xpEarned;
      }).catch(() => {});

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        if (!isGameActiveRef.current) return;
        setShowCelebration(false);
        if (roundIndex + 1 >= ROUND_COUNT) {
          handleSessionEnd();
        } else {
          nextRound();
        }
      }, 1600);
    } else {
      // === INCORRECT ANSWER === (Single attempt only! Auto-advances to next round)
      setFeedbackStatus('wrong');
      heroCardScale.value = withSequence(
        withTiming(0.96, { duration: 100 }),
        withTiming(1.02, { duration: 100 }),
        withTiming(1.0, { duration: 100 })
      );
      recordAnswer(spokenText, false);
      speakPhrase(t('speechWordChallenge.almostTryAgain'), { language: motherTongue });

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        if (!isGameActiveRef.current) return;
        if (roundIndex + 1 >= ROUND_COUNT) {
          handleSessionEnd();
        } else {
          nextRound();
        }
      }, 1800);
    }
  };

  // Compute microphone button visual state
  const micVisualState: MicButtonVisualState =
    roundState === 'recording' || isRecording
      ? 'recording'
      : roundState === 'processing' || isProcessing
      ? 'processing'
      : feedbackStatus === 'correct'
      ? 'success'
      : feedbackStatus === 'wrong'
      ? 'retry'
      : 'idle';

  // Localized instruction for top cue card (always in motherTongue via i18n)
  const instructionPrompt = isLetterMode
    ? t('speechWordChallenge.promptLetters')
    : category === 'animals'
    ? t('speechWordChallenge.promptAnimals')
    : category === 'fruits'
    ? t('speechWordChallenge.promptFruits')
    : category === 'nature'
    ? t('speechWordChallenge.promptNature')
    : t('speechWordChallenge.promptAnimals');

  const currentAccuracy =
    roundIndex > 0 ? Math.round((itemsCorrect / roundIndex) * 100) : 100;

  return (
    <View style={styles.webOuterContainer}>
      {/* Living Cartoon Meadow Background Scene */}
      <CartoonBackground theme="meadow" />

      {/* Confetti celebration overlay on correct answer */}
      <CelebrationOverlay
        visible={showCelebration}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.header.topBarNavy} />

        {/* 1. Top Header Row (Matching AlphabetMatching & VowelMatraMatch) */}
        <View style={styles.topHeaderContainer}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel={t('game.exitGame')}
            accessibilityHint={t('accessibility.exitGameHint')}
            accessibilityRole="button"
            style={styles.redExitButton}
          >
            <Text style={styles.redExitButtonText}>✕</Text>
          </BigTouchTarget>

          <View
            style={styles.starTrailPill}
            accessibilityLabel={t('speechWordChallenge.progressLabel', {
              current: roundIndex + 1,
              total: ROUND_COUNT,
            })}
          >
            <ProgressStarTrail
              total={ROUND_COUNT}
              current={roundIndex + 1}
              roundResults={roundResults}
            />
          </View>

          <BigTouchTarget
            onPress={() => setShowReportModal(true)}
            accessibilityLabel={`Accuracy ${currentAccuracy}%, tap to view report`}
            accessibilityRole="button"
            style={styles.accuracyPill}
          >
            <Text style={styles.accuracyPillText}>🎯 {currentAccuracy}%</Text>
          </BigTouchTarget>
        </View>

        {/* 2. Main Game Content Container */}
        <View style={styles.mainContentContainer}>
          {/* Top Instruction Prompt Card */}
          <View style={styles.targetBanner}>
            <BigTouchTarget
              onPress={speakCurrentItem}
              accessibilityLabel={t('speechWordChallenge.listenInstruction')}
              accessibilityRole="button"
              style={styles.audioCueCard}
              disabled={isProcessing || roundLocked}
            >
              <Animated.View style={speakerAnimatedStyle}>
                <View style={styles.speakerIconCircle}>
                  <Text style={styles.audioSpeakerIcon}>🔊</Text>
                </View>
              </Animated.View>
              <Text style={styles.audioCueText}>{instructionPrompt}</Text>
            </BigTouchTarget>
          </View>

          {/* Hero Challenge Card */}
          {currentItem && (
            <Animated.View style={[styles.heroCardContainer, heroCardAnimatedStyle]}>
              <View style={styles.cardHeaderGlow} />

              {isLetterMode ? (
                /* Age 5: Large Letter + Associated Emoji Tag */
                <View style={styles.letterContentWrapper}>
                  <BigTouchTarget
                    onPress={() => speakLetter(currentItem.displayLetter || currentItem.expectedWord, undefined, learningLanguage)}
                    accessibilityLabel={`Letter ${currentItem.displayLetter || currentItem.expectedWord}, tap to listen`}
                    accessibilityRole="button"
                    style={{ alignItems: 'center' }}
                  >
                    <Text style={styles.heroLetterGlyph}>
                      {currentItem.displayLetter || currentItem.expectedWord.toUpperCase()}
                    </Text>
                  </BigTouchTarget>
                  {currentItem.image ? (
                    <View style={styles.associatedTagPill}>
                      <Text style={styles.associatedTagEmoji}>{currentItem.image}</Text>
                    </View>
                  ) : null}
                  {(feedbackStatus === 'correct' || feedbackStatus === 'wrong') && (
                    <BigTouchTarget
                      onPress={() => speakLetter(currentItem.displayLetter || currentItem.expectedWord, undefined, learningLanguage)}
                      accessibilityLabel={`Listen to letter ${currentItem.displayLetter || currentItem.expectedWord}`}
                      accessibilityRole="button"
                      style={styles.wordDisplayPill}
                    >
                      <Text style={styles.wordDisplayText}>
                        {currentItem.displayLetter || currentItem.expectedWord.toUpperCase()} 🔊
                      </Text>
                    </BigTouchTarget>
                  )}
                </View>
              ) : (
                /* Age 6: Large Educational Image & Word Label (revealed on correct or wrong answer) */
                <View style={styles.wordContentWrapper}>
                  <Text style={styles.heroImageIllustration}>{currentItem.image}</Text>
                  {feedbackStatus === 'correct' || feedbackStatus === 'wrong' ? (
                    <BigTouchTarget
                      onPress={() => speakWord(currentItem.displayWord || currentItem.expectedWord, learningLanguage)}
                      accessibilityLabel={`Listen to ${currentItem.displayWord || currentItem.expectedWord}`}
                      accessibilityRole="button"
                      style={styles.wordDisplayPill}
                    >
                      <Text style={styles.wordDisplayText}>
                        {currentItem.displayWord || currentItem.expectedWord} 🔊
                      </Text>
                    </BigTouchTarget>
                  ) : (
                    <View style={styles.mysteryWordPill}>
                      <Text style={styles.mysteryWordText}>
                        {isLetterMode
                          ? t('speechWordChallenge.mysterySayLetter')
                          : t('speechWordChallenge.mysteryWhatIsThis')}
                      </Text>
                    </View>
                  )}
                  {feedbackStatus === 'wrong' && currentItem.phoneticHint && (
                    <View style={styles.hintBadgePill}>
                      <Text style={styles.hintBadgeText}>💡 {currentItem.phoneticHint}</Text>
                    </View>
                  )}
                </View>
              )}
            </Animated.View>
          )}

          {/* 3. Speech Status Badge */}
          <View style={styles.speechBadgeContainer}>
            <SpeechFeedbackBadge
              recognizedText={recognizedText}
              status={feedbackStatus}
            />
          </View>

          {/* 4. Tactile Microphone Button Area */}
          <View style={styles.micControlContainer}>
            <StorybookMicrophoneButton
              state={micVisualState}
              onPress={handleMicToggle}
              disabled={roundLocked || roundState === 'answered' || roundState === 'processing'}
              accessibilityLabel={t('speechWordChallenge.microphoneHint')}
            />

            {micError && (
              <View style={styles.micErrorBanner}>
                <Text style={styles.micErrorText}>{micError}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 5. Leave Game Confirmation Modal */}
        <FriendlyModal
          visible={showExitModal}
          title={t('game.leaveGameTitle')}
          description={t('game.leaveGameDesc')}
          dismissText={t('game.keepPlaying')}
          onDismiss={() => setShowExitModal(false)}
        >
          <View style={styles.exitModalActions}>
            <BigTouchTarget
              onPress={() => setShowExitModal(false)}
              accessibilityLabel={t('game.keepPlaying')}
              accessibilityRole="button"
              style={styles.keepPlayingBtn}
            >
              <Text style={styles.keepPlayingBtnText}>{t('game.keepPlaying')}</Text>
            </BigTouchTarget>

            <BigTouchTarget
              onPress={handleConfirmQuit}
              accessibilityLabel={t('game.exitGame')}
              accessibilityRole="button"
              style={styles.quitGameBtn}
            >
              <Text style={styles.quitGameBtnText}>{t('game.exitGame')}</Text>
            </BigTouchTarget>
          </View>
        </FriendlyModal>

        {/* 6. Interactive Speech Report Modal */}
        <SpeechReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          attempts={sessionAttempts}
          totalRounds={ROUND_COUNT}
        />
      </SafeAreaView>
    </View>
  );
});

GameScreen.displayName = 'GameScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#1B2B5A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'transparent',
  },

  /* Top Header Container */
  topHeaderContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.header.topBarNavy,
    paddingHorizontal: 12,
    width: '100%',
    zIndex: 20,
  },
  redExitButton: {
    width: 46,
    height: 46,
    minWidth: 46,
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: Colors.header.exitRed,
    borderColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  redExitButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  starTrailPill: {
    backgroundColor: Colors.header.starPillNavy,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: Colors.header.starPillBorder,
    borderWidth: 2,
    flexShrink: 1,
  },
  accuracyPill: {
    backgroundColor: Colors.header.starPillNavy,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderColor: Colors.accent.amber,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accuracyPillText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#FDE047',
  },

  /* Main Body Content */
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },

  /* Top Instruction Cue Card */
  targetBanner: {
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  audioCueCard: {
    width: '100%',
    minHeight: 80,
    borderRadius: 24,
    backgroundColor: Colors.instructionCard.bg,
    borderColor: Colors.instructionCard.border,
    borderWidth: 3.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    shadowColor: Colors.instructionCard.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  speakerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.instructionCard.speakerBg,
    borderColor: Colors.instructionCard.speakerBorder,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  audioSpeakerIcon: {
    fontSize: 24,
  },
  audioCueText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: Colors.instructionCard.text,
    flex: 1,
  },

  /* Hero Challenge Card */
  heroCardContainer: {
    width: '92%',
    maxWidth: 340,
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 4,
    borderColor: '#E0F2FE',
    borderBottomWidth: 7,
    borderBottomColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeaderGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  letterContentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroLetterGlyph: {
    fontFamily: Typography.fonts.bold,
    fontSize: 88,
    color: '#0284C7',
    lineHeight: 100,
    textShadowColor: 'rgba(2, 132, 199, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  associatedTagPill: {
    position: 'absolute',
    bottom: -6,
    right: -30,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  associatedTagEmoji: {
    fontSize: 24,
  },
  wordContentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroImageIllustration: {
    fontSize: 88,
  },
  wordDisplayPill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderWidth: 2.5,
    borderColor: '#BAE6FD',
    marginTop: 2,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  wordDisplayText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 26,
    color: '#0369A1',
    textAlign: 'center',
  },
  mysteryWordPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  mysteryWordText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 20,
    color: '#64748B',
  },
  hintBadgePill: {
    backgroundColor: '#FEF9C3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#FDE047',
  },
  hintBadgeText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#854D0E',
  },

  /* Speech Status Feedback Badge */
  speechBadgeContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },

  /* Microphone Control Section */
  micControlContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  micErrorBanner: {
    marginTop: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  micErrorText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#B91C1C',
  },

  /* Exit Confirmation Modal */
  exitModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    width: '100%',
  },
  keepPlayingBtn: {
    flex: 1,
    height: 50,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepPlayingBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#334155',
  },
  quitGameBtn: {
    flex: 1,
    height: 50,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quitGameBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
