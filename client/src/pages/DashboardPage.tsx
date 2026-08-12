import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardPage: React.FC = () => {
  const { user, resetProgress } = useGameStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Generate 90-day activity heatmap grid tiles
  const generateHeatmapDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayStr}`;
      const count = user.activityHeatmap[dateKey] || 0;
      days.push({ dateKey, count, dateObj: d });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays();

  // Calculate overall stats
  const totalQuizzes = user.quizHistory.length;
  const totalQuestions = user.quizHistory.reduce((acc, q) => acc + q.totalQuestions, 0);
  const totalCorrect = user.quizHistory.reduce((acc, q) => acc + q.score, 0);
  const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-12 max-w-4xl mx-auto font-serif pb-16">
      
      {/* 1. TOP PROFILE HEADER & LEVEL PROGRESS */}
      <Card padding="lg" className="space-y-8 hairline-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar initials={user.username.slice(0, 2).toUpperCase()} size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-pure-black dark:text-pure-white tracking-tight">
                  {user.username}
                </h1>
                <span className="px-3 py-0.5 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-xs font-semibold text-pure-black dark:text-pure-white">
                  Level {user.level}
                </span>
              </div>
              <p className="text-xs text-grayscale-500 dark:text-grayscale-400 mt-1">
                ID: {user.userId} &middot; Precision Active Recall
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(true)}>
              Reset Progress
            </Button>
          </div>
        </div>

        <ProgressBar value={user.currentXp} max={user.nextLevelXp} label={`Level ${user.level} Progress`} />
      </Card>

      {/* 2. STATS SUMMARY GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-grayscale-400">Total XP</span>
          <div className="text-2xl font-bold text-pure-black dark:text-pure-white tabular-nums">{user.totalXp}</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-grayscale-400">Quizzes</span>
          <div className="text-2xl font-bold text-pure-black dark:text-pure-white tabular-nums">{totalQuizzes}</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-grayscale-400">Accuracy</span>
          <div className="text-2xl font-bold text-pure-black dark:text-pure-white tabular-nums">{averageAccuracy}%</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-grayscale-400">Streak</span>
          <div className="text-2xl font-bold text-pure-black dark:text-pure-white tabular-nums">{user.streakDays}d</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase tracking-widest text-grayscale-400">Best Streak</span>
          <div className="text-2xl font-bold text-pure-black dark:text-pure-white tabular-nums">{user.longestStreak}d</div>
        </Card>
      </section>

      {/* 3. 90-DAY STREAK CALENDAR HEATMAP (APPLE HEALTH STYLE) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-grayscale-200 dark:border-grayscale-800 pb-3">
          <h2 className="text-lg font-bold text-pure-black dark:text-pure-white tracking-tight">
            Activity Heatmap (Last 90 Days)
          </h2>
          <span className="text-xs text-grayscale-500">
            {user.streakDays} Days Active Streak
          </span>
        </div>

        <Card padding="md" className="hairline-border">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto p-1">
            {heatmapDays.map((item) => {
              let intensityStyle = "bg-grayscale-100 dark:bg-grayscale-900 border border-grayscale-200 dark:border-grayscale-800";
              if (item.count >= 3) {
                intensityStyle = "bg-pure-black dark:bg-pure-white border-pure-black dark:border-pure-white";
              } else if (item.count >= 1) {
                intensityStyle = "bg-grayscale-400 dark:bg-grayscale-600 border-grayscale-400 dark:border-grayscale-600";
              }

              return (
                <div
                  key={item.dateKey}
                  title={`${item.dateKey}: ${item.count} activity count`}
                  className={`w-3.5 h-3.5 rounded-sm transition-all ${intensityStyle}`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-grayscale-400 pt-3 border-t border-grayscale-100 dark:border-grayscale-800/60 mt-3">
            <span>90 Days Ago</span>
            <div className="flex items-center gap-1">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-grayscale-100 dark:bg-grayscale-900 border border-grayscale-200" />
              <span className="w-2.5 h-2.5 rounded-sm bg-grayscale-400 dark:bg-grayscale-600" />
              <span className="w-2.5 h-2.5 rounded-sm bg-pure-black dark:bg-pure-white" />
              <span>More</span>
            </div>
            <span>Today</span>
          </div>
        </Card>
      </section>

      {/* 4. BADGES SHOWCASE GRID (ALL 6 CORE MONOCHROME BADGES) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-grayscale-200 dark:border-grayscale-800 pb-3">
          <h2 className="text-lg font-bold text-pure-black dark:text-pure-white tracking-tight">
            Achievements & Badges
          </h2>
          <span className="text-xs text-grayscale-500">
            {user.badges.filter(b => b.unlockedAt).length} / {user.badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <Card key={badge.id} padding="md" className="space-y-3 hairline-border">
                <div className="flex items-start justify-between">
                  <Badge label={badge.rarity} unlocked={isUnlocked} size="sm" />
                  {isUnlocked && (
                    <span className="text-[10px] text-grayscale-400 font-serif">
                      {new Date(badge.unlockedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-pure-black dark:text-pure-white">{badge.title}</h3>
                  <p className="text-xs text-grayscale-500 dark:text-grayscale-400 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. QUIZ HISTORY TABLE */}
      <section className="space-y-4">
        <div className="border-b border-grayscale-200 dark:border-grayscale-800 pb-3">
          <h2 className="text-lg font-bold text-pure-black dark:text-pure-white tracking-tight">
            Topic Quiz History
          </h2>
        </div>

        <Card padding="md" className="hairline-border">
          {user.quizHistory.length === 0 ? (
            <p className="text-xs text-grayscale-400 text-center py-6">
              No completed quizzes yet. Generate a topic on the Home page to get started.
            </p>
          ) : (
            <div className="divide-y divide-grayscale-200 dark:divide-grayscale-800 text-sm">
              {user.quizHistory.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-pure-black dark:text-pure-white">{item.topicTitle}</div>
                    <div className="text-xs text-grayscale-400">{new Date(item.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="tabular-nums font-semibold text-pure-black dark:text-pure-white">
                      {item.score}/{item.totalQuestions}
                    </span>
                    <span className="tabular-nums text-grayscale-500">+{item.xpEarned} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* RESET PROGRESS CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-pure-white/90 dark:bg-pure-black/90 backdrop-blur-md px-6"
          >
            <Card padding="lg" className="max-w-md mx-auto text-center space-y-6">
              <h3 className="text-xl font-bold text-pure-black dark:text-pure-white">Reset Progress?</h3>
              <p className="text-sm text-grayscale-600 dark:text-grayscale-400 leading-relaxed font-light">
                This will clear your XP, level progress, unlocked badges, streaks, and quiz history. This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    resetProgress();
                    setShowResetConfirm(false);
                  }}
                >
                  Confirm Reset
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
