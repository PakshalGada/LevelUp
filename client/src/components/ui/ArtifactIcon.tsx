import React from 'react';
import { motion } from 'framer-motion';

export interface ArtifactIconProps {
  id?: string;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ArtifactIcon: React.FC<ArtifactIconProps> = ({
  id = 'default',
  unlocked = false,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const getArtifactGlyph = (type: string) => {
    switch (type) {
      case 'first-steps':
      case 'Footprints':
        return '❖';
      case 'perfectionist':
      case 'CheckCircle':
        return '✦';
      case 'on-fire':
      case 'Flame':
        return '🔥';
      case 'unstoppable':
      case 'Zap':
        return '⚡';
      case 'polymath':
      case 'BookOpen':
        return '◈';
      case 'speed-demon':
      case 'Clock':
        return '⏱';
      default:
        return '★';
    }
  };

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.08, rotate: 3 } : undefined}
      className={`relative inline-flex items-center justify-center font-hud clip-corner ${
        sizeStyles[size]
      } ${
        unlocked
          ? 'bg-slate-900 border border-cyan-400 text-cyan-300 shadow-hud-cyan'
          : 'bg-slate-950 border border-slate-800 text-slate-600 opacity-60'
      } ${className}`}
    >
      {/* Background Radial Glow Burst when unlocked */}
      {unlocked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0 bg-cyan-500/20 rounded-full blur-sm pointer-events-none"
        />
      )}

      {/* Artifact SVG / Glyph */}
      <span className={`relative z-10 font-bold ${unlocked ? 'drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'grayscale'}`}>
        {getArtifactGlyph(id)}
      </span>

      {/* Lock overlay icon if locked */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      )}
    </motion.div>
  );
};
