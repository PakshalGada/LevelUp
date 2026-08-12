import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';

interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Alex The Dev', level: 12, xp: 4850, streak: 14 },
  { rank: 2, name: 'Cyber Learner', level: 9, xp: 3400, streak: 8, isCurrentUser: false },
  { rank: 3, name: 'Quantum Coder', level: 8, xp: 2950, streak: 6 },
  { rank: 4, name: 'Sarah TS', level: 7, xp: 2300, streak: 5 },
  { rank: 5, name: 'Byte Master', level: 6, xp: 1900, streak: 4 },
];

export const LeaderboardPage: React.FC = () => {
  const { user } = useGameStore();

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-serif">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-grayscale-500 font-medium">Global Rankings</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-pure-black dark:text-pure-white tracking-tight">
          Global Leaderboard
        </h1>
        <p className="text-sm text-grayscale-500 dark:text-grayscale-400 max-w-lg mx-auto">
          Recognizing consistent learners and active recall mastery across the global community.
        </p>
      </div>

      {/* Leaderboard Table Card */}
      <Card padding="lg">
        <div className="divide-y divide-grayscale-200 dark:divide-grayscale-800">
          {MOCK_LEADERBOARD.map((item) => (
            <div
              key={item.rank}
              className={`py-4 px-4 sm:px-6 rounded-xl flex items-center justify-between transition-colors duration-150 ${
                item.isCurrentUser
                  ? 'bg-grayscale-100 dark:bg-grayscale-900 border border-grayscale-300 dark:border-grayscale-700'
                  : 'hover:bg-grayscale-50 dark:hover:bg-grayscale-950'
              }`}
            >
              {/* Left: Rank & User Info */}
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs tabular-nums ${
                  item.rank === 1 ? 'bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black' :
                  item.rank <= 3 ? 'bg-grayscale-200 text-grayscale-800 dark:bg-grayscale-800 dark:text-grayscale-200' :
                  'text-grayscale-500 border border-grayscale-300 dark:border-grayscale-700'
                }`}>
                  0{item.rank}
                </div>

                <Avatar initials={item.name.slice(0, 2).toUpperCase()} size="sm" />

                <div>
                  <div className="font-bold text-pure-black dark:text-pure-white text-sm sm:text-base flex items-center gap-2">
                    {item.name}
                    {item.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black font-semibold uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-grayscale-500 font-serif">Level {item.level}</div>
                </div>
              </div>

              {/* Right: XP & Streak */}
              <div className="flex items-center gap-6 text-xs sm:text-sm font-serif">
                <div className="text-grayscale-600 dark:text-grayscale-400">
                  <span className="tabular-nums font-semibold">{item.streak}</span>d streak
                </div>
                <div className="font-bold text-pure-black dark:text-pure-white tabular-nums">
                  {item.xp} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
