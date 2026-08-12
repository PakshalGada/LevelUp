export interface Topic {
  id: string;
  title: string;
  description: string;
  category: 'web-dev' | 'ai-ml' | 'cybersecurity' | 'cloud' | 'data';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  icon: string; // Lucide icon name or emoji
  lessonsCount: number;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  durationMinutes: number;
  xpReward: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
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
