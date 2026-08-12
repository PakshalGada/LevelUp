import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useContentStore } from '../store/useContentStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { playClick } from '../lib/soundEffects';
import { motion, AnimatePresence } from 'framer-motion';

export const LessonPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { addXp, recordDailyActivity } = useGameStore();
  const {
    getContent,
    generateTopicContent,
    reframeSection,
    isGenerating,
    reframingSectionIdx,
    loadingStatus,
    error,
    clearError,
  } = useContentStore();

  const [completed, setCompleted] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showStickyCta, setShowStickyCta] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const articleRef = useRef<HTMLDivElement>(null);
  const topicSlug = topicId || '';
  const cachedContent = getContent(topicSlug);
  const lesson = cachedContent?.lesson;

  // Reading progress scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setScrollProgress(currentProgress);
        if (currentProgress > 45) {
          setShowStickyCta(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!topicSlug) return;
    if (!cachedContent && !isGenerating) {
      const readableTopic = topicSlug.replace(/-/g, ' ');
      generateTopicContent(readableTopic).catch((err: any) => {
        setLocalError(err.message || 'Failed to generate lesson.');
      });
    }
  }, [topicSlug, cachedContent, isGenerating, generateTopicContent]);

  const handleCompleteLesson = () => {
    if (!lesson || completed) return;
    playClick();
    addXp(lesson.xpReward || 100);
    recordDailyActivity();
    setCompleted(true);
  };

  const handleReframe = (sectionIdx: number, style: 'Simpler' | 'Story form' | 'Exam-focused') => {
    if (!topicSlug) return;
    playClick();
    reframeSection(topicSlug, sectionIdx, style);
  };

  if (isGenerating || (!lesson && !error && !localError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 font-hud text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-12 h-12 clip-corner border-2 border-cyan-500/40 border-t-cyan-400 shadow-hud-cyan"
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingStatus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm font-bold text-cyan-300 tracking-wider uppercase"
          >
            {loadingStatus}
          </motion.p>
        </AnimatePresence>
        <p className="text-[10px] text-slate-400 tracking-widest uppercase">
          Synthesizing Neural Micro-Lesson via Gemini LLM
        </p>
      </div>
    );
  }

  if (error || localError || !lesson) {
    return (
      <Card padding="lg" className="max-w-xl mx-auto text-center space-y-4 font-hud">
        <p className="text-red-400 font-bold text-xs tracking-wider uppercase">
          [ {error?.message || localError || 'LESSON DATA NOT FOUND'} ]
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="secondary" onClick={() => { clearError(); navigate('/'); }}>
            BACK TO HOME
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              clearError();
              setLocalError(null);
              generateTopicContent(topicSlug.replace(/-/g, ' '));
            }}
          >
            RETRY GENERATION
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 font-sans relative pb-24">
      {/* 1. SCROLL READING PROGRESS HUD BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-slate-950 pointer-events-none">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-amber-400 shadow-hud-cyan"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        />
      </div>

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-2 font-hud text-xs">
        <Link
          to="/"
          onClick={playClick}
          className="tracking-widest uppercase text-slate-400 hover:text-cyan-300 transition-colors"
        >
          &larr; BACK TO TOPICS
        </Link>

        <div className="flex items-center gap-4">
          <span className="px-3 py-1 clip-corner-sm border border-cyan-500/40 bg-slate-900/90 text-cyan-300 font-bold shadow-hud-cyan">
            +{lesson.xpReward || 100} XP REWARD
          </span>
          <span className="text-slate-400 uppercase tracking-widest">
            {lesson.durationMinutes || 4} MIN READ
          </span>
        </div>
      </div>

      {/* Main Lesson Content Area */}
      <div ref={articleRef} className="space-y-10">
        <header className="space-y-4 border-b border-cyan-500/30 pb-8">
          <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-hud font-bold">
            MODULE TOPIC: {lesson.topicId || topicSlug}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black font-hud text-slate-100 tracking-wider uppercase leading-tight drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            {lesson.title}
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed italic bg-slate-900/80 p-6 clip-corner border border-cyan-500/30 shadow-hud-cyan">
            "{lesson.summary}"
          </p>
        </header>

        {/* Sections with Angular Panels & Section-Level Reframing Controls */}
        <div className="space-y-10">
          {lesson.sections.map((section, idx) => {
            const isReframingThis = reframingSectionIdx === idx;
            return (
              <Card key={idx} padding="lg" className="space-y-6 relative overflow-hidden">

                {/* Section Shimmer Overlay during Reframing */}
                {isReframingThis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex items-center justify-center font-hud"
                  >
                    <div className="flex items-center gap-3 text-xs font-bold text-cyan-300 uppercase tracking-widest">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-cyan-400 border-t-transparent clip-corner-sm"
                      />
                      <span>REFRAMING NARRATIVE TONE...</span>
                    </div>
                  </motion.div>
                )}

                {/* Section Title & Reframe Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold font-hud text-cyan-300 tracking-wider uppercase">
                    {section.heading}
                  </h2>

                  {/* Understated Apple Tone Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-950/90 p-1.5 clip-corner-sm border border-cyan-500/30 shrink-0 font-hud">
                    <span className="text-[9px] text-slate-400 px-2 font-bold tracking-widest uppercase">TONE:</span>
                    {(['Simpler', 'Story form', 'Exam-focused'] as const).map((style) => {
                      const isActive = section.activeStyle === style;
                      return (
                        <button
                          key={style}
                          disabled={isReframingThis}
                          onClick={() => handleReframe(idx, style)}
                          className={`text-[10px] tracking-wider uppercase px-2.5 py-1 clip-corner-sm transition-all duration-150 ${isActive
                              ? 'bg-cyan-500 text-slate-950 font-bold shadow-hud-cyan'
                              : 'text-slate-400 hover:text-cyan-300'
                            }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Content Paragraph */}
                <p className="text-slate-200 text-base md:text-lg leading-relaxed whitespace-pre-line font-normal">
                  {section.content}
                </p>

                {section.activeStyle && (
                  <div className="text-xs text-amber-400 font-hud tracking-wider uppercase pt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-hud-gold inline-block" />
                    Reframed in "{section.activeStyle.toUpperCase()}" tone
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Key Takeaways Card */}
        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <Card padding="lg" className="space-y-4">
            <h3 className="text-sm font-bold font-hud text-cyan-300 tracking-widest uppercase">
              KEY TAKEAWAYS & PROTOCOLS
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              {lesson.keyTakeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-hud-cyan shrink-0 mt-2" />
                  <span className="leading-relaxed font-sans">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Inline Completion Section */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-cyan-500/30">
          {!completed ? (
            <Button variant="primary" size="lg" onClick={handleCompleteLesson}>
              COMPLETE LESSON (+{lesson.xpReward || 100} XP)
            </Button>
          ) : (
            <div className="text-xs font-hud tracking-wider font-bold px-4 py-2 clip-corner-sm border border-cyan-400 bg-slate-900 text-cyan-300 shadow-hud-cyan">
              ✓ LESSON COMPLETED (+{lesson.xpReward || 100} XP)
            </div>
          )}

          <Button variant="gold" size="lg" onClick={() => { playClick(); navigate(`/quiz/${topicSlug}`); }}>
            START QUIZ CHALLENGE
          </Button>
        </div>
      </div>

      {/* STICKY BOTTOM "START QUIZ" CTA BUTTON */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
          >
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
