/**
 * Purpose: Tactile 3D beveled Colour Selection Card for Colour Challenge.
 *          Child-friendly with rich tactile feedback, high contrast borders, and accessibility.
 * Module: Colour Challenge — Components
 * Folder: frontend/src/screens/games/ColourChallenge/components
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
import { ColorOption } from '../types';
import { triggerHapticLightImpact } from '../../../../services/hapticsService';

export interface ColourCardProps {
  option: ColorOption;
  isSelected?: boolean;
  status?: 'idle' | 'correct' | 'wrong' | 'disabled';
  onPress: () => void;
  disabled?: boolean;
  showName?: boolean;
}

export const ColourCard: React.FC<ColourCardProps> = React.memo(({
  option,
  isSelected = false,
  status = 'idle',
  onPress,
  disabled = false,
  showName = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 2-column grid card dimensions (responsive)
  const cardWidth = Math.min((screenWidth - 64) / 2, 170);
  const cardHeight = cardWidth * 0.95;

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
    if (status === 'correct') return '#10B981'; // Green glow
    if (status === 'wrong') return '#EF4444'; // Red error
    if (isSelected) return '#3B82F6';
    return '#FFFFFF';
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
        accessibilityLabel={`${option.name} colour option`}
        accessibilityState={{ disabled: disabled || isDimmed, selected: isSelected }}
        style={[
          styles.cardContainer,
          {
            height: cardHeight,
            borderColor: getBorderColor(),
            borderBottomColor: status === 'correct' ? '#047857' : option.borderHex,
            opacity: isDimmed ? 0.38 : 1,
          },
        ]}
      >
        {/* Main Swatch Box */}
        <View
          style={[
            styles.swatch,
            {
              backgroundColor: option.hex,
              borderColor: option.borderHex,
            },
          ]}
        >
          {/* Subtle 3D Gloss Highlight */}
          <View style={styles.glossHighlight} />
        </View>

        {/* Text Label (shown optionally or for accessible learning) */}
        {showName && (
          <View style={styles.nameContainer}>
            <Text style={styles.nameText} numberOfLines={1}>
              {option.name}
            </Text>
          </View>
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  swatch: {
    width: '100%',
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  glossHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  nameContainer: {
    marginTop: 6,
    paddingHorizontal: 4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
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
