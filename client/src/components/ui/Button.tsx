import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
  const baseStyles = "inline-flex items-center justify-center font-serif font-medium cursor-pointer transition-colors duration-200 focus:outline-none select-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variantStyles = {
    primary: "bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black shadow-elevation-resting dark:shadow-elevation-dark-resting hover:bg-grayscale-900 dark:hover:bg-grayscale-100",
    secondary: "bg-transparent text-pure-black dark:text-pure-white border border-grayscale-300 dark:border-grayscale-700 hover:border-grayscale-900 dark:hover:border-grayscale-200 hover:bg-grayscale-100/60 dark:hover:bg-grayscale-900/60 shadow-elevation-resting dark:shadow-elevation-dark-resting",
    ghost: "bg-transparent text-grayscale-700 dark:text-grayscale-300 hover:text-pure-black dark:hover:text-pure-white hover:bg-grayscale-100/70 dark:hover:bg-grayscale-900/70",
    danger: "bg-danger-light-bg text-danger-light-text border border-danger-light-border dark:bg-danger-bg dark:text-red-400 dark:border-danger-border hover:bg-red-100/80 dark:hover:bg-red-950/60",
  };

  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-md gap-1.5 tracking-tight",
    md: "px-5 py-2.5 text-sm rounded-lg gap-2 tracking-tight",
    lg: "px-7 py-3.5 text-base rounded-xl gap-2.5 tracking-tight",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98, y: 0 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
