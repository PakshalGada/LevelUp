import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, Award, Zap, HelpCircle } from 'lucide-react';
import { QuizQuestion } from '../types';
import { useGameStore } from '../store/useGameStore';

const MOCK_QUIZ_QUESTIONS: Record<string, QuizQuestion[]> = {
  default: [
    {
      id: 'q1',
      question: 'What is the primary benefit of modular architecture in software engineering?',
      options: [
        'It makes code run 100x faster automatically',
        'It reduces cognitive load and allows isolated maintenance',
        'It eliminates the need for database indexes',
        'It prevents any type errors from occurring'
      ],
      correctAnswer: 1,
      explanation: 'Modular design isolates concerns, making software easier to test, maintain, and scale.'
    },
    {
      id: 'q2',
      question: 'How does state synchronization improve user experience?',
      options: [
        'By avoiding page reloads and keeping UI responsive to changes',
        'By storing user passwords in local storage',
        'By converting all backend code to SQL queries',
        'By removing CSS animations'
      ],
      correctAnswer: 0,
      explanation: 'Predictable state flow ensures smooth, deterministic UI updates without unexpected race conditions.'
    }
  ]
};

export const QuizPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { addXp } = useGameStore();

  const questions = MOCK_QUIZ_QUESTIONS[topicId || ''] || MOCK_QUIZ_QUESTIONS.default;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || submitted) return;
    setSubmitted(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    } else {
      setQuizFinished(true);
      const earnedXp = Math.round((score / questions.length) * 100) + 50;
      addXp(earnedXp);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to={`/lesson/${topicId || ''}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Lesson
        </Link>
        
        <span className="text-xs font-mono text-neon-cyan px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-full font-bold">
          Quiz Challenge: {topicId}
        </span>
      </div>

      {!quizFinished ? (
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-3xl p-8 border border-dark-700/60 space-y-8"
        >
          {/* Question Counter */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-dark-700 pb-4">
            <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
            <span className="text-neon-gold font-bold">Score: {score}</span>
          </div>

          {/* Question Title */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let isSelected = selectedOption === idx;
              let isCorrect = idx === currentQuestion.correctAnswer;

              let btnClasses = "w-full text-left p-4 rounded-xl text-sm font-medium border transition-all duration-200 flex items-center justify-between ";

              if (!submitted) {
                btnClasses += isSelected
                  ? "bg-neon-cyan/15 border-neon-cyan text-white shadow-neon-cyan"
                  : "bg-dark-900/60 border-dark-700 text-slate-300 hover:bg-dark-800 hover:border-slate-500";
              } else {
                if (isCorrect) {
                  btnClasses += "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                } else if (isSelected) {
                  btnClasses += "bg-rose-500/20 border-rose-500 text-rose-300";
                } else {
                  btnClasses += "bg-dark-900/40 border-dark-800 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={submitted}
                  className={btnClasses}
                >
                  <span>{option}</span>
                  {submitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-dark-900 border border-dark-700 text-xs text-slate-300 space-y-1"
            >
              <div className="font-bold text-neon-cyan flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Explanation:
              </div>
              <p>{currentQuestion.explanation}</p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex justify-end pt-4 border-t border-dark-700">
            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-3 rounded-xl bg-neon-cyan text-dark-950 font-extrabold text-sm hover:shadow-neon-cyan disabled:opacity-40 transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan text-dark-950 font-extrabold text-sm hover:shadow-neon-cyan transition-all"
              >
                {currentIdx + 1 < questions.length ? 'Next Question →' : 'View Results 🏆'}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        /* Quiz Finished Screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-10 text-center border border-neon-gold/40 space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-neon-gold/10 border-2 border-neon-gold flex items-center justify-center text-neon-gold shadow-neon-gold">
            <Award className="w-10 h-10 animate-bounce" />
          </div>

          <h2 className="text-3xl font-extrabold text-white">Quiz Completed!</h2>

          <p className="text-slate-300 text-base">
            You scored <span className="font-extrabold text-neon-cyan">{score} / {questions.length}</span> correct answers!
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green font-bold text-sm">
            <Zap className="w-4 h-4" /> Earned +{Math.round((score / questions.length) * 100) + 50} XP Bonus
          </div>

          <div className="pt-6 flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl bg-dark-700 text-white font-bold text-sm hover:bg-dark-600"
            >
              More Quests
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-gold to-orange-500 text-dark-950 font-extrabold text-sm hover:shadow-neon-gold"
            >
              View Dashboard & Badges
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
