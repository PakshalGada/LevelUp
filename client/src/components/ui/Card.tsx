import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const baseClasses = "bg-pure-white dark:bg-off-black border border-grayscale-200 dark:border-grayscale-800/80 rounded-xl transition-all duration-200 shadow-elevation-resting dark:shadow-elevation-dark-resting";

  return (
    <motion.div
      whileHover={hoverable ? { y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } } : undefined}
      className={`${baseClasses} ${hoverable ? 'hover:shadow-elevation-hover dark:hover:shadow-elevation-dark-hover hover:border-grayscale-300 dark:hover:border-grayscale-700' : ''} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
