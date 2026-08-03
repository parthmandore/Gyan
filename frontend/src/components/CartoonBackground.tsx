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

export interface CartoonBackgroundProps {
  theme?: 'meadow' | 'evening' | 'hub';
}

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

  const meadowSky: [string, string, ...string[]] = ['#38BDF8', '#60A5FA', '#93C5FD', '#BAE6FD', '#E0F2FE'];
  const eveningSky: [string, string, ...string[]] = ['#2E1065', '#581C87', '#831843', '#BE185D', '#F43F5E', '#FB923C'];
  const hubSky: [string, string, ...string[]] = ['#0E7490', '#06B6D4', '#67E8F9', '#FDE047', '#FEF08A'];
  const skyColors = isEvening ? eveningSky : isHub ? hubSky : meadowSky;

  const mountain1Fill = isEvening ? Colors.sceneEvening.mountainDark : isHub ? Colors.sceneHub.mountainDark : '#334155';
  const mountain2Fill = isEvening ? Colors.sceneEvening.mountainMid : isHub ? Colors.sceneHub.mountainMid : '#475569';

  const hill1Bg = isEvening ? Colors.sceneEvening.hillBack : isHub ? Colors.sceneHub.hillBack : '#F472B6';
  const hill2Bg = isEvening ? Colors.sceneEvening.hillMid : isHub ? Colors.sceneHub.hillMid : '#4ADE80';
  const hill3Bg = isEvening ? Colors.sceneEvening.hillFront : isHub ? Colors.sceneHub.hillFront : '#22C55E';

  const treeTrunkBg = isEvening ? Colors.sceneEvening.treeTrunk : isHub ? Colors.sceneHub.treeTrunk : Colors.scene.treeTrunk;
  const treeDarkBg = isEvening ? Colors.sceneEvening.treeLeafDark : isHub ? Colors.sceneHub.treeLeafDark : Colors.scene.treeLeafDark;
  const treeMidBg = isEvening ? Colors.sceneEvening.treeLeafMid : isHub ? Colors.sceneHub.treeLeafMid : Colors.scene.treeLeafMid;
  const treeLightBg = isEvening ? Colors.sceneEvening.treeLeafLight : isHub ? Colors.sceneHub.treeLeafLight : Colors.scene.treeLeafLight;

  const bushDarkFill = isEvening ? Colors.sceneEvening.bushDark : isHub ? Colors.sceneHub.bushDark : '#064E3B';
  const bushMidFill = isEvening ? Colors.sceneEvening.bushMid : isHub ? Colors.sceneHub.bushMid : '#14532D';
  const bushFrontFill = isEvening ? Colors.sceneEvening.bushFront : isHub ? Colors.sceneHub.bushFront : '#166534';

  const sunCoreColor = isEvening ? Colors.sceneEvening.sunCore : isHub ? Colors.sceneHub.sunCore : Colors.scene.sunCore;
  const sunBorderColor = isEvening ? Colors.sceneEvening.sunBorder : isHub ? Colors.sceneHub.sunBorder : Colors.scene.sunBorder;
  const sunGlowColor = isEvening ? Colors.sceneEvening.sunGlow : isHub ? Colors.sceneHub.sunGlow : Colors.scene.sunGlow;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Multi-Stop Continuous Sky Gradient */}
      <LinearGradient
        colors={skyColors}
        locations={isEvening ? [0, 0.22, 0.45, 0.68, 0.86, 1.0] : isHub ? [0, 0.25, 0.5, 0.75, 1.0] : [0, 0.32, 0.58, 0.82, 1.0]}
        style={StyleSheet.absoluteFill}
      />

      {/* Evening Dusk Stars */}
      {isEvening && (
        <>
          <Animated.Text style={[styles.duskStar, { top: '4%', left: '12%' }, starStyle]}>✨</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '8%', left: '38%' }, starStyle]}>⭐</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '3%', left: '62%' }, starStyle]}>✦</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '7%', left: '84%' }, starStyle]}>✨</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '12%', left: '22%' }, starStyle]}>✦</Animated.Text>
          <Animated.Text style={[styles.duskStar, { top: '14%', left: '76%' }, starStyle]}>⭐</Animated.Text>
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
      <Animated.View style={[styles.birdContainer, { top: '6%', left: '8%' }, bird1Style]}>
        <Svg width="32" height="14" viewBox="0 0 32 14">
          <Path d="M 2 11 Q 8 2 16 9 Q 24 2 30 11" fill="none" stroke={isEvening ? '#FEF08A' : '#1E293B'} strokeWidth="2.8" strokeLinecap="round" opacity={0.85} />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.birdContainer, { top: '10%', left: '24%' }, bird2Style]}>
        <Svg width="26" height="12" viewBox="0 0 26 12">
          <Path d="M 2 9 Q 6 2 13 8 Q 20 2 24 9" fill="none" stroke={isEvening ? '#FEF08A' : '#1E293B'} strokeWidth="2.4" strokeLinecap="round" opacity={0.85} />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.birdContainer, { top: '14%', left: '42%' }, bird3Style]}>
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
      <Animated.View style={[styles.cloudContainer, { top: '6%', left: '8%' }, cloud1Style]}>
        <Svg width="120" height="44" viewBox="0 0 120 44">
          <Path
            d="M 10 38 Q 0 25 15 15 Q 30 2 50 12 Q 70 0 90 12 Q 110 8 115 25 Q 120 38 100 42 Q 50 44 10 38 Z"
            fill={isEvening ? '#FED7AA' : '#FFFFFF'}
            opacity={isEvening ? 0.75 : 0.94}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.cloudContainer, { top: '11%', left: '32%' }, cloud2Style]}>
        <Svg width="100" height="38" viewBox="0 0 100 38">
          <Path
            d="M 8 32 Q 0 20 12 12 Q 25 2 42 10 Q 58 0 75 10 Q 92 6 96 22 Q 100 34 82 36 Q 40 38 8 32 Z"
            fill={isEvening ? '#FBCFE8' : '#FFFFFF'}
            opacity={isEvening ? 0.70 : 0.90}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.cloudContainer, { top: '14%', left: '54%' }, cloud3Style]}>
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
          <Text style={styles.flower1}>{isEvening ? '✨' : '🌸'}</Text>
          <Text style={styles.flower2}>{isEvening ? '🌺' : '🌻'}</Text>
          <Text style={styles.flower3}>{isEvening ? '🌙' : '🌱'}</Text>
          <Text style={styles.flower4}>{isEvening ? '🌷' : '🌷'}</Text>
        </View>

        {/* Right Bush Cluster */}
        <View style={styles.bushClusterRight}>
          <Svg width="160" height="90" viewBox="0 0 160 90" style={StyleSheet.absoluteFill}>
            <Path d="M 15 90 Q 5 65 25 45 Q 55 20 85 35 Q 115 25 140 45 Q 160 65 150 90 Z" fill={bushDarkFill} />
            <Path d="M 30 90 Q 20 55 45 35 Q 75 15 105 28 Q 135 15 150 50 Q 160 75 150 90 Z" fill={bushMidFill} />
            <Path d="M 45 90 Q 35 60 60 42 Q 88 24 115 38 Q 140 28 155 55 Q 165 78 155 90 Z" fill={bushFrontFill} />
          </Svg>
          <Text style={styles.flower5}>{isEvening ? '🌺' : '🌺'}</Text>
          <Text style={styles.flower6}>{isEvening ? '✨' : '🌼'}</Text>
          <Text style={styles.flower7}>{isEvening ? '🌙' : '🌱'}</Text>
          <Text style={styles.flower8}>{isEvening ? '🌸' : '🌸'}</Text>
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
    top: '2%',
    right: '4%',
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunEveningPos: {
    top: '16%',
    right: '8%',
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
