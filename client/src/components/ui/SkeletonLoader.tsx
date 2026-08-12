import React from 'react';
import { motion } from 'framer-motion';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'title';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
}) => {
  const variantStyles = {
    text: 'h-4 w-full clip-corner-sm',
    title: 'h-8 w-3/4 clip-corner-sm',
    avatar: 'h-10 w-10 clip-corner-sm shrink-0',
    card: 'h-32 w-full clip-corner',
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-900/80 border border-cyan-500/20 ${variantStyles[variant]} ${className}`}
    >
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -skew-x-12"
      />
    </div>
  );
};
