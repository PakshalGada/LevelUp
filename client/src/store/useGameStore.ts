import { create } from 'zustand';
import { UserProgress, Badge } from '../types';

interface GameState {
  user: UserProgress;
  addXp: (amount: number) => void;
  completeTopic: (topicId: string) => void;
  incrementStreak: () => void;
  unlockBadge: (badge: Badge) => void;
}

const INITIAL_BADGES: Badge[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Completed your first micro-lesson',
    icon: 'Footprints',
    unlockedAt: new Date().toISOString(),
    rarity: 'Common',
  },
  {
    id: 'streak-master',
    title: 'On Fire',
    description: 'Maintained a 3-day learning streak',
    icon: 'Flame',
    unlockedAt: new Date().toISOString(),
    rarity: 'Rare',
  },
  {
    id: 'quiz-wizard',
    title: 'Quiz Wizard',
    description: 'Scored 100% on a quiz',
    icon: 'Zap',
    rarity: 'Epic',
  },
  {
    id: 'legendary-learner',
    title: 'Grandmaster',
    description: 'Reached Level 10 in LevelUp',
    icon: 'Trophy',
    rarity: 'Legendary',
  },
];

export const useGameStore = create<GameState>((set) => ({
  user: {
    userId: 'user-1',
    username: 'CyberLearner',
    level: 3,
    currentXp: 450,
    nextLevelXp: 1000,
    streakDays: 4,
    totalPoints: 1450,
    completedTopics: ['react-fundamentals'],
    badges: INITIAL_BADGES,
  },

  addXp: (amount: number) =>
    set((state) => {
      let newXp = state.user.currentXp + amount;
      let newLevel = state.user.level;
      let nextLevelXp = state.user.nextLevelXp;

      if (newXp >= nextLevelXp) {
        newXp -= nextLevelXp;
        newLevel += 1;
        nextLevelXp = Math.floor(nextLevelXp * 1.5);
      }

      return {
        user: {
          ...state.user,
          level: newLevel,
          currentXp: newXp,
          nextLevelXp,
          totalPoints: state.user.totalPoints + amount,
        },
      };
    }),

  completeTopic: (topicId: string) =>
    set((state) => {
      if (state.user.completedTopics.includes(topicId)) return state;
      return {
        user: {
          ...state.user,
          completedTopics: [...state.user.completedTopics, topicId],
        },
      };
    }),

  incrementStreak: () =>
    set((state) => ({
      user: {
        ...state.user,
        streakDays: state.user.streakDays + 1,
      },
    })),

  unlockBadge: (badge: Badge) =>
    set((state) => {
      if (state.user.badges.some((b) => b.id === badge.id)) return state;
      return {
        user: {
          ...state.user,
          badges: [...state.user.badges, { ...badge, unlockedAt: new Date().toISOString() }],
        },
      };
    }),
}));
