import React from 'react';
import { Navbar } from './Navbar';
import { PageTransition } from './ui/PageTransition';
import { BackgroundAtmosphere } from './ui/BackgroundAtmosphere';

export interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative font-sans overflow-x-hidden">
      <BackgroundAtmosphere />
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 md:py-14 z-10">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <footer className="w-full border-t border-cyan-500/20 bg-slate-950/80 backdrop-blur-md py-6 px-6 sm:px-8 lg:px-12 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-hud tracking-wider">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>LEVELUP HUD SYSTEM &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-slate-500">
            <span>NEURAL RECALL ENGINE</span>
            <span>&middot;</span>
            <span>CYAN / GOLD PROTOCOL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
