import { apiClient } from './apiClient';

export interface TeacherStudent {
  id: string;
  name: string;
  age?: number;
  language?: string;
  xpTotal?: number;
  level?: number;
  streak?: number;
  lastActiveAt?: string;
  accuracy?: number;
  gamesCompleted?: number;
  initial?: string;
  percentage?: number;
  xp?: number;
}

export interface TeacherClassroom {
  name: string;
  level: string;
  language: string;
  students: number;
  activeToday: number;
  completedToday: number;
}

export interface TeacherClassProgress {
  percentage: number;
  studentsOnTrack: number;
  totalStudents: number;
}

export interface TeacherActivity {
  title: string;
  description: string;
  students: number;
}

export interface TeacherAttention {
  count: number;
  message: string;
  description: string;
}

export interface TeacherRecentActivity {
  title: string;
  time: string;
  xp: string;
}

export interface TeacherDashboardData {
  classroom: TeacherClassroom;

  classProgress: TeacherClassProgress;

  classAccuracy: number;

  activities: TeacherActivity[];

  students: TeacherStudent[];

  attention: TeacherAttention;

  recentActivity: TeacherRecentActivity[];

  teachingTip: string;
}

export interface TeacherDashboardResponse {
  success: boolean;
  data: TeacherDashboardData;
}

export interface TeacherStudentsResponse {
  success: boolean;
  data: {
    students: TeacherStudent[];
  };
}

export interface LinkStudentResponse {
  success: boolean;
  message: string;
  data: {
    student: {
      id: string;
      name: string;
      email: string;
    };
  };
}

class TeacherService {
  async getDashboard(): Promise<TeacherDashboardData> {
    const response =
      await apiClient.get<TeacherDashboardResponse>(
        '/api/teachers/dashboard',
      );

    return response.data.data;
  }

  async getStudents(): Promise<TeacherStudent[]> {
    const response =
      await apiClient.get<TeacherStudentsResponse>(
        '/api/teachers/students',
      );

    return response.data.data.students;
  }

  async linkStudent(
    email: string,
  ): Promise<LinkStudentResponse> {
    const response =
      await apiClient.post<LinkStudentResponse>(
        '/api/teachers/students/link',
        { email },
      );

    return response.data;
  }
}

export const teacherService =
  new TeacherService();

export default teacherService;