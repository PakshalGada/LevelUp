import React from 'react';
import { motion } from 'framer-motion';

export interface BadgeProps {
  label: string;
  unlocked?: boolean;
  icon?: React.ReactNode;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  unlocked = false,
  icon,
  description,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: "px-2.5 py-1 text-xs gap-1.5 rounded-full",
    md: "px-3.5 py-1.5 text-sm gap-2 rounded-full",
    lg: "px-5 py-2 text-base gap-2.5 rounded-full",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative inline-flex items-center font-serif font-medium tracking-tight overflow-hidden select-none transition-colors duration-300 cursor-pointer ${
        sizeClasses[size]
      } ${
        unlocked
          ? "bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black shadow-elevation-resting"
          : "bg-transparent text-grayscale-400 dark:text-grayscale-600 border border-grayscale-300 dark:border-grayscale-800"
      } ${className}`}
    >
      {/* Sheen animation overlay for unlocked state */}
      {unlocked && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            repeatDelay: 4,
            duration: 1.4,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent transform -skew-x-12 pointer-events-none"
        />
      )}

      {icon && (
        <span className={`shrink-0 ${unlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
          {icon}
        </span>
      )}
      <span>{label}</span>
      {!unlocked && (
        <svg className="w-3 h-3 opacity-40 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )}
    </motion.div>
  );
};
