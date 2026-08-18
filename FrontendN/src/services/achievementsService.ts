/**
 * Purpose: Service layer for fetching achievement/badge data from Backend API.
 * Module: Services
 * Folder: frontend/src/services
 *
 * Endpoint: GET /api/achievements
 * Returns earned badges and available (not yet earned) badges.
 * Badge display text comes from description_key resolved through i18next,
 * not a raw string from the API.
 *
 * // TEMPORARY MOCK — Returns realistic mock data when Backend is offline.
 */

import { apiClient } from './apiClient';

export interface EarnedBadge {
  badge_id: string;
  earned_at: string; // ISO 8601 date string
}

export interface AvailableBadge {
  badge_id: string;
  description_key: string;
}

export interface AchievementsData {
  earned: EarnedBadge[];
  available: AvailableBadge[];
}

export interface AchievementsResponse {
  success: boolean;
  data: AchievementsData;
}

// TEMPORARY MOCK — REPLACE WHEN BACKEND IS AVAILABLE
const MOCK_ACHIEVEMENTS: AchievementsResponse = {
  success: true,
  data: {
    earned: [
      {
        badge_id: 'quick_learner',
        earned_at: new Date().toISOString(),
      },
    ],
    available: [
      {
        badge_id: 'reading_streak_7',
        description_key: 'badge.reading_streak_7',
      },
      {
        badge_id: 'perfect_round',
        description_key: 'badge.perfect_round',
      },
    ],
  },
};

export const fetchAchievements = async (): Promise<AchievementsResponse> => {
  try {
    const response = await apiClient.get<AchievementsResponse>(
      '/api/achievements',
    );
    return response.data;
  } catch (error) {
    // TEMPORARY MOCK — REPLACE WHEN BACKEND IS AVAILABLE
    console.warn(
      '[achievementsService] Backend API offline. Returning temporary mock achievements.',
    );
    return MOCK_ACHIEVEMENTS;
  }
};
