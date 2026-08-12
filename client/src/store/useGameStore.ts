import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProgress, Badge, QuizHistoryItem } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Completed your first quiz challenge',
    icon: 'Footprints',
    rarity: 'Common',
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Achieved a perfect 5/5 score on a quiz',
    icon: 'CheckCircle',
    rarity: 'Epic',
  },
  {
    id: 'on-fire',
    title: 'On Fire',
    description: 'Maintained a 3-day daily learning streak',
    icon: 'Flame',
    rarity: 'Rare',
  },
  {
    id: 'unstoppable',
    title: 'Unstoppable',
    description: 'Reached a 7-day daily learning streak',
    icon: 'Zap',
    rarity: 'Legendary',
  },
  {
    id: 'polymath',
    title: 'Polymath',
    description: 'Completed quizzes in 5 different topics',
    icon: 'BookOpen',
    rarity: 'Epic',
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Completed a quiz in under 60s with 80%+ accuracy',
    icon: 'Clock',
    rarity: 'Rare',
  },
];

function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateAnonymousId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `user-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `user-${Math.random().toString(36).substring(2, 10)}`;
}

export interface TopicAccuracyRecord {
  totalAttempts: number;
  totalCorrect: number;
}

interface GameStoreState {
  user: UserProgress;
  pendingLevelUp: number | null;
  newlyUnlockedBadges: Badge[];
  streakProtectedNotice: string | null;
  timedSprintMode: boolean;
  streakFreezes: number;
  dailyChallengeCompletedDate: string | null;
  topicAccuracy: Record<string, TopicAccuracyRecord>;

  addXp: (amount: number) => void;
  clearLevelUp: () => void;
  clearNewlyUnlockedBadges: () => void;
  clearStreakProtectedNotice: () => void;
  setTimedSprintMode: (enabled: boolean) => void;
  incrementComboStreak: () => void;
  resetComboStreak: () => void;
  recordDailyActivity: () => void;
  recordQuizResult: (params: {
    topicId: string;
    topicTitle: string;
    score: number;
    totalQuestions: number;
    xpEarned: number;
    durationSeconds: number;
  }) => { newlyUnlocked: Badge[]; levelUpOccurred: boolean };
  completeDailyChallenge: () => void;
  getTopicDifficultyLabel: (topicId: string) => string;
  resetProgress: () => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      user: {
        userId: generateAnonymousId(),
        username: 'Learner',
        level: 1,
        totalXp: 0,
        currentXp: 0,
        nextLevelXp: 250,
        streakDays: 1,
        longestStreak: 1,
        lastActiveDate: getTodayString(),
        comboStreak: 0,
        completedTopics: [],
        badges: INITIAL_BADGES,
        quizHistory: [],
        activityHeatmap: { [getTodayString()]: 1 },
      },
      pendingLevelUp: null,
      newlyUnlockedBadges: [],
      streakProtectedNotice: null,
      timedSprintMode: false,
      streakFreezes: 1,
      dailyChallengeCompletedDate: null,
      topicAccuracy: {},

      addXp: (amount: number) => {
        set((state) => {
          let newTotalXp = state.user.totalXp + amount;
          let newCurrentXp = state.user.currentXp + amount;
          let newLevel = state.user.level;
          let nextLevelXp = state.user.nextLevelXp;
          let levelUpTriggered = false;

          while (newCurrentXp >= nextLevelXp) {
            newCurrentXp -= nextLevelXp;
            newLevel += 1;
            nextLevelXp = newLevel * 250;
            levelUpTriggered = true;
          }

          // Milestone streak freeze award at level up
          const updatedFreezes = levelUpTriggered ? state.streakFreezes + 1 : state.streakFreezes;

          return {
            user: {
              ...state.user,
              totalXp: newTotalXp,
              currentXp: newCurrentXp,
              level: newLevel,
              nextLevelXp,
            },
            streakFreezes: updatedFreezes,
            pendingLevelUp: levelUpTriggered ? newLevel : state.pendingLevelUp,
          };
        });
      },

      clearLevelUp: () => set({ pendingLevelUp: null }),
      clearNewlyUnlockedBadges: () => set({ newlyUnlockedBadges: [] }),
      clearStreakProtectedNotice: () => set({ streakProtectedNotice: null }),
      setTimedSprintMode: (enabled: boolean) => set({ timedSprintMode: enabled }),

      incrementComboStreak: () =>
        set((state) => ({
          user: {
            ...state.user,
            comboStreak: state.user.comboStreak + 1,
          },
        })),

      resetComboStreak: () =>
        set((state) => ({
          user: {
            ...state.user,
            comboStreak: 0,
          },
        })),

      recordDailyActivity: () => {
        const today = getTodayString();
        const yesterday = getYesterdayString();
        const state = get();
        const last = state.user.lastActiveDate;

        let newStreak = state.user.streakDays;
        let notice: string | null = null;
        let freezes = state.streakFreezes;

        if (last === today) {
          // Already recorded today
        } else if (last === yesterday) {
          newStreak += 1;
        } else if (last < yesterday) {
          // Missed a day
          if (freezes > 0) {
            freezes -= 1;
            notice = `Your streak freeze protected your ${state.user.streakDays}-day streak.`;
          } else {
            newStreak = 1;
          }
        }

        const newLongest = Math.max(state.user.longestStreak, newStreak);
        const currentCount = state.user.activityHeatmap[today] || 0;

        set((s) => ({
          user: {
            ...s.user,
            streakDays: newStreak,
            longestStreak: newLongest,
            lastActiveDate: today,
            activityHeatmap: {
              ...s.user.activityHeatmap,
              [today]: currentCount + 1,
            },
          },
          streakFreezes: freezes,
          streakProtectedNotice: notice,
        }));
      },

      recordQuizResult: ({ topicId, topicTitle, score, totalQuestions, xpEarned, durationSeconds }) => {
        const today = getTodayString();
        get().recordDailyActivity();

        const historyItem: QuizHistoryItem = {
          id: `quiz-${Date.now()}`,
          topicId,
          topicTitle,
          score,
          totalQuestions,
          xpEarned,
          durationSeconds,
          date: new Date().toISOString(),
        };

        const stateBefore = get();
        const levelBefore = stateBefore.user.level;

        // Add XP
        get().addXp(xpEarned);

        const stateAfterAddXp = get();
        const levelUpOccurred = stateAfterAddXp.user.level > levelBefore;

        const updatedHistory = [historyItem, ...stateAfterAddXp.user.quizHistory];
        const updatedCompleted = stateAfterAddXp.user.completedTopics.includes(topicId)
          ? stateAfterAddXp.user.completedTopics
          : [...stateAfterAddXp.user.completedTopics, topicId];

        // Update Topic Accuracy Tracking
        const prevAcc = stateAfterAddXp.topicAccuracy[topicId] || { totalAttempts: 0, totalCorrect: 0 };
        const updatedAcc = {
          totalAttempts: prevAcc.totalAttempts + totalQuestions,
          totalCorrect: prevAcc.totalCorrect + score,
        };

        // Evaluate Badges
        const currentBadges = stateAfterAddXp.user.badges;
        const newlyUnlocked: Badge[] = [];

        const updatedBadges = currentBadges.map((badge) => {
          if (badge.unlockedAt) return badge;

          let unlock = false;
          if (badge.id === 'first-steps' && updatedHistory.length >= 1) {
            unlock = true;
          } else if (badge.id === 'perfectionist' && score === totalQuestions && totalQuestions >= 5) {
            unlock = true;
          } else if (badge.id === 'on-fire' && stateAfterAddXp.user.streakDays >= 3) {
            unlock = true;
          } else if (badge.id === 'unstoppable' && stateAfterAddXp.user.streakDays >= 7) {
            unlock = true;
          } else if (badge.id === 'polymath' && updatedCompleted.length >= 5) {
            unlock = true;
          } else if (
            badge.id === 'speed-demon' &&
            durationSeconds <= 60 &&
            score / totalQuestions >= 0.8
          ) {
            unlock = true;
          }

          if (unlock) {
            const unlockedBadge = { ...badge, unlockedAt: new Date().toISOString() };
            newlyUnlocked.push(unlockedBadge);
            return unlockedBadge;
          }
          return badge;
        });

        set((s) => ({
          user: {
            ...s.user,
            quizHistory: updatedHistory,
            completedTopics: updatedCompleted,
            badges: updatedBadges,
            activityHeatmap: {
              ...s.user.activityHeatmap,
              [today]: (s.user.activityHeatmap[today] || 0) + 1,
            },
          },
          topicAccuracy: {
            ...s.topicAccuracy,
            [topicId]: updatedAcc,
          },
          newlyUnlockedBadges: newlyUnlocked,
        }));

        return { newlyUnlocked, levelUpOccurred };
      },

      completeDailyChallenge: () => {
        const today = getTodayString();
        const state = get();
        if (state.dailyChallengeCompletedDate === today) return;

        get().addXp(150); // Daily Challenge Bonus XP
        get().recordDailyActivity();

        set({ dailyChallengeCompletedDate: today });
      },

      getTopicDifficultyLabel: (topicId: string) => {
        const acc = get().topicAccuracy[topicId];
        if (!acc || acc.totalAttempts === 0) return 'Adaptive · Standard';
        const ratio = acc.totalCorrect / acc.totalAttempts;
        if (ratio >= 0.8) return 'Adaptive · Hard';
        if (ratio < 0.6) return 'Adaptive · Guided';
        return 'Adaptive · Balanced';
      },

      resetProgress: () => {
        set({
          user: {
            userId: generateAnonymousId(),
            username: 'Learner',
            level: 1,
            totalXp: 0,
            currentXp: 0,
            nextLevelXp: 250,
            streakDays: 1,
            longestStreak: 1,
            lastActiveDate: getTodayString(),
            comboStreak: 0,
            completedTopics: [],
            badges: INITIAL_BADGES,
            quizHistory: [],
            activityHeatmap: { [getTodayString()]: 1 },
          },
          pendingLevelUp: null,
          newlyUnlockedBadges: [],
          streakProtectedNotice: null,
          timedSprintMode: false,
          streakFreezes: 1,
          dailyChallengeCompletedDate: null,
          topicAccuracy: {},
        });
      },
    }),
    {
      name: 'levelup-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
