import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-hud tracking-wider uppercase font-semibold cursor-pointer transition-all duration-200 focus:outline-none select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none clip-button relative";

  const variantStyles = {
    primary: "bg-cyan-500 text-slate-950 shadow-hud-cyan hover:bg-cyan-400 hover:shadow-hud-cyan-lg border border-cyan-300",
    gold: "bg-amber-400 text-slate-950 shadow-hud-gold hover:bg-amber-300 hover:shadow-hud-gold-lg border border-amber-200",
    secondary: "bg-slate-900/80 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 hover:text-cyan-300 hover:bg-slate-800/80 hover:shadow-hud-cyan",
    ghost: "bg-transparent text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20",
    danger: "bg-red-950/80 text-red-400 border border-red-500/40 hover:border-red-400 hover:text-red-300 hover:shadow-hud-red",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-[11px] gap-1.5",
    md: "px-5 py-2.5 text-xs gap-2",
    lg: "px-7 py-3.5 text-sm gap-2.5",
  };

  const widthStyle = fullWidth ? "w-full" : "";
  const isPrimaryOrGold = variant === 'primary' || variant === 'gold';

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.97, y: 0 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {isPrimaryOrGold && <span className="text-[10px] opacity-75 font-mono ml-1">»</span>}
    </motion.button>
  );
};
