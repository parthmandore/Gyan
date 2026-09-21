/**
 * Purpose: Enclosed ordering puzzle stage framing destination slots and prompt.
 *          Prompt is in a compact instruction pill and sequence slots sit directly
 *          on the cartoon background without a white box, sized responsively to prevent overflow.
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

    const availableWidth = Math.min(screenWidth - 24, 430);
    const arrowCount = Math.max(0, totalSlots - 1);
    const arrowWidth = 14;
    const slotWrapperMargin = 6; // 3 on each side
    const totalOverhead = (arrowCount * arrowWidth) + (totalSlots * slotWrapperMargin) + 8;
    const calculatedSlotSize = Math.min(
      Math.floor((availableWidth - totalOverhead) / totalSlots),
      72
    );
    const slotSize = Math.max(calculatedSlotSize, 48);

    const hasAnyPlaced = placedItems.some((item) => item !== null);

    return (
      <View style={[styles.container, { width: availableWidth }]}>
        {/* Compact Instruction Pill Card */}
        <View style={styles.promptCard}>
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
        </View>

        {/* Destination Slots Row directly on living background */}
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
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginVertical: 4,
  },
  promptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    shadowColor: '#312E81',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  promptContainer: {
    flex: 1,
    marginRight: 10,
  },
  promptText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    lineHeight: 24,
  },
  speakerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerIcon: {
    fontSize: 18,
  },
  orderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  orderLabelText: {
    fontSize: 12,
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
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 0,
  },
  arrowIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4F46E5',
    marginHorizontal: 0,
  },
});
