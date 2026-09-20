/**
 * Purpose: Interactive gameplay screen for Put in Order (Age 5).
 *          Features 5 progressive ordering rounds, tap-to-place tray mechanics,
 *          tap-to-remove slots, automatic evaluation, XP integration, and clean exit lifecycle.
 * Module: Put in Order — Game Screen
 * Folder: frontend/src/screens/games/PutInOrder
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { SessionCountdownTimer } from '../../../components/SessionCountdownTimer';
import { EducationalCorrectionModal } from '../../../components/EducationalCorrectionModal';
import { OrderingStage } from './components/OrderingStage';
import { OrderItemTile } from './components/OrderItemTile';
import { usePutInOrderStore } from './store/usePutInOrderStore';
import {
  generateOrderSession,
  TOTAL_ORDER_ROUNDS,
} from './logic/orderGameGenerator';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import {
  triggerHapticSuccess,
  triggerHapticWarning,
  triggerHapticLightImpact,
} from '../../../services/hapticsService';
import { xpService } from '../../../services/xpService';
import { OrderItem, OrderQuestion, SupportedLanguage } from './types';
import { RootStackParamList } from '../../../types';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  const motherTongue = (useAppLanguageStore((s) => s.motherTongue) || 'en') as SupportedLanguage;
  const learningLanguage = (useAppLanguageStore((s) => s.learningLanguage) || 'en') as SupportedLanguage;
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 5;

  const {
    sessionId,
    rounds,
    roundIndex,
    itemsCorrect,
    score,
    roundResults,
    attempts,
    sessionStartTime,
    startSession,
    recordAttempt,
    nextRound,
    resetGame,
  } = usePutInOrderStore();

  const [placedItems, setPlacedItems] = useState<Array<OrderItem | null>>([]);
  const [evaluationStatus, setEvaluationStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [isRoundLocked, setIsRoundLocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [attemptCountInRound, setAttemptCountInRound] = useState(0);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionTarget, setCorrectionTarget] = useState('');
  const [correctionWrong, setCorrectionWrong] = useState('');
  const isSessionFinishedRef = useRef(false);

  const transitionTimerRef = useRef<any>(null);
  const roundStartTimeRef = useRef<number>(Date.now());
  const isNavigatingAwayRef = useRef(false);

  // Initialize 10 progressive rounds on mount
  useEffect(() => {
    const sessionRounds = generateOrderSession(learningLanguage);
    startSession(sessionRounds);
    roundStartTimeRef.current = Date.now();

    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      stopSpeech();
    };
  }, [startSession, learningLanguage]);

  const currentRound: OrderQuestion | undefined = rounds[roundIndex];

  // Speak prompt on round change
  const speakCurrentPrompt = useCallback(() => {
    if (!currentRound) return;
    const spoken =
      currentRound.spokenPrompt[learningLanguage] ||
      currentRound.spokenPrompt[motherTongue] ||
      currentRound.spokenPrompt.en;

    speakPhrase(spoken, { language: learningLanguage });
  }, [currentRound, learningLanguage, motherTongue]);

  // Reset round state when roundIndex changes
  useEffect(() => {
    if (!currentRound) return;

    setPlacedItems(new Array(currentRound.items.length).fill(null));
    setEvaluationStatus('idle');
    setIsRoundLocked(false);
    setShowCelebration(false);
    setAttemptCountInRound(0);
    setShowCorrectionModal(false);
    setCorrectionTarget('');
    setCorrectionWrong('');
    roundStartTimeRef.current = Date.now();

    const speechTimeout = setTimeout(() => {
      speakCurrentPrompt();
    }, 450);

    return () => {
      clearTimeout(speechTimeout);
      stopSpeech();
    };
  }, [roundIndex, currentRound, speakCurrentPrompt]);

  const finishSession = useCallback(
    async (finalCorrect: number, isTimeExpired = false) => {
      if (isSessionFinishedRef.current) return;
      isSessionFinishedRef.current = true;
      isNavigatingAwayRef.current = true;
      setIsRoundLocked(true);
      stopSpeech();

      const durationSeconds = Math.max(
        1,
        Math.round((Date.now() - sessionStartTime) / 1000)
      );

      let earnedXp = 0;
      try {
        const accuracy = Math.round((finalCorrect / TOTAL_ORDER_ROUNDS) * 100);
        const xpResult = await xpService.recordSessionCompletionXP({
          sessionId,
          gameId: 'put_in_order',
          age: selectedAge,
          motherTongue,
          learningLanguage,
          totalQuestions: TOTAL_ORDER_ROUNDS,
          correctAnswers: finalCorrect,
          accuracy,
          durationSeconds,
        });
        earnedXp = xpResult?.totalSessionXp || finalCorrect * 15;
      } catch {
        earnedXp = finalCorrect * 15;
      }

      navigation.navigate('Games', {
        screen: 'PutInOrderSessionComplete' as any,
        params: {
          score: finalCorrect * 10,
          totalQuestions: TOTAL_ORDER_ROUNDS,
          correctAnswers: finalCorrect,
          xpEarned: earnedXp,
          durationSeconds,
          isTimeExpired,
        },
      });
    },
    [sessionId, selectedAge, motherTongue, learningLanguage, sessionStartTime, navigation]
  );

  const handleTimeExpired = useCallback(() => {
    finishSession(itemsCorrect, true);
  }, [finishSession, itemsCorrect]);

  // Handle tap from Available Items Tray
  const handleTapTrayItem = useCallback(
    async (item: OrderItem) => {
      if (isRoundLocked || !currentRound || evaluationStatus !== 'idle') return;

      // Find first empty slot
      const emptySlotIdx = placedItems.findIndex((x) => x === null);
      if (emptySlotIdx === -1) return; // All slots full

      triggerHapticLightImpact();

      const newPlaced = [...placedItems];
      newPlaced[emptySlotIdx] = item;
      setPlacedItems(newPlaced);

      // Check if all slots are now filled
      const isComplete = newPlaced.every((x) => x !== null);
      if (isComplete) {
        setIsRoundLocked(true);
        const timeTakenMs = Date.now() - roundStartTimeRef.current;
        const currentAttempts = attemptCountInRound + 1;
        setAttemptCountInRound(currentAttempts);

        const isCorrect = newPlaced.every((placed, idx) => placed?.orderIndex === idx);

        if (isCorrect) {
          setEvaluationStatus('correct');
          triggerHapticSuccess();
          setShowCelebration(true);
          speakPraise(learningLanguage);

          // Record real-time answer XP (15 XP for try 1, 10 XP for retry)
          try {
            await xpService.recordAnswerXP({
              sessionId,
              roundIndex,
              attemptNum: currentAttempts,
              isCorrect: true,
              gameId: 'put_in_order',
              metadata: {
                type: currentRound.type,
                itemsCount: currentRound.items.length,
              },
            });
          } catch {
            // Ignore
          }

          recordAttempt({
            roundIndex,
            questionId: currentRound.id,
            placedIds: newPlaced.map((x) => x!.id),
            correctIds: currentRound.items.map((x) => x.id),
            isCorrect: true,
            timeTakenMs,
          });

          const newCorrect = itemsCorrect + 1;

          // Transition to next round or finish session
          transitionTimerRef.current = setTimeout(async () => {
            setShowCelebration(false);

            if (roundIndex + 1 >= TOTAL_ORDER_ROUNDS) {
              finishSession(newCorrect);
            } else {
              nextRound();
            }
          }, 1400);
        } else {
          // --- WRONG SEQUENCE ---
          setEvaluationStatus('wrong');
          triggerHapticWarning();

          recordAttempt({
            roundIndex,
            questionId: currentRound.id,
            placedIds: newPlaced.map((x) => x!.id),
            correctIds: currentRound.items.map((x) => x.id),
            isCorrect: false,
            timeTakenMs,
          });

          if (currentAttempts === 1) {
            // Attempt 1: Educational correction popup + allow retry
            const correctStr = currentRound.items.map((x) => x.display).join('  ');
            const wrongStr = newPlaced.map((x) => x?.display || '').join('  ');
            setCorrectionTarget(correctStr);
            setCorrectionWrong(wrongStr);
            setShowCorrectionModal(true);
          } else {
            // Attempt 2: Mark wrong (0 XP) and advance
            try {
              await xpService.recordAnswerXP({
                sessionId,
                roundIndex,
                attemptNum: 2,
                isCorrect: false,
                gameId: 'put_in_order',
                metadata: {
                  type: currentRound.type,
                  itemsCount: currentRound.items.length,
                },
              });
            } catch {
              // Ignore
            }

            transitionTimerRef.current = setTimeout(() => {
              if (roundIndex + 1 >= TOTAL_ORDER_ROUNDS) {
                finishSession(itemsCorrect);
              } else {
                nextRound();
              }
            }, 1400);
          }
        }
      }
    },
    [
      isRoundLocked,
      currentRound,
      placedItems,
      evaluationStatus,
      attemptCountInRound,
      learningLanguage,
      roundIndex,
      itemsCorrect,
      recordAttempt,
      nextRound,
      finishSession,
      sessionId,
    ]
  );

  // Handle tap placed slot to remove and return to tray
  const handleTapSlot = useCallback(
    (slotIndex: number) => {
      if (isRoundLocked || evaluationStatus !== 'idle') return;
      triggerHapticLightImpact();
      setPlacedItems((prev) => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
    },
    [isRoundLocked, evaluationStatus]
  );

  // Handle Reset All Slots
  const handleClearAll = useCallback(() => {
    if (isRoundLocked || evaluationStatus !== 'idle' || !currentRound) return;
    triggerHapticLightImpact();
    setPlacedItems(new Array(currentRound.items.length).fill(null));
  }, [isRoundLocked, evaluationStatus, currentRound]);

  // Clean Navigation Exit Guard
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isNavigatingAwayRef.current) {
        return;
      }
      e.preventDefault();
      setShowQuitModal(true);
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const handleConfirmQuit = () => {
    isNavigatingAwayRef.current = true;
    setShowQuitModal(false);
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    stopSpeech();
    if (attempts.length > 0 || roundIndex > 0 || itemsCorrect > 0) {
      finishSession(itemsCorrect, false);
    } else {
      resetGame();
      navigation.goBack();
    }
  };

  const handleCancelQuit = () => {
    setShowQuitModal(false);
  };

  if (!currentRound) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {t('common.loading', 'Loading Puzzle...')}
        </Text>
      </View>
    );
  }

  const activePromptText =
    currentRound.promptText[learningLanguage] ||
    currentRound.promptText[motherTongue] ||
    currentRound.promptText.en;

  const isTablet = screenWidth >= 600;
  const contentMaxWidth = isTablet ? 560 : 430;
  const isFourItems = currentRound.items.length >= 4;
  const tileSize = isFourItems ? Math.min((screenWidth - 100) / 4, 76) : 84;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF2FF" />
      <CartoonBackground theme="puzzle" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.quitButton}
          onPress={() => setShowQuitModal(true)}
          activeOpacity={0.7}
          accessibilityLabel="Quit game"
          accessibilityRole="button"
        >
          <Text style={styles.quitButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Session Timer */}
        <SessionCountdownTimer
          initialSeconds={90}
          onTimeExpired={handleTimeExpired}
          isPaused={showCorrectionModal || showCelebration || showQuitModal}
        />

        <View style={styles.starTrailContainer}>
          <ProgressStarTrail
            current={roundIndex + 1}
            total={TOTAL_ORDER_ROUNDS}
            roundResults={roundResults}
          />
        </View>

        <View style={styles.roundBadge}>
          <Text style={styles.roundBadgeText}>
            {roundIndex + 1}/{TOTAL_ORDER_ROUNDS}
          </Text>
        </View>
      </View>

      {/* Main Play Area */}
      <View style={[styles.mainArea, { maxWidth: contentMaxWidth }]}>
        {/* Top / Center: Ordering Puzzle Stage */}
        <OrderingStage
          totalSlots={currentRound.items.length}
          placedItems={placedItems}
          evaluationStatus={evaluationStatus}
          isLocked={isRoundLocked}
          promptText={activePromptText}
          onPressSlot={handleTapSlot}
          onPressSpeak={speakCurrentPrompt}
          onPressClearAll={handleClearAll}
        />

        {/* Bottom: Available Items Tray */}
        <View style={styles.traySection}>
          <Text style={styles.trayPrompt}>
            {t('putInOrder.trayPrompt', 'Tap cards in order to place them:')}
          </Text>

          <View style={styles.trayRow}>
            {currentRound.shuffledItems.map((item) => {
              const isPlaced = placedItems.some((placed) => placed?.id === item.id);
              return (
                <OrderItemTile
                  key={item.id}
                  item={item}
                  isPlaced={isPlaced}
                  disabled={isRoundLocked || evaluationStatus !== 'idle'}
                  tileSize={tileSize}
                  onPress={handleTapTrayItem}
                />
              );
            })}
          </View>
        </View>
      </View>

      {/* Celebration Stars */}
      <CelebrationOverlay visible={showCelebration} />

      {/* Quit Modal */}
      <Modal
        visible={showQuitModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelQuit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: contentMaxWidth }]}>
            <Text style={styles.modalTitle}>
              {t('putInOrder.quitTitle', 'Leave Ordering Game?')}
            </Text>
            <Text style={styles.modalBody}>
              {t(
                'putInOrder.quitConfirm',
                'Are you sure you want to stop? Your progress in this session will not be saved.'
              )}
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCancelQuit}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelButtonText}>
                  {t('common.keepPlaying', 'Keep Playing! 🌟')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmQuit}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmButtonText}>
                  {t('common.exit', 'Exit')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Educational Correction Modal (Attempt 1 Wrong) */}
      <EducationalCorrectionModal
        visible={showCorrectionModal}
        targetValue={correctionTarget}
        selectedWrongValue={correctionWrong || undefined}
        onDismiss={() => {
          setShowCorrectionModal(false);
          setPlacedItems(new Array(currentRound.items.length).fill(null));
          setEvaluationStatus('idle');
          setIsRoundLocked(false);
        }}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4338CA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  quitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quitButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#64748B',
  },
  starTrailContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  roundBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  roundBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4338CA',
  },
  mainArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  traySection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 2.5,
    borderColor: '#C7D2FE',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  trayPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4338CA',
    marginBottom: 8,
  },
  trayRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 2,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },
});
