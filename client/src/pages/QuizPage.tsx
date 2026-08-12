import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion, Badge as BadgeType } from '../types';
import { useGameStore } from '../store/useGameStore';
import { useContentStore } from '../store/useContentStore';
import { explainMistake } from '../lib/api';
import { playCorrectTick, playIncorrectTone, playLevelUpChime, playClick } from '../lib/soundEffects';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

const FALLBACK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary objective of active recall in learning?',
    options: [
      'Passively re-reading notes multiple times',
      'Retrieving information from memory to strengthen neural pathways',
      'Highlighting every sentence in a textbook',
      'Listening to lectures at 2x speed'
    ],
    correctIndex: 1,
    explanation: 'Active recall forces your brain to retrieve knowledge, which significantly improves long-term retention compared to passive review.'
  },
  {
    id: 'q2',
    question: 'Why is structured micro-learning effective?',
    options: [
      'It eliminates the need to practice or solve exercises',
      'It replaces deep study with superficial bullet points',
      'It reduces cognitive overload by breaking complex concepts into digestible pieces',
      'It guarantees 100% test scores without effort'
    ],
    correctIndex: 2,
    explanation: 'Bite-sized micro-lessons minimize cognitive load, allowing focused, high-retention learning sessions.'
  },
  {
    id: 'q3',
    question: 'Which principle best describes spaced repetition?',
    options: [
      'Cramming all study hours into a single overnight session',
      'Memorizing answers word-for-word without understanding',
      'Reading multiple books simultaneously',
      'Reviewing material at increasing time intervals to interrupt forgetting'
    ],
    correctIndex: 3,
    explanation: 'Spaced repetition aligns with the forgetting curve, reviewing concepts just before they fade to maximize retention.'
  },
  {
    id: 'q4',
    question: 'How does immediate conceptual feedback accelerate mastery?',
    options: [
      'By correcting mental models instantly before misconceptions solidify',
      'By penalizing mistakes with lost score',
      'By skipping difficult topics',
      'By hiding correct answers until final exams'
    ],
    correctIndex: 0,
    explanation: 'Immediate feedback prevents wrong assumptions from becoming habituated neural pathways.'
  },
  {
    id: 'q5',
    question: 'What is the ultimate goal of the Apple editorial learning philosophy?',
    options: [
      'Maximizing screen time through loud arcade animations',
      'Replacing human tutors with basic multiple choice forms',
      'Promoting quiet, confident, and high-precision conceptual understanding',
      'Simplifying all complex subjects into single bullet points'
    ],
    correctIndex: 2,
    explanation: 'Editorial design focuses on clarity, typography, and deliberate timing rather than noisy gamification gimmicks.'
  }
];

export const QuizPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const {
    user,
    timedSprintMode,
    getTopicDifficultyLabel,
    recordQuizResult,
    clearNewlyUnlockedBadges,
  } = useGameStore();

  const { getContent } = useContentStore();

  const topicSlug = topicId || '';
  const cachedContent = getContent(topicSlug);
  const difficultyLabel = getTopicDifficultyLabel(topicSlug);

  const questions: QuizQuestion[] = (cachedContent && cachedContent.quiz && cachedContent.quiz.length > 0)
    ? cachedContent.quiz
    : FALLBACK_QUIZ_QUESTIONS;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [showFloatingXp, setShowFloatingXp] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [unlockedBadgesToReveal, setUnlockedBadgesToReveal] = useState<BadgeType[]>([]);

  // Timed Sprint 15s Timer
  const [sprintTimeLeft, setSprintTimeLeft] = useState<number>(15);
  const sprintTimerRef = useRef<any>(null);

  // Mistake Explanations ("Dig deeper") state
  const [incorrectAnswers, setIncorrectAnswers] = useState<
    Array<{ questionId: string; question: string; userAns: string; correctAns: string; llmAnalysis?: string; isAnalyzing?: boolean }>
  >([]);

  const startTimeRef = useRef<number>(Date.now());
  const currentQuestion = questions[currentIdx];

  // Timed Sprint 15s timer
  useEffect(() => {
    if (timedSprintMode && !submitted && !quizFinished) {
      setSprintTimeLeft(15);
      if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);

      sprintTimerRef.current = setInterval(() => {
        setSprintTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(sprintTimerRef.current);
            handleAutoSubmitTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);
    };
  }, [currentIdx, timedSprintMode, submitted, quizFinished]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizFinished) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1;
        if (optionIdx < currentQuestion.options.length && !submitted) {
          playClick();
          setSelectedOption(optionIdx);
        }
      } else if (e.key === 'Enter') {
        if (!submitted && selectedOption !== null) {
          handleSubmitAnswer();
        } else if (submitted) {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedOption, submitted, quizFinished, currentIdx, currentQuestion]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    clearNewlyUnlockedBadges();
  }, [topicSlug, clearNewlyUnlockedBadges]);

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    playClick();
    setSelectedOption(idx);
  };

  const handleAutoSubmitTimeout = () => {
    if (submitted) return;
    setSubmitted(true);
    playIncorrectTone();
    setComboCount(0);

    const targetCorrectIndex = currentQuestion.correctIndex ?? currentQuestion.correctAnswer ?? 0;
    setIncorrectAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        userAns: 'Timed out (No selection)',
        correctAns: currentQuestion.options[targetCorrectIndex],
      },
    ]);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || submitted) return;
    if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);

    setSubmitted(true);
    const targetCorrectIndex = currentQuestion.correctIndex ?? currentQuestion.correctAnswer ?? 0;
    const isCorrect = selectedOption === targetCorrectIndex;

    if (isCorrect) {
      playCorrectTick();
      setScore((prev) => prev + 1);
      setComboCount((prev) => prev + 1);
      setShowFloatingXp(true);
      setTimeout(() => setShowFloatingXp(false), 1200);
    } else {
      playIncorrectTone();
      setComboCount(0);
      setIncorrectAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          userAns: currentQuestion.options[selectedOption],
          correctAns: currentQuestion.options[targetCorrectIndex],
        },
      ]);
    }
  };

  const handleNextQuestion = () => {
    playClick();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const totalEarnedXp = (score * 20) + (score === questions.length ? 50 : 25) + (timedSprintMode ? 30 : 0);

      const { newlyUnlocked, levelUpOccurred } = recordQuizResult({
        topicId: topicSlug,
        topicTitle: cachedContent?.lesson.title || topicSlug.replace(/-/g, ' '),
        score,
        totalQuestions: questions.length,
        xpEarned: totalEarnedXp,
        durationSeconds,
      });

      if (levelUpOccurred || score === questions.length) {
        playLevelUpChime();
      }

      setUnlockedBadgesToReveal(newlyUnlocked);
      setQuizFinished(true);
    }
  };

  const handleDigDeeper = async (questionId: string) => {
    const target = incorrectAnswers.find((i) => i.questionId === questionId);
    if (!target || target.llmAnalysis || target.isAnalyzing) return;

    setIncorrectAnswers((prev) =>
      prev.map((i) => (i.questionId === questionId ? { ...i, isAnalyzing: true } : i))
    );

    const explanation = await explainMistake(target.question, target.userAns, target.correctAns);

    setIncorrectAnswers((prev) =>
      prev.map((i) => (i.questionId === questionId ? { ...i, llmAnalysis: explanation, isAnalyzing: false } : i))
    );
  };

  const handleRestartQuiz = () => {
    playClick();
    setCurrentIdx(0);
    setSelectedOption(null);
    setSubmitted(false);
    setScore(0);
    setComboCount(0);
    setQuizFinished(false);
    setUnlockedBadgesToReveal([]);
    setIncorrectAnswers([]);
    startTimeRef.current = Date.now();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans pb-16">
      {/* Top Navigation & Difficulty Badge */}
      <div className="flex items-center justify-between font-hud text-xs">
        <Link 
          to={`/lesson/${topicSlug}`} 
          onClick={playClick}
          className="tracking-widest uppercase text-slate-400 hover:text-cyan-300 transition-colors"
        >
          &larr; BACK TO LESSON
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 clip-corner-sm bg-slate-900 border border-cyan-500/30 text-cyan-300 font-bold">
            {difficultyLabel}
          </span>
          {timedSprintMode && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 clip-corner-sm border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-hud-gold">
              TIMED SPRINT (15S)
            </span>
          )}
        </div>
      </div>

      {!quizFinished ? (
        <div className="space-y-8">
          
          {/* 1. TOP SEGMENTED PROGRESS BAR & TIMED DRAIN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 font-hud">
              <div className="flex-1 flex items-center gap-2">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 clip-corner-sm transition-all duration-300 ${
                      idx === currentIdx
                        ? 'bg-cyan-400 shadow-hud-cyan'
                        : idx < currentIdx
                        ? 'bg-slate-700 border border-slate-600'
                        : 'bg-slate-900 border border-slate-800'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-hud">
                {comboCount >= 2 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-2.5 py-0.5 clip-corner-sm border border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold"
                  >
                    &times;{comboCount} COMBO
                  </motion.span>
                )}
                <span className="tabular-nums font-bold text-slate-300">
                  SCORE: {score}/{questions.length}
                </span>
              </div>
            </div>

            {/* Timed Sprint 15s Draining Segment */}
            {timedSprintMode && !submitted && (
              <div className="w-full bg-slate-950 h-1.5 clip-corner-sm overflow-hidden border border-amber-500/30">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 shadow-hud-gold"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(sprintTimeLeft / 15) * 100}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            )}
          </div>

          {/* Floating +15 XP Dissolve Animation */}
          <AnimatePresence>
            {showFloatingXp && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: -24 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute right-12 top-28 pointer-events-none text-xs font-hud font-bold text-cyan-300 bg-slate-900 px-3.5 py-1 clip-corner border border-cyan-400 shadow-hud-cyan z-30"
              >
                +15 XP
              </motion.div>
            )}
          </AnimatePresence>

          {/* Single Question Container with Quick Sci-Fi Crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card padding="lg" className="space-y-8">
                
                {/* QUESTION TAG TOP-LEFT & GOLD NUMERAL */}
                <div className="flex items-center justify-between text-xs font-hud font-bold tracking-widest text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-hud-gold" />
                    <span className="text-amber-400">QUESTION 0{currentIdx + 1} OF 0{questions.length}</span>
                  </div>
                  {timedSprintMode && !submitted && (
                    <span className="tabular-nums font-bold text-amber-400 shadow-hud-gold">
                      {sprintTimeLeft}S REMAINING
                    </span>
                  )}
                </div>

                {/* Question Title */}
                <h2 className="text-2xl sm:text-3xl font-black font-hud text-slate-100 tracking-wider leading-snug">
                  {currentQuestion.question}
                </h2>

                {/* 4 Option Angular Rows */}
                <div className="space-y-3.5 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const targetCorrectIndex = currentQuestion.correctIndex ?? currentQuestion.correctAnswer ?? 0;
                    const isCorrect = idx === targetCorrectIndex;

                    let baseCardStyle = "w-full text-left p-5 clip-corner text-sm font-hud tracking-wider transition-all duration-200 flex items-center justify-between border cursor-pointer select-none ";

                    if (!submitted) {
                      baseCardStyle += isSelected
                        ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-hud-cyan-lg font-bold"
                        : "bg-slate-950/80 border-cyan-500/20 text-slate-200 hover:border-cyan-400 hover:shadow-hud-cyan hover:bg-slate-900";
                    } else {
                      if (isCorrect) {
                        baseCardStyle += "bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-hud-green font-bold scale-[1.01]";
                      } else if (isSelected) {
                        baseCardStyle += "bg-red-950/90 text-red-300 border-red-500 shadow-hud-red";
                      } else {
                        baseCardStyle += "bg-slate-950/40 border-slate-800 text-slate-600 opacity-40";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={submitted}
                        whileHover={!submitted ? { scale: 1.01 } : undefined}
                        whileTap={!submitted ? { scale: 0.99 } : undefined}
                        aria-label={`Option ${idx + 1}: ${option}`}
                        className={baseCardStyle}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 clip-corner-sm border border-current flex items-center justify-center text-xs font-mono shrink-0">
                            0{idx + 1}
                          </span>
                          <span className="leading-normal font-sans font-medium text-base">{option}</span>
                        </div>

                        {submitted && isCorrect && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-bold text-xs shrink-0 flex items-center gap-1 text-emerald-400"
                          >
                            ✓ CORRECT
                          </motion.span>
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-bold text-xs shrink-0 flex items-center gap-1 text-red-400"
                          >
                            💀 INCORRECT
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation Box Directly Beneath Question */}
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 clip-corner bg-slate-950 border border-cyan-500/30 space-y-2 font-sans"
                  >
                    <div className="text-xs font-hud font-bold text-cyan-300 uppercase tracking-widest">
                      SYSTEM ANALYSIS & EXPLANATION
                    </div>
                    <p className="text-sm text-slate-300 font-normal leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Bottom Action Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-cyan-500/20 font-hud">
                  <span className="text-[10px] text-slate-500 tracking-wider">
                    SHORTCUTS: KEYS [1-4] OR ENTER
                  </span>
                  {!submitted ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                    >
                      SUBMIT ANSWER [ENTER]
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleNextQuestion}
                    >
                      {currentIdx + 1 < questions.length ? 'NEXT QUESTION →' : 'VIEW RESULTS & REWARD'}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* QUIZ RESULTS SCREEN (SCI-FI HUD CELEBRATION & MISTAKE ANALYSIS) */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <Card padding="lg" className="text-center space-y-8">
            
            {/* Score Summary */}
            <div className="space-y-2 font-hud">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                MISSION RECALL ACCURACY
              </span>
              <div className="text-6xl sm:text-7xl font-black tracking-wider text-slate-100 tabular-nums drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                {score}/{questions.length}
              </div>
              <p className="text-xs font-sans text-slate-400">
                {score === questions.length ? 'Flawless recall execution. All neural pathways verified.' : 'Solid performance. Review mistake analysis below.'}
              </p>
            </div>

            {/* Total XP Earned */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 clip-corner border border-amber-500/40 bg-slate-900 shadow-hud-gold">
              <span className="text-xs font-hud uppercase tracking-widest text-amber-400">XP REWARD</span>
              <span className="text-2xl font-black font-hud text-amber-400 tabular-nums">
                +{(score * 20) + (score === questions.length ? 50 : 25) + (timedSprintMode ? 30 : 0)} XP
              </span>
            </div>

            {/* Level & Animated XP Bar */}
            <div className="max-w-md mx-auto space-y-2 pt-2">
              <ProgressBar value={user.currentXp} max={user.nextLevelXp} label={`RANK LEVEL ${user.level} PROGRESS`} />
            </div>

            {/* Newly Unlocked Badges */}
            {unlockedBadgesToReveal.length > 0 && (
              <div className="pt-4 space-y-3 border-t border-cyan-500/20 font-hud">
                <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                  NEW ARTIFACT EMBLEM UNLOCKED
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {unlockedBadgesToReveal.map((b) => (
                    <Badge key={b.id} label={b.title} unlocked size="lg" icon={b.icon} />
                  ))}
                </div>
              </div>
            )}

            {/* Streak Status */}
            <div className="pt-4 flex items-center justify-center gap-3 text-xs font-hud text-slate-200">
              <span className="text-amber-400 text-base">🔥</span>
              <span className="font-bold tracking-widest">{user.streakDays} DAY NEURAL STREAK ACTIVE</span>
            </div>

            {/* Action CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" onClick={() => { playClick(); navigate('/'); }}>
                TRY ANOTHER TOPIC
              </Button>
              <Button variant="secondary" size="lg" onClick={handleRestartQuiz}>
                RETRY QUIZ
              </Button>
              <Button variant="ghost" size="lg" onClick={() => { playClick(); navigate('/dashboard'); }}>
                VIEW COMMAND CENTER
              </Button>
            </div>
          </Card>

          {/* INCORRECT ANSWERS & "DIG DEEPER" LLM MISCONCEPTION ANALYSIS */}
          {incorrectAnswers.length > 0 && (
            <Card padding="lg" className="space-y-6">
              <div className="border-b border-cyan-500/20 pb-3 font-hud">
                <h3 className="text-lg font-bold text-cyan-300 tracking-wider uppercase">
                  MISTAKE DIAGNOSTICS & NEURAL ANALYSIS
                </h3>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Click "DIG DEEPER" for an instant AI breakdown of why your choice was incorrect.
                </p>
              </div>

              <div className="space-y-6">
                {incorrectAnswers.map((item, idx) => (
                  <div key={idx} className="p-5 clip-corner border border-cyan-500/30 space-y-3 bg-slate-950">
                    <div className="font-bold text-base font-hud text-slate-100 leading-snug">
                      {item.question}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-hud">
                      <div className="p-2.5 clip-corner-sm border border-red-500/40 bg-red-950/80 text-red-300">
                        <span className="font-bold block text-[9px] uppercase tracking-widest">SELECTED ANSWER</span>
                        <span className="font-sans">{item.userAns}</span>
                      </div>
                      <div className="p-2.5 clip-corner-sm border border-emerald-500/40 bg-emerald-950/80 text-emerald-300">
                        <span className="font-bold block text-[9px] uppercase tracking-widest">CORRECT ANSWER</span>
                        <span className="font-sans">{item.correctAns}</span>
                      </div>
                    </div>

                    {!item.llmAnalysis ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={item.isAnalyzing}
                        onClick={() => handleDigDeeper(item.questionId)}
                      >
                        {item.isAnalyzing ? 'ANALYZING MISCONCEPTION...' : 'DIG DEEPER →'}
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 clip-corner border border-cyan-400 bg-slate-900 text-xs text-slate-200 space-y-1 font-sans leading-relaxed shadow-hud-cyan"
                      >
                        <span className="font-hud font-bold text-[10px] uppercase tracking-widest text-cyan-300 block">
                          AI TUTOR MISCONCEPTION ANALYSIS
                        </span>
                        <p>{item.llmAnalysis}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

        </motion.div>
      )}
    </div>
  );
};
