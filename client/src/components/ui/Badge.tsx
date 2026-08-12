import React from 'react';
import { motion } from 'framer-motion';
import { ArtifactIcon } from './ArtifactIcon';

export interface BadgeProps {
  label: string;
  unlocked?: boolean;
  icon?: string | React.ReactNode;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  unlocked = false,
  icon,
  size = 'md',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    sm: "px-3 py-1 text-[10px] gap-2 clip-corner-sm",
    md: "px-4 py-1.5 text-xs gap-2.5 clip-corner",
    lg: "px-6 py-2.5 text-sm gap-3 clip-corner-lg",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative inline-flex items-center font-hud uppercase tracking-wider font-semibold select-none transition-all duration-300 cursor-pointer ${
        sizeClasses[size]
      } ${
        unlocked
          ? "bg-slate-900/90 text-cyan-300 border border-cyan-500/40 shadow-hud-cyan"
          : "bg-slate-950/80 text-slate-500 border border-slate-800"
      } ${className}`}
    >
      {/* Sheen sweep animation overlay for unlocked state */}
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
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent transform -skew-x-12 pointer-events-none"
        />
      )}

      <ArtifactIcon id={typeof icon === 'string' ? icon : label} unlocked={unlocked} size="sm" />
      <span>{label}</span>

      {!unlocked && (
        <span className="text-[10px] text-slate-600 font-mono ml-1">🔒</span>
      )}
    </motion.div>
  );
};
