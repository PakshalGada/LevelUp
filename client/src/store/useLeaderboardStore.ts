import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  xp: number;
  streak: number;
  isFriends?: boolean;
  isCurrentUser?: boolean;
}

const INITIAL_MOCK_LEADERBOARD: LeaderboardUser[] = [
  { id: 'u-1', name: 'Elena Rostova', avatar: 'ER', level: 14, xp: 5200, streak: 18, isFriends: true },
  { id: 'u-2', name: 'Marcus Vance', avatar: 'MV', level: 12, xp: 4450, streak: 14, isFriends: false },
  { id: 'u-3', name: 'Sofia Chen', avatar: 'SC', level: 11, xp: 3900, streak: 11, isFriends: true },
  { id: 'u-4', name: 'David Kim', avatar: 'DK', level: 10, xp: 3450, streak: 9, isFriends: false },
  { id: 'u-5', name: 'Amara Okafor', avatar: 'AO', level: 9, xp: 2950, streak: 8, isFriends: true },
  { id: 'u-6', name: 'Lucas Wright', avatar: 'LW', level: 8, xp: 2600, streak: 6, isFriends: false },
  { id: 'u-7', name: 'Hanna Lindqvist', avatar: 'HL', level: 8, xp: 2350, streak: 7, isFriends: true },
  { id: 'u-8', name: 'Kaito Tanaka', avatar: 'KT', level: 7, xp: 2100, streak: 5, isFriends: false },
  { id: 'u-9', name: 'Clara Dubois', avatar: 'CD', level: 7, xp: 1950, streak: 4, isFriends: false },
  { id: 'u-10', name: 'Aarav Sharma', avatar: 'AS', level: 6, xp: 1750, streak: 5, isFriends: true },
  { id: 'u-11', name: 'Maya Patel', avatar: 'MP', level: 6, xp: 1550, streak: 3, isFriends: false },
  { id: 'u-12', name: 'Viktor Novak', avatar: 'VN', level: 5, xp: 1350, streak: 4, isFriends: false },
  { id: 'u-13', name: 'Sora Takahashi', avatar: 'ST', level: 5, xp: 1200, streak: 2, isFriends: false },
  { id: 'u-14', name: 'Nadia Al-Mansoor', avatar: 'NA', level: 4, xp: 980, streak: 3, isFriends: false },
  { id: 'u-15', name: 'Leo Rossi', avatar: 'LR', level: 4, xp: 820, streak: 2, isFriends: false },
  { id: 'u-16', name: 'Chloe Bennett', avatar: 'CB', level: 3, xp: 650, streak: 1, isFriends: false },
  { id: 'u-17', name: 'Gabriel Cruz', avatar: 'GC', level: 3, xp: 480, streak: 2, isFriends: false },
];

export type LeaderboardTab = 'Global' | 'This Week' | 'Friends';

interface LeaderboardStoreState {
  users: LeaderboardUser[];
  activeTab: LeaderboardTab;
  setActiveTab: (tab: LeaderboardTab) => void;
  getRankedUsers: (currentRealUser: { name: string; level: number; totalXp: number; streakDays: number }) => {
    rankedList: (LeaderboardUser & { rank: number })[];
    currentUserRank: number;
  };
}

export const useLeaderboardStore = create<LeaderboardStoreState>()(
  persist(
    (set, get) => ({
      users: INITIAL_MOCK_LEADERBOARD,
      activeTab: 'Global',

      setActiveTab: (tab: LeaderboardTab) => set({ activeTab: tab }),

      getRankedUsers: (currentRealUser) => {
        const { users, activeTab } = get();

        const realUserItem: LeaderboardUser = {
          id: 'real-current-user',
          name: currentRealUser.name || 'Learner (You)',
          avatar: (currentRealUser.name || 'LU').slice(0, 2).toUpperCase(),
          level: currentRealUser.level,
          xp: currentRealUser.totalXp,
          streak: currentRealUser.streakDays,
          isFriends: true,
          isCurrentUser: true,
        };

        // Filter by tab
        let filtered = users.filter((u) => u.id !== 'real-current-user');
        if (activeTab === 'Friends') {
          filtered = filtered.filter((u) => u.isFriends);
        } else if (activeTab === 'This Week') {
          // Slightly scaled weekly variation for realistic view
          filtered = filtered.map((u) => ({
            ...u,
            xp: Math.round(u.xp * 0.4),
          }));
          realUserItem.xp = Math.round(currentRealUser.totalXp * 0.5);
        }

        // Combine & sort descending by XP
        const combined = [...filtered, realUserItem];
        combined.sort((a, b) => b.xp - a.xp);

        let userRank = 1;
        const rankedList = combined.map((item, index) => {
          const rank = index + 1;
          if (item.isCurrentUser) {
            userRank = rank;
          }
          return {
            ...item,
            rank,
          };
        });

        return { rankedList, currentUserRank: userRank };
      },
    }),
    {
      name: 'levelup-leaderboard-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
