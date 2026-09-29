/**
 * Purpose: Elevated, high-contrast counting stage framing countable objects
 *          so they are visually separated from decorative cartoon background elements.
 *          Provides interactive tap-to-count numbering assist and speaker audio trigger.
 * Module: Number Counting — Components
 * Folder: frontend/src/screens/games/NumberCounting/components
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { CountableObjectItem } from '../types';
import { triggerHapticLightImpact } from '../../../../services/hapticsService';

interface CountingStageProps {
  targetCount: number;
  objectItem: CountableObjectItem;
  questionText: string;
  onPressSpeakPrompt: () => void;
}

export const CountingStage: React.FC<CountingStageProps> = React.memo(
  ({ targetCount, objectItem, questionText, onPressSpeakPrompt }) => {
    const { width: screenWidth } = useWindowDimensions();
    // Track which items have been tapped/counted by the child (set of indices)
    const [tappedIndices, setTappedIndices] = useState<number[]>([]);

    // Entrance animation for stage
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Reset tapped indices when targetCount or object changes
      setTappedIndices([]);

      scaleAnim.setValue(0.92);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, [targetCount, objectItem.id]);

    const handleTapItem = (index: number) => {
      triggerHapticLightImpact();
      setTappedIndices((prev) => {
        if (prev.includes(index)) {
          return prev.filter((i) => i !== index);
        } else {
          return [...prev, index];
        }
      });
    };

    // Determine sizing based on count
    const getItemSize = () => {
      if (targetCount <= 3) return { emojiSize: 58, boxSize: 76 };
      if (targetCount <= 6) return { emojiSize: 48, boxSize: 66 };
      return { emojiSize: 40, boxSize: 56 };
    };

    const { emojiSize, boxSize } = getItemSize();

    return (
      <Animated.View
        style={[
          styles.container,
          {
            width: Math.min(screenWidth - 32, 420),
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {/* Header: Question Prompt + Audio Button */}
        <View style={styles.headerRow}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText} numberOfLines={2}>
              {questionText}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.speakerButton}
            onPress={onPressSpeakPrompt}
            activeOpacity={0.7}
            accessibilityLabel="Hear question"
            accessibilityRole="button"
          >
            <Text style={styles.speakerIcon}>🔊</Text>
          </TouchableOpacity>
        </View>

        {/* Separator / Subtitle */}
        <Text style={styles.tapHintText}>👉 Tap to count each one!</Text>

        {/* Dedicated Counting Playground (Strictly Separated from Background) */}
        <View style={styles.objectsGrid}>
          {Array.from({ length: targetCount }).map((_, index) => {
            // Find order in which this item was tapped to display sequential 1, 2, 3...
            const tappedOrderIndex = tappedIndices.indexOf(index);
            const isTapped = tappedOrderIndex !== -1;
            const countBadgeNumber = isTapped ? tappedOrderIndex + 1 : null;

            return (
              <TouchableOpacity
                key={`countable_${objectItem.id}_${index}`}
                onPress={() => handleTapItem(index)}
                activeOpacity={0.8}
                style={[
                  styles.objectBox,
                  {
                    width: boxSize,
                    height: boxSize,
                  },
                  isTapped && styles.objectBoxTapped,
                ]}
              >
                <Text style={{ fontSize: emojiSize }}>{objectItem.emoji}</Text>

                {/* Number badge on counted item */}
                {isTapped && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{countBadgeNumber}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tally Helper for Age 5 */}
        {tappedIndices.length > 0 && (
          <View style={styles.tallyFooter}>
            <Text style={styles.tallyText}>
              Counted: <Text style={styles.tallyBold}>{tappedIndices.length}</Text> /{' '}
              {targetCount}
            </Text>
          </View>
        )}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginVertical: 12,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  questionContainer: {
    flex: 1,
    marginRight: 10,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  speakerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerIcon: {
    fontSize: 22,
  },
  tapHintText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 14,
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    minHeight: 130,
  },
  objectBox: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  objectBoxTapped: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tallyFooter: {
    marginTop: 10,
    alignItems: 'center',
  },
  tallyText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  tallyBold: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 16,
  },
});
