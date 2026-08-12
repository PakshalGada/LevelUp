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

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface UserProgress {
  userId: string;
  username: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  streakDays: number;
  totalPoints: number;
  completedTopics: string[];
  badges: Badge[];
}
