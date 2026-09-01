/**
 * Purpose: Primary 10-round gameplay screen for Speech Word Challenge set in a
 *          rich Storybook Garden world with child-friendly educational UX,
 *          dynamic praise rotation, localized prompts, developer debug toggle,
 *          and complete accessibility support.
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
  ScrollView,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { StorybookGardenBackground } from './components/StorybookGardenBackground';
import { StorybookGameCard } from './components/StorybookGameCard';
import { StorybookMicrophoneButton, MicButtonVisualState } from './components/StorybookMicrophoneButton';
import { SpeechFeedbackBadge } from './components/SpeechFeedbackBadge';
import { WaveformAnimation } from './components/WaveformAnimation';
import { SpeechDiagnosticsModal } from './components/SpeechDiagnosticsModal';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { Typography } from '../../../theme/typography';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useSpeechWordChallengeStore } from './store/speechWordChallengeStore';
import { useSpeechDiagnosticsStore } from './store/speechDiagnosticsStore';
import { getRandomizedRoundItems } from './datasets';
import { SpeechChallengeItem } from './types';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { transcribeAudio } from '../../../services/sttService';
import { isAnswerCorrect } from './utils/speechAnswerMatcher';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { RootStackParamList } from '../../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

const ROUND_COUNT = 10;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const selectedLanguage = useAppLanguageStore((s) => s.selectedLanguage) || 'en';

  // Store state
  const roundIndex = useSpeechWordChallengeStore((s) => s.roundIndex);
  const score = useSpeechWordChallengeStore((s) => s.score);
  const roundResults = useSpeechWordChallengeStore((s) => s.roundResults);
  const itemsAttempted = useSpeechWordChallengeStore((s) => s.itemsAttempted);
  const itemsCorrect = useSpeechWordChallengeStore((s) => s.itemsCorrect);
  const sessionStartTime = useSpeechWordChallengeStore((s) => s.sessionStartTime);
  const recordAnswer = useSpeechWordChallengeStore((s) => s.recordAnswer);
  const recordEmptyAttempt = useSpeechWordChallengeStore((s) => s.recordEmptyAttempt);
  const nextRound = useSpeechWordChallengeStore((s) => s.nextRound);

  // Local state
  const [roundsData, setRoundsData] = useState<SpeechChallengeItem[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<
    'correct' | 'wrong' | 'empty' | 'listening' | 'transcribing' | 'technical' | null
  >(null);
  const [attemptNum, setAttemptNum] = useState(1);
  const [roundLocked, setRoundLocked] = useState(false);
  const [currentPraiseText, setCurrentPraiseText] = useState<string>('');

  // Developer / Debug Mode mechanism (hidden in normal child mode)
  const [showDevDebug, setShowDevDebug] = useState(false);
  const debugTapCountRef = useRef(0);
  const lastDebugTapTimeRef = useRef(0);

  const autoStopTimeoutRef = useRef<any>(null);

  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    error: micError,
  } = useAudioRecorder();

  // Initialize 10 random items
  useEffect(() => {
    const items = getRandomizedRoundItems(selectedLanguage, ROUND_COUNT);
    setRoundsData(items);
  }, [selectedLanguage]);

  const currentItem = roundsData[roundIndex] || null;

  // Speak prompt on new round
  const speakCurrentItem = useCallback(() => {
    if (!currentItem) return;
    stopSpeech();
    speakPhrase(currentItem.spokenPrompt);
  }, [currentItem]);

  useEffect(() => {
    if (currentItem && !showCelebration) {
      setRecognizedText(null);
      setFeedbackStatus(null);
      setAttemptNum(1);
      setRoundLocked(false);
      setCurrentPraiseText('');
      const timer = setTimeout(() => {
        speakCurrentItem();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [roundIndex, currentItem, speakCurrentItem, showCelebration]);

  // Navigate to session complete when all rounds finish
  const handleSessionEnd = useCallback(() => {
    const durationSec = sessionStartTime
      ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000))
      : 30;
    const accuracy =
      itemsAttempted > 0 ? Math.round((itemsCorrect / itemsAttempted) * 100) : 0;
    const starsEarned = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;
    const xpEarned = itemsCorrect * 10;

    navigation.navigate('Games', {
      screen: 'SpeechWordChallengeSessionComplete' as any,
      params: {
        starsEarned,
        xpEarned,
        itemsCorrect,
        sessionLength: ROUND_COUNT,
        accuracy,
        durationSeconds: durationSec,
      },
    });
  }, [sessionStartTime, itemsAttempted, itemsCorrect, navigation]);

  // Handle Mic Press
  const recordAttemptDiagnostic = useSpeechDiagnosticsStore((s) => s.recordAttemptDiagnostic);
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const recordingStartTimeRef = useRef<number>(0);

  const handleMicToggle = async () => {
    if (roundLocked || isProcessing) return;

    if (!isRecording) {
      // Start Recording
      setFeedbackStatus('listening');
      recordingStartTimeRef.current = Date.now();
      const success = await startRecording();
      if (success) {
        // Auto-stop after 3.5 seconds
        autoStopTimeoutRef.current = setTimeout(async () => {
          await handleStopAndEvaluate();
        }, 3500);
      }
    } else {
      // Manually stop recording
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }
      await handleStopAndEvaluate();
    }
  };

  // Rotate praise variations
  const getRandomPraise = useCallback(() => {
    const praiseKeys = ['praise1', 'praise2', 'praise3', 'praise4'];
    const randomKey = praiseKeys[Math.floor(Math.random() * praiseKeys.length)];
    return t(`speechWordChallenge.${randomKey}`);
  }, [t]);

  const handleStopAndEvaluate = async () => {
    setIsProcessing(true);
    setFeedbackStatus('transcribing');

    const recordingDurationSec = recordingStartTimeRef.current > 0
      ? (Date.now() - recordingStartTimeRef.current) / 1000
      : 0;

    const audioData = await stopRecording();
    if (!audioData) {
      setIsProcessing(false);
      setFeedbackStatus('empty');
      if (currentItem) {
        recordAttemptDiagnostic({
          expectedWord: currentItem.expectedWord,
          recognizedText: '',
          selectedLanguage: selectedLanguage as 'en' | 'hi' | 'mr',
          languageReturned: selectedLanguage,
          recordingDurationSec,
          apiLatencyMs: 0,
          result: 'EMPTY',
        });
      }
      return;
    }

    // Call Speech-to-Text API
    const result = await transcribeAudio(
      audioData,
      selectedLanguage as 'en' | 'hi' | 'mr'
    );

    setIsProcessing(false);

    // 1. Technical / Network Failure (connection refused, timeout, server error)
    if (!result.success) {
      console.warn(`[SpeechWordChallenge] STT Technical Failure (${result.error_type}):`, result.error);
      setFeedbackStatus('technical');
      speakPhrase(t('speechWordChallenge.technicalIssue'));
      if (currentItem) {
        recordAttemptDiagnostic({
          expectedWord: currentItem.expectedWord,
          recognizedText: '',
          selectedLanguage: selectedLanguage as 'en' | 'hi' | 'mr',
          languageReturned: result.language_used || selectedLanguage,
          recordingDurationSec,
          apiLatencyMs: result.latency_ms || 0,
          result: 'API_ERROR',
          errorMessage: result.error,
        });
      }
      return;
    }

    // 2. Empty / Silent Audio (no speech detected)
    if (result.is_empty || !result.recognized_text.trim()) {
      setFeedbackStatus('empty');
      setRecognizedText(null);
      recordEmptyAttempt();
      speakPhrase(t('speechWordChallenge.noSpeech'));
      if (currentItem) {
        recordAttemptDiagnostic({
          expectedWord: currentItem.expectedWord,
          recognizedText: '',
          selectedLanguage: selectedLanguage as 'en' | 'hi' | 'mr',
          languageReturned: result.language_used || selectedLanguage,
          recordingDurationSec,
          apiLatencyMs: result.latency_ms || 0,
          result: 'EMPTY',
        });
      }
      return;
    }

    const spokenText = result.recognized_text.trim();
    setRecognizedText(spokenText);

    if (!currentItem) return;

    // Evaluate answer
    const match = isAnswerCorrect(spokenText, currentItem);

    if (match.isCorrect) {
      // === CORRECT ANSWER ===
      const praise = getRandomPraise();
      setCurrentPraiseText(praise);
      setFeedbackStatus('correct');
      setRoundLocked(true);
      recordAnswer(spokenText, true);
      setShowCelebration(true);
      speakPraise();

      recordAttemptDiagnostic({
        expectedWord: currentItem.expectedWord,
        recognizedText: spokenText,
        selectedLanguage: selectedLanguage as 'en' | 'hi' | 'mr',
        languageReturned: result.language_used || selectedLanguage,
        recordingDurationSec,
        apiLatencyMs: result.latency_ms || 0,
        result: 'CORRECT',
      });

      setTimeout(() => {
        setShowCelebration(false);
        if (roundIndex + 1 >= ROUND_COUNT) {
          handleSessionEnd();
        } else {
          nextRound();
        }
      }, 2500);
    } else {
      // === INCORRECT ANSWER (Encouraging, Never Shaming) ===
      setFeedbackStatus('wrong');

      recordAttemptDiagnostic({
        expectedWord: currentItem.expectedWord,
        recognizedText: spokenText,
        selectedLanguage: selectedLanguage as 'en' | 'hi' | 'mr',
        languageReturned: result.language_used || selectedLanguage,
        recordingDurationSec,
        apiLatencyMs: result.latency_ms || 0,
        result: 'INCORRECT',
      });

      if (attemptNum === 1) {
        // Allow attempt 2 with prompt hint
        setAttemptNum(2);
        recordAnswer(spokenText, false);
        speakPhrase(t('speechWordChallenge.almostTryAgain'));
      } else {
        // Second wrong attempt: record red star and advance
        setRoundLocked(true);
        recordAnswer(spokenText, false);
        setTimeout(() => {
          if (roundIndex + 1 >= ROUND_COUNT) {
            handleSessionEnd();
          } else {
            nextRound();
          }
        }, 2800);
      }
    }
  };

  const handleExitGame = () => {
    cancelRecording();
    stopSpeech();
    setShowExitModal(false);
    navigation.navigate('GameCatalog');
  };

  // Developer / Debug Mode Triple-Tap Handler on Header
  const handleHeaderTap = () => {
    const now = Date.now();
    if (now - lastDebugTapTimeRef.current < 500) {
      debugTapCountRef.current += 1;
      if (debugTapCountRef.current >= 3) {
        setShowDevDebug((prev) => !prev);
        debugTapCountRef.current = 0;
      }
    } else {
      debugTapCountRef.current = 1;
    }
    lastDebugTapTimeRef.current = now;
  };

  // Compute microphone button visual state
  const micVisualState: MicButtonVisualState = isRecording
    ? 'recording'
    : isProcessing
    ? 'processing'
    : feedbackStatus === 'correct'
    ? 'success'
    : feedbackStatus === 'wrong'
    ? 'retry'
    : 'idle';

  // Localized instruction for speech bubble
  const instructionPrompt = t('speechWordChallenge.sayTheWord');

  const containerWidth = Math.min(screenWidth - 32, 420);

  return (
    <View style={styles.webOuterContainer}>
      {/* 1. Living Storybook Garden Environment */}
      <StorybookGardenBackground />

      {/* Confetti celebration overlay on correct answer */}
      <CelebrationOverlay
        visible={showCelebration}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#7DD3FC" />

        {/* 2. Top Header Row with Exit button and Progress Star Trail */}
        <Pressable
          onPress={handleHeaderTap}
          style={[styles.headerRow, { width: containerWidth }]}
          accessibilityLabel={t('speechWordChallenge.progressLabel', {
            current: roundIndex + 1,
            total: ROUND_COUNT,
          })}
        >
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel={t('game.exitGame')}
            accessibilityHint={t('accessibility.exitGameHint')}
            accessibilityRole="button"
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </BigTouchTarget>

          <View style={styles.progressWrapper}>
            <ProgressStarTrail
              total={ROUND_COUNT}
              current={roundIndex + 1}
              roundResults={roundResults}
            />
          </View>
        </Pressable>

        {/* Developer / Debug Mode Overlay (Hidden in Normal Child Mode) */}
        {showDevDebug && currentItem && (
          <Pressable
            onPress={() => setShowDiagnosticsModal(true)}
            style={styles.devDebugPill}
            accessibilityRole="button"
            accessibilityLabel="Open Developer Diagnostics"
          >
            <Text style={styles.devDebugText}>
              ⚙️ {t('speechWordChallenge.debugExpected', { word: currentItem.expectedWord })} |{' '}
              {t('speechWordChallenge.debugHeard', { heard: recognizedText || '...' })} (Tap for Panel)
            </Text>
          </Pressable>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentItem && (
            <View style={[styles.gamePlayContainer, { width: containerWidth }]}>
              {/* 3. Hero Educational Storybook Game Card */}
              <StorybookGameCard
                item={currentItem}
                mascotState={showCelebration ? 'celebrating' : feedbackStatus === 'wrong' ? 'encouraging' : 'idle'}
                onReplayPrompt={speakCurrentItem}
                showHint={attemptNum > 1}
                instructionText={instructionPrompt}
              />

              {/* 4. Speech Feedback Status Pill */}
              <SpeechFeedbackBadge
                recognizedText={recognizedText}
                status={feedbackStatus}
              />

              {/* 5. Acoustic Waveform Visualizer */}
              {isRecording ? <WaveformAnimation /> : <View style={{ height: 28 }} />}

              {/* 6. Premium Storybook Microphone Button */}
              <StorybookMicrophoneButton
                state={micVisualState}
                disabled={roundLocked}
                onPress={handleMicToggle}
                accessibilityLabel={
                  isRecording
                    ? t('speechWordChallenge.micButtonRecording')
                    : isProcessing
                    ? t('speechWordChallenge.micButtonProcessing')
                    : t('speechWordChallenge.micButtonIdle')
                }
              />

              {/* 7. Action Guide Text */}
              <View style={styles.actionGuideWrapper}>
                <Text style={styles.actionGuideText}>
                  {isRecording
                    ? `🎙️ ${t('speechWordChallenge.listening')}`
                    : isProcessing
                    ? `⏳ ${t('speechWordChallenge.checking')}`
                    : feedbackStatus === 'technical'
                    ? `🔌 ${t('speechWordChallenge.technicalIssue')}`
                    : roundLocked
                    ? `⭐ ${currentPraiseText || t('speechWordChallenge.praise1')}`
                    : attemptNum > 1
                    ? `💡 ${t('speechWordChallenge.almostTryAgain')}`
                    : `🎙️ ${t('speechWordChallenge.tapMicPrompt')}`}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Friendly Leave Game Confirmation Modal */}
        <FriendlyModal
          visible={showExitModal}
          title={t('game.leaveGameTitle')}
          description={t('game.leaveGameDesc')}
          dismissText={t('game.keepPlaying')}
          onDismiss={() => setShowExitModal(false)}
        />

        {/* Development-Only Speech Diagnostics Test Panel */}
        <SpeechDiagnosticsModal
          visible={showDiagnosticsModal}
          onClose={() => setShowDiagnosticsModal(false)}
        />
      </SafeAreaView>
    </View>
  );
});

GameScreen.displayName = 'GameScreen';

const styles = StyleSheet.create({
  webOuterContainer: {
    flex: 1,
    backgroundColor: '#7DD3FC',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    maxHeight: 920,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  headerRow: {
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#BAE6FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    minHeight: 44,
    shadowColor: '#0369A1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  progressWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  devDebugPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  devDebugText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 11,
    color: '#FDE047',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
    alignItems: 'center',
  },
  gamePlayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGuideWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginTop: 4,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: 340,
  },
  actionGuideText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
  },
});
