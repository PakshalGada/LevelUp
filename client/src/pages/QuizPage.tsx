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
      'It reduces cognitive overload by breaking complex concepts into digestible pieces',
      'It eliminates the need to practice or solve exercises',
      'It replaces deep study with superficial bullet points',
      'It guarantees 100% test scores without effort'
    ],
    correctIndex: 0,
    explanation: 'Bite-sized micro-lessons minimize cognitive load, allowing focused, high-retention learning sessions.'
  },
  {
    id: 'q3',
    question: 'Which principle best describes spaced repetition?',
    options: [
      'Cramming all study hours into a single overnight session',
      'Reviewing material at increasing time intervals to interrupt forgetting',
      'Memorizing answers word-for-word without understanding',
      'Reading multiple books simultaneously'
    ],
    correctIndex: 1,
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
      'Promoting quiet, confident, and high-precision conceptual understanding',
      'Maximizing screen time through loud arcade animations',
      'Replacing human tutors with basic multiple choice forms',
      'Simplifying all complex subjects into single bullet points'
    ],
    correctIndex: 0,
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

  // Timed Sprint 15s per-question timer logic
  useEffect(() => {
    if (timedSprintMode && !submitted && !quizFinished) {
      setSprintTimeLeft(15);
      if (sprintTimerRef.current) clearInterval(sprintTimerRef.current);

      sprintTimerRef.current = setInterval(() => {
        setSprintTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(sprintTimerRef.current);
            // Auto submit timed out question
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

  // Keyboard navigation shortcuts (1-4 keys & Enter)
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
      // Quiz Finished
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
    <div className="max-w-3xl mx-auto space-y-8 font-serif pb-16">
      {/* Top Navigation & Difficulty Badge */}
      <div className="flex items-center justify-between">
        <Link 
          to={`/lesson/${topicSlug}`} 
          className="text-xs uppercase tracking-widest text-grayscale-500 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white transition-colors"
        >
          &larr; Back to Lesson
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-serif text-grayscale-400 font-medium">
            {difficultyLabel}
          </span>
          {timedSprintMode && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-pure-black dark:text-pure-white">
              Timed Sprint (15s)
            </span>
          )}
        </div>
      </div>

      {!quizFinished ? (
        <div className="space-y-8">
          
          {/* 1. TOP 5-DASH PROGRESS SEGMENT LINE & TIMED DRAIN */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2">
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      idx === currentIdx
                        ? 'bg-pure-black dark:bg-pure-white'
                        : idx < currentIdx
                        ? 'bg-grayscale-400 dark:bg-grayscale-600'
                        : 'bg-grayscale-200 dark:bg-grayscale-800'
                    }`}
                  />
                ))}
              </div>

              {/* Score & Minimal Combo Badge */}
              <div className="flex items-center gap-3 shrink-0 text-xs font-serif">
                {comboCount >= 2 && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-2 py-0.5 rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-pure-black dark:text-pure-white font-bold"
                  >
                    &times;{comboCount} Combo
                  </motion.span>
                )}
                <span className="tabular-nums font-semibold text-grayscale-600 dark:text-grayscale-400">
                  Score: {score}/{questions.length}
                </span>
              </div>
            </div>

            {/* Timed Sprint 15s Draining Progress Line */}
            {timedSprintMode && !submitted && (
              <div className="w-full bg-grayscale-100 dark:bg-grayscale-900 h-1 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-pure-black dark:bg-pure-white"
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
                className="absolute right-12 top-28 pointer-events-none text-sm font-bold text-pure-black dark:text-pure-white bg-grayscale-100 dark:bg-grayscale-900 px-3 py-1 rounded-full border border-grayscale-300 dark:border-grayscale-700 shadow-elevation-resting z-30"
              >
                +15 XP
              </motion.div>
            )}
          </AnimatePresence>

          {/* Single Question Container with Quick Apple Crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card padding="lg" className="space-y-8 hairline-border">
                
                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-grayscale-400 font-semibold">
                  <span>Question 0{currentIdx + 1} of 0{questions.length}</span>
                  {timedSprintMode && !submitted && (
                    <span className="tabular-nums font-bold text-pure-black dark:text-pure-white">
                      {sprintTimeLeft}s remaining
                    </span>
                  )}
                </div>

                {/* Question Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-pure-black dark:text-pure-white tracking-tight leading-snug">
                  {currentQuestion.question}
                </h2>

                {/* 4 Option Minimal Cards */}
                <div className="space-y-3.5 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const targetCorrectIndex = currentQuestion.correctIndex ?? currentQuestion.correctAnswer ?? 0;
                    const isCorrect = idx === targetCorrectIndex;

                    let baseCardStyle = "w-full text-left p-5 rounded-xl text-base font-serif transition-all duration-200 flex items-center justify-between border cursor-pointer select-none ";

                    if (!submitted) {
                      baseCardStyle += isSelected
                        ? "bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black border-pure-black dark:border-pure-white shadow-elevation-resting"
                        : "bg-transparent border-grayscale-200 dark:border-grayscale-800 text-grayscale-800 dark:text-grayscale-200 hover:border-grayscale-400 dark:hover:border-grayscale-600 hover:bg-grayscale-50 dark:hover:bg-grayscale-950";
                    } else {
                      if (isCorrect) {
                        baseCardStyle += "bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black border-pure-black dark:border-pure-white font-semibold scale-[1.01]";
                      } else if (isSelected) {
                        baseCardStyle += "bg-danger-light-bg text-danger-light-text border-danger-light-border dark:bg-danger-bg dark:text-red-400 dark:border-danger-border";
                      } else {
                        baseCardStyle += "bg-transparent border-grayscale-200 dark:border-grayscale-800 text-grayscale-400 dark:text-grayscale-600 opacity-40";
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
                          <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs opacity-60 shrink-0 font-mono">
                            {idx + 1}
                          </span>
                          <span className="leading-normal">{option}</span>
                        </div>

                        {submitted && isCorrect && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-bold text-xs shrink-0 flex items-center gap-1"
                          >
                            &check; Correct
                          </motion.span>
                        )}
                        {submitted && isSelected && !isCorrect && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-bold text-xs shrink-0 flex items-center gap-1"
                          >
                            &cross; Incorrect
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
                    className="p-5 rounded-xl bg-grayscale-50 dark:bg-grayscale-950 border border-grayscale-200 dark:border-grayscale-800 space-y-1.5"
                  >
                    <div className="text-xs font-bold text-pure-black dark:text-pure-white uppercase tracking-wider">
                      Explanation
                    </div>
                    <p className="text-sm text-grayscale-700 dark:text-grayscale-300 font-light leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}

                {/* Bottom Action Controls */}
                <div className="flex justify-between items-center pt-4 border-t border-grayscale-200 dark:border-grayscale-800">
                  <span className="text-[11px] text-grayscale-400">
                    Use keys [1-4] or Enter
                  </span>
                  {!submitted ? (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSubmitAnswer}
                      disabled={selectedOption === null}
                    >
                      Submit Answer [Enter]
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleNextQuestion}
                    >
                      {currentIdx + 1 < questions.length ? 'Next Question →' : 'View Results & Reward'}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* QUIZ RESULTS SCREEN (APPLE REFRACTED CELEBRATION & MISTAKE ANALYSIS) */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <Card padding="lg" className="text-center space-y-8 hairline-border">
            
            {/* Score Summary as Large Serif Numeral */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-grayscale-400 font-medium">
                Correct Answers
              </span>
              <div className="text-6xl sm:text-7xl font-bold tracking-tight text-pure-black dark:text-pure-white tabular-nums">
                {score}/{questions.length}
              </div>
              <p className="text-sm font-light text-grayscale-500">
                {score === questions.length ? 'Flawless execution & perfect recall.' : 'Solid effort. Review explanations to solidify memory.'}
              </p>
            </div>

            {/* Total XP Earned */}
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-grayscale-200 dark:border-grayscale-800 bg-grayscale-50 dark:bg-grayscale-950">
              <span className="text-xs uppercase tracking-widest text-grayscale-400">XP Earned</span>
              <span className="text-2xl font-bold text-pure-black dark:text-pure-white tabular-nums">
                +{(score * 20) + (score === questions.length ? 50 : 25) + (timedSprintMode ? 30 : 0)} XP
              </span>
            </div>

            {/* Level & Animated XP Bar */}
            <div className="max-w-md mx-auto space-y-2 pt-2">
              <ProgressBar value={user.currentXp} max={user.nextLevelXp} label={`Level ${user.level} Progress`} />
            </div>

            {/* Newly Unlocked Badges (Revealed with calm scale/fade-in + sheen sweep) */}
            {unlockedBadgesToReveal.length > 0 && (
              <div className="pt-4 space-y-3 border-t border-grayscale-200 dark:border-grayscale-800">
                <div className="text-xs uppercase tracking-widest text-grayscale-400 font-semibold">
                  New Achievement Unlocked
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  {unlockedBadgesToReveal.map((b) => (
                    <Badge key={b.id} label={b.title} unlocked size="lg" />
                  ))}
                </div>
              </div>
            )}

            {/* Streak Status */}
            <div className="pt-4 flex items-center justify-center gap-3 text-sm text-pure-black dark:text-pure-white">
              <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.75">
                <path d="M12 2c1 3 2.5 3.5 3.5 5.5 1 2 1.5 3.5 1.5 5.5A7 7 0 115 13c0-3 1.5-5.5 3-7.5 1-1.33 2-2.5 4-3.5z" />
              </svg>
              <span className="font-semibold tabular-nums">{user.streakDays} Day Streak Active</span>
            </div>

            {/* Action CTAs */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" size="lg" onClick={() => navigate('/')}>
                Try Another Topic
              </Button>
              <Button variant="secondary" size="lg" onClick={handleRestartQuiz}>
                Retry Quiz
              </Button>
              <Button variant="ghost" size="lg" onClick={() => navigate('/dashboard')}>
                View Dashboard
              </Button>
            </div>
          </Card>

          {/* INCORRECT ANSWERS & "DIG DEEPER" LLM MISCONCEPTION ANALYSIS */}
          {incorrectAnswers.length > 0 && (
            <Card padding="lg" className="space-y-6 hairline-border">
              <div className="border-b border-grayscale-200 dark:border-grayscale-800 pb-3">
                <h3 className="text-lg font-bold text-pure-black dark:text-pure-white tracking-tight">
                  Incorrect Answers & Misconception Analysis
                </h3>
                <p className="text-xs text-grayscale-500 mt-1">
                  Click "Dig deeper" for an instant AI breakdown of why your choice was incorrect.
                </p>
              </div>

              <div className="space-y-6">
                {incorrectAnswers.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl border border-grayscale-200 dark:border-grayscale-800 space-y-3 bg-grayscale-50/50 dark:bg-grayscale-950/50">
                    <div className="font-bold text-base text-pure-black dark:text-pure-white leading-snug">
                      {item.question}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg border border-danger-light-border dark:border-danger-border bg-danger-light-bg dark:bg-danger-bg text-danger-light-text dark:text-red-400">
                        <span className="font-semibold block text-[10px] uppercase">Your Answer</span>
                        {item.userAns}
                      </div>
                      <div className="p-2.5 rounded-lg border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 text-pure-black dark:text-pure-white">
                        <span className="font-semibold block text-[10px] uppercase">Correct Answer</span>
                        {item.correctAns}
                      </div>
                    </div>

                    {/* Dig Deeper Action & LLM Result */}
                    {!item.llmAnalysis ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={item.isAnalyzing}
                        onClick={() => handleDigDeeper(item.questionId)}
                      >
                        {item.isAnalyzing ? 'Analyzing misconception...' : 'Dig deeper →'}
                      </Button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl border border-grayscale-300 dark:border-grayscale-700 bg-pure-white dark:bg-off-black text-xs text-pure-black dark:text-pure-white space-y-1 font-light leading-relaxed shadow-elevation-resting"
                      >
                        <span className="font-bold text-[10px] uppercase tracking-wider block text-grayscale-500">
                          AI Tutor Insight
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
