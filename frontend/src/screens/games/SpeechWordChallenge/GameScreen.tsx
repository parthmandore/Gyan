/**
 * Purpose: Primary 10-round gameplay screen for Speech Word Challenge.
 *          Age 5: Letter Speech Challenge (Letter pronunciation)
 *          Age 6: Word Speech Challenge (Visual identification & pronunciation, expected word hidden)
 *          Interactive Speech Report Modal, complete quit cleanup, and storybook visuals.
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
import { SpeechReportModal } from './components/SpeechReportModal';
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
import { SpeechChallengeItem, SpeechRoundAttempt } from './types';
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
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

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
  const [attemptNum, setAttemptNum] = useState(1);
  const [roundLocked, setRoundLocked] = useState(false);
  const [currentPraiseText, setCurrentPraiseText] = useState<string>('');

  // Developer / Debug Mode mechanism
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

  // Initialize 10 random items based on language and age
  useEffect(() => {
    const items = getRandomizedRoundItems(selectedLanguage, selectedAge, ROUND_COUNT);
    setRoundsData(items);
  }, [selectedLanguage, selectedAge]);

  const currentItem = roundsData[roundIndex] || null;

  // Speak prompt on new round
  const speakCurrentItem = useCallback(() => {
    if (!currentItem) return;
    stopSpeech();
    if (selectedAge === 5) {
      // Age 5: Speak letter prompt
      speakPhrase(currentItem.spokenPrompt);
    } else {
      // Age 6: Speak question instruction without giving away the word!
      const questionPrompt =
        selectedLanguage === 'hi'
          ? 'यह क्या है? शब्द बोलो।'
          : selectedLanguage === 'mr'
          ? 'हे काय आहे? शब्द बोला.'
          : 'What is this? Say the word.';
      speakPhrase(questionPrompt);
    }
  }, [currentItem, selectedAge, selectedLanguage]);

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
    cancelRecording();
    stopSpeech();

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
  }, [sessionStartTime, itemsAttempted, itemsCorrect, navigation, cancelRecording]);

  // Handle Quit from exit modal
  const handleConfirmQuit = () => {
    cancelRecording();
    stopSpeech();
    setShowExitModal(false);

    if (itemsAttempted > 0) {
      // Finalize and show speech report
      handleSessionEnd();
    } else {
      navigation.navigate('GameCatalog');
    }
  };

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

    // 1. Technical / Network Failure
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

    // 2. Empty / Silent Audio
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

    // Record session attempt detail
    const attemptRecord: SpeechRoundAttempt = {
      roundNumber: roundIndex + 1,
      expectedAnswer: currentItem.expectedWord,
      displayLabel: currentItem.displayLetter || currentItem.displayWord,
      image: currentItem.image,
      recognizedAnswer: spokenText,
      isCorrect: match.isCorrect,
      language: selectedLanguage,
      age: selectedAge,
      timestamp: Date.now(),
      attemptCount: attemptNum,
      durationSeconds: recordingDurationSec,
    };
    recordDetailedAttempt(attemptRecord);

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
      // === INCORRECT ANSWER ===
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
        setAttemptNum(2);
        recordAnswer(spokenText, false);
        speakPhrase(t('speechWordChallenge.almostTryAgain'));
      } else {
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

  // Developer / Debug Mode Handler
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
  const instructionPrompt =
    selectedAge === 5
      ? t('speechWordChallenge.sayTheLetter')
      : t('speechWordChallenge.whatIsThis');

  const containerWidth = Math.min(screenWidth - 32, 420);
  const currentAccuracy =
    itemsAttempted > 0 ? Math.round((itemsCorrect / itemsAttempted) * 100) : 100;

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

        {/* 2. Top Header Row with Exit button, Star Progress, and Interactive Accuracy Pill */}
        <View style={[styles.headerRow, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel={t('game.exitGame')}
            accessibilityHint={t('accessibility.exitGameHint')}
            accessibilityRole="button"
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </BigTouchTarget>

          <Pressable
            onPress={handleHeaderTap}
            style={styles.progressWrapper}
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
          </Pressable>

          {/* Interactive Accuracy Pill — Opens Detailed Speech Report */}
          <BigTouchTarget
            onPress={() => setShowReportModal(true)}
            accessibilityLabel={`Accuracy ${currentAccuracy}%, tap to view report`}
            accessibilityRole="button"
            style={styles.accuracyPill}
          >
            <Text style={styles.accuracyPillText}>🎯 {currentAccuracy}%</Text>
          </BigTouchTarget>
        </View>

        {/* Developer / Debug Mode Overlay */}
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
                age={selectedAge}
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
                onPress={handleMicToggle}
                disabled={roundLocked || isProcessing}
                accessibilityLabel={t('speechWordChallenge.microphoneHint')}
              />

              {/* Mic Error Banner if any */}
              {micError && (
                <View style={styles.micErrorBanner}>
                  <Text style={styles.micErrorText}>{micError}</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* 7. Leave Game Confirmation Modal with CLEAN quit & cleanup */}
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

        {/* 8. Interactive Speech Report Modal */}
        <SpeechReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          attempts={sessionAttempts}
          totalRounds={ROUND_COUNT}
        />

        {/* 9. Developer STT Diagnostics Modal */}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 10,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  exitButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#64748B',
  },
  progressWrapper: {
    flex: 1,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  accuracyPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderBottomWidth: 3,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  accuracyPillText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#0F172A',
  },
  devDebugPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
    zIndex: 12,
  },
  devDebugText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 11,
    color: '#38BDF8',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  gamePlayContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  micErrorBanner: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
  },
  micErrorText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 12,
    color: '#991B1B',
  },
  exitModalActions: {
    width: '100%',
    gap: 10,
    marginTop: 14,
  },
  keepPlayingBtn: {
    backgroundColor: '#10B981',
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: '#047857',
    paddingVertical: 12,
    alignItems: 'center',
  },
  keepPlayingBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  quitGameBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 18,
    borderBottomWidth: 4,
    borderBottomColor: '#B91C1C',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quitGameBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
