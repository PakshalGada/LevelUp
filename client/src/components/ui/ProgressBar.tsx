import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export interface ProgressBarProps {
  value: number; // 0 to max
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = true,
  label,
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Animated counter for tabular numerals
  const springValue = useSpring(0, { duration: 1.2, bounce: 0 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  const heightStyles = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3.5",
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-baseline mb-2 text-xs text-grayscale-600 dark:text-grayscale-400 font-serif tracking-tight">
          <span>{label || 'Progress'}</span>
          <span className="tabular-nums font-medium text-pure-black dark:text-pure-white">
            {displayValue} / {max}
          </span>
        </div>
      )}
      <div className={`w-full bg-grayscale-100 dark:bg-grayscale-900 rounded-full overflow-hidden hairline-border p-[1px]`}>
        <motion.div
          className={`bg-pure-black dark:bg-pure-white rounded-full ${heightStyles[size]}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};
