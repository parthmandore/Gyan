/**
 * Purpose: Lightweight animated waveform visualizer for active audio recording.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const WaveBar: React.FC<{ delay: number; heightRange: [number, number] }> = ({
  delay,
  heightRange,
}) => {
  const barHeight = useSharedValue(heightRange[0]);

  useEffect(() => {
    barHeight.value = withRepeat(
      withSequence(
        withTiming(heightRange[1], { duration: 250 + delay }),
        withTiming(heightRange[0], { duration: 250 + delay })
      ),
      -1,
      true
    );
  }, [barHeight, delay, heightRange]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return <Animated.View style={[styles.bar, animatedStyle]} />;
};

export const WaveformAnimation: React.FC = React.memo(() => {
  return (
    <View style={styles.container}>
      <WaveBar delay={0} heightRange={[10, 32]} />
      <WaveBar delay={60} heightRange={[14, 42]} />
      <WaveBar delay={120} heightRange={[8, 36]} />
      <WaveBar delay={180} heightRange={[16, 48]} />
      <WaveBar delay={100} heightRange={[12, 38]} />
      <WaveBar delay={40} heightRange={[10, 30]} />
    </View>
  );
});

WaveformAnimation.displayName = 'WaveformAnimation';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    marginVertical: 4,
  },
  bar: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#F43F5E',
  },
});
