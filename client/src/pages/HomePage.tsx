import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { ArtifactIcon } from '../components/ui/ArtifactIcon';
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
    <div className="space-y-20 relative font-sans">

      {/* STREAK PROTECTED NOTICE BANNER */}
      <AnimatePresence>
        {streakProtectedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xl mx-auto p-4 clip-corner bg-slate-900 border border-amber-500/50 shadow-hud-gold text-center space-y-2 font-hud"
          >
            <p className="text-xs font-bold text-amber-400 flex items-center justify-center gap-2 tracking-wider">
              <span>❄️</span>
              <span>{streakProtectedNotice.toUpperCase()}</span>
            </p>
            <button
              onClick={clearStreakProtectedNotice}
              className="text-[10px] font-hud uppercase tracking-widest text-slate-400 hover:text-amber-400"
            >
              [ DISMISS NOTICE ]
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCI-FI HUD GENERATION OVERLAY */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl px-6 font-hud"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center space-y-6 max-w-sm mx-auto p-8 clip-corner bg-slate-900 border border-cyan-500/50 shadow-hud-cyan-lg"
            >
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-12 h-12 clip-corner border-2 border-cyan-500/40 border-t-cyan-400 shadow-hud-cyan"
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
                    className="text-sm font-bold text-cyan-300 uppercase tracking-widest"
                  >
                    {loadingStatus}
                  </motion.p>
                </AnimatePresence>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Synthesizing Neural Micro-Lesson & 5-Question HUD Quiz via Gemini
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HERO SECTION */}
      <section className="text-center space-y-8 py-10 md:py-16 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 clip-corner-sm border border-cyan-500/30 bg-cyan-500/10 text-[10px] font-hud uppercase tracking-widest text-cyan-300 shadow-hud-cyan">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            NEURAL ACTIVE RECALL PROTOCOL
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-hud tracking-widest leading-[1.05] text-slate-100 uppercase drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            LEVEL UP YOUR KNOWLEDGE.
          </h1>

          <p className="text-base md:text-lg font-sans text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enter any concept or topic to instantly synthesize a sci-fi micro-lesson and 5-question conceptual quiz powered by Google Gemini.
          </p>
        </motion.div>

        {/* ERROR BANNER FOR BLOCKED / FAILED TOPICS */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto p-4 clip-corner bg-red-950/80 border border-red-500/40 text-center space-y-2 font-hud"
            >
              <p className="text-xs font-bold text-red-400 tracking-wider">
                [ ERROR: {error.message.toUpperCase()} ]
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={() => {
                    clearError();
                    setTopicInput('');
                  }}
                  className="text-[10px] font-hud tracking-widest text-slate-400 hover:text-slate-100"
                >
                  [ DISMISS ]
                </button>
                {error.topic && (
                  <button
                    onClick={() => handleGenerate(error.topic)}
                    className="text-[10px] font-hud font-bold tracking-widest text-cyan-300"
                  >
                    [ RETRY GENERATION ]
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
            className="relative flex items-center bg-slate-900/90 clip-corner border border-cyan-500/40 p-2 shadow-hud-cyan focus-within:border-cyan-400 transition-all duration-200"
          >
            <input
              type="text"
              value={topicInput}
              onChange={(e) => {
                setTopicInput(e.target.value);
                if (error) clearError();
              }}
              placeholder="INPUT KNOWLEDGE TOPIC OR MODULE..."
              className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm font-hud text-slate-100 placeholder-slate-500 focus:outline-none uppercase tracking-wider"
              disabled={isGenerating}
            />
            <Button 
              variant="primary" 
              size="md" 
              className="shrink-0"
              disabled={isGenerating || !topicInput.trim()}
              type="submit"
            >
              {isGenerating ? 'PROCESSING...' : 'INITIALIZE'}
            </Button>
          </form>

          {/* TIMED SPRINT MODE TOGGLE SWITCH */}
          <div className="flex items-center justify-center gap-3 text-xs font-hud tracking-wider uppercase">
            <span className="text-slate-400">PROTOCOL MODE:</span>
            <button
              type="button"
              onClick={() => { playClick(); setTimedSprintMode(false); }}
              className={`px-3.5 py-1 clip-corner-sm transition-all ${
                !timedSprintMode
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-hud-cyan'
                  : 'text-slate-400 hover:text-slate-100 border border-slate-800'
              }`}
            >
              STANDARD
            </button>
            <button
              type="button"
              onClick={() => { playClick(); setTimedSprintMode(true); }}
              className={`px-3.5 py-1 clip-corner-sm transition-all ${
                timedSprintMode
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-hud-cyan'
                  : 'text-slate-400 hover:text-slate-100 border border-slate-800'
              }`}
            >
              TIMED SPRINT (15S)
            </button>
          </div>

          {/* SUGGESTED TOPIC CHIPS */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-1 font-hud text-xs">
            <span className="text-[10px] text-slate-500 tracking-widest mr-1 uppercase">PRESETS:</span>
            {suggestedTopics.map((topic) => (
              <button
                key={topic}
                disabled={isGenerating}
                onClick={() => {
                  setTopicInput(topic);
                  handleGenerate(topic);
                }}
                className="text-[10px] uppercase tracking-wider px-3 py-1 clip-corner-sm border border-cyan-500/20 bg-slate-900/60 text-slate-400 hover:text-cyan-300 hover:border-cyan-400 transition-all duration-150 disabled:opacity-50"
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. FEATURED TODAY'S DAILY CHALLENGE CARD */}
      <section className="max-w-4xl mx-auto">
        <Card variant="gold" hoverable padding="lg" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-400 font-hud font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-hud-gold animate-pulse" />
                FEATURED DAILY MISSION
              </div>
              <h2 className="text-2xl font-bold font-hud text-slate-100 tracking-wider">
                {todayChallengeTopic}
              </h2>
            </div>

            {/* Countdown Timer to Midnight */}
            <div className="text-right shrink-0 font-hud">
              <span className="text-[10px] uppercase tracking-widest text-amber-400/80 block">RESETS IN</span>
              <div className="text-lg font-bold tracking-widest text-amber-400 tabular-nums shadow-hud-gold">
                {timeLeft.hours}H {timeLeft.minutes}M {timeLeft.seconds}S
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              Earn <span className="font-bold text-amber-400 font-hud">+150 BONUS XP</span> and advance your neural streak by completing today's featured community challenge.
            </p>

            <Button
              variant={isChallengeDone ? "secondary" : "gold"}
              size="md"
              onClick={handleStartDailyChallenge}
              disabled={isChallengeDone}
              className="shrink-0"
            >
              {isChallengeDone ? "MISSION COMPLETED ✓" : "LAUNCH MISSION (+150 XP)"}
            </Button>
          </div>
        </Card>
      </section>

      {/* 4. USER STATS SUMMARY CARD */}
      <section className="max-w-4xl mx-auto">
        <Card padding="lg">
          <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-hud font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-hud-cyan" />
            COMMAND CENTER &middot; NEURAL PERFORMANCE OVERVIEW
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-cyan-500/20">
            {/* Level */}
            <div className="flex flex-col space-y-1 font-hud">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                RANK TIER
              </span>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-cyan-300 tabular-nums drop-shadow-[0_0_10px_rgba(0,240,255,0.6)]">
                0{user.level}
              </div>
              <span className="text-[10px] text-slate-500 pt-1 tracking-widest uppercase">
                STATUS: ACTIVE LEARNER
              </span>
            </div>

            {/* Total XP */}
            <div className="flex flex-col space-y-1 pt-6 md:pt-0 md:pl-8 font-hud">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                TOTAL EXPERIENCE (XP)
              </span>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-slate-100 tabular-nums">
                {user.totalXp}
              </div>
              <span className="text-[10px] text-slate-500 pt-1 tracking-widest uppercase">
                NEXT RANK: {user.nextLevelXp} XP
              </span>
            </div>

            {/* Streak Days */}
            <div className="flex flex-col space-y-1 pt-6 md:pt-0 md:pl-8 font-hud">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                NEURAL STREAK
              </span>
              <div className="text-4xl md:text-5xl font-black tracking-tight text-amber-400 tabular-nums flex items-baseline gap-2 drop-shadow-[0_0_10px_rgba(255,199,0,0.6)]">
                <span>{user.streakDays}</span>
                <span className="text-base font-normal text-slate-500">DAYS</span>
              </div>
              <span className="text-[10px] text-slate-500 pt-1 tracking-widest uppercase">
                RECORD: {user.longestStreak} DAYS
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-cyan-500/20">
            <ProgressBar value={user.currentXp} max={user.nextLevelXp} label={`RANK LEVEL ${user.level} CAPACITY`} />
          </div>
        </Card>
      </section>

      {/* 5. DESIGN SYSTEM COMPONENT SHOWCASE */}
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="border-b border-cyan-500/30 pb-4">
          <h2 className="text-2xl md:text-3xl font-black font-hud text-cyan-300 tracking-wider uppercase">
            HUD DESIGN SYSTEM PRIMITIVES
          </h2>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Sci-Fi HUD angular panels, cyan/gold glow system, and illustrated artifact emblems.
          </p>
        </div>

        {/* Buttons Grid */}
        <Card hoverable padding="lg" className="space-y-6">
          <h3 className="text-xs font-hud uppercase tracking-widest text-slate-300 border-b border-cyan-500/20 pb-2">
            Button Variants & Interactive Glow
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg">Primary Cyan CTA</Button>
            <Button variant="gold" size="lg">Gold Rank CTA</Button>
            <Button variant="secondary" size="md">Secondary HUD</Button>
            <Button variant="danger" size="sm">System Hazard</Button>
          </div>
        </Card>

        {/* Badges & Artifact Emblems */}
        <Card hoverable padding="lg" className="space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div>
              <h3 className="text-xs font-hud uppercase tracking-widest text-slate-300">
                Artifact Emblems & Charge-Up States
              </h3>
              <p className="text-[10px] font-sans text-slate-500">
                Illustrated glowing artifact icons in framed HUD backdrops.
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setBadgeUnlocked(!badgeUnlocked)}
            >
              TOGGLE ({badgeUnlocked ? 'UNLOCKED' : 'LOCKED'})
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Badge 
              label="First Steps" 
              unlocked={badgeUnlocked} 
              icon="Footprints"
              onClick={() => setBadgeUnlocked(!badgeUnlocked)} 
            />
            <Badge 
              label="Perfectionist" 
              unlocked={badgeUnlocked} 
              icon="CheckCircle"
              onClick={() => setBadgeUnlocked(!badgeUnlocked)} 
            />
            <Badge 
              label="Speed Demon" 
              unlocked={false} 
              icon="Clock"
            />
            <Badge 
              label="Unstoppable" 
              unlocked={false} 
              icon="Zap"
            />
          </div>
        </Card>

        {/* SegmentedBar Progress */}
        <Card hoverable padding="lg" className="space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 font-hud">
            <h3 className="text-xs uppercase tracking-widest text-slate-300">
              HUD Segmented Bar (10 Blocks)
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
            label="Module Capacity" 
          />
        </Card>
      </section>
    </div>
  );
};
