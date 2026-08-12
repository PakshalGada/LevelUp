import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { Button } from './Button';

export const LevelUpModal: React.FC = () => {
  const { pendingLevelUp, clearLevelUp } = useGameStore();

  if (pendingLevelUp === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-pure-white/95 dark:bg-pure-black/95 backdrop-blur-lg px-6 font-serif select-none"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-8 max-w-md mx-auto p-10 rounded-3xl border border-grayscale-200 dark:border-grayscale-800 bg-pure-white dark:bg-off-black shadow-elevation-hover"
        >
          {/* Apple Watch Ring Close Style SVG Animation */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring Track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="4"
                className="text-grayscale-200 dark:text-grayscale-800 fill-none"
              />
              {/* Sweeping Ring Progress */}
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                className="text-pure-black dark:text-pure-white fill-none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
            </svg>

            {/* Level Numeral */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-grayscale-400 font-medium">Level</span>
              <span className="text-4xl font-bold tracking-tight text-pure-black dark:text-pure-white tabular-nums">
                0{pendingLevelUp}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-pure-black dark:text-pure-white">
              Level {pendingLevelUp} Achieved
            </h2>
            <p className="text-sm font-light text-grayscale-600 dark:text-grayscale-400 max-w-xs mx-auto leading-relaxed">
              Your dedication to active recall and deliberate practice continues to expand your knowledge base.
            </p>
          </div>

          <div className="pt-2">
            <Button variant="primary" size="lg" onClick={clearLevelUp} fullWidth>
              Continue Learning
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
