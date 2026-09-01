/**
 * Purpose: Service layer for persisting and checking per-game tutorial completion/skip state.
 * Module: Services
 * Folder: frontend/src/services
 *
 * Uses @react-native-async-storage/async-storage with an in-memory fallback map for Node testing environments.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_SEEN_PREFIX = 'tutorial_seen:';

// In-memory fallback map for Node CLI test environments
const inMemorySeenMap = new Map<string, boolean>();

/**
 * Checks whether the tutorial for a specific game has already been seen or skipped.
 */
export const isTutorialSeen = async (gameId: string): Promise<boolean> => {
  try {
    if (typeof window === 'undefined' && (typeof localStorage === 'undefined' || !localStorage)) {
      return inMemorySeenMap.get(gameId) === true;
    }
    const value = await AsyncStorage.getItem(`${TUTORIAL_SEEN_PREFIX}${gameId}`);
    return value === 'true';
  } catch {
    return inMemorySeenMap.get(gameId) === true;
  }
};

/**
 * Marks the tutorial for a specific game as seen (whether completed or skipped).
 */
export const markTutorialSeen = async (gameId: string): Promise<void> => {
  inMemorySeenMap.set(gameId, true);
  try {
    if (typeof window === 'undefined' && (typeof localStorage === 'undefined' || !localStorage)) {
      return;
    }
    await AsyncStorage.setItem(`${TUTORIAL_SEEN_PREFIX}${gameId}`, 'true');
  } catch {
    // In-memory fallback map active
  }
};

/**
 * Resets the tutorial seen flag for a specific game (for manual replay testing).
 */
export const resetTutorialSeen = async (gameId: string): Promise<void> => {
  inMemorySeenMap.delete(gameId);
  try {
    if (typeof window === 'undefined' && (typeof localStorage === 'undefined' || !localStorage)) {
      return;
    }
    await AsyncStorage.removeItem(`${TUTORIAL_SEEN_PREFIX}${gameId}`);
  } catch {
    // In-memory fallback map active
  }
};
