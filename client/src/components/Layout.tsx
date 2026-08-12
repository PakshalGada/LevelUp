import React from 'react';
import { Navbar } from './Navbar';
import { PageTransition } from './ui/PageTransition';

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-pure-white dark:bg-pure-black text-pure-black dark:text-pure-white transition-colors duration-200 font-serif">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 md:py-16">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <footer className="w-full border-t border-grayscale-200 dark:border-grayscale-800/80 py-8 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-grayscale-500 dark:text-grayscale-400 font-serif">
          <span>LevelUp &copy; {new Date().getFullYear()} — Designed in Apple Monochrome Editorial Style</span>
          <div className="flex items-center gap-6 text-grayscale-600 dark:text-grayscale-400">
            <span>Precision Learning</span>
            <span>&middot;</span>
            <span>Minimalist Design</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
