/**
 * Purpose: Cute vector-styled cartoon star component for children's UI.
 * Module: Shared Components
 * Folder: frontend/src/components
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export interface CuteStarProps {
  size?: 'sm' | 'md' | 'lg' | number;
  style?: ViewStyle;
  variant?: 'gold' | 'pink' | 'cyan';
}

export const CuteStar: React.FC<CuteStarProps> = React.memo(({
  size = 'md',
  style,
  variant = 'gold',
}) => {
  let dimension = 40;
  if (typeof size === 'number') {
    dimension = size;
  } else if (size === 'sm') {
    dimension = 26;
  } else if (size === 'lg') {
    dimension = 56;
  }

  const starColor = variant === 'pink' ? '#FF69B4' : variant === 'cyan' ? '#00E5FF' : '#FFD700';
  const shadowColor = variant === 'pink' ? '#C71585' : variant === 'cyan' ? '#0097A7' : '#FF8C00';

  return (
    <View style={[styles.starContainer, { width: dimension, height: dimension }, style]}>
      {/* Outer 3D Glow */}
      <View
        style={[
          styles.outerStar,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension * 0.28,
            backgroundColor: starColor,
            borderColor: '#FFFFFF',
            borderWidth: Math.max(2, dimension * 0.08),
            shadowColor: shadowColor,
          },
        ]}
      >
        {/* Inner Shiny Specular Highlight */}
        <View
          style={[
            styles.specularHighlight,
            {
              width: dimension * 0.35,
              height: dimension * 0.35,
              borderRadius: dimension * 0.18,
            },
          ]}
        />

        {/* Cute Smiling Face Details */}
        <View style={styles.faceContainer}>
          <View style={styles.eyesRow}>
            <View style={[styles.eye, { width: dimension * 0.14, height: dimension * 0.14 }]} />
            <View style={[styles.eye, { width: dimension * 0.14, height: dimension * 0.14 }]} />
          </View>
          <View style={[styles.blushRow, { width: dimension * 0.6 }]}>
            <View style={[styles.blush, { width: dimension * 0.12, height: dimension * 0.08 }]} />
            <View style={[styles.blush, { width: dimension * 0.12, height: dimension * 0.08 }]} />
          </View>
          <Text style={[styles.smileText, { fontSize: dimension * 0.28 }]}>‿</Text>
        </View>
      </View>
    </View>
  );
});

CuteStar.displayName = 'CuteStar';

const styles = StyleSheet.create({
  starContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerStar: {
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  specularHighlight: {
    position: 'absolute',
    top: '12%',
    left: '12%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    transform: [{ rotate: '-45deg' }],
  },
  faceContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  eyesRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: -2,
  },
  eye: {
    borderRadius: 99,
    backgroundColor: '#1E293B',
  },
  blushRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: '30%',
  },
  blush: {
    borderRadius: 99,
    backgroundColor: '#FF6B6B',
    opacity: 0.7,
  },
  smileText: {
    fontFamily: 'System',
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: -4,
    lineHeight: 14,
  },
});
