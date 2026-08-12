import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useGameStore } from '../store/useGameStore';
import { useContentStore } from '../store/useContentStore';
import { playClick } from '../lib/soundEffects';
import { motion, AnimatePresence } from 'framer-motion';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    timedSprintMode,
    setTimedSprintMode,
    dailyChallengeCompletedDate,
    completeDailyChallenge,
    streakProtectedNotice,
    clearStreakProtectedNotice,
  } = useGameStore();

  const { generateTopicContent, isGenerating, loadingStatus, error, clearError } = useContentStore();

  const [topicInput, setTopicInput] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(true);
  const [progressVal, setProgressVal] = useState(450);

  // Countdown timer to midnight
  const [timeLeft, setTimeLeft] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      setTimeLeft({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const isChallengeDone = dailyChallengeCompletedDate === todayStr;

  const dailyChallengeTopics = [
    'Quantum Computing & Superposition',
    'Neural Networks & Transformers',
    'Typography & Grid Systems',
    'Distributed Consensus & Raft',
    'Architecture & Spatial Design',
  ];

  // Deterministically select today's challenge topic
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const todayChallengeTopic = dailyChallengeTopics[dayOfYear % dailyChallengeTopics.length];

  const suggestedTopics = [
    'Quantum Computing',
    'Typography & Grid Systems',
    'Neural Networks',
    'Architecture History',
    'System Design',
  ];

  const handleGenerate = async (topicToGenerate?: string) => {
    playClick();
    const targetTopic = topicToGenerate || topicInput;
    if (!targetTopic || !targetTopic.trim()) return;

    try {
      clearError();
      const topicId = await generateTopicContent(targetTopic.trim());
      navigate(`/lesson/${topicId}`);
    } catch (err) {
      console.error("Generation failed:", err);
    }
  };

  const handleStartDailyChallenge = () => {
    playClick();
    completeDailyChallenge();
    handleGenerate(todayChallengeTopic);
  };

  return (
    <div className="space-y-24 relative font-serif">

      {/* STREAK PROTECTED NOTICE BANNER */}
      <AnimatePresence>
        {streakProtectedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto p-4 rounded-xl border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-center space-y-2"
          >
            <p className="text-sm font-semibold text-pure-black dark:text-pure-white flex items-center justify-center gap-2">
              <span>❄️</span>
              <span>{streakProtectedNotice}</span>
            </p>
            <button
              onClick={clearStreakProtectedNotice}
              className="text-xs font-serif underline text-grayscale-500 hover:text-pure-black dark:hover:text-pure-white"
            >
              Dismiss Notice
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING OVERLAY / MODAL */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-pure-white/90 dark:bg-pure-black/90 backdrop-blur-md px-6 font-serif"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="text-center space-y-6 max-w-sm mx-auto p-8 rounded-2xl border border-grayscale-200 dark:border-grayscale-800 bg-pure-white dark:bg-off-black shadow-elevation-hover"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-12 h-12 rounded-full border-2 border-grayscale-300 dark:border-grayscale-700 border-t-pure-black dark:border-t-pure-white"
                />
              </div>

              <div className="space-y-2">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStatus}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                    className="text-base font-semibold text-pure-black dark:text-pure-white tracking-tight"
                  >
                    {loadingStatus}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-grayscale-500 font-serif">
                  Generating custom lesson & 5-question quiz via Gemini LLM
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <section className="text-center space-y-8 py-12 md:py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <span className="inline-block text-xs uppercase tracking-widest text-grayscale-500 dark:text-grayscale-400 font-medium">
            Editorial Active Recall Platform
          </span>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tightest leading-[1.05] text-pure-black dark:text-pure-white">
            Level up your learning.
          </h1>

          <p className="text-lg md:text-xl font-light text-grayscale-600 dark:text-grayscale-400 max-w-2xl mx-auto leading-relaxed">
            Enter any topic to instantly generate a tailored micro-lesson and 5-question conceptual quiz powered by Google Gemini.
          </p>
        </motion.div>

        {/* ERROR BANNER FOR BLOCKED / FAILED TOPICS */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto p-4 rounded-xl border border-danger-light-border dark:border-danger-border bg-danger-light-bg dark:bg-danger-bg text-center space-y-2"
            >
              <p className="text-sm font-semibold text-danger-light-text dark:text-red-400">
                {error.message}
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={() => {
                    clearError();
                    setTopicInput('');
                  }}
                  className="text-xs font-serif underline text-grayscale-600 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white"
                >
                  Dismiss
                </button>
                {error.topic && (
                  <button
                    onClick={() => handleGenerate(error.topic)}
                    className="text-xs font-serif font-bold underline text-pure-black dark:text-pure-white"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. TOPIC INPUT & MODE TOGGLE */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl mx-auto space-y-6"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }} 
            className="relative flex items-center bg-pure-white dark:bg-off-black rounded-full border border-grayscale-300 dark:border-grayscale-700 p-1.5 shadow-elevation-resting focus-within:border-pure-black dark:focus-within:border-pure-white transition-all duration-200"
          >
            <input
              type="text"
              value={topicInput}
              onChange={(e) => {
                setTopicInput(e.target.value);
                if (error) clearError();
              }}
              placeholder="What would you like to learn today?"
              className="w-full bg-transparent px-5 py-2.5 text-sm md:text-base text-pure-black dark:text-pure-white placeholder-grayscale-400 dark:placeholder-grayscale-600 focus:outline-none font-serif"
              disabled={isGenerating}
            />
            <Button 
              variant="primary" 
              size="md" 
              className="shrink-0 rounded-full"
              disabled={isGenerating || !topicInput.trim()}
              type="submit"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
          </form>

          {/* TIMED SPRINT MODE TOGGLE SWITCH */}
          <div className="flex items-center justify-center gap-4 text-xs font-serif">
            <span className="text-grayscale-400">Mode:</span>
            <button
              type="button"
              onClick={() => { playClick(); setTimedSprintMode(false); }}
              className={`px-3 py-1 rounded-full transition-colors ${
                !timedSprintMode
                  ? 'bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black font-semibold'
                  : 'text-grayscale-500 hover:text-pure-black dark:hover:text-pure-white'
              }`}
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => { playClick(); setTimedSprintMode(true); }}
              className={`px-3 py-1 rounded-full transition-colors ${
                timedSprintMode
                  ? 'bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black font-semibold'
                  : 'text-grayscale-500 hover:text-pure-black dark:hover:text-pure-white'
              }`}
            >
              Timed Sprint (15s/q)
            </button>
          </div>

          {/* SUGGESTED TOPIC CHIPS */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
            <span className="text-xs text-grayscale-400 dark:text-grayscale-600 mr-1">Suggestions:</span>
            {suggestedTopics.map((topic) => (
              <button
                key={topic}
                disabled={isGenerating}
                onClick={() => {
                  setTopicInput(topic);
                  handleGenerate(topic);
                }}
                className="text-xs font-serif px-3 py-1 rounded-full border border-grayscale-200 dark:border-grayscale-800 text-grayscale-600 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white hover:border-grayscale-400 dark:hover:border-grayscale-600 hover:bg-grayscale-100/50 dark:hover:bg-grayscale-900/50 transition-all duration-150 disabled:opacity-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. FEATURED TODAY'S DAILY CHALLENGE CARD */}
      <section className="max-w-4xl mx-auto">
        <Card hoverable padding="lg" className="hairline-border space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-grayscale-200 dark:border-grayscale-800 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-grayscale-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-pure-black dark:bg-pure-white" />
                Featured Daily Challenge
              </div>
              <h2 className="text-2xl font-bold text-pure-black dark:text-pure-white tracking-tight">
                {todayChallengeTopic}
              </h2>
            </div>

            {/* Countdown Timer to Midnight */}
            <div className="text-right shrink-0 font-serif">
              <span className="text-[10px] uppercase tracking-widest text-grayscale-400 block">Resets In</span>
              <div className="text-lg font-bold tracking-tight text-pure-black dark:text-pure-white tabular-nums">
                {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-light text-grayscale-600 dark:text-grayscale-400 leading-relaxed">
              Earn <span className="font-semibold text-pure-black dark:text-pure-white">+150 Bonus XP</span> and advance your daily streak by completing today's community challenge topic.
            </p>

            <Button
              variant={isChallengeDone ? "ghost" : "primary"}
              size="md"
              onClick={handleStartDailyChallenge}
              disabled={isChallengeDone}
              className="shrink-0"
            >
              {isChallengeDone ? "Completed Today &check;" : "Start Challenge (+150 XP)"}
            </Button>
          </div>
        </Card>
      </section>

      {/* 4. USER STATS SUMMARY CARD */}
      <section className="max-w-4xl mx-auto">
        <Card padding="lg" className="hairline-border">
          <div className="text-xs uppercase tracking-widest text-grayscale-500 dark:text-grayscale-400 font-medium mb-6">
            Overview & Performance
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-grayscale-200 dark:divide-grayscale-800">
            {/* Level */}
            <div className="flex flex-col space-y-1">
              <span className="text-xs uppercase tracking-widest text-grayscale-400 dark:text-grayscale-500">
                Current Level
              </span>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-pure-black dark:text-pure-white tabular-nums">
                0{user.level}
              </div>
              <span className="text-xs text-grayscale-500 dark:text-grayscale-400 pt-1">
                Learner Status: Active
              </span>
            </div>

            {/* Total XP */}
            <div className="flex flex-col space-y-1 pt-6 md:pt-0 md:pl-8">
              <span className="text-xs uppercase tracking-widest text-grayscale-400 dark:text-grayscale-500">
                Experience (XP)
              </span>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-pure-black dark:text-pure-white tabular-nums">
                {user.totalXp}
              </div>
              <span className="text-xs text-grayscale-500 dark:text-grayscale-400 pt-1">
                Target: {user.nextLevelXp} XP
              </span>
            </div>

            {/* Streak Days */}
            <div className="flex flex-col space-y-1 pt-6 md:pt-0 md:pl-8">
              <span className="text-xs uppercase tracking-widest text-grayscale-400 dark:text-grayscale-500">
                Active Streak
              </span>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-pure-black dark:text-pure-white tabular-nums flex items-baseline gap-2">
                <span>{user.streakDays}</span>
                <span className="text-lg font-light text-grayscale-400 dark:text-grayscale-500">Days</span>
              </div>
              <span className="text-xs text-grayscale-500 dark:text-grayscale-400 pt-1">
                Best Record: {user.longestStreak} Days
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-grayscale-200 dark:border-grayscale-800/80">
            <ProgressBar value={user.currentXp} max={user.nextLevelXp} label={`Level ${user.level} Progression`} />
          </div>
        </Card>
      </section>

      {/* 5. DESIGN SYSTEM COMPONENT SHOWCASE */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-grayscale-200 dark:border-grayscale-800 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-pure-black dark:text-pure-white tracking-tight">
            Design System Components
          </h2>
          <p className="text-sm text-grayscale-500 dark:text-grayscale-400 mt-1">
            Monochrome, Apple-inspired editorial primitives and motion system.
          </p>
        </div>

        {/* Buttons Grid */}
        <Card hoverable padding="lg" className="space-y-6">
          <h3 className="text-base font-semibold text-pure-black dark:text-pure-white border-b border-grayscale-200 dark:border-grayscale-800 pb-2">
            Button Variants & Sizes
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg">Primary Large</Button>
            <Button variant="primary" size="md">Primary Medium</Button>
            <Button variant="primary" size="sm">Primary Small</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="secondary" size="md">Secondary Outline</Button>
            <Button variant="ghost" size="md">Ghost Link</Button>
            <Button variant="danger" size="md">Desaturated Danger</Button>
          </div>
        </Card>

        {/* Badges & Unlocked Sheen */}
        <Card hoverable padding="lg" className="space-y-6">
          <div className="flex items-center justify-between border-b border-grayscale-200 dark:border-grayscale-800 pb-2">
            <div>
              <h3 className="text-base font-semibold text-pure-black dark:text-pure-white">
                Badges & Lock States
              </h3>
              <p className="text-xs text-grayscale-500 dark:text-grayscale-400">
                Click to toggle unlocked sheen sweep animation.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setBadgeUnlocked(!badgeUnlocked)}
            >
              Toggle State ({badgeUnlocked ? 'Unlocked' : 'Locked'})
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Badge 
              label="First Steps" 
              unlocked={badgeUnlocked} 
              onClick={() => setBadgeUnlocked(!badgeUnlocked)} 
            />
            <Badge 
              label="Perfectionist" 
              unlocked={badgeUnlocked} 
              onClick={() => setBadgeUnlocked(!badgeUnlocked)} 
            />
            <Badge 
              label="Speed Demon" 
              unlocked={false} 
            />
            <Badge 
              label="Unstoppable" 
              unlocked={false} 
            />
          </div>
        </Card>

        {/* Progress Bar & Interactive Counter */}
        <Card hoverable padding="lg" className="space-y-6">
          <div className="flex items-center justify-between border-b border-grayscale-200 dark:border-grayscale-800 pb-2">
            <h3 className="text-base font-semibold text-pure-black dark:text-pure-white">
              Animated Progress Bar
            </h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setProgressVal(Math.max(0, progressVal - 150))}
              >
                -150 XP
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setProgressVal(Math.min(1000, progressVal + 150))}
              >
                +150 XP
              </Button>
            </div>
          </div>

          <ProgressBar 
            value={progressVal} 
            max={1000} 
            label="Module Master XP" 
          />
        </Card>

        {/* Avatars */}
        <Card hoverable padding="lg" className="space-y-6">
          <h3 className="text-base font-semibold text-pure-black dark:text-pure-white border-b border-grayscale-200 dark:border-grayscale-800 pb-2">
            Avatar Variations
          </h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Avatar initials="AP" size="lg" />
              <span className="text-xs text-grayscale-500 font-serif">Large</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar initials="LU" size="md" />
              <span className="text-xs text-grayscale-500 font-serif">Medium</span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar initials="CL" size="sm" />
              <span className="text-xs text-grayscale-500 font-serif">Small</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
