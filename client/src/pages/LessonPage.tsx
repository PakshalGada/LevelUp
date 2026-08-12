import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle, Zap, HelpCircle, RefreshCw, Clock } from 'lucide-react';
import { Lesson } from '../types';
import { fetchGeneratedLesson } from '../lib/api';
import { useGameStore } from '../store/useGameStore';

export const LessonPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { addXp, completeTopic } = useGameStore();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!topicId) return;

    setLoading(true);
    fetchGeneratedLesson(topicId)
      .then((res) => {
        setLesson(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch lesson from proxy endpoint.');
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  const handleCompleteLesson = () => {
    if (!lesson || completed) return;
    addXp(lesson.xpReward);
    if (topicId) completeTopic(topicId);
    setCompleted(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-neon-cyan border-t-transparent animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Generating Lesson via Express Proxy Server...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="glass-card max-w-xl mx-auto p-8 rounded-2xl text-center space-y-4">
        <p className="text-red-400 font-semibold">{error || 'Lesson not found'}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 rounded-lg text-sm font-bold text-white hover:bg-dark-600">
          <ArrowLeft className="w-4 h-4" /> Back to Quests
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Topics
        </Link>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
            <Zap className="w-3.5 h-3.5" /> +{lesson.xpReward} XP
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5" /> {lesson.durationMinutes} min read
          </span>
        </div>
      </div>

      {/* Lesson Container */}
      <motion.article
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 sm:p-10 border border-dark-700/60 space-y-8"
      >
        <header className="space-y-4 border-b border-dark-700/60 pb-6">
          <div className="inline-block px-3 py-1 rounded-md bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs font-mono font-bold uppercase">
            Topic: {lesson.topicId}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-slate-300 text-base leading-relaxed italic bg-dark-900/60 p-4 rounded-xl border border-dark-700">
            "{lesson.summary}"
          </p>
        </header>

        {/* Content Sections */}
        <div className="space-y-6 text-slate-200 text-sm sm:text-base leading-relaxed">
          {lesson.content.map((paragraph, index) => (
            <p key={index} className="bg-dark-900/30 p-4 rounded-xl border border-dark-800">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Key Takeaways */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-dark-900 via-dark-850 to-dark-900 border border-neon-cyan/30 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-cyan" /> Key Takeaways
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {lesson.keyTakeaways.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-dark-700/60">
          {!completed ? (
            <button
              onClick={handleCompleteLesson}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-neon-green to-emerald-500 text-dark-950 font-extrabold text-sm hover:shadow-neon-green transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> Complete Lesson (+{lesson.xpReward} XP)
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-neon-green font-bold text-sm bg-neon-green/10 px-4 py-2 rounded-xl border border-neon-green/30">
              <CheckCircle className="w-5 h-5" /> XP Claimed! Lesson Completed
            </div>
          )}

          <button
            onClick={() => navigate(`/quiz/${topicId}`)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-950 font-extrabold text-sm hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-5 h-5" /> Take Quiz Challenge
          </button>
        </div>
      </motion.article>

    </div>
  );
};
