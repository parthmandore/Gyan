/**
 * Purpose: Main Game Screen for Alphabet Matching — Featuring a 10-second per-round countdown timer,
 *          non-punitive timeout flow, child-friendly RoundTimer UI, and clean per-round lifecycle state machine.
 * Module: Alphabet Matching
 * Folder: frontend/src/screens/games/AlphabetMatching
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { useAlphabetMatchingStore } from './store/alphabetMatchingStore';
import { useSpeechPlaybackStore } from './store/speechPlaybackStore';
import { useProgressStore } from '../../../state/useProgressStore';
import { xpService } from '../../../services/xpService';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { AlphabetMatchingStackParamList } from './types';
import { getDataset } from './datasets';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { LetterTile, LetterTileState } from '../../../components/LetterTile';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { RoundTimer } from '../../../components/RoundTimer';
import { FriendlyModal } from '../../../components/FriendlyModal';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { TeachingOverlay } from '../../../components/TeachingOverlay';
import { FlyingStarOverlay } from '../../../components/FlyingStarOverlay';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import {
  fetchAlphabetMatchingContent,
  RoundContent,
} from '../../../services/alphabetMatchingContentService';
import { submitGameProgress } from '../../../services/progressService';
import { speakLetter, speakPhrase, stopSpeech } from '../../../services/speechService';
import { speakPraise, resetPraiseRotation } from '../../../services/praiseService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { arrangeGridAvoidingConfusion } from './utils/gridArrangement';
import {
  DEFAULT_DIFFICULTY_TIER,
  getGridSizeForDifficulty,
} from './utils/difficultyConfig';

const CORRECT_ANSWER_CELEBRATION_DURATION_MS = 1100;
const SECOND_WRONG_AUTO_ADVANCE_DELAY_MS = 1500;
const ROUND_TIME_LIMIT_SECONDS = 10;

export type RoundLifecycleState =
  | 'WAITING_FOR_SELECTION'
  | 'FIRST_INCORRECT'
  | 'TEACHING_POPUP'
  | 'SECOND_ATTEMPT'
  | 'CORRECT_CELEBRATING'
  | 'SECOND_INCORRECT_SHOW_CORRECT'
  | 'TIMED_OUT'
  | 'ADVANCING_NEXT_ROUND';

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AlphabetMatchingStackParamList>>();

  const { width: screenWidth } = useWindowDimensions();

  const isAudioLoading = useSpeechPlaybackStore((s) => s.isLoading);
  const setIsAudioLoading = useSpeechPlaybackStore((s) => s.setLoading);
  const mode = useAlphabetMatchingStore((s) => s.mode);
  const motherTongue = useAppLanguageStore((s) => s.motherTongue) || 'en';
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'en';

  const [currentDifficulty] = useState<number>(DEFAULT_DIFFICULTY_TIER);
  const [rounds, setRounds] = useState<RoundContent[]>([]);
  const [roundIndex, setRoundIndex] = useState<number>(0);

  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [targetChar, setTargetChar] = useState<string>('');

  const [tileStates, setTileStates] = useState<Record<string, LetterTileState>>({});

  const [, setItemsAttempted] = useState<number>(0);
  const [, setItemsCorrect] = useState<number>(0);
  const [roundResults, setRoundResults] = useState<Array<'correct' | 'wrong' | 'pending'>>([]);

  const [attemptsInCurrentRound, setAttemptsInCurrentRound] = useState<number>(0);
  const [lifecycleState, setLifecycleState] = useState<RoundLifecycleState>('WAITING_FOR_SELECTION');
  const [timerSeconds, setTimerSeconds] = useState<number>(ROUND_TIME_LIMIT_SECONDS);

  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [showTeaching, setShowTeaching] = useState<boolean>(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showFlyingStar, setShowFlyingStar] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roundLocked, setRoundLocked] = useState<boolean>(false);

  const gridScale = useSharedValue(1);
  const gridOpacity = useSharedValue(1);
  const speakerPulse = useSharedValue(1);

  const sessionStartTimeRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string>(`alpha_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const roundXpEarnedRef = useRef<number>(0);
  const activeRoundRef = useRef<RoundContent | null>(null);

  const speakerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speakerPulse.value }],
  }));

  const gridAnimatedStyle = useAnimatedStyle(() => ({
    opacity: gridOpacity.value,
    transform: [{ scale: gridScale.value }],
  }));

  const sessionLength = rounds.length || 10;
  const currentRound = rounds[roundIndex] || null;

  const playLetterAudio = useCallback(async (letter: string, cachedUrl?: string | null) => {
    if (!letter) return;
    setIsAudioLoading(true);
    try {
      const result = await speakLetter(letter, cachedUrl, learningLanguage);
      if (!result.success) {
        const retryResult = await speakLetter(letter, cachedUrl, learningLanguage);
        if (!retryResult.success) {
          console.error(
            `[GameScreen] Audio playback failed for letter "${letter}" after retry. Giving up silently.`,
            retryResult.error,
          );
        }
      }
    } catch (error) {
      console.error(`[GameScreen] Exception during playLetterAudio("${letter}"):`, error);
    } finally {
      setIsAudioLoading(false);
    }
  }, [setIsAudioLoading, learningLanguage]);

  const loadRound = useCallback((roundData: RoundContent, index: number) => {
    activeRoundRef.current = roundData;

    gridOpacity.value = 0;
    gridScale.value = 0.92;

    const numCols = getGridSizeForDifficulty(currentDifficulty) > 4 ? 3 : 2;
    const arrangedOptions = arrangeGridAvoidingConfusion(roundData.options, numCols);

    setCurrentOptions(arrangedOptions);
    setTargetChar(roundData.target_letter);
    setRoundIndex(index);
    setTileStates({});
    setAttemptsInCurrentRound(0);
    setTimerSeconds(ROUND_TIME_LIMIT_SECONDS);
    setShowFlyingStar(false);
    setLifecycleState('WAITING_FOR_SELECTION');

    gridOpacity.value = withTiming(1, { duration: 350 });
    gridScale.value = withSpring(1, { damping: 14, stiffness: 140 });

    stopSpeech();
    playLetterAudio(roundData.target_letter, roundData.audio_url);
  }, [currentDifficulty, gridOpacity, gridScale, playLetterAudio]);

  const finishSessionAndSubmitProgress = useCallback(async () => {
    setShowCelebration(false);
    setShowTeaching(false);
    setShowFlyingStar(false);
    stopSpeech();

    await new Promise((resolve) => setTimeout(resolve, 30));

    const finalState = useAlphabetMatchingStore.getState();
    const finalDifficulty = currentDifficulty;
    const sessionStart = sessionStartTimeRef.current;
    const finalAttempted = finalState.itemsAttempted;
    const finalCorrect = finalState.itemsCorrect;

    const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStart) / 1000));
    const accuracy = finalAttempted > 0 ? (finalCorrect / finalAttempted) * 100 : 0;

    const learningLanguage = useAppLanguageStore.getState().learningLanguage || 'en';
    const motherTongue = useAppLanguageStore.getState().motherTongue || 'en';

    const sessionResult = await xpService.recordSessionCompletionXP({
      sessionId: sessionIdRef.current,
      gameId: 'alphabet_matching',
      category: mode,
      learningLanguage,
      motherTongue,
      age: 5,
      totalQuestions: sessionLength || 10,
      correctAnswers: finalCorrect,
      accuracy,
      durationSeconds,
      roundXpEarned: roundXpEarnedRef.current,
    });

    try {
      await submitGameProgress({
        game_type: 'alphabet_matching',
        difficulty: finalDifficulty,
        items_attempted: finalAttempted,
        items_correct: finalCorrect,
        time_taken_seconds: durationSeconds,
      });
    } catch (err) {
      console.warn('[GameScreen] Non-critical progress submission failure (mock handling ok):', err);
    }

    navigation.navigate('AlphabetMatchingSessionComplete', {
      starsEarned: sessionResult.starsEarned,
      xpEarned: sessionResult.totalSessionXp,
      itemsCorrect: finalCorrect,
      sessionLength,
      accuracy,
      durationSeconds,
    });
  }, [currentDifficulty, navigation, sessionLength, mode]);

  const advanceToNextRound = useCallback(() => {
    setLifecycleState('ADVANCING_NEXT_ROUND');
    const nextIndex = roundIndex + 1;
    if (nextIndex < rounds.length) {
      setRoundLocked(false);
      loadRound(rounds[nextIndex], nextIndex);
    } else {
      finishSessionAndSubmitProgress();
    }
  }, [roundIndex, rounds, loadRound, finishSessionAndSubmitProgress]);

  // Per-Round 10-Second Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const isTimerActive =
      (lifecycleState === 'WAITING_FOR_SELECTION' || lifecycleState === 'SECOND_ATTEMPT') &&
      !roundLocked &&
      !isLoading &&
      !showExitModal &&
      !showTeaching &&
      !showCelebration;

    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lifecycleState, roundLocked, isLoading, showExitModal, showTeaching, showCelebration, timerSeconds]);

  // Handle Timeout (10 seconds expired without a tap)
  const handleTimeout = useCallback(() => {
    if (roundLocked || !currentRound) return;
    setRoundLocked(true);
    triggerHapticWarning();

    const store = useAlphabetMatchingStore.getState();

    if (attemptsInCurrentRound === 0) {
      // Attempt #1 Timeout — Show teaching overlay & reset timer for Attempt #2
      setLifecycleState('TIMED_OUT');
      setAttemptsInCurrentRound(1);
      store.recordAttempt(false);
      setItemsAttempted((prev) => prev + 1);

      setTimeout(() => {
        setLifecycleState('TEACHING_POPUP');
        setShowTeaching(true);
      }, 220);
    } else {
      // Attempt #2 Timeout — Show correct answer & advance to next round
      setLifecycleState('SECOND_INCORRECT_SHOW_CORRECT');
      setAttemptsInCurrentRound(2);
      store.recordAttempt(false);
      setItemsAttempted((prev) => prev + 1);

      setRoundResults((prev) => {
        const copy = [...prev];
        copy[roundIndex] = 'wrong';
        return copy;
      });

      const updatedTileStates: Record<string, LetterTileState> = {};
      currentOptions.forEach((opt) => {
        if (opt.toUpperCase() === targetChar.toUpperCase()) {
          updatedTileStates[opt] = 'highlighted';
        } else {
          updatedTileStates[opt] = 'dimmed';
        }
      });

      setTileStates(updatedTileStates);

      setTimeout(() => {
        advanceToNextRound();
      }, 1000);
    }
  }, [roundLocked, currentRound, targetChar, roundIndex, attemptsInCurrentRound, currentOptions, mode, advanceToNextRound]);

  useEffect(() => {
    if (timerSeconds === 0 && (lifecycleState === 'WAITING_FOR_SELECTION' || lifecycleState === 'SECOND_ATTEMPT') && !roundLocked) {
      handleTimeout();
    }
  }, [timerSeconds, lifecycleState, roundLocked, handleTimeout]);

  useEffect(() => {
    let isMounted = true;
    sessionStartTimeRef.current = Date.now();
    resetPraiseRotation();

    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAlphabetMatchingContent(currentDifficulty, mode);
        if (isMounted && response.success && response.data.rounds) {
          const fetchedRounds = response.data.rounds;
          setRounds(fetchedRounds);
          useAlphabetMatchingStore.getState().resetSession();
          setRoundResults(new Array(fetchedRounds.length).fill('pending'));

          if (fetchedRounds.length > 0) {
            loadRound(fetchedRounds[0], 0);
          }
        }
      } catch (err) {
        console.error('[GameScreen] Content fetch error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
      stopSpeech();
    };
  }, [currentDifficulty, mode, loadRound]);

  const handleTilePress = useCallback((tappedLetter: string) => {
    if (roundLocked || !currentRound) return;
    setRoundLocked(true);

    const isCorrect = tappedLetter.toUpperCase() === targetChar.toUpperCase();
    const store = useAlphabetMatchingStore.getState();

    if (isCorrect) {
      triggerHapticSuccess();
      setLifecycleState('CORRECT_CELEBRATING');
      store.recordAttempt(true);
      setItemsAttempted((prev) => prev + 1);
      setItemsCorrect((prev) => prev + 1);

      const attemptNum = attemptsInCurrentRound === 0 ? 1 : 2;
      xpService.recordAnswerXP({
        sessionId: sessionIdRef.current,
        roundIndex,
        attemptNum,
        isCorrect: true,
        gameId: 'alphabet_matching',
        metadata: {
          mode,
          letter: targetChar,
        },
      }).then((res) => {
        roundXpEarnedRef.current += res.xpEarned;
      }).catch(() => {});

      setTileStates((prev) => ({ ...prev, [tappedLetter]: 'correct' }));
      setShowFlyingStar(true);
      setShowCelebration(true);
      speakPraise();

      setTimeout(() => {
        setShowCelebration(false);
        advanceToNextRound();
      }, CORRECT_ANSWER_CELEBRATION_DURATION_MS);
    } else {
      triggerHapticWarning();
      if (attemptsInCurrentRound === 0) {
        setLifecycleState('FIRST_INCORRECT');
        setAttemptsInCurrentRound(1);
        store.recordAttempt(false);
        setItemsAttempted((prev) => prev + 1);

        setTileStates((prev) => ({ ...prev, [tappedLetter]: 'incorrect' }));

        setTimeout(() => {
          setLifecycleState('TEACHING_POPUP');
          setShowTeaching(true);
        }, 220);
      } else {
        setLifecycleState('SECOND_INCORRECT_SHOW_CORRECT');
        setAttemptsInCurrentRound(2);
        store.recordAttempt(false);
        setItemsAttempted((prev) => prev + 1);

        setRoundResults((prev) => {
          const copy = [...prev];
          copy[roundIndex] = 'wrong';
          return copy;
        });

        const updatedTileStates: Record<string, LetterTileState> = {};
        currentOptions.forEach((opt) => {
          if (opt.toUpperCase() === targetChar.toUpperCase()) {
            updatedTileStates[opt] = 'highlighted';
          } else {
            updatedTileStates[opt] = 'dimmed';
          }
        });

        setTileStates(updatedTileStates);
        const teachPhrase = mode === 'numbers'
          ? t('alphabetMatching.teachingNumber', { letter: targetChar, lng: motherTongue, defaultValue: `This is number ${targetChar}` })
          : t('alphabetMatching.teachingLetter', { letter: targetChar, lng: motherTongue, defaultValue: `This is the letter ${targetChar}` });
        speakPhrase(teachPhrase, { language: motherTongue });

        setTimeout(() => {
          advanceToNextRound();
        }, SECOND_WRONG_AUTO_ADVANCE_DELAY_MS);
      }
    }
  }, [roundLocked, currentRound, targetChar, roundIndex, attemptsInCurrentRound, currentOptions, mode, advanceToNextRound, motherTongue, t]);

  const handleFlyingStarComplete = useCallback(() => {
    setShowFlyingStar(false);
    setRoundResults((prev) => {
      const copy = [...prev];
      copy[roundIndex] = 'correct';
      return copy;
    });
  }, [roundIndex]);

  const handleTeachingDismiss = useCallback(() => {
    setShowTeaching(false);
    if (lifecycleState === 'TIMED_OUT') {
      advanceToNextRound();
    } else {
      setRoundLocked(false);
      setLifecycleState('SECOND_ATTEMPT');
      setTileStates({});
      setTimerSeconds(ROUND_TIME_LIMIT_SECONDS);
      if (targetChar) {
        playLetterAudio(targetChar, currentRound?.audio_url);
      }
    }
  }, [lifecycleState, targetChar, currentRound, playLetterAudio, advanceToNextRound]);

  const handleRepeatAudio = useCallback(() => {
    if (isAudioLoading || roundLocked || !targetChar) return;

    speakerPulse.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 200 }),
      withSpring(1.0, { damping: 10, stiffness: 150 }),
    );

    playLetterAudio(targetChar, currentRound?.audio_url);
  }, [isAudioLoading, roundLocked, targetChar, currentRound, playLetterAudio, speakerPulse]);

  const handleConfirmExit = useCallback(() => {
    setShowExitModal(false);
    setShowCelebration(false);
    setShowTeaching(false);
    setShowFlyingStar(false);
    stopSpeech();
    navigation.navigate('AlphabetMatchingModeSelection');
  }, [navigation]);

  const totalOptionsCount = getGridSizeForDifficulty(currentDifficulty);
  const numColumns = totalOptionsCount > 4 ? 3 : 2;
  const maxContentWidth = Math.min(screenWidth - 32, 440);
  const gapWidth = 18;
  const calculatedTileWidth = Math.floor((maxContentWidth - gapWidth * (numColumns + 1)) / numColumns);
  const tileWidth = Math.max(140, Math.min(160, calculatedTileWidth));
  const tileHeight = Math.floor(tileWidth * 1.06);
  const tileFontSize = 68;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  const promptText = mode === 'numbers' ? 'Listen for\nthe number!' : 'Listen for\nthe letter!';

  return (
    <View style={styles.webOuterContainer}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#1B2B5A" />

        {/* Full Decorative Cartoon Background Scenery */}
        <CartoonBackground />

        {/* Top Header Navigation Bar */}
        <View style={styles.topHeaderContainer}>
          <BigTouchTarget
            onPress={() => setShowExitModal(true)}
            accessibilityLabel={t('common.back')}
            accessibilityHint={t('accessibility.exitGameHint')}
            style={styles.redExitButton}
          >
            <Text style={styles.redExitButtonText}>✕</Text>
          </BigTouchTarget>

          {/* Responsive Star Trail Pill */}
          <View style={styles.starTrailPill}>
            <ProgressStarTrail
              current={roundIndex + 1}
              total={sessionLength}
              roundResults={roundResults}
            />
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.mainContentContainer}>
          <View style={styles.targetBanner}>
            <BigTouchTarget
              onPress={handleRepeatAudio}
              accessibilityLabel={t('accessibility.replayLetterSound')}
              accessibilityHint={t('accessibility.tapToHearAgain')}
              accessibilityRole="button"
              style={[
                styles.audioCueCard,
                isAudioLoading && styles.audioCueCardLoading,
              ]}
              disabled={isAudioLoading || roundLocked}
            >
              <Animated.View style={speakerAnimatedStyle}>
                <View style={styles.speakerIconCircle}>
                  <Text style={styles.audioSpeakerIcon}>
                    {isAudioLoading ? '⏳' : '🔊'}
                  </Text>
                </View>
              </Animated.View>
              <Text style={styles.audioCueText}>
                {isAudioLoading ? t('game.loadingAudio') : promptText}
              </Text>
              {/* Integrated Radial Ring Timer */}
              <RoundTimer seconds={timerSeconds} />
            </BigTouchTarget>
          </View>

          {/* 2x2 Option Grid */}
          <Animated.View style={[styles.gridContainer, gridAnimatedStyle]}>
            <View style={[styles.grid, { gap: gapWidth }]}>
              {currentOptions.map((letter, idx) => (
                <LetterTile
                  key={letter}
                  letter={letter}
                  tileIndex={idx}
                  state={tileStates[letter] || 'default'}
                  onPress={() => handleTilePress(letter)}
                  disabled={roundLocked}
                  accessibilityLabel={t('accessibility.selectLetter', { letter })}
                  style={{
                    width: tileWidth,
                    height: tileHeight,
                  }}
                  textStyle={{ fontSize: tileFontSize }}
                />
              ))}
            </View>
          </Animated.View>
        </View>

        {/* Flying Star Reward Overlay */}
        <FlyingStarOverlay
          visible={showFlyingStar}
          onComplete={handleFlyingStarComplete}
        />

        {/* Celebration Overlay */}
        <CelebrationOverlay visible={showCelebration} />

        {/* Teaching Overlay */}
        <TeachingOverlay
          visible={showTeaching}
          targetLetter={targetChar}
          onDismiss={handleTeachingDismiss}
        />

        {/* Exit Confirmation Modal */}
        <FriendlyModal
          visible={showExitModal}
          onDismiss={() => setShowExitModal(false)}
          title={t('game.leaveGameTitle')}
          description={t('game.leaveGameDesc')}
          dismissText={t('game.keepPlaying')}
        >
          <BigTouchTarget
            onPress={handleConfirmExit}
            accessibilityLabel={t('accessibility.exitToModeSelection')}
            style={styles.modalExitButton}
          >
            <Text style={styles.modalExitButtonText}>{t('game.exitGame')}</Text>
          </BigTouchTarget>
        </FriendlyModal>
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
    maxHeight: 920,
    backgroundColor: '#1B2B5A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C5F5E9',
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
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    borderRadius: 18,
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
    fontSize: 22,
    color: '#FFFFFF',
  },
  starTrailPill: {
    backgroundColor: Colors.header.starPillNavy,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderColor: Colors.header.starPillBorder,
    borderWidth: 2,
    flexShrink: 1,
  },

  /* Main Body Content */
  mainContentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },

  /* Instruction Card */
  targetBanner: {
    width: '94%',
    alignItems: 'center',
    zIndex: 10,
  },
  audioCueCard: {
    width: '100%',
    minHeight: 110,
    borderRadius: 28,
    backgroundColor: Colors.instructionCard.bg,
    borderColor: Colors.instructionCard.border,
    borderWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: Colors.instructionCard.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  audioCueCardLoading: {
    borderColor: Colors.accent.amber,
    backgroundColor: Colors.accent.amberSurface,
  },
  speakerIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.instructionCard.speakerBg,
    borderColor: Colors.instructionCard.speakerBorder,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  audioSpeakerIcon: {
    fontSize: 28,
  },
  audioCueText: {
    fontFamily: Typography.fonts.bold,
    fontSize: 24,
    color: Colors.instructionCard.text,
    lineHeight: 28,
  },

  /* 2x2 Option Grid Container */
  gridContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Exit Modal */
  modalExitButton: {
    width: '100%',
    height: 54,
    minHeight: 84,
    backgroundColor: Colors.accent.amberSurface,
    borderColor: Colors.accent.amber,
    borderWidth: 1.5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalExitButtonText: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.md,
    color: Colors.accent.amberText,
  },
});
