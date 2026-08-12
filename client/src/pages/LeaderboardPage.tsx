import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useLeaderboardStore, LeaderboardTab } from '../store/useLeaderboardStore';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';

export const LeaderboardPage: React.FC = () => {
  const { user } = useGameStore();
  const { activeTab, setActiveTab, getRankedUsers } = useLeaderboardStore();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [activeTab]);

  const { rankedList, currentUserRank } = getRankedUsers({
    name: user.username,
    level: user.level,
    totalXp: user.totalXp,
    streakDays: user.streakDays,
  });

  const top3 = rankedList.slice(0, 3);
  const remainingList = rankedList.slice(3);

  const tabs: LeaderboardTab[] = ['Global', 'This Week', 'Friends'];

  return (
    <div className="max-w-4xl mx-auto space-y-10 font-serif pb-16">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs uppercase tracking-widest text-grayscale-500 font-medium">Community Mastery</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-pure-black dark:text-pure-white tracking-tight">
          Global Leaderboard
        </h1>
        <p className="text-sm text-grayscale-500 dark:text-grayscale-400 max-w-lg mx-auto leading-relaxed font-light">
          Recognizing top learners and daily streak consistency across the global community.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center items-center gap-2">
        <div className="inline-flex items-center gap-1.5 bg-grayscale-100/70 dark:bg-grayscale-900/70 p-1.5 rounded-full border border-grayscale-200 dark:border-grayscale-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setLoading(true);
                  setActiveTab(tab);
                }}
                className={`relative px-4 py-1.5 text-xs font-serif font-medium rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'text-pure-black dark:text-pure-white'
                    : 'text-grayscale-500 hover:text-pure-black dark:hover:text-pure-white'
                }`}
              >
                {tab}
                {isActive && (
                  <motion.div
                    layoutId="leaderboard-tab-bg"
                    className="absolute inset-0 bg-pure-white dark:bg-off-black rounded-full border border-grayscale-200 dark:border-grayscale-800 shadow-elevation-resting -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          <SkeletonLoader variant="card" className="h-40" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonLoader key={i} variant="text" className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* TOP 3 RESTRAINED PODIUM LAYOUT */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
              
              {/* #2 Rank */}
              <Card 
                padding="lg" 
                className={`text-center space-y-4 md:order-1 hairline-border ${
                  top3[1].isCurrentUser ? 'border-pure-black dark:border-pure-white shadow-elevation-hover' : ''
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest text-grayscale-400 font-semibold">Rank 02</span>
                <Avatar initials={top3[1].avatar} size="lg" className="mx-auto" />
                <div>
                  <div className="font-bold text-lg text-pure-black dark:text-pure-white flex items-center justify-center gap-1.5">
                    <span>{top3[1].name}</span>
                    {top3[1].isCurrentUser && <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black">You</span>}
                  </div>
                  <div className="text-xs text-grayscale-400">Level {top3[1].level}</div>
                </div>
                <div className="text-xl font-bold text-pure-black dark:text-pure-white tabular-nums pt-1 border-t border-grayscale-100 dark:border-grayscale-800">
                  {top3[1].xp} XP
                </div>
              </Card>

              {/* #1 Rank (Prominent Typography Scale) */}
              <Card 
                padding="lg" 
                className={`text-center space-y-5 md:order-2 md:-translate-y-3 hairline-border ${
                  top3[0].isCurrentUser ? 'border-pure-black dark:border-pure-white shadow-elevation-hover' : 'shadow-elevation-hover'
                }`}
              >
                <div className="inline-block px-3 py-1 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black text-[10px] uppercase tracking-widest font-bold">
                  Rank 01 &middot; Leader
                </div>
                <Avatar initials={top3[0].avatar} size="lg" className="mx-auto ring-2 ring-pure-black dark:ring-pure-white" />
                <div>
                  <div className="font-bold text-xl text-pure-black dark:text-pure-white flex items-center justify-center gap-1.5">
                    <span>{top3[0].name}</span>
                    {top3[0].isCurrentUser && <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black">You</span>}
                  </div>
                  <div className="text-xs text-grayscale-400">Level {top3[0].level}</div>
                </div>
                <div className="text-3xl font-bold text-pure-black dark:text-pure-white tabular-nums pt-2 border-t border-grayscale-200 dark:border-grayscale-800">
                  {top3[0].xp} XP
                </div>
              </Card>

              {/* #3 Rank */}
              <Card 
                padding="lg" 
                className={`text-center space-y-4 md:order-3 hairline-border ${
                  top3[2].isCurrentUser ? 'border-pure-black dark:border-pure-white shadow-elevation-hover' : ''
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest text-grayscale-400 font-semibold">Rank 03</span>
                <Avatar initials={top3[2].avatar} size="lg" className="mx-auto" />
                <div>
                  <div className="font-bold text-lg text-pure-black dark:text-pure-white flex items-center justify-center gap-1.5">
                    <span>{top3[2].name}</span>
                    {top3[2].isCurrentUser && <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black">You</span>}
                  </div>
                  <div className="text-xs text-grayscale-400">Level {top3[2].level}</div>
                </div>
                <div className="text-xl font-bold text-pure-black dark:text-pure-white tabular-nums pt-1 border-t border-grayscale-100 dark:border-grayscale-800">
                  {top3[2].xp} XP
                </div>
              </Card>

            </div>
          )}

          {/* RANKED LIST WITH REFLOW ANIMATION & HAIRLINE HIGHLIGHT FOR CURRENT USER */}
          <Card padding="lg" className="hairline-border">
            <div className="divide-y divide-grayscale-200 dark:divide-grayscale-800">
              <AnimatePresence>
                {remainingList.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`py-4 px-4 sm:px-6 rounded-xl flex items-center justify-between transition-colors duration-150 ${
                      item.isCurrentUser
                        ? 'bg-grayscale-100 dark:bg-grayscale-900 border border-pure-black dark:border-pure-white shadow-elevation-resting'
                        : 'hover:bg-grayscale-50 dark:hover:bg-grayscale-950'
                    }`}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs tabular-nums text-grayscale-500 border border-grayscale-300 dark:border-grayscale-700 shrink-0">
                        {item.rank < 10 ? `0${item.rank}` : item.rank}
                      </div>

                      <Avatar initials={item.avatar} size="sm" />

                      <div>
                        <div className="font-bold text-pure-black dark:text-pure-white text-sm sm:text-base flex items-center gap-2">
                          {item.name}
                          {item.isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black font-semibold uppercase">
                              You &middot; Rank #{currentUserRank}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-grayscale-500">Level {item.level}</div>
                      </div>
                    </div>

                    {/* XP & Streak */}
                    <div className="flex items-center gap-6 text-xs sm:text-sm font-serif">
                      <div className="text-grayscale-600 dark:text-grayscale-400">
                        <span className="tabular-nums font-semibold">{item.streak}</span>d streak
                      </div>
                      <div className="font-bold text-pure-black dark:text-pure-white tabular-nums">
                        {item.xp} XP
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>

        </div>
      )}
    </div>
  );
};
