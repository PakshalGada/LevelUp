import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'cyan' | 'gold' | 'default';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  padding = 'md',
  variant = 'cyan',
  className = '',
  ...props
}) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const isGold = variant === 'gold';

  return (
    <motion.div
      whileHover={hoverable ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`relative bg-slate-900/85 backdrop-blur-md border ${
        isGold
          ? 'border-amber-500/40 shadow-hud-gold'
          : 'border-cyan-500/30 shadow-hud-cyan'
      } clip-corner transition-all duration-200 ${
        hoverable
          ? isGold
            ? 'hover:border-amber-400 hover:shadow-hud-gold-lg'
            : 'hover:border-cyan-400 hover:shadow-hud-cyan-lg'
          : ''
      } ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {/* Sci-Fi HUD Corner Bracket Accents */}
      <span className={`absolute top-1.5 left-1.5 text-[9px] font-mono select-none ${isGold ? 'text-amber-400/60' : 'text-cyan-400/60'}`}>
        ┌
      </span>
      <span className={`absolute top-1.5 right-3 text-[9px] font-mono select-none ${isGold ? 'text-amber-400/60' : 'text-cyan-400/60'}`}>
        ┐
      </span>
      <span className={`absolute bottom-1.5 left-1.5 text-[9px] font-mono select-none ${isGold ? 'text-amber-400/60' : 'text-cyan-400/60'}`}>
        └
      </span>
      <span className={`absolute bottom-1.5 right-1.5 text-[9px] font-mono select-none ${isGold ? 'text-amber-400/60' : 'text-cyan-400/60'}`}>
        ┘
      </span>

      {children}
    </motion.div>
  );
};
