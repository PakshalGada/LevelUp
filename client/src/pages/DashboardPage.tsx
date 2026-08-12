import React from 'react';
import { motion } from 'framer-motion';
import { User, Flame, Award, Trophy, Zap, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const DashboardPage: React.FC = () => {
  const { user } = useGameStore();

  const xpPercentage = Math.min(100, Math.round((user.currentXp / user.nextLevelXp) * 100));

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header Profile Section */}
      <section className="glass-card rounded-3xl p-8 border border-dark-700/60 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-neon-purple via-indigo-600 to-neon-cyan p-1 shadow-neon-cyan shrink-0">
            <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center text-neon-cyan">
              <User className="w-10 h-10" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.username}</h1>
              <span className="px-3 py-1 rounded-full bg-neon-purple/20 border border-neon-purple/40 text-neon-purple font-mono font-bold text-xs">
                LVL {user.level}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1">Learner ID: #{user.userId} • Gamified Micro-Learning Enthusiast</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex flex-wrap gap-4 z-10">
          <div className="px-4 py-3 rounded-2xl bg-dark-900/80 border border-dark-700 text-center min-w-[100px]">
            <div className="text-xs text-slate-400 uppercase font-mono">Streak</div>
            <div className="text-lg font-bold text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> {user.streakDays}d
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-dark-900/80 border border-dark-700 text-center min-w-[100px]">
            <div className="text-xs text-slate-400 uppercase font-mono">Total Points</div>
            <div className="text-lg font-bold text-neon-cyan flex items-center justify-center gap-1">
              <Zap className="w-4 h-4" /> {user.totalPoints}
            </div>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-dark-900/80 border border-dark-700 text-center min-w-[100px]">
            <div className="text-xs text-slate-400 uppercase font-mono">Completed</div>
            <div className="text-lg font-bold text-neon-green flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {user.completedTopics.length}
            </div>
          </div>
        </div>
      </section>

      {/* XP & Level Progress */}
      <section className="glass-card rounded-3xl p-8 border border-dark-700/60 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-green" /> Level Progress
          </h2>
          <span className="text-sm font-mono text-slate-300">
            {user.currentXp} / {user.nextLevelXp} <span className="text-neon-green font-bold">XP</span> ({xpPercentage}%)
          </span>
        </div>

        <div className="w-full bg-dark-950 h-4 rounded-full overflow-hidden border border-dark-700 p-1">
          <div
            className="h-full bg-gradient-to-r from-neon-cyan via-neon-green to-emerald-400 rounded-full transition-all duration-500 shadow-neon-green"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </section>

      {/* Badges & Achievements Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-neon-gold" /> Unlocked Badges & Achievements
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {user.badges.length} Badges Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {user.badges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-2xl p-6 border border-dark-700/60 space-y-4 relative overflow-hidden text-center group"
            >
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border ${
                badge.rarity === 'Legendary' ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-neon-gold' :
                badge.rarity === 'Epic' ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-neon-purple' :
                badge.rarity === 'Rare' ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-neon-cyan' :
                'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
              }`}>
                <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-dark-900 border border-dark-700">
                  {badge.rarity}
                </span>
                <h3 className="text-lg font-bold text-white mt-2">{badge.title}</h3>
                <p className="text-slate-400 text-xs mt-1">{badge.description}</p>
              </div>

              {badge.unlockedAt && (
                <div className="text-[10px] text-neon-green font-mono pt-2 border-t border-dark-700/50">
                  Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};
