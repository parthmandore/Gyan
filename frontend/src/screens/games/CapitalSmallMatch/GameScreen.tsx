/**
 * Purpose: Core Game Screen for Capital & Small Letter Match featuring 2-column side-by-side layout,
 *          bidirectional selection (capital-first or lowercase-first), 50-second session timer,
 *          interactive WrongMatchModal teaching overlay, and 12-star session progress trail.
 * Module: Capital Small Match
 * Folder: frontend/src/screens/games/CapitalSmallMatch
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

import { useCapitalSmallMatchStore } from './store/capitalSmallMatchStore';
import { CapitalSmallMatchStackParamList } from './types';
import { generateRound } from './logic/roundGenerator';
import { ENGLISH_LETTER_CASE_PAIRS } from './data/letterCasePairs';
import { MatchTile, MatchTileState } from './components/MatchTile';
import { MatchConnectorLines, TileLayoutPosition } from './components/MatchConnectorLines';
import { FingerTrailOverlay, TouchPoint } from './components/FingerTrailOverlay';
import { WrongMatchModal } from './components/WrongMatchModal';
import { CelebrationOverlay } from '../../../components/CelebrationOverlay';
import { ProgressStarTrail } from '../../../components/ProgressStarTrail';
import { CartoonBackground } from '../../../components/CartoonBackground';
import { BigTouchTarget } from '../../../components/BigTouchTarget';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { fetchCapitalSmallMatchConfig } from '../../../services/gameConfigService';
import { triggerHapticSuccess, triggerHapticWarning } from '../../../services/hapticsService';

import {
  playTileLetterAudio,
  playWrongMatchRevealAudio,
  playRoundCompleteAudio,
} from './services/matchAudioService';

type NavProp = NativeStackNavigationProp<CapitalSmallMatchStackParamList>;

const WRONG_FEEDBACK_DURATION_MS = 400;
const MATCH_CELEBRATION_MS = 600;
const ROUND_CELEBRATION_DURATION_MS = 1400;
const SESSION_TOTAL_PAIRS = 12;
const INITIAL_TIMER_SECONDS = 50;

export const GameScreen: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavProp>();
  const { width: screenWidth } = useWindowDimensions();

  // Store selectors
  const roundPairs = useCapitalSmallMatchStore((s) => s.roundPairs);
  const capitalRowOrder = useCapitalSmallMatchStore((s) => s.capitalRowOrder);
  const lowercaseRowOrder = useCapitalSmallMatchStore((s) => s.lowercaseRowOrder);
  const selectedCapital = useCapitalSmallMatchStore((s) => s.selectedCapital);
  const matchedPairs = useCapitalSmallMatchStore((s) => s.matchedPairs);
  const score = useCapitalSmallMatchStore((s) => s.score);
  const roundIndex = useCapitalSmallMatchStore((s) => s.roundIndex);
  const sessionLength = useCapitalSmallMatchStore((s) => s.sessionLength);
  const sessionStartTime = useCapitalSmallMatchStore((s) => s.sessionStartTime);
  const itemsCorrect = useCapitalSmallMatchStore((s) => s.itemsCorrect);
  const itemsAttempted = useCapitalSmallMatchStore((s) => s.itemsAttempted);

  // Store actions
  const advanceRound = useCapitalSmallMatchStore((s) => s.advanceRound);
  const setRound = useCapitalSmallMatchStore((s) => s.setRound);
  const selectCapital = useCapitalSmallMatchStore((s) => s.selectCapital);
  const matchPair = useCapitalSmallMatchStore((s) => s.matchPair);
  const incrementScore = useCapitalSmallMatchStore((s) => s.incrementScore);
  const recordAttempt = useCapitalSmallMatchStore((s) => s.recordAttempt);
  const setSessionStartTime = useCapitalSmallMatchStore((s) => s.setSessionStartTime);
  const setSessionLength = useCapitalSmallMatchStore((s) => s.setSessionLength);

  // Ref to prevent double-firing round complete effect per round index
  const handledRoundIndexRef = useRef<number>(-1);
  const sessionIdRef = useRef<string>(`csm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);

  // Bidirectional selection state: tracks selected lowercase letter if tapped first
  const [selectedLowercase, setSelectedLowercase] = useState<string | null>(null);

  // Wrong Match Teaching Modal state
  const [teachingModalPair, setTeachingModalPair] = useState<{ capital: string; lowercase: string } | null>(null);

  // Live 50-Second Countdown Timer state
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIMER_SECONDS);

  // Local UI state
  const [wrongFlashPair, setWrongFlashPair] = useState<{ capital: string; lowercase: string } | null>(null);
  const [justMatchedCapital, setJustMatchedCapital] = useState<string | null>(null);
  const [showRoundCelebration, setShowRoundCelebration] = useState(false);
  const [interactionLocked, setInteractionLocked] = useState(false);

  // 12-Star Session-Wide Progress Trail State (accumulates across 3 rounds)
  const [sessionResults, setSessionResults] = useState<Array<'correct' | 'wrong'>>([]);

  // Accessibility & Drag Gesture state
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [trailPoints, setTrailPoints] = useState<TouchPoint[]>([]);
  const [gameAreaPageOffset, setGameAreaPageOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layout tracking for SVG connecting lines
  const [gameAreaDimensions, setGameAreaDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [leftColumnOffset, setLeftColumnOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rightColumnOffset, setRightColumnOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [capitalPositions, setCapitalPositions] = useState<Record<string, TileLayoutPosition>>({});
  const [lowercasePositions, setLowercasePositions] = useState<Record<string, TileLayoutPosition>>({});

  const previousRoundPairsRef = useRef<string[]>([]);

  // Detect screen reader status on mount & dynamically
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled().then((enabled) => {
      if (mounted) setIsScreenReaderActive(enabled);
    });

    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      setIsScreenReaderActive(enabled);
    });

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  // --- Fetch game config on mount ---
  useEffect(() => {
    fetchCapitalSmallMatchConfig().then((res) => {
      if (res.success && res.data?.items_per_session) {
        setSessionLength(res.data.items_per_session);
      }
    });
  }, [setSessionLength]);

  // --- Initialize first round on mount ---
  useEffect(() => {
    if (roundPairs.length === 0) {
      handledRoundIndexRef.current = -1;
      const round = generateRound(ENGLISH_LETTER_CASE_PAIRS, []);
      setRound(round.pairs, round.capitalRowOrder, round.lowercaseRowOrder);
      setSessionResults([]);
      if (!sessionStartTime) {
        setSessionStartTime(Date.now());
      }
    }
  }, [roundPairs.length, setRound, sessionStartTime, setSessionStartTime]);

  // --- 50-Second Countdown Session Timer ---
  const handleTimeUp = useCallback(() => {
    setInteractionLocked(true);
    const duration = sessionStartTime
      ? Math.round((Date.now() - sessionStartTime) / 1000)
      : INITIAL_TIMER_SECONDS;
    const accuracy = itemsAttempted > 0
      ? Math.round((itemsCorrect / itemsAttempted) * 100)
      : 100;
    const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const xpEarned = score > 0 ? score : (itemsCorrect * 10);

    navigation.navigate('CapitalSmallMatchSessionComplete', {
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
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [roundPairs.length, interactionLocked, teachingModalPair, handleTimeUp]);

  // --- Detect round completion & trigger celebration overlay & audio ---
  useEffect(() => {
    if (roundPairs.length === 0) return;
    if (matchedPairs.length < roundPairs.length) return;
    if (handledRoundIndexRef.current === roundIndex) return;

    handledRoundIndexRef.current = roundIndex;
    setInteractionLocked(true);
    setShowRoundCelebration(true);
    playRoundCompleteAudio();

    const timer = setTimeout(() => {
      setShowRoundCelebration(false);
      const nextRoundIndex = roundIndex + 1;
      const TOTAL_SESSION_ROUNDS = 3;

      if (nextRoundIndex >= TOTAL_SESSION_ROUNDS) {
        // Session complete navigation after 3 full rounds (12 total pairs)
        const duration = sessionStartTime
          ? Math.round((Date.now() - sessionStartTime) / 1000)
          : INITIAL_TIMER_SECONDS;
        const accuracy = itemsAttempted > 0
          ? Math.round((itemsCorrect / itemsAttempted) * 100)
          : 100;
        const starsEarned = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
        const xpEarned = score > 0 ? score : (itemsCorrect * 10);

        navigation.navigate('CapitalSmallMatchSessionComplete', {
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
        // Advance to next round atomically
        previousRoundPairsRef.current = roundPairs.map((p) => p.capital);
        const round = generateRound(ENGLISH_LETTER_CASE_PAIRS, previousRoundPairsRef.current);
        advanceRound(round.pairs, round.capitalRowOrder, round.lowercaseRowOrder);
        setSelectedLowercase(null);
        setCapitalPositions({});
        setLowercasePositions({});
      }
      setInteractionLocked(false);
    }, ROUND_CELEBRATION_DURATION_MS);

    return () => clearTimeout(timer);
  }, [matchedPairs.length, roundPairs, roundIndex, sessionStartTime, itemsAttempted, itemsCorrect, score, navigation, advanceRound, sessionResults]);

  // --- Evaluate match between capital & lowercase ---
  const evaluateMatch = useCallback(
    async (capChar: string, lowChar: string) => {
      const correctPair = roundPairs.find((p) => p.capital === capChar);
      if (!correctPair) return;

      if (correctPair.lowercase === lowChar) {
        // --- CORRECT MATCH ---
        triggerHapticSuccess();
        setJustMatchedCapital(capChar);
        matchPair(capChar);
        recordAttempt(true);
        incrementScore(10);
        setSessionResults((prev) => [...prev, 'correct']);
        selectCapital(null);
        setSelectedLowercase(null);

        setTimeout(() => {
          setJustMatchedCapital(null);
          setInteractionLocked(false);
        }, MATCH_CELEBRATION_MS);
      } else {
        // --- WRONG MATCH ---
        triggerHapticWarning();
        setWrongFlashPair({ capital: capChar, lowercase: lowChar });

        setTimeout(() => {
          setWrongFlashPair(null);
          setJustMatchedCapital(capChar);
          matchPair(capChar); // Auto-reveal correct pairing & draw line
          recordAttempt(false);
          setSessionResults((prev) => [...prev, 'wrong']);

          // Show interactive Teaching Modal overlay with correct pairing
          setTeachingModalPair({ capital: capChar, lowercase: correctPair.lowercase });
          selectCapital(null);
          setSelectedLowercase(null);
          setJustMatchedCapital(null);
          setInteractionLocked(false);
        }, WRONG_FEEDBACK_DURATION_MS);
      }
    },
    [roundPairs, matchPair, recordAttempt, incrementScore, selectCapital]
  );

  // --- Capital tile tap (bidirectional) ---
  const handleCapitalTap = useCallback((capital: string) => {
    if (interactionLocked) return;
    if (matchedPairs.includes(capital)) return;

    playTileLetterAudio(capital, true);

    if (selectedLowercase) {
      // User selected Small letter first, now tapped Capital letter -> Evaluate!
      setInteractionLocked(true);
      evaluateMatch(capital, selectedLowercase);
    } else if (selectedCapital === capital) {
      selectCapital(null); // Deselect
    } else {
      selectCapital(capital);
    }
  }, [interactionLocked, matchedPairs, selectedLowercase, selectedCapital, selectCapital, evaluateMatch]);

  // --- Lowercase tile tap (bidirectional) ---
  const handleLowercaseTap = useCallback(
    (lowercase: string) => {
      if (interactionLocked) return;
      const pairForLower = roundPairs.find((p) => p.lowercase === lowercase);
      if (pairForLower && matchedPairs.includes(pairForLower.capital)) return;

      playTileLetterAudio(lowercase, false);

      if (selectedCapital) {
        // User selected Capital letter first, now tapped Small letter -> Evaluate!
        setInteractionLocked(true);
        evaluateMatch(selectedCapital, lowercase);
      } else if (selectedLowercase === lowercase) {
        setSelectedLowercase(null); // Deselect
      } else {
        setSelectedLowercase(lowercase);
      }
    },
    [interactionLocked, roundPairs, matchedPairs, selectedCapital, selectedLowercase, evaluateMatch]
  );

  // --- Drag gesture handlers ---
  const handleDragStart = useCallback(
    (letter: string, row: 'capital' | 'lowercase', startX: number, startY: number) => {
      if (interactionLocked) return;
      setIsDragging(true);
      playTileLetterAudio(letter, row === 'capital');

      if (row === 'capital') {
        selectCapital(letter);
        setSelectedLowercase(null);
      } else {
        setSelectedLowercase(letter);
        selectCapital(null);
      }

      const relX = startX - gameAreaPageOffset.x;
      const relY = startY - gameAreaPageOffset.y;
      setTrailPoints([{ x: relX, y: relY }]);
    },
    [interactionLocked, selectCapital, gameAreaPageOffset]
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
    (letter: string, row: 'capital' | 'lowercase', endX: number, endY: number) => {
      setIsDragging(false);
      setTrailPoints([]);

      if (interactionLocked) return;

      const relX = endX - gameAreaPageOffset.x;
      const relY = endY - gameAreaPageOffset.y;

      if (row === 'capital') {
        let targetLowercase: string | null = null;
        for (const [lowChar, pos] of Object.entries(lowercasePositions)) {
          if (
            relX >= pos.x - 20 &&
            relX <= pos.x + pos.width + 20 &&
            relY >= pos.y - 20 &&
            relY <= pos.y + pos.height + 20
          ) {
            targetLowercase = lowChar;
            break;
          }
        }

        if (targetLowercase) {
          handleLowercaseTap(targetLowercase);
        } else {
          selectCapital(null);
        }
      } else {
        let targetCapital: string | null = null;
        for (const [capChar, pos] of Object.entries(capitalPositions)) {
          if (
            relX >= pos.x - 20 &&
            relX <= pos.x + pos.width + 20 &&
            relY >= pos.y - 20 &&
            relY <= pos.y + pos.height + 20
          ) {
            targetCapital = capChar;
            break;
          }
        }

        if (targetCapital) {
          handleCapitalTap(targetCapital);
        } else {
          setSelectedLowercase(null);
        }
      }
    },
    [interactionLocked, gameAreaPageOffset, lowercasePositions, capitalPositions, handleLowercaseTap, handleCapitalTap, selectCapital]
  );

  // --- Layout capture handlers ---
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

  const handleLeftColumnLayout = useCallback((e: LayoutChangeEvent) => {
    const { x, y } = e.nativeEvent.layout;
    setLeftColumnOffset({ x, y });
  }, []);

  const handleRightColumnLayout = useCallback((e: LayoutChangeEvent) => {
    const { x, y } = e.nativeEvent.layout;
    setRightColumnOffset({ x, y });
  }, []);

  const handleCapitalTileLayout = useCallback((capital: string, e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setCapitalPositions((prev) => ({
      ...prev,
      [capital]: {
        x: leftColumnOffset.x + x,
        y: leftColumnOffset.y + y,
        width,
        height,
      },
    }));
  }, [leftColumnOffset]);

  const handleLowercaseTileLayout = useCallback((lowercase: string, e: LayoutChangeEvent) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setLowercasePositions((prev) => ({
      ...prev,
      [lowercase]: {
        x: rightColumnOffset.x + x,
        y: rightColumnOffset.y + y,
        width,
        height,
      },
    }));
  }, [rightColumnOffset]);

  // --- Compute tile states (bidirectional) ---
  const getCapitalTileState = useCallback((capital: string): MatchTileState => {
    if (matchedPairs.includes(capital)) return 'matched';
    if (wrongFlashPair?.capital === capital) return 'wrong';
    if (selectedCapital === capital) return 'selected';
    return 'default';
  }, [matchedPairs, wrongFlashPair, selectedCapital]);

  const getLowercaseTileState = useCallback((lowercase: string): MatchTileState => {
    const pair = roundPairs.find((p) => p.lowercase === lowercase);
    if (!pair) return 'default';
    if (matchedPairs.includes(pair.capital)) return 'matched';
    if (wrongFlashPair?.lowercase === lowercase) return 'wrong';
    if (selectedLowercase === lowercase) return 'selected';
    return 'default';
  }, [roundPairs, matchedPairs, wrongFlashPair, selectedLowercase]);

  // --- Exit handler ---
  const handleExit = useCallback(() => {
    navigation.getParent()?.goBack();
  }, [navigation]);

  if (roundPairs.length === 0) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="light-content" backgroundColor="#1B2B5A" />
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading game...</Text>
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
              onPress={handleExit}
              accessibilityLabel={t('accessibility.exitToModeSelection')}
              accessibilityHint={t('accessibility.exitGameHint')}
              style={styles.exitButton}
            >
              <Text style={styles.exitIcon}>✕</Text>
            </BigTouchTarget>

            {/* Continuous 12-Star Session Progress Trail */}
            <ProgressStarTrail
              current={sessionResults.length}
              total={SESSION_TOTAL_PAIRS}
              roundResults={sessionResults}
              style={styles.starTrail}
            />

            {/* Live 50-Second Countdown Timer Badge */}
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
            <MatchConnectorLines
              matchedCapitals={matchedPairs}
              capitalPositions={capitalPositions}
              lowercasePositions={lowercasePositions}
              capitalRowOrder={capitalRowOrder}
              lowercaseRowOrder={lowercaseRowOrder}
              roundPairs={roundPairs}
              justMatchedCapital={justMatchedCapital}
              width={gameAreaDimensions.width}
              height={gameAreaDimensions.height}
            />

            {/* Dynamic Finger Trail Overlay */}
            <FingerTrailOverlay
              active={isDragging}
              points={trailPoints}
              width={gameAreaDimensions.width}
              height={gameAreaDimensions.height}
            />

            {/* 2-Column Grid Layout */}
            <View style={styles.columnsRow}>
              {/* Left Column: CAPITAL LETTERS */}
              <View style={styles.columnGroup} onLayout={handleLeftColumnLayout}>
                <Text style={styles.columnLabel}>{t('capitalSmallMatch.capitalRowLabel')}</Text>
                <View style={styles.tileColumn}>
                  {capitalRowOrder.map((pairIdx, displayIdx) => {
                    const pair = roundPairs[pairIdx];
                    if (!pair) return null;
                    return (
                      <View
                        key={`cap-${pair.capital}`}
                        onLayout={(e) => handleCapitalTileLayout(pair.capital, e)}
                      >
                        <MatchTile
                          letter={pair.capital}
                          tileIndex={displayIdx}
                          state={getCapitalTileState(pair.capital)}
                          row="capital"
                          onPress={() => handleCapitalTap(pair.capital)}
                          onDragStart={handleDragStart}
                          onDragUpdate={handleDragUpdate}
                          onDragEnd={handleDragEnd}
                          isScreenReaderActive={isScreenReaderActive}
                          disabled={interactionLocked || matchedPairs.includes(pair.capital)}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Central Drag Runway / Visual Separator */}
              <View style={styles.runwaySeparator}>
                <View style={styles.runwayLine} />
                <Text style={styles.runwayIcon}>↔</Text>
                <View style={styles.runwayLine} />
              </View>

              {/* Right Column: SMALL LETTERS */}
              <View style={styles.columnGroup} onLayout={handleRightColumnLayout}>
                <Text style={styles.columnLabel}>{t('capitalSmallMatch.lowercaseRowLabel')}</Text>
                <View style={styles.tileColumn}>
                  {lowercaseRowOrder.map((pairIdx, displayIdx) => {
                    const pair = roundPairs[pairIdx];
                    if (!pair) return null;
                    return (
                      <View
                        key={`low-${pair.lowercase}`}
                        onLayout={(e) => handleLowercaseTileLayout(pair.lowercase, e)}
                      >
                        <MatchTile
                          letter={pair.lowercase}
                          tileIndex={displayIdx}
                          state={getLowercaseTileState(pair.lowercase)}
                          row="lowercase"
                          onPress={() => handleLowercaseTap(pair.lowercase)}
                          onDragStart={handleDragStart}
                          onDragUpdate={handleDragUpdate}
                          onDragEnd={handleDragEnd}
                          isScreenReaderActive={isScreenReaderActive}
                          disabled={interactionLocked || matchedPairs.includes(pair.capital)}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* Round progress footer */}
          <View style={styles.footer}>
            <Text style={styles.progressText}>
              {matchedPairs.length} / {roundPairs.length} pairs matched • Round {roundIndex + 1} of {sessionLength}
            </Text>
          </View>
        </SafeAreaView>

        {/* Interactive Wrong-Answer Teaching Modal */}
        {teachingModalPair && (
          <WrongMatchModal
            visible={!!teachingModalPair}
            capital={teachingModalPair.capital}
            lowercase={teachingModalPair.lowercase}
            onDismiss={() => setTeachingModalPair(null)}
          />
        )}

        {/* Round Complete Celebration Overlay */}
        <CelebrationOverlay
          visible={showRoundCelebration}
          isBigCelebration
        />
      </View>
    </GestureHandlerRootView>
  );
});

GameScreen.displayName = 'CapitalSmallMatchGameScreen';

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
