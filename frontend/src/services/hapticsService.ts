/**
 * Purpose: Safe haptic feedback service wrapper for mobile devices
 *          safely degrading on web platforms.
 * Module: Services
 * Folder: frontend/src/services
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const triggerHapticSuccess = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore silently on unsupported devices
    }
  }
};

export const triggerHapticWarning = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {
      // Ignore silently on unsupported devices
    }
  }
};

export const triggerHapticLightImpact = async () => {
  if (Platform.OS !== 'web') {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore silently
    }
  }
};
