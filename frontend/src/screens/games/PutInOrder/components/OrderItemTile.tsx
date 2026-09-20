/**
 * Purpose: Chunky, tactile item tile that the child taps to place into the sequence.
 *          Features 3D button bevel, spring scale animations, and placed/dimmed state.
 * Module: Put in Order — Components
 * Folder: frontend/src/screens/games/PutInOrder/components
 */

import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { OrderItem } from '../types';

interface OrderItemTileProps {
  item: OrderItem;
  isPlaced: boolean;
  disabled: boolean;
  tileSize?: number;
  onPress: (item: OrderItem) => void;
}

export const OrderItemTile: React.FC<OrderItemTileProps> = React.memo(
  ({ item, isPlaced, disabled, tileSize = 78, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      if (disabled || isPlaced) return;
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        speed: 30,
        bounciness: 0,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      if (disabled || isPlaced) return;
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 20,
        bounciness: 8,
        useNativeDriver: true,
      }).start();
    };

    const isEmojiDense = item.display.length > 2;

    return (
      <Animated.View
        style={[
          styles.wrapper,
          {
            width: tileSize,
            height: tileSize,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onPress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || isPlaced}
          style={[
            styles.tile,
            isPlaced && styles.tilePlaced,
          ]}
          accessibilityLabel={`Item ${item.display}`}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.displayText,
              isEmojiDense && styles.displayTextDense,
              isPlaced && styles.displayTextPlaced,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {item.display}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 6,
    marginVertical: 6,
  },
  tile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#F59E0B',
    borderBottomWidth: 6,
    borderBottomColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    padding: 4,
  },
  tilePlaced: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderBottomColor: '#94A3B8',
    opacity: 0.35,
    elevation: 0,
    shadowOpacity: 0,
  },
  displayText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
  },
  displayTextDense: {
    fontSize: 22,
  },
  displayTextPlaced: {
    color: '#94A3B8',
  },
});
