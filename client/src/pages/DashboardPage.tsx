import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { playClick } from '../lib/soundEffects';
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
    <div className="space-y-12 max-w-4xl mx-auto font-sans pb-16">
      
      {/* 1. TOP PROFILE HEADER & LEVEL PROGRESS */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Avatar initials={user.username.slice(0, 2).toUpperCase()} size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black font-hud text-slate-100 uppercase tracking-wider">
                  {user.username}
                </h1>
                <span className="px-3 py-0.5 clip-corner-sm border border-cyan-500/40 bg-slate-900 text-xs font-hud font-bold text-cyan-300 shadow-hud-cyan">
                  RANK LEVEL 0{user.level}
                </span>
              </div>
              <p className="text-xs font-hud text-slate-400 mt-1 uppercase tracking-widest">
                ID: {user.userId} &middot; NEURAL COMMAND CENTER
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { playClick(); setShowResetConfirm(true); }}>
              RESET PROGRESS
            </Button>
          </div>
        </div>

        <div className="pt-6">
          <ProgressBar value={user.currentXp} max={user.nextLevelXp} label={`RANK LEVEL ${user.level} PROGRESSION`} />
        </div>
      </Card>

      {/* 2. STATS SUMMARY GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-hud">
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">TOTAL XP</span>
          <div className="text-2xl font-black text-slate-100 tabular-nums">{user.totalXp}</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">QUIZZES</span>
          <div className="text-2xl font-black text-slate-100 tabular-nums">{totalQuizzes}</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">ACCURACY</span>
          <div className="text-2xl font-black text-cyan-300 tabular-nums drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">{averageAccuracy}%</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">STREAK</span>
          <div className="text-2xl font-black text-amber-400 tabular-nums drop-shadow-[0_0_8px_rgba(255,199,0,0.6)]">{user.streakDays}D</div>
        </Card>
        <Card padding="sm" className="text-center space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">BEST STREAK</span>
          <div className="text-2xl font-black text-slate-100 tabular-nums">{user.longestStreak}D</div>
        </Card>
      </section>

      {/* 3. 90-DAY STREAK CALENDAR HEATMAP */}
      <section className="space-y-4 font-hud">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <h2 className="text-lg font-bold text-cyan-300 tracking-wider uppercase">
            NEURAL ACTIVITY HEATMAP (90 DAYS)
          </h2>
          <span className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            {user.streakDays} DAYS ACTIVE STREAK
          </span>
        </div>

        <Card padding="md">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto p-1">
            {heatmapDays.map((item) => {
              let intensityStyle = "bg-slate-950 border border-slate-800";
              if (item.count >= 3) {
                intensityStyle = "bg-cyan-400 shadow-hud-cyan border border-cyan-200";
              } else if (item.count >= 1) {
                intensityStyle = "bg-cyan-900 border border-cyan-500/50";
              }

              return (
                <div
                  key={item.dateKey}
                  title={`${item.dateKey}: ${item.count} activity count`}
                  className={`w-3.5 h-3.5 clip-corner-sm transition-all ${intensityStyle}`}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-cyan-500/20 mt-3 font-hud tracking-widest uppercase">
            <span>90 DAYS AGO</span>
            <div className="flex items-center gap-1.5">
              <span>LESS</span>
              <span className="w-2.5 h-2.5 clip-corner-sm bg-slate-950 border border-slate-800" />
              <span className="w-2.5 h-2.5 clip-corner-sm bg-cyan-900 border border-cyan-500/50" />
              <span className="w-2.5 h-2.5 clip-corner-sm bg-cyan-400 shadow-hud-cyan" />
              <span>MORE</span>
            </div>
            <span>TODAY</span>
          </div>
        </Card>
      </section>

      {/* 4. BADGES SHOWCASE GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 font-hud">
          <h2 className="text-lg font-bold text-cyan-300 tracking-wider uppercase">
            ARTIFACT EMBLEMS & ACHIEVEMENTS
          </h2>
          <span className="text-xs text-slate-400">
            {user.badges.filter(b => b.unlockedAt).length} / {user.badges.length} UNLOCKED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <Card key={badge.id} padding="md" className="space-y-3">
                <div className="flex items-start justify-between font-hud">
                  <Badge label={badge.title} unlocked={isUnlocked} icon={badge.icon} size="sm" />
                  {isUnlocked && (
                    <span className="text-[9px] text-cyan-400 font-hud tracking-wider">
                      {new Date(badge.unlockedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold font-hud text-slate-100 uppercase">{badge.title}</h3>
                  <p className="text-xs font-sans text-slate-400 mt-1 leading-relaxed">{badge.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. QUIZ HISTORY TABLE */}
      <section className="space-y-4 font-hud">
        <div className="border-b border-cyan-500/20 pb-3">
          <h2 className="text-lg font-bold text-cyan-300 tracking-wider uppercase">
            TOPIC MISSION HISTORY
          </h2>
        </div>

        <Card padding="md">
          {user.quizHistory.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6 uppercase tracking-widest font-hud">
              No completed missions logged. Generate a topic on Home console to begin.
            </p>
          ) : (
            <div className="divide-y divide-cyan-500/20 text-xs">
              {user.quizHistory.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-100 uppercase tracking-wider">{item.topicTitle}</div>
                    <div className="text-[10px] text-slate-500">{new Date(item.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="tabular-nums font-bold text-cyan-300">
                      {item.score}/{item.totalQuestions}
                    </span>
                    <span className="tabular-nums text-amber-400 font-bold">+{item.xpEarned} XP</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl px-6 font-hud"
          >
            <Card padding="lg" className="max-w-md mx-auto text-center space-y-6">
              <h3 className="text-xl font-bold text-red-400 uppercase tracking-wider">[ RESET ALL PROGRESS? ]</h3>
              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                This will reset your rank level, total XP, artifact emblems, daily streak, and mission history. This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
                  CANCEL
                </Button>
                <Button 
                  variant="danger" 
                  onClick={() => {
                    playClick();
                    resetProgress();
                    setShowResetConfirm(false);
                  }}
                >
                  CONFIRM RESET
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
