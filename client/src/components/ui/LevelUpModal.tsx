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
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl px-6 font-hud select-none"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-8 max-w-md mx-auto p-10 clip-corner bg-slate-900 border border-amber-500/50 shadow-hud-gold-lg relative overflow-hidden"
        >
          {/* Radial Gold/Cyan Burst Glow */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.8, 1.2], opacity: [0, 0.6, 0.3] }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute -inset-10 bg-gradient-to-r from-amber-500/30 via-cyan-500/30 to-amber-500/30 rounded-full blur-2xl pointer-events-none"
          />

          {/* Sci-Fi Glowing Charge-Up Meter Ring */}
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring Track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800 fill-none"
              />
              {/* Sweeping Cyan/Gold Ring Progress */}
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                stroke="url(#goldGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                className="fill-none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFC700" />
                  <stop offset="100%" stopColor="#00F0FF" />
                </linearGradient>
              </defs>
            </svg>

            {/* Level Numeral */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">LEVEL UP</span>
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                className="text-4xl font-black tracking-tight text-slate-100 tabular-nums drop-shadow-[0_0_12px_rgba(255,199,0,0.8)]"
              >
                0{pendingLevelUp}
              </motion.span>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <h2 className="text-2xl font-bold tracking-wider text-amber-400 uppercase">
              RANK UNLOCKED: LEVEL {pendingLevelUp}
            </h2>
            <p className="text-xs font-sans text-slate-300 max-w-xs mx-auto leading-relaxed">
              Neural memory retention threshold achieved. Active recall protocols upgraded to next tier.
            </p>
          </div>

          <div className="pt-2 relative z-10">
            <Button variant="gold" size="lg" onClick={clearLevelUp} fullWidth>
              Resume Neural Training
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
