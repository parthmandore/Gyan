export interface StudentSummary {
  id: number;
  name: string;
  age?: number;
  avatar?: string;
}

export interface GamePerformance {
  gameId: string;
  gameName: string;
  attempts: number;
  completed: number;
  accuracy: number;
  averageScore?: number;
  bestScore?: number;
}

export interface SkillPerformance {
  skillId: string;
  skillName: string;
  accuracy: number;
  attempts: number;
}

export interface RecentActivity {
  id: number | string;
  gameId: string;
  gameName: string;
  score?: number;
  accuracy?: number;
  completedAt: string;
}

export interface LearningAnalytics {
  student: StudentSummary;

  overallAccuracy: number;

  totalGamesPlayed: number;

  totalGamesCompleted: number;

  totalXP: number;

  currentStreak: number;

  learningTimeMinutes: number;

  gamePerformance: GamePerformance[];

  skillPerformance: SkillPerformance[];

  strengths: SkillPerformance[];

  weaknesses: SkillPerformance[];

  recentActivity: RecentActivity[];
}

export interface Classroom {
  id: number;
  name: string;
  classCode?: string;
  teacherId: number;
  students: StudentSummary[];
}

export interface ClassroomSummary {
  id: number;
  name: string;
  classCode?: string;
  studentCount: number;
}

export interface GameAttempt {
  studentId: number;
  gameId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeTakenSeconds?: number;
  mistakes?: string[];
  completedAt?: string;
}