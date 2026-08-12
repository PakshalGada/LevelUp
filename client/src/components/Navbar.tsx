import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gamepad2, Flame, Award, Trophy, User, Zap } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useGameStore();

  const xpPercentage = Math.min(100, Math.round((user.currentXp / user.nextLevelXp) * 100));

  const navLinks = [
    { path: '/', label: 'Topics', icon: Gamepad2 },
    { path: '/dashboard', label: 'Dashboard', icon: User },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-dark-700/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-purple via-indigo-600 to-neon-cyan p-0.5 shadow-neon-cyan transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-cyan animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              LEVEL<span className="text-gradient-cyan">UP</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest -mt-1 uppercase">
              Gamified Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-900/60 p-1.5 rounded-xl border border-dark-700/50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-neon-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-dark-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-neon-cyan' : ''}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Stats Widget */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold text-xs sm:text-sm">
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <span>{user.streakDays} Day Streak</span>
          </div>

          {/* Level & XP Widget */}
          <div className="flex flex-col items-end min-w-[130px] hidden sm:flex">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-neon-purple/20 border border-neon-purple/40 text-neon-purple text-xs font-bold font-mono">
                LVL {user.level}
              </span>
              <span className="text-xs text-slate-300 font-semibold">
                {user.currentXp} / {user.nextLevelXp} <span className="text-neon-green">XP</span>
              </span>
            </div>
            
            {/* XP Progress Bar */}
            <div className="w-full bg-dark-950 h-2 rounded-full overflow-hidden border border-dark-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan via-neon-green to-emerald-400 rounded-full transition-all duration-500 shadow-neon-green"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
          </div>

          {/* Mobile Profile Icon */}
          <Link
            to="/dashboard"
            className="md:hidden w-9 h-9 rounded-lg bg-dark-800 border border-dark-600 flex items-center justify-center text-neon-cyan hover:border-neon-cyan"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </header>
  );
};
