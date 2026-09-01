/**
 * Purpose: Service layer for submitting session progress metrics to Backend API.
 * Module: Services
 * Folder: frontend/src/services
 */

import { apiClient } from './apiClient';

export interface ProgressPayload {
  game_type: string;
  difficulty: number;
  items_attempted: number;
  items_correct: number;
  time_taken_seconds: number;
}

export interface ProgressResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Submits raw session progress results to Backend at session completion.
 * Endpoint: POST /api/progress/submit
 *
 * Per frozen architecture:
 * - Fired EXACTLY ONCE at session completion (not per-round).
 * - Does NOT trigger AI difficulty recommendation directly (Backend manages throttling/triggering).
 *
 * // TEMPORARY MOCK — Logs payload and resolves successfully when Backend is offline.
 */
export const submitGameProgress = async (
  payload: ProgressPayload,
): Promise<ProgressResponse> => {
  try {
    const response = await apiClient.post<ProgressResponse>(
      '/api/progress/submit',
      payload,
    );
    return response.data;
  } catch (error) {
    // TEMPORARY MOCK — REPLACE WHEN BACKEND IS AVAILABLE
    console.log(
      '[progressService] Backend API offline. Logging session progress payload (TEMPORARY MOCK):',
      JSON.stringify(payload, null, 2),
    );
    return {
      success: true,
      message: 'Mock progress submitted successfully',
      data: payload,
    };
  }
};
