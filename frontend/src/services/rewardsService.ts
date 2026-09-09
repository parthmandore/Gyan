/**
 * Purpose: Service layer for fetching reward/XP summary from Backend API.
 * Module: Services
 * Folder: frontend/src/services
 *
 * Endpoint: GET /api/rewards/summary
 * Returns current XP total, level, and XP remaining to next level.
 * Backend is the source of truth for all reward/XP calculations —
 * the frontend does NOT duplicate this logic.
 *
 * // TEMPORARY MOCK — Returns realistic mock data when Backend is offline.
 */

import { apiClient } from './apiClient';

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

// TEMPORARY MOCK — REPLACE WHEN BACKEND IS AVAILABLE
const MOCK_REWARDS_SUMMARY: RewardsSummaryResponse = {
  success: true,
  data: {
    xp_total: 340,
    level: 4,
    xp_earned_in_level: 40,
    xp_to_next_level: 60,
  },
};

export const fetchRewardsSummary = async (): Promise<RewardsSummaryResponse> => {
  try {
    const response = await apiClient.get<RewardsSummaryResponse>(
      '/api/rewards/summary',
    );
    return response.data;
  } catch (error) {
    // TEMPORARY MOCK — REPLACE WHEN BACKEND IS AVAILABLE
    console.warn(
      '[rewardsService] Backend API offline. Returning temporary mock rewards summary.',
    );
    return MOCK_REWARDS_SUMMARY;
  }
};
