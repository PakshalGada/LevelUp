import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Flame, Zap, User } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface LeaderboardUser {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'AlexTheDev', level: 12, xp: 4850, streak: 14 },
  { rank: 2, name: 'CyberLearner', level: 9, xp: 3400, streak: 8, isCurrentUser: false },
  { rank: 3, name: 'QuantumCoder', level: 8, xp: 2950, streak: 6 },
  { rank: 4, name: 'Sarah_TS', level: 7, xp: 2300, streak: 5 },
  { rank: 5, name: 'ByteMaster', level: 6, xp: 1900, streak: 4 },
];

export const LeaderboardPage: React.FC = () => {
  const { user } = useGameStore();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-neon-gold animate-bounce" /> Global Leaderboard
        </h1>
        <p className="text-slate-400 text-sm">Compete with learners worldwide by gaining XP and maintaining daily streaks.</p>
      </div>

      {/* Leaderboard Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-dark-700/60 space-y-4"
      >
        <div className="divide-y divide-dark-700/60">
          {MOCK_LEADERBOARD.map((item) => {
            const isTop3 = item.rank <= 3;
            return (
              <div
                key={item.rank}
                className={`py-4 px-4 sm:px-6 rounded-xl flex items-center justify-between transition-all duration-200 ${
                  item.isCurrentUser
                    ? 'bg-neon-cyan/15 border border-neon-cyan/40 shadow-neon-cyan'
                    : 'hover:bg-dark-800/40'
                }`}
              >
                {/* Left: Rank & User Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                    item.rank === 1 ? 'bg-amber-500 text-dark-950 shadow-neon-gold' :
                    item.rank === 2 ? 'bg-slate-300 text-dark-950' :
                    item.rank === 3 ? 'bg-amber-700 text-white' :
                    'bg-dark-800 text-slate-400 border border-dark-700'
                  }`}>
                    {item.rank === 1 ? '👑' : item.rank}
                  </div>

                  <div>
                    <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      {item.name}
                      {item.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-neon-cyan text-dark-950 font-bold uppercase">You</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono">Level {item.level}</div>
                  </div>
                </div>

                {/* Right: XP & Streak */}
                <div className="flex items-center gap-6 text-sm font-semibold">
                  <div className="flex items-center gap-1.5 text-orange-400">
                    <Flame className="w-4 h-4" /> {item.streak}d
                  </div>
                  <div className="flex items-center gap-1.5 text-neon-green font-mono font-bold">
                    <Zap className="w-4 h-4" /> {item.xp} XP
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
};
