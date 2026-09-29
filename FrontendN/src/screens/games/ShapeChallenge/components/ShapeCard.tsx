/**
 * Purpose: Tactile 3D Shape Selection Card for Shape Challenge.
 *          Renders vector shape with child-friendly touch target, border highlight,
 *          and haptic feedback.
 * Module: Shape Challenge — Components
 * Folder: frontend/src/screens/games/ShapeChallenge/components
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { ShapeOption } from '../types';
import { ShapeSvg } from './ShapeSvg';
import { triggerHapticLightImpact } from '../../../../services/hapticsService';

export interface ShapeCardProps {
  option: ShapeOption;
  isSelected?: boolean;
  status?: 'idle' | 'correct' | 'wrong' | 'disabled';
  onPress: () => void;
  disabled?: boolean;
  showName?: boolean;
  compact?: boolean;
}

export const ShapeCard: React.FC<ShapeCardProps> = React.memo(({
  option,
  isSelected = false,
  status = 'idle',
  onPress,
  disabled = false,
  showName = false,
  compact = false,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Responsive card sizing
  const isShortScreen = screenHeight <= 750;
  const cardWidth = compact
    ? Math.min((screenWidth - 64) / 4, 72)
    : Math.min((screenWidth - 56) / 2, isShortScreen ? 135 : 155);
  const cardHeight = compact ? cardWidth : cardWidth * (isShortScreen ? 0.76 : 0.82);
  const svgSize = compact ? cardWidth * 0.55 : cardWidth * 0.52;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled || status === 'disabled' || status === 'wrong') return;
    triggerHapticLightImpact();
    onPress();
  };

  const getBorderColor = () => {
    if (status === 'correct') return '#10B981';
    if (status === 'wrong') return '#EF4444';
    if (isSelected) return '#3B82F6';
    return '#E2E8F0';
  };

  const isDimmed = status === 'wrong' || status === 'disabled';

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }], width: cardWidth }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || isDimmed}
        accessibilityRole="button"
        accessibilityLabel={`${option.name} shape option`}
        accessibilityState={{ disabled: disabled || isDimmed, selected: isSelected }}
        style={[
          styles.cardContainer,
          {
            height: cardHeight,
            borderColor: getBorderColor(),
            borderBottomColor: status === 'correct' ? '#047857' : '#94A3B8',
            opacity: isDimmed ? 0.38 : 1,
          },
        ]}
      >
        {/* Shape SVG Center Display */}
        <View style={styles.svgWrapper}>
          <ShapeSvg
            shapeId={option.id}
            size={svgSize}
            color={option.color}
            strokeColor="#1E293B"
            strokeWidth={2.5}
          />
        </View>

        {showName && (
          <Text style={styles.nameText} numberOfLines={1}>
            {option.name}
          </Text>
        )}

        {status === 'correct' && (
          <View style={styles.badgeSuccess}>
            <Text style={styles.badgeText}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderBottomWidth: 7,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  svgWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
  },
  badgeSuccess: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#10B981',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
});
