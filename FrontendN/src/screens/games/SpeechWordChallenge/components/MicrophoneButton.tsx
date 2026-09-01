/**
 * Purpose: Child-friendly, chunky animated 3D microphone button with pulse ripple.
 * Module: Speech Word Challenge
 * Folder: frontend/src/screens/games/SpeechWordChallenge/components
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface MicrophoneButtonProps {
  isRecording: boolean;
  isTranscribing: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = React.memo(
  ({ isRecording, isTranscribing, disabled, onPress, accessibilityLabel }) => {
    const pulseScale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
      if (isRecording) {
        pulseScale.value = withRepeat(
          withTiming(1.35, { duration: 900, easing: Easing.out(Easing.ease) }),
          -1,
          false
        );
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.8, { duration: 450 }),
            withTiming(0.1, { duration: 450 })
          ),
          -1,
          false
        );
      } else {
        pulseScale.value = withTiming(1, { duration: 250 });
        pulseOpacity.value = withTiming(0, { duration: 250 });
      }
    }, [isRecording, pulseScale, pulseOpacity]);

    const animatedPulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    }));

    const buttonBg = isRecording ? '#EF4444' : isTranscribing ? '#F59E0B' : '#EC4899';
    const bevelColor = isRecording ? '#B91C1C' : isTranscribing ? '#D97706' : '#BE185D';

    return (
      <View style={styles.container}>
        {/* Pulsing Ripple Ring */}
        {isRecording && (
          <Animated.View style={[styles.pulseRing, animatedPulseStyle]} />
        )}

        <Pressable
          onPress={onPress}
          disabled={disabled}
          accessibilityLabel={accessibilityLabel || (isRecording ? 'Stop Recording' : 'Start Speaking')}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.buttonWrapper,
            {
              backgroundColor: buttonBg,
              borderBottomColor: bevelColor,
              transform: [{ translateY: pressed ? 4 : 0 }],
            },
            disabled && styles.disabledButton,
          ]}
        >
          <View style={styles.highlightRibbon} />
          <Text style={styles.iconText}>
            {isTranscribing ? '⏳' : isRecording ? '⏹️' : '🎙️'}
          </Text>
          <Text style={styles.labelSubtext}>
            {isTranscribing ? 'Listening...' : isRecording ? 'TAP TO STOP' : 'TAP & SAY'}
          </Text>
        </Pressable>
      </View>
    );
  }
);

MicrophoneButton.displayName = 'MicrophoneButton';

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FDA4AF',
  },
  buttonWrapper: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BE185D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  highlightRibbon: {
    position: 'absolute',
    top: 4,
    left: 20,
    right: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  iconText: {
    fontSize: 44,
  },
  labelSubtext: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
