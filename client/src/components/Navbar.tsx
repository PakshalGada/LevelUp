import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { isSoundMuted, setSoundMuted, playClick } from '../lib/soundEffects';
import { Avatar } from './ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, streakFreezes } = useGameStore();
  const location = useLocation();

  const [muted, setMutedState] = useState<boolean>(isSoundMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setSoundMuted(next);
    if (!next) playClick();
  };

  const navLinks = [
    { path: '/', label: 'HOME' },
    { path: '/dashboard', label: 'DASHBOARD' },
    { path: '/leaderboard', label: 'LEADERBOARD' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Brand Wordmark Logo */}
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            onClick={() => { playClick(); setMobileMenuOpen(false); }}
            className="font-hud font-extrabold text-xl tracking-wider text-cyan-400 hover:text-cyan-300 transition-opacity flex items-center gap-2 drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]"
          >
            <span className="w-2.5 h-2.5 bg-cyan-400 clip-corner-sm animate-pulse" />
            LEVELUP
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={playClick}
                  className={`relative font-hud text-xs tracking-widest font-semibold transition-colors duration-150 py-1 ${
                    isActive
                      ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]'
                      : 'text-slate-400 hover:text-cyan-400'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-400 shadow-hud-cyan"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Level Chip, XP StatBar, Streak, Sound Toggle, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Level XP Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 clip-corner-sm border border-cyan-500/40 bg-slate-900/90 text-xs font-hud text-cyan-300 shadow-hud-cyan">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-hud-cyan" />
            <span className="font-bold">LVL {user.level}</span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="tabular-nums text-slate-300 hidden sm:inline">{user.currentXp} XP</span>
          </div>

          {/* Streak Flame Badge */}
          <div 
            title={streakFreezes > 0 ? `${streakFreezes} Streak Freeze Protection` : undefined}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 clip-corner-sm border border-amber-500/40 bg-slate-900/90 text-xs font-hud text-amber-400 shadow-hud-gold"
          >
            <span className="text-amber-400">🔥</span>
            <span className="tabular-nums font-bold">{user.streakDays}D</span>
            {streakFreezes > 0 && <span className="text-[10px]">❄️</span>}
          </div>

          {/* Sound Audio Mute Toggle Button */}
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute audio" : "Mute audio"}
            title={muted ? "Unmute audio" : "Mute audio"}
            className="p-2 clip-corner-sm border border-cyan-500/30 text-slate-400 hover:text-cyan-300 hover:border-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            {muted ? (
              <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>

          {/* User Avatar */}
          <Link to="/dashboard" onClick={playClick}>
            <Avatar initials="CL" size="sm" />
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 clip-corner-sm border border-cyan-500/30 text-slate-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-cyan-500/30 bg-slate-950 px-6 py-4 space-y-3 font-hud tracking-widest text-xs"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 ${
                  location.pathname === link.path
                    ? 'text-cyan-300 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
