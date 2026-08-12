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
    text: 'h-4 w-full rounded-md',
    title: 'h-8 w-3/4 rounded-lg',
    avatar: 'h-10 w-10 rounded-full shrink-0',
    card: 'h-32 w-full rounded-2xl',
  };

  return (
    <div
      className={`relative overflow-hidden bg-grayscale-100 dark:bg-grayscale-900 border border-grayscale-200 dark:border-grayscale-800 ${variantStyles[variant]} ${className}`}
    >
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-grayscale-200/40 dark:via-grayscale-800/40 to-transparent transform -skew-x-12"
      />
    </div>
  );
};
