import React from 'react';
import { Navbar } from './Navbar';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100 selection:bg-neon-cyan selection:text-dark-950">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {children}
      </motion.main>
      
      <footer className="border-t border-dark-800 py-6 text-center text-xs text-slate-500 glass-panel mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} LevelUp Platform. Gamified Micro-Learning Scaffold.</p>
          <div className="flex gap-4">
            <span className="hover:text-neon-cyan cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-neon-cyan cursor-pointer transition-colors">API Proxy Status: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
