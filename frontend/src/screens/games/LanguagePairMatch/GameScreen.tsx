/**
 * Purpose: Re-skinned and enhanced Game Screen for Language Pair Match (Age 6).
 *          Faithfully adopts CapitalSmallMatch's visual architecture:
 *          - CartoonBackground evening sunset theme with smiling sun mascot
 *          - Continuous 50-second session countdown timer across 3 rounds (4+3+3 = 10 pairs)
 *          - 10-star session progress trail & live XP score pill
 *          - 2-column tactile toy-block tiles with 3D bevels, badges, and connecting SVG lines
 *          - Bidirectional tap & drag-to-match interactions
 *          - Dual-language spoken pair TTS on every match (sourceLang -> targetLang)
 *          - Non-punitive gentle mismatch feedback
 *          - Complete lifecycle cleanup with zero dangling audio
 * Module: Language Pair Match — Screens
 * Folder: frontend/src/screens/games/LanguagePairMatch
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  LayoutChangeEvent,
  AccessibilityInfo,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useLanguagePairMatchStore } from './store/useLanguagePairMatchStore';
import { LanguagePairMatchStackParamList, LanguageCode, MatchCard, PairMatchAttempt } from './types';
import { generateLanguagePairRound, TOTAL_GAME_ROUNDS, TOTAL_SESSION_PAIRS } from './logic/roundGenerator';
import { LanguageMatchTile, LanguageTileState } from './components/LanguageMatchTile';
import { LanguageMatchConnectorLines, TileLayoutPosition } from './components/LanguageMatchConnectorLines';
import { FingerTrailOverlay, TouchPoint } from '../CapitalSmallMatch/components/FingerTrailOverlay';
import { LanguagePairReportModal } from './components/LanguagePairReportModal';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { Typography } from '../../../theme/typography';
import { Colors } from '../../../theme/colors';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise } from '../../../services/praiseService';
import { xpService } from '../../../services/xpService';

const INITIAL_TIMER_SECONDS = 90;
const MATCH_CELEBRATION_MS = 500;
const WRONG_FEEDBACK_MS = 450;
const ROUND_CELEBRATION_MS = 1400;

const LANGUAGE_NAMES: Record<LanguageCode, { en: string; native: string; flag: string }> = {
  en: { en: 'English', native: 'English', flag: '🔤' },
  hi: { en: 'Hindi', native: 'हिन्दी', flag: '🗣️' },
  mr: { en: 'Marathi', native: 'मराठी', flag: '📚' },
};

type NavProp = NativeStackNavigationProp<LanguagePairMatchStackParamList>;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteProp<LanguagePairMatchStackParamList, 'LanguagePairMatchGame'>>();
  const { width: screenWidth } = useWindowDimensions();

  // Language state resolution: route params first, then store
  const isInitialized = useAppLanguageStore((s) => s.isInitialized);
  const storeMotherTongue = useAppLanguageStore((s) => s.motherTongue);
  const storeLearningLanguage = useAppLanguageStore((s) => s.learningLanguage);
  const selectedAge = useAppLanguageStore((s) => s.selectedAge) || 6;
  const appLanguage = useAppLanguageStore((s) => s.appLanguage) || storeMotherTongue || 'en';

  const motherTongue = (route.params?.motherTongue || storeMotherTongue || 'en') as LanguageCode;
  const learningLanguage = (route.params?.learningLanguage || storeLearningLanguage || (motherTongue === 'en' ? 'hi' : 'en')) as LanguageCode;

  const sourceInfo = LANGUAGE_NAMES[motherTongue] || LANGUAGE_NAMES.en;
  const targetInfo = LANGUAGE_NAMES[learningLanguage] || LANGUAGE_NAMES.hi;

  // Store selectors
  const roundIndex = useLanguagePairMatchStore((s) => s.roundIndex);
  const totalRounds = useLanguagePairMatchStore((s) => s.totalRounds);
  const currentRound = useLanguagePairMatchStore((s) => s.currentRound);
  const matchedConceptIds = useLanguagePairMatchStore((s) => s.matchedConceptIds);
  const selectedSourceId = useLanguagePairMatchStore((s) => s.selectedSourceId);
  const selectedTargetId = useLanguagePairMatchStore((s) => s.selectedTargetId);
  const wrongMatchPair = useLanguagePairMatchStore((s) => s.wrongMatchPair);
  const score = useLanguagePairMatchStore((s) => s.score);
  const itemsAttempted = useLanguagePairMatchStore((s) => s.itemsAttempted);
  const itemsCorrect = useLanguagePairMatchStore((s) => s.itemsCorrect);
  const sessionStartTime = useLanguagePairMatchStore((s) => s.sessionStartTime);
  const roundAttempts = useLanguagePairMatchStore((s) => s.roundAttempts);

  // Store actions
  const setRound = useLanguagePairMatchStore((s) => s.setRound);
  const selectSource = useLanguagePairMatchStore((s) => s.selectSource);
  const selectTarget = useLanguagePairMatchStore((s) => s.selectTarget);
  const matchSuccess = useLanguagePairMatchStore((s) => s.matchSuccess);
  const matchWrong = useLanguagePairMatchStore((s) => s.matchWrong);
  const clearSelection = useLanguagePairMatchStore((s) => s.clearSelection);
  const clearWrongFlash = useLanguagePairMatchStore((s) => s.clearWrongFlash);
  const nextRound = useLanguagePairMatchStore((s) => s.nextRound);
  const setSessionStartTime = useLanguagePairMatchStore((s) => s.setSessionStartTime);

  // Local state
  const [showExitModal, setShowExitModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRoundCelebration, setShowRoundCelebration] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [justMatchedConceptId, setJustMatchedConceptId] = useState<string | null>(null);

  // 10-Star Session Progress Trail (1 star per pair matched, persists across all 3 rounds)
  const [sessionResults, setSessionResults] = useState<Array<'correct' | 'wrong'>>([]);

  // 50-Second continuous global countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIMER_SECONDS);
  const timeExpiredRef = useRef(false);

  // Drag Gesture & Layout state
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [trailPoints, setTrailPoints] = useState<TouchPoint[]>([]);
  const [gameAreaPageOffset, setGameAreaPageOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [gameAreaDimensions, setGameAreaDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [leftColumnOffset, setLeftColumnOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rightColumnOffset, setRightColumnOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [columnsRowY, setColumnsRowY] = useState<number | null>(null);
  const [sourcePositions, setSourcePositions] = useState<Record<string, TileLayoutPosition>>({});
  const [targetPositions, setTargetPositions] = useState<Record<string, TileLayoutPosition>>({});

  // Lifecycle refs
  const isGameActiveRef = useRef(true);
  const usedConceptIdsRef = useRef<Set<string>>(new Set());
  const sessionIdRef = useRef<string>(`lpm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const handledRoundIndexRef = useRef<number>(-1);
  const advanceTimerRef = useRef<any>(null);
  const wrongTimerRef = useRef<any>(null);
  const promptTimerRef = useRef<any>(null);

  // Clear all pending timers
  const clearAllTimers = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    if (wrongTimerRef.current) {
      clearTimeout(wrongTimerRef.current);
      wrongTimerRef.current = null;
    }
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }
  }, []);

  // Screen reader detection
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (mounted) setIsScreenReaderActive(enabled);
    });

    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      setIsScreenReaderActive(enabled);
    });

    return () => {
      mounted = false;
      sub?.remove();
    };
  }, []);

  // Cleanup on unmount & before navigation exit
  useEffect(() => {
    isGameActiveRef.current = true;
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      isGameActiveRef.current = false;
      stopSpeech();
      clearAllTimers();
    });

    return () => {
      isGameActiveRef.current = false;
      unsubscribe();
      stopSpeech();
      clearAllTimers();
    };
  }, [navigation, clearAllTimers]);

  // Spoken match TTS: immediately pronounce source word (motherTongue) then target word (learningLanguage)
  const speakDualLanguageMatch = useCallback(
    async (sourceWord: string, targetWord: string) => {
      if (!isGameActiveRef.current) return;
      try {
        // 1. Speak source word in motherTongue
        await speakPhrase(sourceWord, { cancelPrevious: true, language: motherTongue });
        if (!isGameActiveRef.current) return;

        // Brief natural pause between words
        await new Promise((resolve) => setTimeout(resolve, 320));
        if (!isGameActiveRef.current) return;

        // 2. Speak target word in learningLanguage
        await speakPhrase(targetWord, { cancelPrevious: false, language: learningLanguage });
      } catch (err) {
        console.warn('[LanguagePairMatch] Spoken pair TTS warning:', err);
      }
    },
    [motherTongue, learningLanguage]
  );

  // Initial instruction audio
  const speakInstruction = useCallback(() => {
    if (!isGameActiveRef.current) return;
    const promptText = t('languagePairMatch.instructionsText', 'Match the pairs!');
    speakPhrase(promptText, { language: motherTongue });
  }, [motherTongue, t]);

  // Session completion handler
  const handleSessionEnd = useCallback(async () => {
    isGameActiveRef.current = false;
    clearAllTimers();
    stopSpeech();

    // Read synchronous, latest state from store to prevent stale closure counts
    const storeState = useLanguagePairMatchStore.getState();
    const finalItemsCorrect = storeState.itemsCorrect;
    const finalItemsAttempted = storeState.itemsAttempted;
    const finalScore = storeState.score;
    const finalRoundAttempts = storeState.roundAttempts;

    const durationSec = sessionStartTime
      ? Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000))
      : INITIAL_TIMER_SECONDS;

    const accuracy =
      finalItemsAttempted > 0 ? Math.round((finalItemsCorrect / finalItemsAttempted) * 100) : 100;
    const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    // Record session completion to centralized XP engine
    const sessionResult = await xpService.recordSessionCompletionXP({
      sessionId: sessionIdRef.current,
      gameId: 'language_pair_match',
      category: 'vocabulary',
      learningLanguage,
      motherTongue,
      age: selectedAge,
      totalQuestions: TOTAL_SESSION_PAIRS, // exactly 10 pairs
      correctAnswers: finalItemsCorrect,
      accuracy,
      durationSeconds: durationSec,
      roundXpEarned: finalScore,
    });

    navigation.navigate('LanguagePairMatchSessionComplete', {
      sessionId: sessionIdRef.current,
      starsEarned: sessionResult.starsEarned || starsEarned,
      xpEarned: sessionResult.totalSessionXp || (finalScore > 0 ? finalScore : finalItemsCorrect * 10),
      itemsCorrect: finalItemsCorrect,
      sessionLength: TOTAL_SESSION_PAIRS, // exactly 10 pairs
      accuracy,
      durationSeconds: durationSec,
      roundAttempts: finalRoundAttempts,
    });
  }, [
    sessionStartTime,
    learningLanguage,
    motherTongue,
    selectedAge,
    navigation,
    clearAllTimers,
  ]);

  const handleSessionEndRef = useRef(handleSessionEnd);
  useEffect(() => {
    handleSessionEndRef.current = handleSessionEnd;
  }, [handleSessionEnd]);

  // Time expired handler for 50s countdown
  const handleTimeUp = useCallback(() => {
    setInteractionLocked(true);
    handleSessionEnd();
  }, [handleSessionEnd]);

  // Continuous 50-second countdown timer across all rounds
  useEffect(() => {
    if (interactionLocked || showExitModal || showReportModal || !currentRound) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          timeExpiredRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [interactionLocked, showExitModal, showReportModal, currentRound]);

  // Handle time expiry in clean effect
  useEffect(() => {
    if (timeLeft === 0 && timeExpiredRef.current) {
      timeExpiredRef.current = false;
      handleTimeUp();
    }
  }, [timeLeft, handleTimeUp]);

  // Initialize first round on mount
  useEffect(() => {
    if (motherTongue === learningLanguage) return;

    if (!currentRound && roundIndex < totalRounds && isGameActiveRef.current) {
      handledRoundIndexRef.current = -1;
      const newRound = generateLanguagePairRound(
        roundIndex,
        motherTongue,
        learningLanguage,
        usedConceptIdsRef.current
      );

      newRound.sourceCards.forEach((c) => usedConceptIdsRef.current.add(c.conceptId));
      setRound(newRound);
      setInteractionLocked(false);
      setSourcePositions({});
      setTargetPositions({});

      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }

      if (roundIndex === 0) {
        promptTimerRef.current = setTimeout(() => {
          if (isGameActiveRef.current) speakInstruction();
        }, 500);
      }
    }
  }, [
    roundIndex,
    totalRounds,
    currentRound,
    motherTongue,
    learningLanguage,
    setRound,
    sessionStartTime,
    setSessionStartTime,
    speakInstruction,
  ]);

  // Evaluate match between selected source and target cards
  const evaluateMatch = useCallback(
    (sourceCard: MatchCard, targetCard: MatchCard) => {
      if (!isGameActiveRef.current || !currentRound || interactionLocked) return;

      const isCorrect = sourceCard.conceptId === targetCard.conceptId;
      const attempt: PairMatchAttempt = {
        roundNumber: roundIndex + 1,
        conceptId: sourceCard.conceptId,
        sourceText: sourceCard.text,
        targetText: targetCard.text,
        sourceImage: sourceCard.image || '🎯',
        isCorrect,
        timestamp: Date.now(),
      };

      if (isCorrect) {
        // === CORRECT MATCH ===
        triggerHapticSuccess();
        setJustMatchedConceptId(sourceCard.conceptId);
        matchSuccess(sourceCard.conceptId, attempt);
        setSessionResults((prev) => [...prev, 'correct']);

        // Record XP deterministically
        xpService.recordAnswerXP({
          sessionId: sessionIdRef.current,
          roundIndex,
          attemptNum: 1,
          isCorrect: true,
          gameId: 'language_pair_match',
          metadata: {
            conceptId: sourceCard.conceptId,
            sourceLang: motherTongue,
            targetLang: learningLanguage,
          },
        }).catch(() => {});

        // Dual-language audio feedback: source word -> target word
        speakDualLanguageMatch(sourceCard.text, targetCard.text);

        setTimeout(() => {
          setJustMatchedConceptId(null);
        }, MATCH_CELEBRATION_MS);

        // Check if all pairs in current round are matched
        const newMatchedCount = matchedConceptIds.length + 1;
        if (newMatchedCount >= currentRound.pairCount) {
          setInteractionLocked(true);

          advanceTimerRef.current = setTimeout(() => {
            if (!isGameActiveRef.current) return;
            setShowRoundCelebration(true);
            speakPraise(motherTongue);

            advanceTimerRef.current = setTimeout(() => {
              if (!isGameActiveRef.current) return;
              setShowRoundCelebration(false);
              const nextRoundIndex = roundIndex + 1;

              if (nextRoundIndex >= totalRounds) {
                handleSessionEndRef.current();
              } else {
                nextRound();
              }
              setInteractionLocked(false);
            }, ROUND_CELEBRATION_MS);
          }, 1100);
        }
      } else {
        // === INCORRECT MATCH ===
        triggerHapticWarning();
        matchWrong(attempt);

        useLanguagePairMatchStore.setState({
          wrongMatchPair: { sourceId: sourceCard.cardId, targetId: targetCard.cardId },
        });

        // Gentle spoken retry prompt in motherTongue
        speakPhrase(t('languagePairMatch.tryAgain', 'Try another match!'), { language: motherTongue });

        if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
        wrongTimerRef.current = setTimeout(() => {
          if (!isGameActiveRef.current) return;
          clearWrongFlash();
          clearSelection();
        }, WRONG_FEEDBACK_MS);
      }
    },
    [
      currentRound,
      interactionLocked,
      roundIndex,
      motherTongue,
      learningLanguage,
      matchedConceptIds.length,
      totalRounds,
      matchSuccess,
      matchWrong,
      clearWrongFlash,
      clearSelection,
      nextRound,
      handleSessionEnd,
      speakDualLanguageMatch,
      t,
    ]
  );

  // Tap handler for source card (bidirectional)
  const handleSourceCardPress = useCallback(
    (card: MatchCard) => {
      if (interactionLocked || matchedConceptIds.includes(card.conceptId)) return;

      if (selectedTargetId && currentRound) {
        // A target card was already selected -> Evaluate match
        const targetCard = currentRound.targetCards.find((c) => c.cardId === selectedTargetId);
        if (targetCard) {
          selectSource(card.cardId);
          evaluateMatch(card, targetCard);
          return;
        }
      }

      if (selectedSourceId === card.cardId) {
        selectSource(null);
      } else {
        selectSource(card.cardId);
      }
    },
    [interactionLocked, matchedConceptIds, selectedTargetId, currentRound, selectedSourceId, selectSource, evaluateMatch]
  );

  // Tap handler for target card (bidirectional)
  const handleTargetCardPress = useCallback(
    (card: MatchCard) => {
      if (interactionLocked || matchedConceptIds.includes(card.conceptId)) return;

      if (selectedSourceId && currentRound) {
        // A source card was already selected -> Evaluate match
        const sourceCard = currentRound.sourceCards.find((c) => c.cardId === selectedSourceId);
        if (sourceCard) {
          selectTarget(card.cardId);
          evaluateMatch(sourceCard, card);
          return;
        }
      }

      if (selectedTargetId === card.cardId) {
        selectTarget(null);
      } else {
        selectTarget(card.cardId);
      }
    },
    [interactionLocked, matchedConceptIds, selectedSourceId, currentRound, selectedTargetId, selectTarget, evaluateMatch]
  );

  // Drag gesture handlers
  const handleDragStart = useCallback(
    (card: MatchCard, row: 'source' | 'target', startX: number, startY: number) => {
      if (interactionLocked) return;
      setIsDragging(true);

      if (row === 'source') {
        selectSource(card.cardId);
        selectTarget(null);
      } else {
        selectTarget(card.cardId);
        selectSource(null);
      }

      const relX = startX - gameAreaPageOffset.x;
      const relY = startY - gameAreaPageOffset.y;
      setTrailPoints([{ x: relX, y: relY }]);
    },
    [interactionLocked, selectSource, selectTarget, gameAreaPageOffset]
  );

  const handleDragUpdate = useCallback(
    (currentX: number, currentY: number) => {
      const relX = currentX - gameAreaPageOffset.x;
      const relY = currentY - gameAreaPageOffset.y;
      setTrailPoints((prev) => [...prev, { x: relX, y: relY }].slice(-12));
    },
    [gameAreaPageOffset]
  );

  const handleDragEnd = useCallback(
    (card: MatchCard, row: 'source' | 'target', endX: number, endY: number) => {
      setIsDragging(false);
      setTrailPoints([]);

      if (interactionLocked || !currentRound) return;

      const relX = endX - gameAreaPageOffset.x;
      const relY = endY - gameAreaPageOffset.y;

      if (row === 'source') {
        let matchedTgtCard: MatchCard | null = null;
        for (const [conceptId, pos] of Object.entries(targetPositions)) {
          if (
            relX >= pos.x - 20 &&
            relX <= pos.x + pos.width + 20 &&
            relY >= pos.y - 20 &&
            relY <= pos.y + pos.height + 20
          ) {
            matchedTgtCard = currentRound.targetCards.find((c) => c.conceptId === conceptId) || null;
            break;
          }
        }

        if (matchedTgtCard) {
          handleTargetCardPress(matchedTgtCard);
        } else {
          selectSource(null);
        }
      } else {
        let matchedSrcCard: MatchCard | null = null;
        for (const [conceptId, pos] of Object.entries(sourcePositions)) {
          if (
            relX >= pos.x - 20 &&
            relX <= pos.x + pos.width + 20 &&
            relY >= pos.y - 20 &&
            relY <= pos.y + pos.height + 20
          ) {
            matchedSrcCard = currentRound.sourceCards.find((c) => c.conceptId === conceptId) || null;
            break;
          }
        }

        if (matchedSrcCard) {
          handleSourceCardPress(matchedSrcCard);
        } else {
          selectTarget(null);
        }
      }
    },
    [
      interactionLocked,
      currentRound,
      gameAreaPageOffset,
      targetPositions,
      sourcePositions,
      handleTargetCardPress,
      handleSourceCardPress,
      selectSource,
      selectTarget,
    ]
  );

  // Layout capture handlers
  const handleGameAreaLayout = useCallback((e: LayoutChangeEvent) => {
    const target = e.currentTarget as any;
    if (target && target.measurePage) {
      target.measurePage((x: number, y: number, width: number, height: number) => {
        setGameAreaPageOffset({ x, y });
        setGameAreaDimensions({ width, height });
      });
    } else {
      const { width, height } = e.nativeEvent.layout;
      setGameAreaDimensions({ width, height });
    }
  }, []);

  const handleColumnsRowLayout = useCallback((e: LayoutChangeEvent) => {
    setColumnsRowY(e.nativeEvent.layout.y);
  }, []);

  const handleLeftColumnLayout = useCallback((e: LayoutChangeEvent) => {
    const { x, y } = e.nativeEvent.layout;
    setLeftColumnOffset({ x, y });
  }, []);

  const handleRightColumnLayout = useCallback((e: LayoutChangeEvent) => {
    const { x, y } = e.nativeEvent.layout;
    setRightColumnOffset({ x, y });
  }, []);

  const handleSourceTileLayout = useCallback(
    (conceptId: string, e: LayoutChangeEvent) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      setSourcePositions((prev) => ({
        ...prev,
        [conceptId]: {
          x: leftColumnOffset.x + x,
          y: leftColumnOffset.y + y,
          width,
          height,
        },
      }));
    },
    [leftColumnOffset]
  );

  const handleTargetTileLayout = useCallback(
    (conceptId: string, e: LayoutChangeEvent) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      setTargetPositions((prev) => ({
        ...prev,
        [conceptId]: {
          x: rightColumnOffset.x + x,
          y: rightColumnOffset.y + y,
          width,
          height,
        },
      }));
    },
    [rightColumnOffset]
  );

  // Compute tile states
  const getSourceTileState = useCallback(
    (card: MatchCard): LanguageTileState => {
      if (matchedConceptIds.includes(card.conceptId)) return 'matched';
      if (wrongMatchPair?.sourceId === card.cardId) return 'wrong';
      if (selectedSourceId === card.cardId) return 'selected';
      return 'default';
    },
    [matchedConceptIds, wrongMatchPair, selectedSourceId]
  );

  const getTargetTileState = useCallback(
    (card: MatchCard): LanguageTileState => {
      if (matchedConceptIds.includes(card.conceptId)) return 'matched';
      if (wrongMatchPair?.targetId === card.cardId) return 'wrong';
      if (selectedTargetId === card.cardId) return 'selected';
      return 'default';
    },
    [matchedConceptIds, wrongMatchPair, selectedTargetId]
  );

  // Quit confirmation
  const handleConfirmQuit = () => {
    isGameActiveRef.current = false;
    clearAllTimers();
    stopSpeech();
    setShowExitModal(false);

    if (itemsAttempted > 0) {
      handleSessionEnd();
    } else {
      navigation.getParent()?.goBack();
    }
  };

  const containerWidth = Math.min(screenWidth - 24, 440);
  const tileWidth = gameAreaDimensions.width > 0 ? Math.min(Math.floor((gameAreaDimensions.width - 56) / 2), 146) : 138;

  // Uninitialized state fallback
  if (!isInitialized || !storeMotherTongue || !storeLearningLanguage) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>{t('common.loading', 'Loading game...')}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Same language guard
  if (motherTongue === learningLanguage) {
    return (
      <View style={styles.root}>
        <CartoonBackground theme="evening" />
        <SafeAreaView style={styles.safe}>
          <View style={styles.centerCardContainer}>
            <View style={[styles.sameLanguageCard, { width: containerWidth }]}>
              <Text style={styles.sameLanguageIcon}>⚠️</Text>
              <Text style={styles.sameLanguageTitle}>
                {t('languagePairMatch.sameLanguageTitle', 'Same Language Selected')}
              </Text>
              <Text style={styles.sameLanguageDesc}>
                {t(
                  'languagePairMatch.sameLanguageDesc',
                  'Your home and learning languages are the same. Please choose another language to play this game.'
                )}
              </Text>
              <BigTouchTarget
                accessibilityLabel={t('languagePairMatch.switchLanguage', 'Choose Another Language')}
                onPress={() => {
                  stopSpeech();
                  navigation.navigate('LanguageGate' as any, { initialStep: 'learningLanguage' });
                }}
                style={styles.switchLangBtn}
              >
                <Text style={styles.switchLangBtnText}>
                  🔄 {t('languagePairMatch.switchLanguage', 'Choose Another Language')}
                </Text>
              </BigTouchTarget>
              <BigTouchTarget
                accessibilityLabel={t('common.catalog', 'Games Hub')}
                onPress={() => {
                  stopSpeech();
                  navigation.getParent()?.goBack();
                }}
                style={styles.backCatalogBtn}
              >
                <Text style={styles.backCatalogBtnText}>
                  🏠 {t('common.catalog', 'Games Hub')}
                </Text>
              </BigTouchTarget>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        {/* Evening Sunset Gradient Theme Background */}
        <CartoonBackground theme="evening" />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <SafeAreaView style={styles.safe}>
          {/* Top Bar Header */}
          <View style={styles.header}>
            <BigTouchTarget
              onPress={() => setShowExitModal(true)}
              accessibilityLabel={t('accessibility.exitToModeSelection')}
              accessibilityHint={t('accessibility.exitGameHint')}
              style={styles.exitButton}
            >
              <Text style={styles.exitIcon}>✕</Text>
            </BigTouchTarget>

            {/* Continuous 10-Star Session Progress Trail */}
            <ProgressStarTrail
              current={sessionResults.length}
              total={TOTAL_SESSION_PAIRS}
              roundResults={sessionResults}
              style={styles.starTrail}
            />

            {/* Live 50-Second Continuous Countdown Timer Badge */}
            <View style={styles.timerBadge}>
              <Text style={styles.timerIcon}>⏱️</Text>
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>

            {/* XP Score Badge */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreStar}>⭐</Text>
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          </View>

          {/* Core Game Area Container */}
          <View style={styles.gameArea} onLayout={handleGameAreaLayout}>
            {/* Animated SVG Connector Lines */}
            {currentRound && (
              <LanguageMatchConnectorLines
                matchedConceptIds={matchedConceptIds}
                sourceCards={currentRound.sourceCards}
                targetCards={currentRound.targetCards}
                justMatchedConceptId={justMatchedConceptId}
                width={gameAreaDimensions.width}
                height={gameAreaDimensions.height}
                tileWidth={tileWidth}
                columnsRowY={columnsRowY}
              />
            )}

            {/* Dynamic Finger Trail Overlay */}
            <FingerTrailOverlay
              active={isDragging}
              points={trailPoints}
              width={gameAreaDimensions.width}
              height={gameAreaDimensions.height}
            />

            {/* 2-Column Grid Layout */}
            {currentRound && (
              <View style={styles.columnsRow} onLayout={handleColumnsRowLayout}>
                {/* Left Column: HOME LANGUAGE */}
                <View style={styles.columnGroup} onLayout={handleLeftColumnLayout}>
                  <Text style={styles.columnLabel}>
                    {sourceInfo.native.toUpperCase()}
                  </Text>
                  <View style={styles.tileColumn}>
                    {currentRound.sourceCards.map((card, idx) => (
                      <View
                        key={card.cardId}
                        onLayout={(e) => handleSourceTileLayout(card.conceptId, e)}
                      >
                        <LanguageMatchTile
                          card={card}
                          tileIndex={idx}
                          state={getSourceTileState(card)}
                          row="source"
                          width={tileWidth}
                          onPress={() => handleSourceCardPress(card)}
                          onDragStart={handleDragStart}
                          onDragUpdate={handleDragUpdate}
                          onDragEnd={handleDragEnd}
                          isScreenReaderActive={isScreenReaderActive}
                          disabled={interactionLocked || matchedConceptIds.includes(card.conceptId)}
                        />
                      </View>
                    ))}
                  </View>
                </View>

                {/* Central Drag Runway / Visual Separator */}
                <View style={styles.runwaySeparator}>
                  <View style={styles.runwayLine} />
                  <Text style={styles.runwayIcon}>↔</Text>
                  <View style={styles.runwayLine} />
                </View>

                {/* Right Column: LEARNING LANGUAGE */}
                <View style={styles.columnGroup} onLayout={handleRightColumnLayout}>
                  <Text style={styles.columnLabel}>
                    {targetInfo.native.toUpperCase()}
                  </Text>
                  <View style={styles.tileColumn}>
                    {currentRound.targetCards.map((card, idx) => (
                      <View
                        key={card.cardId}
                        onLayout={(e) => handleTargetTileLayout(card.conceptId, e)}
                      >
                        <LanguageMatchTile
                          card={card}
                          tileIndex={idx}
                          state={getTargetTileState(card)}
                          row="target"
                          width={tileWidth}
                          onPress={() => handleTargetCardPress(card)}
                          onDragStart={handleDragStart}
                          onDragUpdate={handleDragUpdate}
                          onDragEnd={handleDragEnd}
                          isScreenReaderActive={isScreenReaderActive}
                          disabled={interactionLocked || matchedConceptIds.includes(card.conceptId)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Round progress footer */}
          <View style={styles.footer}>
            <Text style={styles.progressText}>
              {matchedConceptIds.length} / {currentRound?.pairCount || 0} pairs matched • Round {roundIndex + 1} of {totalRounds}
            </Text>
          </View>
        </SafeAreaView>

        {/* Exit Confirmation Modal */}
        <FriendlyModal
          visible={showExitModal}
          title={t('game.leaveGameTitle', 'Leave Game?')}
          description={t('game.leaveGameDesc', 'Are you sure you want to exit? Your current progress will be saved.')}
          dismissText={t('game.keepPlaying', 'Keep Playing')}
          onDismiss={() => setShowExitModal(false)}
        >
          <BigTouchTarget
            onPress={handleConfirmQuit}
            accessibilityLabel={t('game.quitGame', 'Quit Game')}
            accessibilityRole="button"
            style={styles.quitModalBtn}
          >
            <Text style={styles.quitModalBtnText}>{t('game.quitGame', 'Quit Game')}</Text>
          </BigTouchTarget>
        </FriendlyModal>

        {/* Detailed Match Report Modal */}
        <LanguagePairReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          attempts={roundAttempts}
          totalPairs={TOTAL_SESSION_PAIRS}
        />

        {/* Round Complete Celebration Overlay */}
        <CelebrationOverlay visible={showRoundCelebration} isBigCelebration />
      </View>
    </GestureHandlerRootView>
  );
});

GameScreen.displayName = 'LanguagePairMatchGameScreen';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safe: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    zIndex: 20,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  starTrail: {
    flex: 1,
    marginHorizontal: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    marginRight: 4,
  },
  timerIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  timerText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scoreStar: {
    fontSize: 14,
    marginRight: 4,
  },
  scoreText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },
  columnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  columnGroup: {
    alignItems: 'center',
  },
  columnLabel: {
    fontFamily: Typography.fonts.bold,
    fontSize: 12,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 8,
    opacity: 0.9,
  },
  tileColumn: {
    gap: 12,
  },
  runwaySeparator: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
  },
  runwayLine: {
    width: 2,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 1,
  },
  runwayIcon: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressText: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: Colors.neutral.textMuted,
  },
  centerCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sameLanguageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FEF08A',
    borderBottomWidth: 6,
    borderBottomColor: '#FACC15',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sameLanguageIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  sameLanguageTitle: {
    fontFamily: Typography.fonts.bold,
    fontSize: 18,
    color: '#854D0E',
    marginBottom: 8,
    textAlign: 'center',
  },
  sameLanguageDesc: {
    fontFamily: Typography.fonts.medium,
    fontSize: 14,
    color: '#A16207',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  switchLangBtn: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#B45309',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLangBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#451A03',
  },
  backCatalogBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderBottomWidth: 4,
    borderBottomColor: '#94A3B8',
    width: '100%',
    alignItems: 'center',
  },
  backCatalogBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 14,
    color: '#334155',
  },
  quitModalBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    borderBottomWidth: 4,
    borderBottomColor: '#EF4444',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  quitModalBtnText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 15,
    color: '#DC2626',
  },
});
