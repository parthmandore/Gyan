/**
 * Purpose: Destination slot card in the ordering sequence.
 *          Supports empty dashed state with step number, filled state with tap-to-remove,
 *          and correct/wrong evaluation animations.
 * Module: Put in Order — Components
 * Folder: frontend/src/screens/games/PutInOrder/components
 */

import React, { useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
} from 'react-native';
import { OrderItem } from '../types';

interface OrderSlotTargetProps {
  slotIndex: number;
  item: OrderItem | null;
  status: 'empty' | 'filled' | 'correct' | 'wrong';
  disabled: boolean;
  slotSize?: number;
  onPressSlot: (slotIndex: number) => void;
}

export const OrderSlotTarget: React.FC<OrderSlotTargetProps> = React.memo(
  ({ slotIndex, item, status, disabled, slotSize = 78, onPressSlot }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const wobbleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (status === 'correct') {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (status === 'wrong') {
        Animated.sequence([
          Animated.timing(wobbleAnim, {
            toValue: -8,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 8,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: -5,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 5,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(wobbleAnim, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (status === 'filled') {
        // Bounce on fill
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        scaleAnim.setValue(1);
        wobbleAnim.setValue(0);
      }
    }, [status]);

    const isEmojiDense = item && item.display.length > 2;

    return (
      <Animated.View
        style={[
          styles.wrapper,
          {
            width: slotSize,
            height: slotSize,
            transform: [{ scale: scaleAnim }, { translateX: wobbleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={item ? 0.7 : 1}
          onPress={() => item && onPressSlot(slotIndex)}
          disabled={disabled || !item}
          style={[
            styles.slot,
            !item && styles.slotEmpty,
            item && styles.slotFilled,
            status === 'correct' && styles.slotCorrect,
            status === 'wrong' && styles.slotWrong,
          ]}
          accessibilityLabel={
            item ? `Slot ${slotIndex + 1}: ${item.display}` : `Empty slot ${slotIndex + 1}`
          }
          accessibilityRole="button"
        >
          {item ? (
            <>
              <Text
                style={[
                  styles.displayText,
                  isEmojiDense && styles.displayTextDense,
                  status === 'correct' && styles.displayTextCorrect,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {item.display}
              </Text>

              {status === 'correct' && (
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>✓</Text>
                </View>
              )}

              {status === 'filled' && !disabled && (
                <View style={styles.badgeRemove}>
                  <Text style={styles.badgeRemoveText}>✕</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.slotWatermark}>{slotIndex + 1}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 5,
    marginVertical: 4,
  },
  slot: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 4,
  },
  slotEmpty: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2.5,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
  },
  slotFilled: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#6366F1',
    borderBottomWidth: 5,
    borderBottomColor: '#4F46E5',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  slotCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
    borderBottomColor: '#047857',
    shadowColor: '#10B981',
  },
  slotWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderBottomColor: '#EF4444',
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
  displayTextCorrect: {
    color: '#FFFFFF',
  },
  slotWatermark: {
    fontSize: 26,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  badgeSuccess: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  badgeSuccessText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  badgeRemove: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  badgeRemoveText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
});
