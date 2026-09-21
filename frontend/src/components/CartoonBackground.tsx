/**
 * Purpose: Living cartoon illustrated background scene supporting 'meadow' (daylight),
 *          'evening' (warm sunset/dusk), and 'hub' (airy golden sunrise scenery) themes.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Path } from 'react-native-svg';
import { Colors } from '../theme/colors';

export type CartoonBackgroundTheme =
  | 'meadow'
  | 'evening'
  | 'hub'
  | 'jungle'
  | 'orchard'
  | 'nature'
  | 'math'
  | 'puzzle'
  | 'library'
  | 'rainbow'
  | 'geometry'
  | 'art'
  | 'alphabet';

export interface CartoonBackgroundProps {
  theme?: CartoonBackgroundTheme;
}

/**
 * Standard vertical height to ensure all interactive controls, cards, and text
 * start completely clear of the top cartoon clouds, sun, and mobile status panel.
 */
export const CLOUD_CLEARANCE_HEIGHT = 125;

export interface CloudClearanceSpacerProps {
  height?: number;
}

export const CloudClearanceSpacer: React.FC<CloudClearanceSpacerProps> = React.memo(
  ({ height }) => {
    const { height: windowHeight } = useWindowDimensions();
    const effectiveHeight = height !== undefined ? height : (windowHeight <= 750 ? 10 : 18);
    return <View style={{ height: effectiveHeight, width: '100%' }} pointerEvents="none" />;
  }
);

export const CartoonBackground: React.FC<CartoonBackgroundProps> = React.memo(({ theme = 'meadow' }) => {
  const { width } = useWindowDimensions();

  const isEvening = theme === 'evening';
  const isHub = theme === 'hub';

  const cloud1X = useSharedValue(0);
  const cloud2X = useSharedValue(0);
  const cloud3X = useSharedValue(0);
  const sunPulse = useSharedValue(1);
  const sunRotate = useSharedValue(0);
  const hillSway = useSharedValue(0);
  const bird1X = useSharedValue(0);
  const bird2X = useSharedValue(0);
  const bird3X = useSharedValue(0);
  const starTwinkle = useSharedValue(0.4);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (isMounted && !reduced) {
        cloud1X.value = withRepeat(
          withSequence(
            withTiming(16, { duration: 5200 }),
            withTiming(-16, { duration: 5200 })
          ),
          -1,
          true
        );
        cloud2X.value = withRepeat(
          withSequence(
            withTiming(-14, { duration: 5800 }),
            withTiming(14, { duration: 5800 })
          ),
          -1,
          true
        );
        cloud3X.value = withRepeat(
          withSequence(
            withTiming(12, { duration: 6200 }),
            withTiming(-12, { duration: 6200 })
          ),
          -1,
          true
        );
        sunPulse.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2200 }),
            withTiming(0.98, { duration: 2200 })
          ),
          -1,
          true
        );
        sunRotate.value = withRepeat(
          withTiming(360, { duration: 18000, easing: Easing.linear }),
          -1,
          false
        );
        hillSway.value = withRepeat(
          withSequence(
            withTiming(-2.5, { duration: 3800 }),
            withTiming(2.5, { duration: 3800 })
          ),
          -1,
          true
        );
        bird1X.value = withRepeat(
          withSequence(
            withTiming(18, { duration: 4200 }),
            withTiming(-18, { duration: 4200 })
          ),
          -1,
          true
        );
        bird2X.value = withRepeat(
          withSequence(
            withTiming(-12, { duration: 5000 }),
            withTiming(12, { duration: 5000 })
          ),
          -1,
          true
        );
        bird3X.value = withRepeat(
          withSequence(
            withTiming(14, { duration: 5400 }),
            withTiming(-14, { duration: 5400 })
          ),
          -1,
          true
        );
        starTwinkle.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1800 }),
            withTiming(0.3, { duration: 1800 })
          ),
          -1,
          true
        );
      }
    });
    return () => {
      isMounted = false;
    };
  }, [cloud1X, cloud2X, cloud3X, sunPulse, sunRotate, hillSway, bird1X, bird2X, bird3X, starTwinkle]);

  const cloud1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud1X.value }],
  }));

  const cloud2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud2X.value }],
  }));

  const cloud3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: cloud3X.value }],
  }));

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sunPulse.value }],
  }));

  const sunRayRotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sunRotate.value}deg` }],
  }));

  const hillSwayStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: hillSway.value }],
  }));

  const bird1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: bird1X.value }],
  }));

  const bird2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: bird2X.value }],
  }));

  const bird3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: bird3X.value }],
  }));

  const starStyle = useAnimatedStyle(() => ({
    opacity: starTwinkle.value,
  }));

  const svgWidth = Math.max(width, 480);

  // 1. Multi-Stop Sky Gradient Tokens
  let skyColors: [string, string, ...string[]] = ['#38BDF8', '#60A5FA', '#93C5FD', '#BAE6FD', '#E0F2FE'];
  let skyLocations: [number, number, ...number[]] = [0, 0.32, 0.58, 0.82, 1.0];

  if (theme === 'evening') {
    skyColors = ['#2E1065', '#581C87', '#831843', '#BE185D', '#F43F5E', '#FB923C'];
    skyLocations = [0, 0.22, 0.45, 0.68, 0.86, 1.0];
  } else if (theme === 'hub') {
    skyColors = ['#0E7490', '#06B6D4', '#67E8F9', '#FDE047', '#FEF08A'];
    skyLocations = [0, 0.25, 0.5, 0.75, 1.0];
  } else if (theme === 'jungle') {
    skyColors = ['#064E3B', '#047857', '#059669', '#10B981', '#34D399', '#A7F3D0'];
    skyLocations = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  } else if (theme === 'orchard') {
    skyColors = ['#EA580C', '#F97316', '#FB923C', '#FDE047', '#FEF08A'];
    skyLocations = [0, 0.25, 0.5, 0.75, 1.0];
  } else if (theme === 'nature') {
    skyColors = ['#0284C7', '#38BDF8', '#7DD3FC', '#BAE6FD', '#F0FDF4'];
    skyLocations = [0, 0.25, 0.5, 0.75, 1.0];
  } else if (theme === 'math') {
    skyColors = ['#1E1B4B', '#312E81', '#4338CA', '#6366F1', '#A5B4FC', '#E0E7FF'];
    skyLocations = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  } else if (theme === 'puzzle') {
    skyColors = ['#3B0764', '#581C87', '#7E22CE', '#A855F7', '#D8B4FE', '#FAF5FF'];
    skyLocations = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  } else if (theme === 'library') {
    skyColors = ['#78350F', '#92400E', '#B45309', '#F59E0B', '#FDE68A', '#FEF3C7'];
    skyLocations = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  } else if (theme === 'rainbow') {
    skyColors = ['#E11D48', '#EA580C', '#D97706', '#16A34A', '#2563EB', '#7C3AED', '#EC4899'];
    skyLocations = [0, 0.16, 0.33, 0.5, 0.67, 0.84, 1.0];
  } else if (theme === 'geometry') {
    skyColors = ['#0F172A', '#1E293B', '#334155', '#2563EB', '#60A5FA', '#93C5FD'];
    skyLocations = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  } else if (theme === 'art') {
    skyColors = ['#831843', '#BE185D', '#DB2777', '#F472B6', '#FBCFE8', '#FFF1F2'];
    skyLocations = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  } else if (theme === 'alphabet') {
    skyColors = ['#4338CA', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#EEF2FF'];
    skyLocations = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  }

  // 2. Mountains Fill
  let mountain1Fill = '#334155';
  let mountain2Fill = '#475569';
  if (theme === 'evening') {
    mountain1Fill = Colors.sceneEvening.mountainDark;
    mountain2Fill = Colors.sceneEvening.mountainMid;
  } else if (theme === 'hub') {
    mountain1Fill = Colors.sceneHub.mountainDark;
    mountain2Fill = Colors.sceneHub.mountainMid;
  } else if (theme === 'jungle') {
    mountain1Fill = '#022C22';
    mountain2Fill = '#064E3B';
  } else if (theme === 'orchard') {
    mountain1Fill = '#7C2D12';
    mountain2Fill = '#9A3412';
  } else if (theme === 'math') {
    mountain1Fill = '#1E1B4B';
    mountain2Fill = '#312E81';
  } else if (theme === 'puzzle') {
    mountain1Fill = '#2E1065';
    mountain2Fill = '#3B0764';
  } else if (theme === 'library') {
    mountain1Fill = '#451A03';
    mountain2Fill = '#78350F';
  } else if (theme === 'rainbow') {
    mountain1Fill = '#4C1D95';
    mountain2Fill = '#6B21A8';
  } else if (theme === 'geometry') {
    mountain1Fill = '#0F172A';
    mountain2Fill = '#1E293B';
  } else if (theme === 'art') {
    mountain1Fill = '#500724';
    mountain2Fill = '#831843';
  } else if (theme === 'alphabet') {
    mountain1Fill = '#312E81';
    mountain2Fill = '#3730A3';
  }

  // 3. Hills Fill
  let hill1Bg = '#F472B6';
  let hill2Bg = '#4ADE80';
  let hill3Bg = '#22C55E';
  if (theme === 'evening') {
    hill1Bg = Colors.sceneEvening.hillBack;
    hill2Bg = Colors.sceneEvening.hillMid;
    hill3Bg = Colors.sceneEvening.hillFront;
  } else if (theme === 'hub') {
    hill1Bg = Colors.sceneHub.hillBack;
    hill2Bg = Colors.sceneHub.hillMid;
    hill3Bg = Colors.sceneHub.hillFront;
  } else if (theme === 'jungle') {
    hill1Bg = '#047857';
    hill2Bg = '#059669';
    hill3Bg = '#10B981';
  } else if (theme === 'orchard') {
    hill1Bg = '#FB923C';
    hill2Bg = '#84CC16';
    hill3Bg = '#65A30D';
  } else if (theme === 'math') {
    hill1Bg = '#3730A3';
    hill2Bg = '#4F46E5';
    hill3Bg = '#6366F1';
  } else if (theme === 'puzzle') {
    hill1Bg = '#7C3AED';
    hill2Bg = '#8B5CF6';
    hill3Bg = '#A855F7';
  } else if (theme === 'library') {
    hill1Bg = '#D97706';
    hill2Bg = '#B45309';
    hill3Bg = '#059669';
  } else if (theme === 'rainbow') {
    hill1Bg = '#EC4899';
    hill2Bg = '#8B5CF6';
    hill3Bg = '#10B981';
  } else if (theme === 'geometry') {
    hill1Bg = '#1D4ED8';
    hill2Bg = '#2563EB';
    hill3Bg = '#3B82F6';
  } else if (theme === 'art') {
    hill1Bg = '#DB2777';
    hill2Bg = '#EC4899';
    hill3Bg = '#F472B6';
  } else if (theme === 'alphabet') {
    hill1Bg = '#6366F1';
    hill2Bg = '#10B981';
    hill3Bg = '#059669';
  }

  const treeTrunkBg = isEvening ? Colors.sceneEvening.treeTrunk : Colors.scene.treeTrunk;
  const treeDarkBg = isEvening ? Colors.sceneEvening.treeLeafDark : Colors.scene.treeLeafDark;
  const treeMidBg = isEvening ? Colors.sceneEvening.treeLeafMid : Colors.scene.treeLeafMid;
  const treeLightBg = isEvening ? Colors.sceneEvening.treeLeafLight : Colors.scene.treeLeafLight;

  const bushDarkFill = isEvening ? Colors.sceneEvening.bushDark : '#064E3B';
  const bushMidFill = isEvening ? Colors.sceneEvening.bushMid : '#14532D';
  const bushFrontFill = isEvening ? Colors.sceneEvening.bushFront : '#166534';

  const sunCoreColor = isEvening ? Colors.sceneEvening.sunCore : Colors.scene.sunCore;
  const sunBorderColor = isEvening ? Colors.sceneEvening.sunBorder : Colors.scene.sunBorder;
  const sunGlowColor = isEvening ? Colors.sceneEvening.sunGlow : Colors.scene.sunGlow;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Multi-Stop Continuous Sky Gradient */}
      <LinearGradient
        colors={skyColors}
        locations={skyLocations}
        style={StyleSheet.absoluteFill}
      />

      {/* Themed Floating Sky Elements */}
      {theme === 'evening' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '12%' }, starStyle]}>✨</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '8%', left: '38%' }, starStyle]}>⭐</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '62%' }, starStyle]}>✦</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '7%', left: '84%' }, starStyle]}>✨</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '22%' }, starStyle]}>✦</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '14%', left: '76%' }, starStyle]}>⭐</Animated.Text>
        </>
      )}
      {theme === 'math' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '10%' }, starStyle]}>➕</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '11%', left: '26%' }, starStyle]}>🔢</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '46%' }, starStyle]}>✖️</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '68%' }, starStyle]}>➗</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '5%', left: '84%' }, starStyle]}>➖</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '15%', left: '38%' }, starStyle]}>⭐</Animated.Text>
        </>
      )}
      {theme === 'puzzle' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '12%' }, starStyle]}>🧩</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '10%', left: '32%' }, starStyle]}>💎</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '55%' }, starStyle]}>🔮</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '72%' }, starStyle]}>💡</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '6%', left: '86%' }, starStyle]}>⏳</Animated.Text>
        </>
      )}
      {theme === 'library' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '14%' }, starStyle]}>📖</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '28%' }, starStyle]}>✏️</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '52%' }, starStyle]}>🔤</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '13%', left: '70%' }, starStyle]}>📜</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '5%', left: '85%' }, starStyle]}>✨</Animated.Text>
        </>
      )}
      {theme === 'jungle' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '12%' }, starStyle]}>🦋</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '10%', left: '25%' }, starStyle]}>🐾</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '58%' }, starStyle]}>🌿</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '74%' }, starStyle]}>🌴</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '6%', left: '88%' }, starStyle]}>✨</Animated.Text>
        </>
      )}
      {theme === 'orchard' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '14%' }, starStyle]}>🍎</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '11%', left: '30%' }, starStyle]}>🍊</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '54%' }, starStyle]}>🍓</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '13%', left: '72%' }, starStyle]}>🍇</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '5%', left: '86%' }, starStyle]}>🐝</Animated.Text>
        </>
      )}
      {theme === 'rainbow' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '10%' }, starStyle]}>🌈</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '11%', left: '28%' }, starStyle]}>✨</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '48%' }, starStyle]}>⭐</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '70%' }, starStyle]}>🌸</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '5%', left: '85%' }, starStyle]}>💫</Animated.Text>
        </>
      )}
      {theme === 'geometry' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '12%' }, starStyle]}>🔺</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '11%', left: '30%' }, starStyle]}>🔷</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '52%' }, starStyle]}>🟡</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '13%', left: '72%' }, starStyle]}>⬡</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '5%', left: '86%' }, starStyle]}>💠</Animated.Text>
        </>
      )}
      {theme === 'art' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '12%' }, starStyle]}>🎨</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '11%', left: '30%' }, starStyle]}>🖌️</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '54%' }, starStyle]}>✨</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '72%' }, starStyle]}>🖍️</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '6%', left: '86%' }, starStyle]}>💫</Animated.Text>
        </>
      )}
      {theme === 'nature' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '14%' }, starStyle]}>🍃</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '10%', left: '32%' }, starStyle]}>🌸</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '56%' }, starStyle]}>🌻</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '74%' }, starStyle]}>🌱</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '6%', left: '88%' }, starStyle]}>✨</Animated.Text>
        </>
      )}
      {theme === 'alphabet' && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '10%' }, starStyle]}>🔤</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '11%', left: '26%' }, starStyle]}>🅰️</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '50%' }, starStyle]}>⭐</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '72%' }, starStyle]}>🅱️</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '5%', left: '86%' }, starStyle]}>✨</Animated.Text>
        </>
      )}

      {/* SVG Distant Mountain Silhouettes */}
      <View style={styles.mountainsContainer}>
        <Svg height="140" width={svgWidth} style={StyleSheet.absoluteFill}>
          <Polygon
            points={`0,140 0,65 ${svgWidth * 0.22},15 ${svgWidth * 0.45},80 ${svgWidth * 0.7},25 ${svgWidth * 0.88},75 ${svgWidth},35 ${svgWidth},140`}
            fill={mountain1Fill}
            opacity={isEvening ? 0.65 : isHub ? 0.4 : 0.32}
          />
          <Polygon
            points={`0,140 0,85 ${svgWidth * 0.15},40 ${svgWidth * 0.35},95 ${svgWidth * 0.58},30 ${svgWidth * 0.82},85 ${svgWidth},45 ${svgWidth},140`}
            fill={mountain2Fill}
            opacity={isEvening ? 0.75 : isHub ? 0.5 : 0.42}
          />
        </Svg>
      </View>

      {/* Double-Arc Bird Vector Silhouettes */}
      <Animated.View style={[styles.birdContainer, { top: 38, left: '20%' }, bird1Style]}>
        <Svg width="28" height="12" viewBox="0 0 28 12">
          <Path d="M 2 9 Q 7 2 14 8 Q 21 2 26 9" fill="none" stroke={isEvening ? '#FEF08A' : '#1E293B'} strokeWidth="2.5" strokeLinecap="round" opacity={0.85} />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.birdContainer, { top: 68, left: '46%' }, bird2Style]}>
        <Svg width="26" height="12" viewBox="0 0 26 12">
          <Path d="M 2 9 Q 6 2 13 8 Q 20 2 24 9" fill="none" stroke={isEvening ? '#FEF08A' : '#1E293B'} strokeWidth="2.4" strokeLinecap="round" opacity={0.85} />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.birdContainer, { top: 92, left: '40%' }, bird3Style]}>
        <Svg width="34" height="15" viewBox="0 0 34 15">
          <Path d="M 2 12 Q 8 2 17 10 Q 26 2 32 12" fill="none" stroke={isEvening ? '#FEF08A' : '#1E293B'} strokeWidth="3" strokeLinecap="round" opacity={0.85} />
        </Svg>
      </Animated.View>

      {/* Expressive Sun */}
      <Animated.View style={[styles.sunContainer, isEvening && styles.sunEveningPos, sunStyle]}>
        <View style={[styles.sunOuterHalo, { backgroundColor: sunGlowColor }]} />
        <View style={styles.sunInnerHalo} />
        <Animated.View style={[styles.sunRayRing, sunRayRotateStyle]}>
          <View style={[styles.sunRay, { transform: [{ rotate: '0deg' }] }]} />
          <View style={[styles.sunRay, { transform: [{ rotate: '45deg' }] }]} />
          <View style={[styles.sunRay, { transform: [{ rotate: '90deg' }] }]} />
          <View style={[styles.sunRay, { transform: [{ rotate: '135deg' }] }]} />
        </Animated.View>
        <View style={[styles.sunBody, { backgroundColor: sunCoreColor, borderColor: sunBorderColor, shadowColor: sunCoreColor }]}>
          <View style={styles.sunFaceRow}>
            <View style={styles.sunEye} />
            <View style={styles.sunEye} />
          </View>
          <View style={styles.sunSmile} />
        </View>
      </Animated.View>

      {/* Natural Organic SVG Clouds */}
      <Animated.View style={[styles.cloudContainer, { top: 20, left: '6%' }, cloud1Style]}>
        <Svg width="120" height="44" viewBox="0 0 120 44">
          <Path
            d="M 10 38 Q 0 25 15 15 Q 30 2 50 12 Q 70 0 90 12 Q 110 8 115 25 Q 120 38 100 42 Q 50 44 10 38 Z"
            fill={isEvening ? '#FED7AA' : '#FFFFFF'}
            opacity={isEvening ? 0.75 : 0.94}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.cloudContainer, { top: 50, left: '30%' }, cloud2Style]}>
        <Svg width="100" height="38" viewBox="0 0 100 38">
          <Path
            d="M 8 32 Q 0 20 12 12 Q 25 2 42 10 Q 58 0 75 10 Q 92 6 96 22 Q 100 34 82 36 Q 40 38 8 32 Z"
            fill={isEvening ? '#FBCFE8' : '#FFFFFF'}
            opacity={isEvening ? 0.70 : 0.90}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.cloudContainer, { top: 76, left: '56%' }, cloud3Style]}>
        <Svg width="90" height="34" viewBox="0 0 90 34">
          <Path
            d="M 6 28 Q 0 18 10 10 Q 22 2 38 8 Q 52 0 68 8 Q 82 4 86 18 Q 90 30 74 32 Q 35 34 6 28 Z"
            fill={isEvening ? '#FED7AA' : '#FFFFFF'}
            opacity={isEvening ? 0.68 : 0.88}
          />
        </Svg>
      </Animated.View>

      {/* Layered Hills with Cartoon Trees */}
      <Animated.View style={[styles.hillsContainer, hillSwayStyle]}>
        <View style={[styles.hillBackCoral, { width: width * 0.7, backgroundColor: hill1Bg, opacity: isEvening ? 0.85 : 0.7 }]} />
        <View style={[styles.hillBackGreen, { width: width * 0.75, backgroundColor: hill2Bg }]} />
        <View style={[styles.hillFrontGreen, { width: width * 0.85, backgroundColor: hill3Bg }]} />

        {/* Cartoon Trees Across Hills */}
        <View style={[styles.treeContainer, { bottom: 18, left: 15 }]}>
          <View style={[styles.treeTrunk, { backgroundColor: treeTrunkBg }]} />
          <View style={[styles.treeCanopyBack, { backgroundColor: treeDarkBg }]} />
          <View style={[styles.treeCanopyMain, { backgroundColor: treeMidBg }]} />
          <View style={[styles.treeCanopyHighlight, { backgroundColor: treeLightBg }]} />
        </View>

        <View style={[styles.treeContainer, { bottom: 32, left: 75, transform: [{ scale: 0.85 }] }]}>
          <View style={[styles.treeTrunk, { backgroundColor: treeTrunkBg }]} />
          <View style={[styles.treeCanopyBack, { backgroundColor: treeDarkBg }]} />
          <View style={[styles.treeCanopyMain, { backgroundColor: treeMidBg }]} />
          <View style={[styles.treeCanopyHighlight, { backgroundColor: treeLightBg }]} />
        </View>

        <View style={[styles.treeContainer, { bottom: 25, right: 70, transform: [{ scale: 0.9 }] }]}>
          <View style={[styles.treeTrunk, { backgroundColor: treeTrunkBg }]} />
          <View style={[styles.treeCanopyBack, { backgroundColor: treeDarkBg }]} />
          <View style={[styles.treeCanopyMain, { backgroundColor: treeMidBg }]} />
          <View style={[styles.treeCanopyHighlight, { backgroundColor: treeLightBg }]} />
        </View>

        <View style={[styles.treeContainer, { bottom: 15, right: 20 }]}>
          <View style={[styles.treeTrunk, { backgroundColor: treeTrunkBg }]} />
          <View style={[styles.treeCanopyBack, { backgroundColor: treeDarkBg }]} />
          <View style={[styles.treeCanopyMain, { backgroundColor: treeMidBg }]} />
          <View style={[styles.treeCanopyHighlight, { backgroundColor: treeLightBg }]} />
        </View>
      </Animated.View>

      {/* Cloud-Shaped SVG Bush Clusters */}
      <View style={styles.bottomSceneryContainer}>
        {/* Left Bush Cluster */}
        <View style={styles.bushClusterLeft}>
          <Svg width="160" height="90" viewBox="0 0 160 90" style={StyleSheet.absoluteFill}>
            <Path d="M 10 90 Q 0 65 20 45 Q 45 25 75 35 Q 105 20 135 45 Q 155 65 145 90 Z" fill={bushDarkFill} />
            <Path d="M 0 90 Q 0 55 25 35 Q 55 15 85 28 Q 115 15 130 50 Q 140 75 130 90 Z" fill={bushMidFill} />
            <Path d="M -5 90 Q -5 60 20 42 Q 48 24 75 38 Q 100 28 115 55 Q 125 78 115 90 Z" fill={bushFrontFill} />
          </Svg>
          <Text style={styles.flower1}>{theme === 'rainbow' ? '🌸' : theme === 'orchard' ? '🍎' : theme === 'jungle' ? '🌿' : theme === 'math' ? '⭐' : isEvening ? '✨' : '🌸'}</Text>
          <Text style={styles.flower2}>{theme === 'rainbow' ? '🌺' : theme === 'orchard' ? '🍊' : theme === 'jungle' ? '🐾' : theme === 'math' ? '✦' : isEvening ? '🌺' : '🌻'}</Text>
          <Text style={styles.flower3}>{theme === 'rainbow' ? '🌼' : theme === 'orchard' ? '🍓' : theme === 'jungle' ? '🦋' : theme === 'puzzle' ? '💎' : isEvening ? '🌙' : '🌱'}</Text>
          <Text style={styles.flower4}>{theme === 'rainbow' ? '🌷' : theme === 'orchard' ? '🌻' : theme === 'jungle' ? '🌱' : theme === 'art' ? '🎨' : isEvening ? '🌷' : '🌷'}</Text>
        </View>

        {/* Right Bush Cluster */}
        <View style={styles.bushClusterRight}>
          <Svg width="160" height="90" viewBox="0 0 160 90" style={StyleSheet.absoluteFill}>
            <Path d="M 15 90 Q 5 65 25 45 Q 55 20 85 35 Q 115 25 140 45 Q 160 65 150 90 Z" fill={bushDarkFill} />
            <Path d="M 30 90 Q 20 55 45 35 Q 75 15 105 28 Q 135 15 150 50 Q 160 75 150 90 Z" fill={bushMidFill} />
            <Path d="M 45 90 Q 35 60 60 42 Q 88 24 115 38 Q 140 28 155 55 Q 165 78 155 90 Z" fill={bushFrontFill} />
          </Svg>
          <Text style={styles.flower5}>{theme === 'rainbow' ? '🌺' : theme === 'orchard' ? '🍇' : theme === 'jungle' ? '🌴' : theme === 'math' ? '💫' : isEvening ? '🌺' : '🌺'}</Text>
          <Text style={styles.flower6}>{theme === 'rainbow' ? '🌹' : theme === 'orchard' ? '🐝' : theme === 'jungle' ? '🍃' : theme === 'puzzle' ? '🔮' : isEvening ? '✨' : '🌼'}</Text>
          <Text style={styles.flower7}>{theme === 'rainbow' ? '🌻' : theme === 'orchard' ? '🌱' : theme === 'jungle' ? '🌱' : theme === 'geometry' ? '💠' : isEvening ? '🌙' : '🌱'}</Text>
          <Text style={styles.flower8}>{theme === 'rainbow' ? '🌸' : theme === 'orchard' ? '🍎' : theme === 'jungle' ? '🦋' : theme === 'art' ? '✨' : isEvening ? '🌸' : '🌸'}</Text>
        </View>
      </View>
    </View>
  );
});

CartoonBackground.displayName = 'CartoonBackground';

export const SceneBackground = CartoonBackground;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: '#38BDF8',
  },
  duskStar: {
    position: 'absolute',
    fontSize: 16,
    zIndex: 3,
  },
  mountainsContainer: {
    position: 'absolute',
    bottom: '16%',
    left: 0,
    right: 0,
    height: 140,
  },
  birdContainer: {
    position: 'absolute',
    zIndex: 5,
  },
  sunContainer: {
    position: 'absolute',
    top: 14,
    right: 18,
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunEveningPos: {
    top: 26,
    right: 22,
  },
  sunOuterHalo: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: Colors.scene.sunGlow,
  },
  sunInnerHalo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(254, 240, 138, 0.75)',
  },
  sunRayRing: {
    position: 'absolute',
    width: 82,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunRay: {
    position: 'absolute',
    width: 90,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FDE047',
    opacity: 0.9,
  },
  sunBody: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.scene.sunCore,
    borderColor: Colors.scene.sunBorder,
    borderWidth: 3.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.scene.sunCore,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  sunFaceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -2,
  },
  sunEye: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#78350F',
  },
  sunSmile: {
    width: 14,
    height: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    backgroundColor: '#78350F',
    marginTop: 3,
  },
  cloudContainer: {
    position: 'absolute',
    zIndex: 4,
  },
  hillsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    overflow: 'hidden',
  },
  hillBackCoral: {
    position: 'absolute',
    bottom: 20,
    left: -50,
    height: 120,
    borderRadius: 120,
    backgroundColor: '#F472B6',
    opacity: 0.7,
  },
  hillBackGreen: {
    position: 'absolute',
    bottom: 10,
    right: -40,
    height: 130,
    borderRadius: 130,
    backgroundColor: '#4ADE80',
  },
  hillFrontGreen: {
    position: 'absolute',
    bottom: 0,
    left: -30,
    height: 110,
    borderRadius: 110,
    backgroundColor: '#22C55E',
  },
  treeContainer: {
    position: 'absolute',
    width: 48,
    height: 70,
    alignItems: 'center',
  },
  treeTrunk: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.scene.treeTrunk,
  },
  treeCanopyBack: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.scene.treeLeafDark,
  },
  treeCanopyMain: {
    position: 'absolute',
    top: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.scene.treeLeafMid,
  },
  treeCanopyHighlight: {
    position: 'absolute',
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.scene.treeLeafLight,
  },
  bottomSceneryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '14%',
    overflow: 'hidden',
  },
  bushClusterLeft: {
    position: 'absolute',
    bottom: -10,
    left: -10,
    width: 160,
    height: 90,
  },
  flower1: { position: 'absolute', bottom: 52, left: 68, fontSize: 20 },
  flower2: { position: 'absolute', bottom: 35, left: 102, fontSize: 18 },
  flower3: { position: 'absolute', bottom: 22, left: 32, fontSize: 16 },
  flower4: { position: 'absolute', bottom: 42, left: 18, fontSize: 18 },
  bushClusterRight: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 160,
    height: 90,
  },
  flower5: { position: 'absolute', bottom: 54, right: 78, fontSize: 20 },
  flower6: { position: 'absolute', bottom: 36, right: 106, fontSize: 18 },
  flower7: { position: 'absolute', bottom: 24, right: 38, fontSize: 16 },
  flower8: { position: 'absolute', bottom: 44, right: 20, fontSize: 18 },
});
