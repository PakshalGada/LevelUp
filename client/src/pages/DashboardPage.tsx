import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';

export const DashboardPage: React.FC = () => {
  const { user } = useGameStore();

  return (
    <div className="space-y-12 max-w-4xl mx-auto font-serif">
      {/* Header Profile Section */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar initials="CL" size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-pure-black dark:text-pure-white tracking-tight">
                  {user.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-xs font-semibold text-pure-black dark:text-pure-white">
                  Level {user.level}
                </span>
              </div>
              <p className="text-xs text-grayscale-500 dark:text-grayscale-400 mt-1">
                Learner ID: #{user.userId} &middot; Apple Editorial Design System
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center gap-4">
            <div className="px-4 py-3 rounded-xl border border-grayscale-200 dark:border-grayscale-800 bg-grayscale-50 dark:bg-grayscale-950 text-center min-w-[90px]">
              <div className="text-[10px] uppercase tracking-widest text-grayscale-400 font-medium">Streak</div>
              <div className="text-xl font-bold text-pure-black dark:text-pure-white tabular-nums mt-0.5">
                {user.streakDays}d
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl border border-grayscale-200 dark:border-grayscale-800 bg-grayscale-50 dark:bg-grayscale-950 text-center min-w-[90px]">
              <div className="text-[10px] uppercase tracking-widest text-grayscale-400 font-medium">Total XP</div>
              <div className="text-xl font-bold text-pure-black dark:text-pure-white tabular-nums mt-0.5">
                {user.totalPoints}
              </div>
            </div>

            <div className="px-4 py-3 rounded-xl border border-grayscale-200 dark:border-grayscale-800 bg-grayscale-50 dark:bg-grayscale-950 text-center min-w-[90px]">
              <div className="text-[10px] uppercase tracking-widest text-grayscale-400 font-medium">Completed</div>
              <div className="text-xl font-bold text-pure-black dark:text-pure-white tabular-nums mt-0.5">
                {user.completedTopics.length}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* XP & Level Progress */}
      <Card padding="lg" className="space-y-4">
        <h2 className="text-xl font-bold text-pure-black dark:text-pure-white tracking-tight">
          Level Progression
        </h2>
        <ProgressBar value={user.currentXp} max={user.nextLevelXp} label={`Level ${user.level} Progress`} />
      </Card>

      {/* Badges & Achievements Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-grayscale-200 dark:border-grayscale-800 pb-3">
          <h2 className="text-xl font-bold text-pure-black dark:text-pure-white tracking-tight">
            Unlocked Achievements
          </h2>
          <span className="text-xs text-grayscale-500 font-serif">
            {user.badges.length} Badges Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.badges.map((badge) => (
            <Card key={badge.id} hoverable padding="md" className="space-y-3">
              <div className="flex items-start justify-between">
                <Badge label={badge.rarity} unlocked={!!badge.unlockedAt} size="sm" />
                {badge.unlockedAt && (
                  <span className="text-[11px] text-grayscale-400 font-serif">
                    {new Date(badge.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-pure-black dark:text-pure-white">{badge.title}</h3>
                <p className="text-xs text-grayscale-500 dark:text-grayscale-400 mt-1 leading-relaxed">{badge.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
