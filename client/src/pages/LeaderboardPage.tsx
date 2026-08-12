import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { useLeaderboardStore, LeaderboardTab } from '../store/useLeaderboardStore';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { playClick } from '../lib/soundEffects';

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
    <div className="max-w-4xl mx-auto space-y-10 font-hud pb-16">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">COMMUNITY RANKING PROTOCOL</span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-100 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          GLOBAL LEADERBOARD
        </h1>
        <p className="text-xs font-sans text-slate-400 max-w-lg mx-auto leading-relaxed">
          Recognizing neural consistency and active recall mastery across the global learning network.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center items-center gap-2">
        <div className="inline-flex items-center gap-1.5 bg-slate-950 p-1.5 clip-corner-sm border border-cyan-500/30">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  playClick();
                  setLoading(true);
                  setActiveTab(tab);
                }}
                className={`relative px-4 py-1.5 text-xs font-hud uppercase tracking-wider font-semibold clip-corner-sm transition-colors duration-200 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-hud-cyan'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                {tab}
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
              <SkeletonLoader key={i} variant="text" className="h-16 clip-corner" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* TOP 3 PODIUM LAYOUT */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
              
              {/* #2 Rank */}
              <Card 
                padding="lg" 
                className={`text-center space-y-4 md:order-1 ${
                  top3[1].isCurrentUser ? 'border-cyan-400 shadow-hud-cyan-lg' : ''
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">RANK 02</span>
                <Avatar initials={top3[1].avatar} size="lg" className="mx-auto" />
                <div>
                  <div className="font-bold text-base text-slate-100 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                    <span>{top3[1].name}</span>
                    {top3[1].isCurrentUser && <span className="text-[9px] uppercase font-bold px-2 py-0.5 clip-corner-sm bg-cyan-500 text-slate-950">You</span>}
                  </div>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest">LVL {top3[1].level}</div>
                </div>
                <div className="text-xl font-bold text-slate-100 tabular-nums pt-1 border-t border-cyan-500/20">
                  {top3[1].xp} XP
                </div>
              </Card>

              {/* #1 Rank (Prominent Typography Scale & Gold Glow) */}
              <Card 
                variant="gold"
                padding="lg" 
                className={`text-center space-y-5 md:order-2 md:-translate-y-3 ${
                  top3[0].isCurrentUser ? 'border-amber-400 shadow-hud-gold-lg' : 'shadow-hud-gold-lg'
                }`}
              >
                <div className="inline-block px-3 py-1 clip-corner-sm border border-amber-300 bg-amber-400 text-slate-950 text-[10px] uppercase tracking-widest font-black shadow-hud-gold">
                  RANK 01 &middot; LEADER
                </div>
                <Avatar initials={top3[0].avatar} size="lg" className="mx-auto ring-2 ring-amber-400 shadow-hud-gold" />
                <div>
                  <div className="font-bold text-lg text-slate-100 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                    <span>{top3[0].name}</span>
                    {top3[0].isCurrentUser && <span className="text-[9px] uppercase font-bold px-2 py-0.5 clip-corner-sm bg-amber-400 text-slate-950">You</span>}
                  </div>
                  <div className="text-[10px] text-amber-400 uppercase tracking-widest">LVL {top3[0].level}</div>
                </div>
                <div className="text-3xl font-black text-amber-400 tabular-nums pt-2 border-t border-amber-500/30 drop-shadow-[0_0_10px_rgba(255,199,0,0.8)]">
                  {top3[0].xp} XP
                </div>
              </Card>

              {/* #3 Rank */}
              <Card 
                padding="lg" 
                className={`text-center space-y-4 md:order-3 ${
                  top3[2].isCurrentUser ? 'border-cyan-400 shadow-hud-cyan-lg' : ''
                }`}
              >
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">RANK 03</span>
                <Avatar initials={top3[2].avatar} size="lg" className="mx-auto" />
                <div>
                  <div className="font-bold text-base text-slate-100 flex items-center justify-center gap-1.5 uppercase tracking-wider">
                    <span>{top3[2].name}</span>
                    {top3[2].isCurrentUser && <span className="text-[9px] uppercase font-bold px-2 py-0.5 clip-corner-sm bg-cyan-500 text-slate-950">You</span>}
                  </div>
                  <div className="text-[10px] text-cyan-400 uppercase tracking-widest">LVL {top3[2].level}</div>
                </div>
                <div className="text-xl font-bold text-slate-100 tabular-nums pt-1 border-t border-cyan-500/20">
                  {top3[2].xp} XP
                </div>
              </Card>

            </div>
          )}

          {/* RANKED LIST WITH REFLOW ANIMATION & HAIRLINE HIGHLIGHT FOR CURRENT USER */}
          <Card padding="lg">
            <div className="divide-y divide-cyan-500/20">
              <AnimatePresence>
                {remainingList.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={`py-4 px-4 sm:px-6 clip-corner flex items-center justify-between transition-colors duration-150 ${
                      item.isCurrentUser
                        ? 'bg-slate-900 border border-cyan-400 shadow-hud-cyan'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 clip-corner-sm flex items-center justify-center font-bold text-xs tabular-nums text-slate-400 border border-cyan-500/30 bg-slate-950 shrink-0">
                        {item.rank < 10 ? `0${item.rank}` : item.rank}
                      </div>

                      <Avatar initials={item.avatar} size="sm" />

                      <div>
                        <div className="font-bold text-slate-100 text-sm uppercase tracking-wider flex items-center gap-2">
                          {item.name}
                          {item.isCurrentUser && (
                            <span className="px-2 py-0.5 clip-corner-sm text-[9px] bg-cyan-500 text-slate-950 font-black uppercase tracking-widest">
                              YOU &middot; RANK #{currentUserRank}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">LVL {item.level}</div>
                      </div>
                    </div>

                    {/* XP & Streak */}
                    <div className="flex items-center gap-6 text-xs font-hud">
                      <div className="text-amber-400">
                        <span className="tabular-nums font-bold">{item.streak}</span>D STREAK
                      </div>
                      <div className="font-bold text-slate-100 tabular-nums">
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
