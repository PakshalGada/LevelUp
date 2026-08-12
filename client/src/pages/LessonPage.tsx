import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useContentStore } from '../store/useContentStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
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
        // Show sticky CTA once scrolled through 50%+ of lesson
        if (currentProgress > 45) {
          setShowStickyCta(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
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
    addXp(lesson.xpReward || 100);
    recordDailyActivity();
    setCompleted(true);
  };

  const handleReframe = (sectionIdx: number, style: 'Simpler' | 'Story form' | 'Exam-focused') => {
    if (!topicSlug) return;
    reframeSection(topicSlug, sectionIdx, style);
  };

  if (isGenerating || (!lesson && !error && !localError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 font-serif text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-grayscale-300 dark:border-grayscale-700 border-t-pure-black dark:border-t-pure-white"
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingStatus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-base font-semibold text-pure-black dark:text-pure-white tracking-tight"
          >
            {loadingStatus}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs text-grayscale-500">Generating structured lesson via Gemini LLM...</p>
      </div>
    );
  }

  if (error || localError || !lesson) {
    return (
      <Card padding="lg" className="max-w-xl mx-auto text-center space-y-4 font-serif">
        <p className="text-danger-light-text dark:text-red-400 font-semibold text-base">
          {error?.message || localError || 'Lesson content not found'}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="secondary" onClick={() => { clearError(); navigate('/'); }}>
            Back to Home
          </Button>
          <Button 
            variant="primary" 
            onClick={() => { 
              clearError(); 
              setLocalError(null);
              generateTopicContent(topicSlug.replace(/-/g, ' '));
            }}
          >
            Try Re-generating
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 font-serif relative pb-24">
      {/* 1. SCROLL READING PROGRESS INDICATOR BAR */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-grayscale-100 dark:bg-grayscale-900 pointer-events-none">
        <motion.div
          className="h-full bg-pure-black dark:bg-pure-white"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1, ease: 'easeOut' }}
        />
      </div>

      {/* Top Header Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Link 
          to="/" 
          className="text-xs uppercase tracking-widest text-grayscale-500 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white transition-colors"
        >
          &larr; Back to Topics
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <span className="px-3 py-1 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-pure-black dark:text-pure-white font-semibold">
            +{lesson.xpReward || 100} XP
          </span>
          <span className="text-grayscale-400 font-serif">
            {lesson.durationMinutes || 4} min read
          </span>
        </div>
      </div>

      {/* Main Lesson Content Area */}
      <div ref={articleRef} className="space-y-10">
        <header className="space-y-4 border-b border-grayscale-200 dark:border-grayscale-800 pb-8">
          <span className="text-[10px] uppercase tracking-widest text-grayscale-400 font-semibold">
            Topic: {lesson.topicId || topicSlug}
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-pure-black dark:text-pure-white tracking-tight leading-[1.1]">
            {lesson.title}
          </h1>
          <p className="text-grayscale-600 dark:text-grayscale-300 text-lg leading-relaxed italic bg-grayscale-50 dark:bg-grayscale-950 p-6 rounded-2xl border border-grayscale-200 dark:border-grayscale-800">
            "{lesson.summary}"
          </p>
        </header>

        {/* Sections with Hairline Dividers & Section-Level "Explain it Differently" Controls */}
        <div className="space-y-12">
          {lesson.sections.map((section, idx) => {
            const isReframingThis = reframingSectionIdx === idx;
            return (
              <Card key={idx} padding="lg" className="space-y-6 relative overflow-hidden hairline-border">
                
                {/* Section Shimmer Overlay during Reframing */}
                {isReframingThis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-pure-white/80 dark:bg-pure-black/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="flex items-center gap-3 text-xs font-semibold text-pure-black dark:text-pure-white">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        className="w-4 h-4 rounded-full border-2 border-grayscale-400 border-t-pure-black dark:border-t-pure-white"
                      />
                      <span>Reframing section tone...</span>
                    </div>
                  </motion.div>
                )}

                {/* Section Title & Reframe Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-grayscale-100 dark:border-grayscale-800/60 pb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-pure-black dark:text-pure-white tracking-tight">
                    {section.heading}
                  </h2>

                  {/* Understated Apple Tone Controls */}
                  <div className="flex items-center gap-1.5 bg-grayscale-100/70 dark:bg-grayscale-900/70 p-1 rounded-full border border-grayscale-200 dark:border-grayscale-800 shrink-0">
                    <span className="text-[10px] text-grayscale-400 px-2 font-medium">Explain:</span>
                    {(['Simpler', 'Story form', 'Exam-focused'] as const).map((style) => {
                      const isActive = section.activeStyle === style;
                      return (
                        <button
                          key={style}
                          disabled={isReframingThis}
                          onClick={() => handleReframe(idx, style)}
                          className={`text-[11px] font-serif px-2.5 py-1 rounded-full transition-all duration-150 ${
                            isActive
                              ? 'bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black font-semibold shadow-elevation-resting'
                              : 'text-grayscale-600 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white'
                          }`}
                        >
                          {style}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section Content Paragraph */}
                <p className="text-grayscale-800 dark:text-grayscale-200 text-base md:text-lg leading-relaxed whitespace-pre-line font-light">
                  {section.content}
                </p>

                {section.activeStyle && (
                  <div className="text-xs text-grayscale-400 font-serif italic pt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pure-black dark:bg-pure-white inline-block" />
                    Reframed in "{section.activeStyle}" tone
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Key Takeaways Card */}
        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <Card padding="lg" className="space-y-4 bg-grayscale-50 dark:bg-grayscale-950 border border-grayscale-200 dark:border-grayscale-800">
            <h3 className="text-base font-bold text-pure-black dark:text-pure-white tracking-tight">
              Key Takeaways
            </h3>
            <ul className="space-y-3 text-sm text-grayscale-700 dark:text-grayscale-300">
              {lesson.keyTakeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-pure-black dark:bg-pure-white shrink-0 mt-2" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Inline Completion Section */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-grayscale-200 dark:border-grayscale-800">
          {!completed ? (
            <Button variant="primary" size="lg" onClick={handleCompleteLesson}>
              Complete Lesson (+{lesson.xpReward || 100} XP)
            </Button>
          ) : (
            <div className="text-xs font-semibold px-4 py-2 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-pure-black dark:text-pure-white">
              &check; Lesson Completed (+{lesson.xpReward || 100} XP)
            </div>
          )}

          <Button variant="secondary" size="lg" onClick={() => navigate(`/quiz/${topicSlug}`)}>
            Start Quiz Challenge &rarr;
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
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate(`/quiz/${topicSlug}`)}
              className="shadow-elevation-hover rounded-full px-8 py-3.5 border border-pure-white/20 dark:border-pure-black/20"
            >
              Start Quiz Challenge &rarr;
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
