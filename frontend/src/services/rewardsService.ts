/**
 * Purpose: Service layer for fetching reward/XP summary dynamically from Backend API or local store.
 * Module: Services
 * Folder: frontend/src/services
 */

import { apiClient } from './apiClient';
import { useProgressStore } from '../state/useProgressStore';
import { calculateLevelProgress } from '../config/xpConfig';

export interface RewardsSummaryData {
  xp_total: number;
  level: number;
  xp_earned_in_level: number;
  xp_to_next_level: number;
}

export interface RewardsSummaryResponse {
  success: boolean;
  data: RewardsSummaryData;
}

export const fetchRewardsSummary = async (): Promise<RewardsSummaryResponse> => {
  const store = useProgressStore.getState();

  try {
    const response = await apiClient.get<{
      user_id: string;
      total_xp: number;
      current_level: number;
    }>(`/api/progress/summary/${store.activeChildId}`);

    if (response.data && typeof response.data.total_xp === 'number') {
      const info = calculateLevelProgress(response.data.total_xp);
      return {
        success: true,
        data: {
          xp_total: info.totalXp,
          level: info.currentLevel,
          xp_earned_in_level: info.xpInCurrentLevel,
          xp_to_next_level: info.xpToNextLevel,
        },
      };
    }
  } catch {
    // Graceful offline fallback using local state
  }

  return {
    success: true,
    data: {
      xp_total: store.totalXp,
      level: store.currentLevel,
      xp_earned_in_level: store.xpInCurrentLevel,
      xp_to_next_level: store.xpToNextLevel,
    },
  };
};
