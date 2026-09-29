import { apiClient } from './apiClient';

import type {
  LearningAnalytics,
  StudentSummary,
  GamePerformance,
  SkillPerformance,
  RecentActivity,
} from '../types/analytics';

class AnalyticsService {
  async getStudentAnalytics(
    studentId: number,
  ): Promise<LearningAnalytics> {
    const response = await apiClient.get(
      `/api/analytics/students/${studentId}`,
    );

    return response.data;
  }

  async getStudentSummary(
    studentId: number,
  ): Promise<StudentSummary> {
    const response = await apiClient.get(
      `/api/analytics/students/${studentId}/summary`,
    );

    return response.data;
  }

  async getGamePerformance(
    studentId: number,
  ): Promise<GamePerformance[]> {
    const response = await apiClient.get(
      `/api/analytics/students/${studentId}/games`,
    );

    return response.data;
  }

  async getSkillPerformance(
    studentId: number,
  ): Promise<SkillPerformance[]> {
    const response = await apiClient.get(
      `/api/analytics/students/${studentId}/skills`,
    );

    return response.data;
  }

  async getRecentActivity(
    studentId: number,
  ): Promise<RecentActivity[]> {
    const response = await apiClient.get(
      `/api/analytics/students/${studentId}/activity`,
    );

    return response.data;
  }
}

export const analyticsService = new AnalyticsService();

export default analyticsService;