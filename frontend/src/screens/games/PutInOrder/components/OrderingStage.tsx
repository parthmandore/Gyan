/**
 * Purpose: Enclosed ordering puzzle stage framing destination slots and prompt,
 *          visually isolating the puzzle from the living cartoon background.
 * Module: Put in Order — Components
 * Folder: frontend/src/screens/games/PutInOrder/components
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { OrderItem } from '../types';
import { OrderSlotTarget } from './OrderSlotTarget';

interface OrderingStageProps {
  totalSlots: number;
  placedItems: Array<OrderItem | null>;
  evaluationStatus: 'idle' | 'correct' | 'wrong';
  isLocked: boolean;
  promptText: string;
  onPressSlot: (slotIndex: number) => void;
  onPressSpeak: () => void;
  onPressClearAll: () => void;
}

export const OrderingStage: React.FC<OrderingStageProps> = React.memo(
  ({
    totalSlots,
    placedItems,
    evaluationStatus,
    isLocked,
    promptText,
    onPressSlot,
    onPressSpeak,
    onPressClearAll,
  }) => {
    const { width: screenWidth } = useWindowDimensions();

    const isFourItems = totalSlots >= 4;
    const slotSize = isFourItems ? Math.min((screenWidth - 100) / 4, 76) : 84;

    const hasAnyPlaced = placedItems.some((item) => item !== null);

    return (
      <View
        style={[
          styles.container,
          { width: Math.min(screenWidth - 32, 430) },
        ]}
      >
        {/* Header with Prompt & Speaker */}
        <View style={styles.headerRow}>
          <View style={styles.promptContainer}>
            <Text style={styles.promptText} numberOfLines={2}>
              {promptText}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={onPressSpeak}
            activeOpacity={0.7}
            accessibilityLabel="Listen to instruction"
            accessibilityRole="button"
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        </View>

        {/* Direction Flow Guide */}
        <View style={styles.orderLabelRow}>
          <Text style={styles.orderLabelText}>First ➔ Next ➔ Last</Text>
          {hasAnyPlaced && !isLocked && evaluationStatus === 'idle' && (
            <TouchableOpacity
              onPress={onPressClearAll}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>Reset 🔄</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Destination Slots Row with Arrows */}
        <View style={styles.slotsRow}>
          {Array.from({ length: totalSlots }).map((_, index) => {
            const placedItem = placedItems[index] || null;
            let slotStatus: 'empty' | 'filled' | 'correct' | 'wrong' = 'empty';
            if (evaluationStatus === 'correct') {
              slotStatus = 'correct';
            } else if (evaluationStatus === 'wrong') {
              slotStatus = 'wrong';
            } else if (placedItem) {
              slotStatus = 'filled';
            }

            return (
              <React.Fragment key={`slot_wrapper_${index}`}>
                <OrderSlotTarget
                  slotIndex={index}
                  item={placedItem}
                  status={slotStatus}
                  disabled={isLocked}
                  slotSize={slotSize}
                  onPressSlot={onPressSlot}
                />
                {index < totalSlots - 1 && (
                  <Text style={styles.arrowIcon}>➔</Text>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginVertical: 10,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#E0E7FF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  promptContainer: {
    flex: 1,
    marginRight: 10,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    lineHeight: 26,
  },
  speakerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerIcon: {
    fontSize: 20,
  },
  orderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  orderLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.3,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  arrowIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#A5B4FC',
    marginHorizontal: 1,
  },
});
