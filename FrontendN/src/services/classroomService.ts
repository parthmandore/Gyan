import { apiClient } from './apiClient';

import type {
  Classroom,
  ClassroomSummary,
  StudentSummary,
} from '../types/analytics';

class ClassroomService {
  async getClassrooms(): Promise<ClassroomSummary[]> {
    const response = await apiClient.get('/api/classrooms');
    return response.data;
  }

  async getClassroom(classroomId: number): Promise<Classroom> {
    const response = await apiClient.get(
      `/api/classrooms/${classroomId}`,
    );

    return response.data;
  }

  async getClassroomStudents(
    classroomId: number,
  ): Promise<StudentSummary[]> {
    const response = await apiClient.get(
      `/api/classrooms/${classroomId}/students`,
    );

    return response.data;
  }

  async joinClassroom(classCode: string): Promise<Classroom> {
    const response = await apiClient.post('/api/classrooms/join', {
      classCode,
    });

    return response.data;
  }

  async createClassroom(
    name: string,
  ): Promise<Classroom> {
    const response = await apiClient.post('/api/classrooms', {
      name,
    });

    return response.data;
  }
}

export const classroomService = new ClassroomService();

export default classroomService;