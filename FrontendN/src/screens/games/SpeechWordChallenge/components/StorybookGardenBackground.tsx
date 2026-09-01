/**
 * Purpose: Living Storybook Garden background scene for Speech Word Challenge.
 * Features: Layered hills, storybook canopy trees, wooden fence, winding garden path,
 *           fluttering butterflies, birds, soft clouds, flower clusters, mushrooms,
 *           garden stones, and subtle acoustic sound-wave/musical note decorations.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G, Polygon, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export const StorybookGardenBackground: React.FC = React.memo(() => {
  const { width: screenWidth } = useWindowDimensions();
  const [reduceMotion, setReduceMotion] = useState(false);

  // Animation values for UI-thread execution
  const cloud1X = useSharedValue(0);
  const cloud2X = useSharedValue(0);
  const butterfly1X = useSharedValue(0);
  const butterfly1Y = useSharedValue(0);
  const butterfly2X = useSharedValue(0);
  const butterfly2Y = useSharedValue(0);
  const sunGlow = useSharedValue(1);
  const birdFlyX = useSharedValue(0);
  const noteFloat1 = useSharedValue(0);
  const noteFloat2 = useSharedValue(0);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (isMounted) setReduceMotion(reduced);
    });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduced) => {
      if (isMounted) setReduceMotion(reduced);
    });

    return () => {
      isMounted = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    // Drifting clouds
    cloud1X.value = withRepeat(
      withSequence(
        withTiming(18, { duration: 6000, easing: Easing.inOut(Easing.quad) }),
        withTiming(-18, { duration: 6000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    cloud2X.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 7000, easing: Easing.inOut(Easing.quad) }),
        withTiming(14, { duration: 7000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Fluttering butterflies
    butterfly1X.value = withRepeat(
      withSequence(
        withTiming(12, { duration: 2400 }),
        withTiming(-10, { duration: 2800 })
      ),
      -1,
      true
    );
    butterfly1Y.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1600 }),
        withTiming(6, { duration: 2000 })
      ),
      -1,
      true
    );

    butterfly2X.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 3200 }),
        withTiming(12, { duration: 3000 })
      ),
      -1,
      true
    );
    butterfly2Y.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 2200 }),
        withTiming(-8, { duration: 2400 })
      ),
      -1,
      true
    );

    // Warm sun pulse
    sunGlow.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.96, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Distant gliding bird
    birdFlyX.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 4500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-20, { duration: 4500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Subtle musical note floating
    noteFloat1.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 3000 }),
        withTiming(4, { duration: 3000 })
      ),
      -1,
      true
    );
    noteFloat2.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 3600 }),
        withTiming(-8, { duration: 3600 })
      ),
      -1,
      true
    );
  }, [reduceMotion, cloud1X, cloud2X, butterfly1X, butterfly1Y, butterfly2X, butterfly2Y, sunGlow, birdFlyX, noteFloat1, noteFloat2]);

  const cloud1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud1X.value }],
  }));

  const cloud2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud2X.value }],
  }));

  const butterfly1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: butterfly1X.value },
      { translateY: butterfly1Y.value },
    ],
  }));

  const butterfly2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: butterfly2X.value },
      { translateY: butterfly2Y.value },
    ],
  }));

  const sunAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sunGlow.value }],
  }));

  const birdAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: birdFlyX.value }],
  }));

  const note1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: noteFloat1.value }],
  }));

  const note2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: noteFloat2.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Sky Gradient: Soft pastel morning azure fading to peach horizon */}
      <LinearGradient
        colors={['#7DD3FC', '#BAE6FD', '#FEF08A', '#FED7AA']}
        locations={[0, 0.45, 0.8, 1]}
        style={styles.skyGradient}
      />

      {/* 2. Warm Morning Sun & Radiance */}
      <Animated.View style={[styles.sunContainer, sunAnimatedStyle]}>
        <Svg width={110} height={110} viewBox="0 0 110 110">
          <Defs>
            <SvgGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
              <Stop offset="60%" stopColor="#FDE047" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
            </SvgGradient>
          </Defs>
          <Circle cx="55" cy="55" r="48" fill="#FEF08A" opacity={0.35} />
          <Circle cx="55" cy="55" r="38" fill="url(#sunGrad)" />
          {/* Subtle smiling sun face */}
          <Circle cx="45" cy="50" r="3" fill="#B45309" />
          <Circle cx="65" cy="50" r="3" fill="#B45309" />
          <Path d="M 45 62 Q 55 70 65 62" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </Svg>
      </Animated.View>

      {/* 3. Soft Drifting Clouds */}
      <Animated.View style={[styles.cloudLayer1, cloud1Style]}>
        <Svg width={140} height={60} viewBox="0 0 140 60">
          <Path
            d="M 25 45 Q 10 45 10 32 Q 10 20 24 20 Q 32 8 48 10 Q 64 2 82 12 Q 98 6 112 18 Q 128 20 128 34 Q 128 45 115 45 Z"
            fill="#FFFFFF"
            opacity={0.88}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.cloudLayer2, cloud2Style]}>
        <Svg width={120} height={50} viewBox="0 0 120 50">
          <Path
            d="M 20 38 Q 8 38 8 26 Q 8 16 20 16 Q 28 6 42 8 Q 56 2 70 10 Q 84 5 96 15 Q 110 17 110 28 Q 110 38 98 38 Z"
            fill="#FFFFFF"
            opacity={0.8}
          />
        </Svg>
      </Animated.View>

      {/* 4. Distant Gliding Storybook Birds */}
      <Animated.View style={[styles.birdContainer, birdAnimatedStyle]}>
        <Svg width={50} height={25} viewBox="0 0 50 25">
          <Path d="M 5 15 Q 12 5 20 12 Q 28 5 35 15" stroke="#0369A1" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.6} />
          <Path d="M 28 8 Q 33 2 39 7 Q 44 2 48 8" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity={0.5} />
        </Svg>
      </Animated.View>

      {/* 5. Acoustic Sound-Wave & Musical Note Decorations */}
      <Animated.View style={[styles.noteContainer1, note1Style]}>
        <Svg width={28} height={32} viewBox="0 0 28 32">
          <Path
            d="M 18 6 L 18 20 C 18 23 15 25 12 25 C 9 25 7 23 7 21 C 7 19 9 17 12 17 C 14 17 16 18 17 19 L 17 8 L 24 5 L 24 10 Z"
            fill="#F472B6"
            opacity={0.55}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.noteContainer2, note2Style]}>
        <Svg width={24} height={28} viewBox="0 0 24 28">
          <Circle cx="8" cy="20" r="4" fill="#38BDF8" opacity={0.55} />
          <Path d="M 12 20 L 12 4 Q 18 6 18 10" stroke="#38BDF8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity={0.55} />
        </Svg>
      </Animated.View>

      {/* 6. Distant Lavender & Emerald Hills */}
      <View style={styles.distantHillsLayer}>
        <Svg width={screenWidth} height={180} viewBox="0 0 400 180" preserveAspectRatio="none">
          {/* Back distant mountain */}
          <Path d="M 0 120 Q 80 50 180 90 Q 280 40 400 110 L 400 180 L 0 180 Z" fill="#93C5FD" opacity={0.45} />
          {/* Mid green rolling hill */}
          <Path d="M 0 100 Q 120 40 260 85 Q 340 60 400 95 L 400 180 L 0 180 Z" fill="#86EFAC" opacity={0.65} />
        </Svg>
      </View>

      {/* 7. Foreground Storybook Meadow, Trees & Garden Path */}
      <View style={styles.foregroundGardenLayer}>
        <Svg width={screenWidth} height={260} viewBox="0 0 400 260" preserveAspectRatio="none">
          <Defs>
            <SvgGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#4ADE80" />
              <Stop offset="40%" stopColor="#22C55E" />
              <Stop offset="100%" stopColor="#15803D" />
            </SvgGradient>
            <SvgGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FDE68A" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </SvgGradient>
          </Defs>

          {/* Lush Foreground Main Meadow */}
          <Path d="M 0 60 Q 140 15 280 45 Q 360 30 400 50 L 400 260 L 0 260 Z" fill="url(#grassGrad)" />

          {/* Winding Storybook Garden Path */}
          <Path
            d="M 170 50 Q 200 120 180 180 Q 160 220 190 260 L 240 260 Q 210 210 230 170 Q 250 110 220 50 Z"
            fill="url(#pathGrad)"
            opacity={0.75}
          />

          {/* Garden Stepping Stones */}
          <Circle cx="195" cy="85" r="5" fill="#E2E8F0" opacity={0.8} />
          <Circle cx="210" cy="125" r="6" fill="#CBD5E1" opacity={0.85} />
          <Circle cx="190" cy="165" r="7" fill="#E2E8F0" opacity={0.8} />
          <Circle cx="205" cy="210" r="7" fill="#CBD5E1" opacity={0.85} />

          {/* Left Storybook Apple / Fruit Tree */}
          <G transform="translate(-10, 10)">
            {/* Tree Trunk */}
            <Path d="M 38 70 Q 42 35 40 10 L 48 10 Q 50 35 54 70 Z" fill="#92400E" />
            {/* Canopy Layers */}
            <Circle cx="44" cy="5" r="28" fill="#16A34A" />
            <Circle cx="26" cy="18" r="22" fill="#22C55E" />
            <Circle cx="62" cy="18" r="22" fill="#15803D" />
            <Circle cx="44" cy="15" r="20" fill="#4ADE80" opacity={0.85} />
            {/* Little Red Apples on Tree */}
            <Circle cx="32" cy="8" r="3.5" fill="#EF4444" />
            <Circle cx="55" cy="12" r="3.5" fill="#EF4444" />
            <Circle cx="40" cy="25" r="3.5" fill="#EF4444" />
          </G>

          {/* Right Whimsical Oak Tree */}
          <G transform="translate(325, 0)">
            <Path d="M 40 85 Q 44 45 42 20 L 50 20 Q 52 45 56 85 Z" fill="#78350F" />
            <Circle cx="46" cy="12" r="32" fill="#15803D" />
            <Circle cx="25" cy="28" r="24" fill="#22C55E" />
            <Circle cx="68" cy="28" r="24" fill="#16A34A" />
            <Circle cx="46" cy="24" r="22" fill="#86EFAC" opacity={0.75} />
          </G>

          {/* Wooden Picket Fence along left garden */}
          <G transform="translate(10, 70)">
            {/* Rails */}
            <Rect x="0" y="22" width="90" height="4" rx="2" fill="#D97706" />
            <Rect x="0" y="36" width="90" height="4" rx="2" fill="#D97706" />
            {/* Pickets */}
            <Polygon points="10,48 10,12 14,8 18,12 18,48" fill="#FBBF24" />
            <Polygon points="30,50 30,14 34,10 38,14 38,50" fill="#FBBF24" />
            <Polygon points="50,52 50,16 54,12 58,16 58,52" fill="#FBBF24" />
            <Polygon points="70,54 70,18 74,14 78,18 78,54" fill="#FBBF24" />
          </G>

          {/* Red Spotted Storybook Mushrooms */}
          <G transform="translate(105, 95)">
            {/* Stem */}
            <Rect x="12" y="14" width="6" height="12" rx="3" fill="#FEF3C7" />
            {/* Cap */}
            <Path d="M 5 15 Q 15 0 25 15 Z" fill="#EF4444" />
            {/* Dots */}
            <Circle cx="11" cy="8" r="1.5" fill="#FFFFFF" />
            <Circle cx="19" cy="9" r="1.5" fill="#FFFFFF" />
            <Circle cx="15" cy="13" r="1.2" fill="#FFFFFF" />
          </G>

          {/* Layered Bushes & Flower Clusters */}
          {/* Left Bush */}
          <Circle cx="95" cy="85" r="14" fill="#15803D" />
          <Circle cx="110" cy="82" r="16" fill="#22C55E" />
          <Circle cx="125" cy="86" r="13" fill="#16A34A" />

          {/* Yellow Daisy Flower Cluster */}
          <Circle cx="92" cy="78" r="3" fill="#FDE047" />
          <Circle cx="108" cy="74" r="3.5" fill="#F472B6" />
          <Circle cx="122" cy="77" r="3" fill="#38BDF8" />

          {/* Right Flower Cluster */}
          <G transform="translate(290, 80)">
            <Circle cx="8" cy="12" r="12" fill="#16A34A" />
            <Circle cx="22" cy="10" r="14" fill="#22C55E" />
            <Circle cx="35" cy="13" r="11" fill="#15803D" />
            {/* Tulips */}
            <Circle cx="10" cy="4" r="3.5" fill="#F43F5E" />
            <Circle cx="24" cy="2" r="4" fill="#F59E0B" />
            <Circle cx="36" cy="5" r="3.5" fill="#EC4899" />
          </G>
        </Svg>
      </View>

      {/* 8. Fluttering Animated Storybook Butterflies */}
      <Animated.View style={[styles.butterfly1, butterfly1Style]}>
        <Svg width={24} height={20} viewBox="0 0 24 20">
          {/* Wings */}
          <Path d="M 12 10 Q 5 0 2 6 Q 0 12 10 12 Z" fill="#F472B6" />
          <Path d="M 12 10 Q 19 0 22 6 Q 24 12 14 12 Z" fill="#F472B6" />
          <Path d="M 12 10 Q 6 16 5 18 Q 10 20 12 12 Z" fill="#FBCFE8" />
          <Path d="M 12 10 Q 18 16 19 18 Q 14 20 12 12 Z" fill="#FBCFE8" />
          <Circle cx="12" cy="10" r="1.5" fill="#831843" />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.butterfly2, butterfly2Style]}>
        <Svg width={22} height={18} viewBox="0 0 22 18">
          <Path d="M 11 9 Q 4 0 2 5 Q 0 10 9 10 Z" fill="#38BDF8" />
          <Path d="M 11 9 Q 18 0 20 5 Q 22 10 13 10 Z" fill="#38BDF8" />
          <Circle cx="11" cy="9" r="1.2" fill="#0369A1" />
        </Svg>
      </Animated.View>
    </View>
  );
});

StorybookGardenBackground.displayName = 'StorybookGardenBackground';

const styles = StyleSheet.create({
  skyGradient: {
    ...StyleSheet.absoluteFill,
    height: '65%',
  },
  sunContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    zIndex: 1,
  },
  cloudLayer1: {
    position: 'absolute',
    top: 40,
    left: '8%',
    zIndex: 2,
  },
  cloudLayer2: {
    position: 'absolute',
    top: 75,
    right: '12%',
    zIndex: 2,
  },
  birdContainer: {
    position: 'absolute',
    top: 60,
    left: '42%',
    zIndex: 2,
  },
  noteContainer1: {
    position: 'absolute',
    top: 110,
    left: '14%',
    zIndex: 3,
  },
  noteContainer2: {
    position: 'absolute',
    top: 95,
    right: '28%',
    zIndex: 3,
  },
  distantHillsLayer: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    height: 180,
    zIndex: 3,
  },
  foregroundGardenLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    zIndex: 4,
  },
  butterfly1: {
    position: 'absolute',
    bottom: 140,
    left: '22%',
    zIndex: 5,
  },
  butterfly2: {
    position: 'absolute',
    bottom: 180,
    right: '25%',
    zIndex: 5,
  },
});
