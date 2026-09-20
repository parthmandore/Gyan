/**
 * Purpose: Primary 5-round gameplay screen for Letter Tracing / Handwriting Practice.
 *          - Age 5: Guided dotted stroke tracing.
 *          - Age 6: Partial guidance with faint paths & anchor dots.
 *          - Age 7: Freehand writing with notebook guidelines.
 * Module: Letter Tracing — Screens
 * Folder: frontend/src/screens/games/LetterTracing
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
  TouchableOpacity,
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
import { DrawingCanvas } from './components/DrawingCanvas';

import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { useLetterTracingStore } from './store/useLetterTracingStore';
import { generateTracingRounds, TOTAL_TRACING_ROUNDS } from './logic/roundGenerator';
import { evaluateTracing } from './logic/accuracyEvaluator';
import { LetterRound } from './types';
import { xpService } from '../../../services/xpService';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Games'>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

  // Store state
  const roundIndex = useLetterTracingStore((s) => s.roundIndex);
  const rounds = useLetterTracingStore((s) => s.rounds);
  const score = useLetterTracingStore((s) => s.score);
  const itemsCorrect = useLetterTracingStore((s) => s.itemsCorrect);
  const currentStrokes = useLetterTracingStore((s) => s.currentStrokes);
  const sessionStartTime = useLetterTracingStore((s) => s.sessionStartTime);
  const startSession = useLetterTracingStore((s) => s.startSession);
  const setCurrentStrokes = useLetterTracingStore((s) => s.setCurrentStrokes);
  const undoLastStroke = useLetterTracingStore((s) => s.undoLastStroke);
  const clearCurrentStrokes = useLetterTracingStore((s) => s.clearCurrentStrokes);
  const recordAttempt = useLetterTracingStore((s) => s.recordAttempt);
  const nextRound = useLetterTracingStore((s) => s.nextRound);
  const resetSession = useLetterTracingStore((s) => s.resetSession);

  // Local state
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionId] = useState(() => `trace_${Date.now()}`);
  const [attemptNum, setAttemptNum] = useState<1 | 2>(1);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const isSessionFinishedRef = useRef(false);

  const canvasWidthRef = useRef(0);
  const canvasHeightRef = useRef(0);

  // Initialize session rounds
  useEffect(() => {
    const newRounds = generateTracingRounds(selectedAge, learningLanguage);
    startSession(newRounds);

    const unsubscribe = navigation.addListener('beforeRemove', () => {
      stopSpeech();
    });

    return () => {
      stopSpeech();
      unsubscribe();
    };
  }, [selectedAge, learningLanguage, startSession, navigation]);

  const currentRound: LetterRound | undefined = rounds[roundIndex];

  // Speak letter pronunciation on round load
  useEffect(() => {
    if (currentRound) {
      setFeedbackMessage(null);
      setAttemptNum(1);
      setShowCorrectionModal(false);
      speakPhrase(currentRound.letter.displayChar, { language: learningLanguage });
    }
  }, [currentRound, learningLanguage, roundIndex]);

  const handleCanvasLayout = useCallback((w: number, h: number) => {
    canvasWidthRef.current = w;
    canvasHeightRef.current = h;
    setCanvasDimensions({ width: w, height: h });
  }, []);

  const handleHearLetter = () => {
    if (currentRound) {
      speakPhrase(currentRound.letter.displayChar, { language: learningLanguage });
    }
  };

  const finishSession = useCallback(
    async (finalCorrectCount: number, isTimeExpired = false) => {
      if (isSessionFinishedRef.current) return;
      isSessionFinishedRef.current = true;
      setIsEvaluating(true);
      stopSpeech();

      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const accuracy = Math.round((finalCorrectCount / TOTAL_TRACING_ROUNDS) * 100);

      const xpResult = await xpService.recordSessionCompletionXP({
        sessionId,
        gameId: 'letter_tracing',
        age: selectedAge,
        motherTongue,
        learningLanguage,
        totalQuestions: TOTAL_TRACING_ROUNDS,
        correctAnswers: finalCorrectCount,
        accuracy,
        durationSeconds,
      });

      navigation.navigate('Games', {
        screen: 'LetterTracingSessionComplete' as any,
        params: {
          starsEarned: xpResult.starsEarned,
          xpEarned: xpResult.totalSessionXp,
          itemsCorrect: finalCorrectCount,
          sessionLength: TOTAL_TRACING_ROUNDS,
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

  const handleCheck = async () => {
    if (!currentRound || isEvaluating) return;

    const width = canvasWidthRef.current || canvasDimensions.width;
    const height = canvasHeightRef.current || canvasDimensions.height;

    const result = evaluateTracing(
      currentStrokes,
      currentRound.letter,
      selectedAge,
      width,
      height
    );

    if (result.isSuccess) {
      setIsEvaluating(true);
      triggerHapticSuccess();
      setShowCelebration(true);
      setFeedbackMessage(t(result.feedbackKey, 'Great job! Beautiful handwriting! 🎉'));

      // Award XP via centralized xpService (15 XP for try 1, 10 XP for retry)
      await xpService.recordAnswerXP({
        sessionId,
        roundIndex,
        attemptNum,
        isCorrect: true,
        gameId: 'letter_tracing',
      });

      recordAttempt({
        roundIndex,
        letterId: currentRound.letter.id,
        strokes: currentStrokes,
        score: result.score,
        isSuccess: true,
      });

      speakPraise(learningLanguage);

      const finalCorrectCount = itemsCorrect + 1;

      setTimeout(async () => {
        setShowCelebration(false);
        setIsEvaluating(false);

        if (roundIndex + 1 >= TOTAL_TRACING_ROUNDS) {
          finishSession(finalCorrectCount);
        } else {
          nextRound();
        }
      }, 1400);
    } else {
      triggerHapticWarning();

      if (currentStrokes.length === 0) {
        setFeedbackMessage(
          t(result.feedbackKey, 'Draw the letter on the canvas first! ✏️')
        );
        return;
      }

      if (attemptNum === 1) {
        // Attempt 1: Educational correction popup + allow retry
        setShowCorrectionModal(true);
        setAttemptNum(2);
      } else {
        // Attempt 2: Mark wrong (0 XP) and advance
        recordAttempt({
          roundIndex,
          letterId: currentRound.letter.id,
          strokes: currentStrokes,
          score: result.score,
          isSuccess: false,
        });

        await xpService.recordAnswerXP({
          sessionId,
          roundIndex,
          attemptNum: 2,
          isCorrect: false,
          gameId: 'letter_tracing',
        });

        setTimeout(async () => {
          if (roundIndex + 1 >= TOTAL_TRACING_ROUNDS) {
            finishSession(itemsCorrect);
          } else {
            nextRound();
          }
        }, 1400);
      }
    }
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    if (roundIndex > 0 || itemsCorrect > 0) {
      finishSession(itemsCorrect, false);
    } else {
      resetSession();
      navigation.goBack();
    }
  };

  if (!currentRound) {
    return (
      <View style={styles.outerContainer}>
        <CartoonBackground theme="art" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Letter Tracing...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Calculate dynamic canvas height to fit nicely on any device
  const canvasHeight = Math.min(340, Math.max(260, screenHeight * 0.38));
  const containerWidth = Math.min(screenWidth - 32, 480);

  return (
    <View style={styles.outerContainer}>
      <CartoonBackground theme="art" />
      <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={[styles.headerBar, { width: containerWidth }]}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel="Exit game"
            style={styles.exitButton}
          >
            <Text style={styles.exitButtonText}>✕</Text>
          </BigTouchTarget>

          {/* Session Timer */}
          <SessionCountdownTimer
            initialSeconds={90}
            onTimeExpired={handleTimeExpired}
            isPaused={showCorrectionModal || showCelebration || showExitModal}
          />

          <View style={styles.progressWrapper}>
            <ProgressStarTrail
              current={roundIndex}
              total={TOTAL_TRACING_ROUNDS}
            />
          </View>

          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>⭐ {score} XP</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Target Letter Prompt Card */}
          <View style={[styles.targetCard, { width: containerWidth }]}>
            <View style={styles.targetHeaderRow}>
              <Text style={styles.targetPromptText}>
                {selectedAge === 7
                  ? t('letterTracing.writePrompt', 'Write this letter:')
                  : t('letterTracing.tracePrompt', 'Trace this letter:')}
              </Text>
              <TouchableOpacity
                style={styles.speakerBtn}
                onPress={handleHearLetter}
                accessibilityLabel="Hear pronunciation"
              >
                <Text style={styles.speakerIcon}>🔊</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.charDisplayRow}>
              <Text style={styles.targetChar}>{currentRound.letter.displayChar}</Text>
              <View style={styles.charDetails}>
                <Text style={styles.charName}>{currentRound.letter.name}</Text>
                <Text style={styles.charHint}>"{currentRound.letter.phoneticHint}"</Text>
              </View>
            </View>
          </View>

          {/* Feedback Message Toast */}
          {feedbackMessage && (
            <View style={[styles.feedbackBanner, { width: containerWidth }]}>
              <Text style={styles.feedbackText}>{feedbackMessage}</Text>
            </View>
          )}

          {/* Touch Drawing Canvas */}
          <View style={[styles.canvasWrapper, { width: containerWidth, height: canvasHeight }]}>
            <DrawingCanvas
              letter={currentRound.letter}
              age={selectedAge}
              strokes={currentStrokes}
              onStrokesChange={setCurrentStrokes}
              onCanvasLayout={handleCanvasLayout}
              disabled={isEvaluating}
            />
          </View>

          {/* Canvas Actions Toolbar */}
          <View style={[styles.toolbarRow, { width: containerWidth }]}>
            {/* Undo */}
            <TouchableOpacity
              style={[
                styles.toolBtn,
                styles.undoBtn,
                currentStrokes.length === 0 && styles.toolBtnDisabled,
              ]}
              onPress={undoLastStroke}
              disabled={currentStrokes.length === 0 || isEvaluating}
              accessibilityLabel="Undo last stroke"
            >
              <Text style={styles.toolIcon}>↶</Text>
              <Text style={styles.toolLabel}>{t('letterTracing.undo', 'Undo')}</Text>
            </TouchableOpacity>

            {/* Clear */}
            <TouchableOpacity
              style={[
                styles.toolBtn,
                styles.clearBtn,
                currentStrokes.length === 0 && styles.toolBtnDisabled,
              ]}
              onPress={clearCurrentStrokes}
              disabled={currentStrokes.length === 0 || isEvaluating}
              accessibilityLabel="Clear drawing"
            >
              <Text style={styles.toolIcon}>🗑️</Text>
              <Text style={styles.toolLabel}>{t('letterTracing.clear', 'Clear')}</Text>
            </TouchableOpacity>

            {/* Check */}
            <TouchableOpacity
              style={[styles.toolBtn, styles.checkBtn, isEvaluating && styles.toolBtnDisabled]}
              onPress={handleCheck}
              disabled={isEvaluating}
              accessibilityLabel="Check drawing"
            >
              <Text style={[styles.toolIcon, styles.checkIcon]}>✓</Text>
              <Text style={[styles.toolLabel, styles.checkLabel]}>
                {t('letterTracing.check', 'Check')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Exit Confirmation Modal */}
      <FriendlyModal
        visible={showExitModal}
        title="Quit Practice?"
        onDismiss={() => setShowExitModal(false)}
      >
        <Text style={styles.exitModalText}>
          Are you sure you want to leave? Your progress in this session will not be saved.
        </Text>
        <View style={styles.exitModalActions}>
          <BigTouchTarget
            onPress={() => setShowExitModal(false)}
            accessibilityLabel="Keep Tracing"
            style={styles.keepTracingBtn}
          >
            <Text style={styles.keepTracingBtnText}>Keep Tracing</Text>
          </BigTouchTarget>
          <BigTouchTarget
            onPress={handleExitConfirm}
            accessibilityLabel="Quit Game"
            style={styles.quitGameBtn}
          >
            <Text style={styles.quitGameBtnText}>Quit Game</Text>
          </BigTouchTarget>
        </View>
      </FriendlyModal>

      {/* Celebration Overlay on Success */}
      <CelebrationOverlay visible={showCelebration} />

      {/* Educational Correction Modal (Attempt 1 Wrong) */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetValue={currentRound.letter.displayChar}
        explanation={t('letterTracing.followGuide', 'Trace smoothly following the guide dots! 🌱')}
        onDismiss={() => {
          setShowCorrectionModal(false);
          clearCurrentStrokes();
        }}
      />
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
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    alignSelf: 'center',
  },
  exitButton: {
    backgroundColor: '#FEE2E2',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#DC2626',
  },
  progressWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  scorePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FCD34D',
  },
  scorePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  targetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  targetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  targetPromptText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  speakerBtn: {
    backgroundColor: '#EFF6FF',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  speakerIcon: {
    fontSize: 18,
  },
  charDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  targetChar: {
    fontSize: 52,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 60,
  },
  charDetails: {
    justifyContent: 'center',
  },
  charName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#334155',
  },
  charHint: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  feedbackBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
    textAlign: 'center',
  },
  canvasWrapper: {
    marginBottom: 14,
  },
  toolbarRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    gap: 6,
    elevation: 2,
  },
  toolBtnDisabled: {
    opacity: 0.4,
  },
  undoBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  clearBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  checkBtn: {
    flex: 1.4,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#059669',
  },
  toolIcon: {
    fontSize: 20,
    color: '#334155',
  },
  toolLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#334155',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  checkLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  exitModalText: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  exitModalActions: {
    gap: 12,
    width: '100%',
  },
  keepTracingBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepTracingBtnText: {
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
