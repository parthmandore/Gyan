/**
 * Purpose: Game Screen for Vowel & Matra Match featuring 2-column layout (vowel ↔ matra form),
 *          bidirectional selection, 50s session timer, and 11-star progress trail.
 * Module: Vowel Matra Match
 * Folder: frontend/src/screens/games/VowelMatraMatch
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useVowelMatraMatchStore } from './store/vowelMatraMatchStore';
import { VowelMatraMatchStackParamList } from './types';
import { generateVowelMatraRound } from './logic/roundGenerator';
import { HINDI_VOWEL_MATRA_PAIRS } from './data/vowelMatraPairs.hi';
import { MARATHI_VOWEL_MATRA_PAIRS } from './data/vowelMatraPairs.mr';
import { useAppLanguageStore } from '../../../state/appLanguageStore';
import { MatchTile, MatchTileState } from '../CapitalSmallMatch/components/MatchTile';
import { MatchConnectorLines } from '../CapitalSmallMatch/components/MatchConnectorLines';
import { FingerTrailOverlay, TouchPoint } from '../CapitalSmallMatch/components/FingerTrailOverlay';
import { WrongMatchModal } from '../CapitalSmallMatch/components/WrongMatchModal';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';
import { speakPhrase } from '../../../services/speechService';

type NavProp = NativeStackNavigationProp<VowelMatraMatchStackParamList>;

const WRONG_FEEDBACK_DURATION_MS = 400;
const MATCH_CELEBRATION_MS = 600;
const ROUND_CELEBRATION_DURATION_MS = 1400;
const SESSION_TOTAL_PAIRS = 11;
const INITIAL_TIMER_SECONDS = 50;
const TOTAL_ROUNDS = 3;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();

  // Determine language dataset based on learningLanguage
  const learningLanguage = useAppLanguageStore((s) => s.learningLanguage) || 'hi';
  const activeDataset = learningLanguage === 'mr' ? MARATHI_VOWEL_MATRA_PAIRS : HINDI_VOWEL_MATRA_PAIRS;

  // Store selectors
  const roundPairs = useVowelMatraMatchStore((s) => s.roundPairs);
  const vowelColumnOrder = useVowelMatraMatchStore((s) => s.vowelColumnOrder);
  const matraColumnOrder = useVowelMatraMatchStore((s) => s.matraColumnOrder);
  const selectedVowel = useVowelMatraMatchStore((s) => s.selectedVowel);
  const matchedVowels = useVowelMatraMatchStore((s) => s.matchedVowels);
  const score = useVowelMatraMatchStore((s) => s.score);
  const roundIndex = useVowelMatraMatchStore((s) => s.roundIndex);
  const sessionStartTime = useVowelMatraMatchStore((s) => s.sessionStartTime);
  const itemsCorrect = useVowelMatraMatchStore((s) => s.itemsCorrect);
  const itemsAttempted = useVowelMatraMatchStore((s) => s.itemsAttempted);

  // Store actions
  const advanceRound = useVowelMatraMatchStore((s) => s.advanceRound);
  const setRound = useVowelMatraMatchStore((s) => s.setRound);
  const selectVowel = useVowelMatraMatchStore((s) => s.selectVowel);
  const matchPair = useVowelMatraMatchStore((s) => s.matchPair);
  const incrementScore = useVowelMatraMatchStore((s) => s.incrementScore);
  const recordAttempt = useVowelMatraMatchStore((s) => s.recordAttempt);
  const setSessionStartTime = useVowelMatraMatchStore((s) => s.setSessionStartTime);

  const handledRoundIndexRef = useRef<number>(-1);
  const sessionIdRef = useRef<string>(`vmm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  // Bidirectional selection state
  const [selectedMatra, setSelectedMatra] = useState<string | null>(null);

  // Teaching Modal & UI feedback state
  const [teachingModalPair, setTeachingModalPair] = useState<{ capital: string; lowercase: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIMER_SECONDS);
  const timeExpiredRef = useRef(false);
  const [wrongFlashPair, setWrongFlashPair] = useState<{ vowel: string; matraForm: string } | null>(null);
  const [justMatchedVowel, setJustMatchedVowel] = useState<string | null>(null);
  const [showRoundCelebration, setShowRoundCelebration] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const [sessionResults, setSessionResults] = useState<Array<'correct' | 'wrong'>>([]);

  const [gameAreaDimensions, setGameAreaDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // --- Initialize first round on mount ---
  useEffect(() => {
    if (roundPairs.length === 0) {
      handledRoundIndexRef.current = -1;
      const round = generateVowelMatraRound(activeDataset, 0);
      setRound(round.pairs, round.vowelColumnOrder, round.matraColumnOrder);
      setSessionResults([]);
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
    }
  }, [roundPairs.length, activeDataset, setRound, sessionStartTime, setSessionStartTime]);

  // --- 50s Countdown Timer ---
  const handleTimeUp = useCallback(() => {
    setInteractionLocked(true);
    const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : INITIAL_TIMER_SECONDS;
    const accuracy = itemsAttempted > 0 ? Math.round((itemsCorrect / itemsAttempted) * 100) : 100;
    const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const xpEarned = score > 0 ? score : itemsCorrect * 10;

    navigation.navigate('VowelMatraMatchSessionComplete', {
      sessionId: sessionIdRef.current,
      starsEarned,
      xpEarned,
      itemsCorrect,
      sessionLength: SESSION_TOTAL_PAIRS,
      accuracy,
      durationSeconds: duration,
      sessionResults,
    });
  }, [sessionStartTime, itemsAttempted, itemsCorrect, score, navigation, sessionResults]);

  useEffect(() => {
    if (roundPairs.length === 0 || interactionLocked || teachingModalPair !== null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Bug 3 fix: Don't call handleTimeUp() inside setState updater.
          // Set a ref flag instead; a separate effect will handle navigation.
          timeExpiredRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roundPairs.length, interactionLocked, teachingModalPair]);

  // Bug 3 fix: Handle time expiry in a separate effect, not inside setState updater
  useEffect(() => {
    if (timeLeft === 0 && timeExpiredRef.current) {
      timeExpiredRef.current = false;
      handleTimeUp();
    }
  }, [timeLeft, handleTimeUp]);

  // --- Detect round completion ---
  useEffect(() => {
    if (roundPairs.length === 0) return;
    if (matchedVowels.length < roundPairs.length) return;
    if (handledRoundIndexRef.current === roundIndex) return;

    handledRoundIndexRef.current = roundIndex;
    setInteractionLocked(true);
    setShowRoundCelebration(true);

    const timer = setTimeout(() => {
      setShowRoundCelebration(false);
      const nextRoundIndex = roundIndex + 1;

      if (nextRoundIndex >= TOTAL_ROUNDS) {
        // Session Complete
        const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 1000) : INITIAL_TIMER_SECONDS;
        const accuracy = itemsAttempted > 0 ? Math.round((itemsCorrect / itemsAttempted) * 100) : 100;
        const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
        const xpEarned = score > 0 ? score : itemsCorrect * 10;

        navigation.navigate('VowelMatraMatchSessionComplete', {
          sessionId: sessionIdRef.current,
          starsEarned,
          xpEarned,
          itemsCorrect,
          sessionLength: SESSION_TOTAL_PAIRS,
          accuracy,
          durationSeconds: duration,
          sessionResults,
        });
      } else {
        // Advance to next round
        const round = generateVowelMatraRound(activeDataset, nextRoundIndex);
        advanceRound(round.pairs, round.vowelColumnOrder, round.matraColumnOrder);
        setSelectedMatra(null);
      }
      setInteractionLocked(false);
    }, ROUND_CELEBRATION_DURATION_MS);

    return () => clearTimeout(timer);
  }, [matchedVowels.length, roundPairs, roundIndex, sessionStartTime, itemsAttempted, itemsCorrect, score, navigation, advanceRound, activeDataset, sessionResults]);

  // --- Evaluate match between vowel and matra ---
  const evaluateMatch = useCallback(
    async (vowelChar: string, matraChar: string) => {
      const correctPair = roundPairs.find((p) => p.vowel === vowelChar);
      if (!correctPair) return;

      if (correctPair.matraForm === matraChar) {
        // Correct
        triggerHapticSuccess();
        setJustMatchedVowel(vowelChar);
        matchPair(vowelChar);
        recordAttempt(true);
        incrementScore(10);
        setSessionResults((prev) => [...prev, 'correct']);
        selectVowel(null);
        setSelectedMatra(null);

        setTimeout(() => {
          setJustMatchedVowel(null);
          setInteractionLocked(false);
        }, MATCH_CELEBRATION_MS);
      } else {
        // Wrong
        triggerHapticWarning();
        setWrongFlashPair({ vowel: vowelChar, matraForm: matraChar });

        setTimeout(() => {
          setWrongFlashPair(null);
          setJustMatchedVowel(vowelChar);
          matchPair(vowelChar);
          recordAttempt(false);
          setSessionResults((prev) => [...prev, 'wrong']);

          setTeachingModalPair({ capital: vowelChar, lowercase: correctPair.matraForm });
          selectVowel(null);
          setSelectedMatra(null);
          setJustMatchedVowel(null);
          setInteractionLocked(false);
        }, WRONG_FEEDBACK_DURATION_MS);
      }
    },
    [roundPairs, matchPair, recordAttempt, incrementScore, selectVowel]
  );

  const handleVowelTap = useCallback(
    (vowel: string) => {
      if (interactionLocked) return;
      if (matchedVowels.includes(vowel)) return;
      speakPhrase(vowel, { language: learningLanguage });

      if (selectedMatra) {
        setInteractionLocked(true);
        evaluateMatch(vowel, selectedMatra);
      } else if (selectedVowel === vowel) {
        selectVowel(null);
      } else {
        selectVowel(vowel);
      }
    },
    [interactionLocked, matchedVowels, selectedMatra, selectedVowel, selectVowel, evaluateMatch, learningLanguage]
  );

  const handleMatraTap = useCallback(
    (matraForm: string) => {
      if (interactionLocked) return;
      const pair = roundPairs.find((p) => p.matraForm === matraForm);
      if (pair && matchedVowels.includes(pair.vowel)) return;
      speakPhrase(matraForm, { language: learningLanguage });

      if (selectedVowel) {
        setInteractionLocked(true);
        evaluateMatch(selectedVowel, matraForm);
      } else if (selectedMatra === matraForm) {
        setSelectedMatra(null);
      } else {
        setSelectedMatra(matraForm);
      }
    },
    [interactionLocked, roundPairs, matchedVowels, selectedVowel, selectedMatra, evaluateMatch, learningLanguage]
  );

  const handleGameAreaLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setGameAreaDimensions({ width, height });
  }, []);

  const handleExit = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  if (roundPairs.length === 0) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="light-content" backgroundColor="#1E1B4B" />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t('vowelMatraMatch.loadingGame')}</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.root}>
        <CartoonBackground theme="evening" />
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <SafeAreaView style={styles.safe}>
          {/* Header */}
          <View style={styles.header}>
            <BigTouchTarget onPress={handleExit} accessibilityLabel="Exit" style={styles.exitButton}>
              <Text style={styles.exitIcon}>✕</Text>
            </BigTouchTarget>

            <ProgressStarTrail
              current={sessionResults.length}
              total={SESSION_TOTAL_PAIRS}
              roundResults={sessionResults}
              style={styles.starTrail}
            />

            <View style={styles.timerBadge}>
              <Text style={styles.timerIcon}>⏱️</Text>
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreStar}>⭐</Text>
              <Text style={styles.scoreText}>{score}</Text>
            </View>
          </View>

          {/* Game Area */}
          <View style={styles.gameArea} onLayout={handleGameAreaLayout}>
            {/* SVG Connecting Lines */}
            <MatchConnectorLines
              matchedCapitals={matchedVowels}
              capitalRowOrder={vowelColumnOrder}
              lowercaseRowOrder={matraColumnOrder}
              roundPairs={roundPairs.map((p) => ({ capital: p.vowel, lowercase: p.matraForm }))}
              justMatchedCapital={justMatchedVowel}
              width={gameAreaDimensions.width}
              height={gameAreaDimensions.height}
            />

            {/* 2 Column Layout */}
            <View style={styles.columnsRow}>
              {/* Vowels (Left Column) */}
              <View style={styles.columnGroup}>
                <Text style={styles.columnLabel}>{t('vowelMatraMatch.vowelColumnLabel')}</Text>
                <View style={styles.tileColumn}>
                  {vowelColumnOrder.map((pairIdx, displayIdx) => {
                    const pair = roundPairs[pairIdx];
                    if (!pair) return null;
                    const isMatched = matchedVowels.includes(pair.vowel);
                    const isSelected = selectedVowel === pair.vowel;
                    const state: MatchTileState = isMatched ? 'matched' : isSelected ? 'selected' : 'default';

                    return (
                      <MatchTile
                        key={`vowel-${pair.vowel}`}
                        letter={pair.vowel}
                        tileIndex={displayIdx}
                        state={state}
                        row="capital"
                        onPress={() => handleVowelTap(pair.vowel)}
                        disabled={interactionLocked || isMatched}
                      />
                    );
                  })}
                </View>
              </View>

              {/* Central Separator */}
              <View style={styles.runwaySeparator}>
                <View style={styles.runwayLine} />
                <Text style={styles.runwayIcon}>↔</Text>
                <View style={styles.runwayLine} />
              </View>

              {/* Matra Forms (Right Column) */}
              <View style={styles.columnGroup}>
                <Text style={styles.columnLabel}>{t('vowelMatraMatch.matraColumnLabel')}</Text>
                <View style={styles.tileColumn}>
                  {matraColumnOrder.map((pairIdx, displayIdx) => {
                    const pair = roundPairs[pairIdx];
                    if (!pair) return null;
                    const isMatched = matchedVowels.includes(pair.vowel);
                    const isSelected = selectedMatra === pair.matraForm;
                    const state: MatchTileState = isMatched ? 'matched' : isSelected ? 'selected' : 'default';

                    return (
                      <MatchTile
                        key={`matra-${pair.matraForm}`}
                        letter={pair.matraForm}
                        tileIndex={displayIdx}
                        state={state}
                        row="lowercase"
                        onPress={() => handleMatraTap(pair.matraForm)}
                        disabled={interactionLocked || isMatched}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.progressText}>
              {t('vowelMatraMatch.roundProgress', { current: matchedVowels.length, total: roundPairs.length, round: roundIndex + 1, totalRounds: TOTAL_ROUNDS })}
            </Text>
          </View>
        </SafeAreaView>

        {/* Teaching Modal */}
        {teachingModalPair && (
          <WrongMatchModal
            visible={!!teachingModalPair}
            capital={teachingModalPair.capital}
            lowercase={teachingModalPair.lowercase}
            onDismiss={() => setTeachingModalPair(null)}
            i18nNamespace="vowelMatraMatch"
          />
        )}

        {/* Round Celebration */}
        <CelebrationOverlay visible={showRoundCelebration} isBigCelebration />
      </View>
    </GestureHandlerRootView>
  );
});

GameScreen.displayName = 'VowelMatraMatchGameScreen';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1E1B4B',
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
    paddingHorizontal: 12,
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
    opacity: 0.85,
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
});
