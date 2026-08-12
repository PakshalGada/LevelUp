export interface Topic {
  id: string;
  title: string;
  description?: string;
  category?: 'web-dev' | 'ai-ml' | 'cybersecurity' | 'cloud' | 'data';
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward?: number;
  icon?: string;
  lessonsCount?: number;
}

export interface LessonSection {
  heading: string;
  content: string;
  originalContent?: string;
  activeStyle?: 'Original' | 'Simpler' | 'Story form' | 'Exam-focused';
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  sections: LessonSection[];
  keyTakeaways?: string[];
  durationMinutes: number;
  xpReward: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number; // 0-indexed
  correctAnswer?: number; // legacy alias
  explanation: string;
}

export interface GeneratedContent {
  lesson: Lesson;
  quiz: QuizQuestion[];
}

export type BadgeId = 
  | 'first-steps' 
  | 'perfectionist' 
  | 'on-fire' 
  | 'unstoppable' 
  | 'polymath' 
  | 'speed-demon';

export interface Badge {
  id: BadgeId;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface QuizHistoryItem {
  id: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  durationSeconds: number;
  date: string; // ISO date string
}

export interface UserProgress {
  userId: string;
  username: string;
  level: number;
  totalXp: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  comboStreak: number;
  completedTopics: string[];
  badges: Badge[];
  quizHistory: QuizHistoryItem[];
  activityHeatmap: Record<string, number>; // YYYY-MM-DD -> quiz count
}
