export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress?: number;
  maxProgress?: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  title: string;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number; // 0 - 100
  lessonsCompleted: string[]; // lesson IDs
  perfectLessons: string[]; // lesson IDs that had 0 mistakes
  topicsCompleted: string[]; // topic IDs
  clinicalCasesCompleted: string[]; // case IDs (e.g. beds, fog cases)
  completedQuestions: string[]; // question IDs awarded XP
  achievements: Achievement[];
  lastActiveDate: string; // YYYY-MM-DD for streak tracking
}

export interface XPGainEvent {
  id: string;
  amount: number;
  reason: string;
  timestamp: number;
  isBonus?: boolean;
}

export interface LevelUpEvent {
  previousLevel: number;
  newLevel: number;
  previousTitle: string;
  newTitle: string;
  timestamp: number;
}

export const XP_RULES = {
  CORRECT_QUESTION: 10,
  DIFFICULT_QUESTION: 20,
  COMPLETE_LESSON: 50,
  PERFECT_LESSON_BONUS: 50,
  COMPLETE_CLINICAL_CASE: 100,
} as const;

export const GAME_RANK_DISCLAIMER =
  'Simulation game ranks only. Not accredited medical qualifications or clinical credentials.';
