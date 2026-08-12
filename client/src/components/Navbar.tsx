import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useTheme } from '../store/useTheme';
import { Avatar } from './ui/Avatar';
import { motion } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user } = useGameStore();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-pure-white/80 dark:bg-pure-black/80 backdrop-blur-md border-b border-grayscale-200 dark:border-grayscale-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* Brand Wordmark Logo */}
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="font-serif font-bold text-xl tracking-tight text-pure-black dark:text-pure-white hover:opacity-80 transition-opacity"
          >
            LevelUp
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-serif text-sm font-medium transition-colors duration-150 py-1 ${
                    isActive
                      ? 'text-pure-black dark:text-pure-white'
                      : 'text-grayscale-500 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-pure-black dark:bg-pure-white"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Level Chip, Streak, Theme Toggle, Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Level XP Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-grayscale-200 dark:border-grayscale-800 bg-grayscale-100/60 dark:bg-grayscale-900/60 text-xs font-serif text-grayscale-900 dark:text-grayscale-100 shadow-elevation-resting">
            <span className="w-2 h-2 rounded-full bg-pure-black dark:bg-pure-white" />
            <span className="font-semibold">Level {user.level}</span>
            <span className="text-grayscale-400 dark:text-grayscale-600">|</span>
            <span className="tabular-nums text-grayscale-600 dark:text-grayscale-400">{user.currentXp} XP</span>
          </div>

          {/* Streak Flame Badge (Monochrome outline icon) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-grayscale-200 dark:border-grayscale-800 bg-transparent text-xs font-serif text-pure-black dark:text-pure-white">
            <svg 
              className="w-3.5 h-3.5 stroke-pure-black dark:stroke-pure-white fill-none" 
              viewBox="0 0 24 24" 
              strokeWidth="1.75" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M8.5 14.5A2.5 2.5 0 0011 17c1.38 0 2.5-1.12 2.5-2.5 0-1.99-1.5-2.8-2-4.5-.47 1.7-2 2.51-2 4.5z" />
              <path d="M12 2c1 3 2.5 3.5 3.5 5.5 1 2 1.5 3.5 1.5 5.5A7 7 0 115 13c0-3 1.5-5.5 3-7.5 1-1.33 2-2.5 4-3.5z" />
            </svg>
            <span className="tabular-nums font-semibold">{user.streakDays}</span>
          </div>

          {/* Light/Dark Mode Switch */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full border border-grayscale-200 dark:border-grayscale-800 text-grayscale-700 dark:text-grayscale-300 hover:text-pure-black dark:hover:text-pure-white hover:bg-grayscale-100 dark:hover:bg-grayscale-900 transition-colors"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User Avatar */}
          <Avatar initials="CL" size="sm" />
        </div>

      </div>
    </header>
  );
};
