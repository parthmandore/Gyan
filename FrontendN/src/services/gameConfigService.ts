/**
 * Purpose: Service layer for fetching game configuration metadata from Backend API.
 * Module: Services
 * Folder: frontend/src/services
 */

import { apiClient } from './apiClient';

export interface GameConfigData {
  game_type: string;
  available_difficulties: number[];
  time_limit_seconds: number | null;
  items_per_session: number;
}

export interface GameConfigResponse {
  success: boolean;
  data: GameConfigData;
}

// TEMPORARY MOCK — REPLACE WHEN BACKEND IS AVAILABLE
const MOCK_ALPHABET_MATCHING_CONFIG: GameConfigResponse = {
  success: true,
  data: {
    game_type: 'alphabet_matching',
    available_difficulties: [1, 2, 3, 4, 5],
    time_limit_seconds: 10,
    items_per_session: 10,
  },
};

const MOCK_CAPITAL_SMALL_MATCH_CONFIG: GameConfigResponse = {
  success: true,
  data: {
    game_type: 'capital_small_match',
    available_difficulties: [1],
    time_limit_seconds: null,
    items_per_session: 3,
  },
};

export const fetchAlphabetMatchingConfig = async (): Promise<GameConfigResponse> => {
  try {
    const response = await apiClient.get<GameConfigResponse>('/api/game-config/alphabet_matching');
    return response.data;
  } catch (error) {
    console.warn('[gameConfigService] Backend API offline. Returning temporary mock config.');
    return MOCK_ALPHABET_MATCHING_CONFIG;
  }
};

export const fetchCapitalSmallMatchConfig = async (): Promise<GameConfigResponse> => {
  try {
    const response = await apiClient.get<GameConfigResponse>('/api/game-config/capital_small_match');
    return response.data;
  } catch (error) {
    console.warn('[gameConfigService] Backend API offline. Returning temporary mock capital_small_match config.');
    return MOCK_CAPITAL_SMALL_MATCH_CONFIG;
  }
};
