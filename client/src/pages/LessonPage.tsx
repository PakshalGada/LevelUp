import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useContentStore } from '../store/useContentStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export const LessonPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { addXp, completeTopic } = useGameStore();
  const { getContent, generateTopicContent, isGenerating, loadingStatus, error, clearError } = useContentStore();

  const [completed, setCompleted] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const topicSlug = topicId || '';
  const cachedContent = getContent(topicSlug);
  const lesson = cachedContent?.lesson;

  useEffect(() => {
    if (!topicSlug) return;
    if (!cachedContent && !isGenerating) {
      // Uncached direct navigation to /lesson/:topicId — trigger generation
      const readableTopic = topicSlug.replace(/-/g, ' ');
      generateTopicContent(readableTopic).catch((err: any) => {
        setLocalError(err.message || 'Failed to generate lesson.');
      });
    }
  }, [topicSlug, cachedContent, isGenerating, generateTopicContent]);

  const handleCompleteLesson = () => {
    if (!lesson || completed) return;
    addXp(lesson.xpReward || 100);
    if (topicId) completeTopic(topicId);
    setCompleted(true);
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
        <p className="text-xs text-grayscale-500">Generating lesson via Gemini LLM...</p>
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
    <div className="max-w-4xl mx-auto space-y-8 font-serif">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xs uppercase tracking-widest text-grayscale-500 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white transition-colors"
        >
          &larr; Back to Topics
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <span className="px-2.5 py-1 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-pure-black dark:text-pure-white font-semibold">
            +{lesson.xpReward || 100} XP
          </span>
          <span className="text-grayscale-400 font-serif">
            {lesson.durationMinutes || 4} min read
          </span>
        </div>
      </div>

      {/* Lesson Article */}
      <Card padding="lg" className="space-y-8">
        <header className="space-y-4 border-b border-grayscale-200 dark:border-grayscale-800 pb-6">
          <span className="text-[10px] uppercase tracking-widest text-grayscale-400 font-semibold">
            Topic: {lesson.topicId || topicSlug}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-pure-black dark:text-pure-white tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-grayscale-600 dark:text-grayscale-300 text-base leading-relaxed italic bg-grayscale-50 dark:bg-grayscale-950 p-4 rounded-xl border border-grayscale-200 dark:border-grayscale-800">
            "{lesson.summary}"
          </p>
        </header>

        {/* Structured Lesson Sections */}
        <div className="space-y-8">
          {lesson.sections && lesson.sections.length > 0 ? (
            lesson.sections.map((section, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-xl font-bold text-pure-black dark:text-pure-white tracking-tight">
                  {section.heading}
                </h2>
                <p className="text-grayscale-800 dark:text-grayscale-200 text-base leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </section>
            ))
          ) : (
            <p className="text-grayscale-700 dark:text-grayscale-300 leading-relaxed">
              No sections generated for this topic.
            </p>
          )}
        </div>

        {/* Key Takeaways */}
        {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
          <div className="p-6 rounded-xl border border-grayscale-200 dark:border-grayscale-800 bg-grayscale-50 dark:bg-grayscale-950 space-y-4">
            <h3 className="text-base font-bold text-pure-black dark:text-pure-white">
              Key Takeaways
            </h3>
            <ul className="space-y-2 text-sm text-grayscale-700 dark:text-grayscale-300">
              {lesson.keyTakeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-pure-black dark:text-pure-white font-bold">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-grayscale-200 dark:border-grayscale-800">
          {!completed ? (
            <Button variant="primary" onClick={handleCompleteLesson}>
              Complete Lesson (+{lesson.xpReward || 100} XP)
            </Button>
          ) : (
            <div className="text-xs font-semibold px-3 py-1.5 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-pure-black dark:text-pure-white">
              &check; Lesson Completed (+{lesson.xpReward || 100} XP)
            </div>
          )}

          <Button variant="secondary" onClick={() => navigate(`/quiz/${topicSlug}`)}>
            Take Quiz Challenge &rarr;
          </Button>
        </div>
      </Card>
    </div>
  );
};
