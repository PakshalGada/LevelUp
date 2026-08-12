import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QuizQuestion } from '../types';
import { useGameStore } from '../store/useGameStore';
import { useContentStore } from '../store/useContentStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
  }
];

export const QuizPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { addXp } = useGameStore();
  const { getContent } = useContentStore();

  const topicSlug = topicId || '';
  const cachedContent = getContent(topicSlug);

  const questions: QuizQuestion[] = (cachedContent && cachedContent.quiz && cachedContent.quiz.length > 0)
    ? cachedContent.quiz
    : FALLBACK_QUIZ_QUESTIONS;

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
    const correctIdx = currentQuestion.correctIndex ?? currentQuestion.correctAnswer ?? 0;
    if (selectedOption === correctIdx) {
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
    <div className="max-w-3xl mx-auto space-y-8 font-serif">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          to={`/lesson/${topicSlug}`} 
          className="text-xs uppercase tracking-widest text-grayscale-500 dark:text-grayscale-400 hover:text-pure-black dark:hover:text-pure-white transition-colors"
        >
          &larr; Back to Lesson
        </Link>
        
        <span className="text-xs font-semibold px-3 py-1 bg-grayscale-100 dark:bg-grayscale-900 border border-grayscale-200 dark:border-grayscale-800 rounded-full text-pure-black dark:text-pure-white">
          Quiz Challenge: {topicSlug}
        </span>
      </div>

      {!quizFinished ? (
        <Card padding="lg" className="space-y-8">
          {/* Question Counter */}
          <div className="flex items-center justify-between text-xs font-serif text-grayscale-500 border-b border-grayscale-200 dark:border-grayscale-800 pb-4">
            <span className="uppercase tracking-widest">
              QUESTION 0{currentIdx + 1} OF 0{questions.length}
            </span>
            <span className="font-bold text-pure-black dark:text-pure-white tabular-nums">
              Score: {score}
            </span>
          </div>

          {/* Question Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-pure-black dark:text-pure-white tracking-tight">
            {currentQuestion.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const targetCorrectIndex = currentQuestion.correctIndex ?? currentQuestion.correctAnswer ?? 0;
              const isCorrect = idx === targetCorrectIndex;

              let optionClasses = "w-full text-left p-4 rounded-xl text-sm font-medium border transition-all duration-150 flex items-center justify-between ";

              if (!submitted) {
                optionClasses += isSelected
                  ? "bg-pure-black text-pure-white dark:bg-pure-white dark:text-pure-black border-pure-black dark:border-pure-white"
                  : "bg-transparent border-grayscale-200 dark:border-grayscale-800 text-grayscale-800 dark:text-grayscale-200 hover:border-grayscale-400 dark:hover:border-grayscale-600";
              } else {
                if (isCorrect) {
                  optionClasses += "bg-grayscale-900 text-pure-white dark:bg-grayscale-100 dark:text-pure-black border-pure-black dark:border-pure-white font-semibold";
                } else if (isSelected) {
                  optionClasses += "bg-danger-light-bg text-danger-light-text border-danger-light-border dark:bg-danger-bg dark:text-red-400 dark:border-danger-border";
                } else {
                  optionClasses += "bg-transparent border-grayscale-200 dark:border-grayscale-800 text-grayscale-400 dark:text-grayscale-600 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={submitted}
                  className={optionClasses}
                >
                  <span className="pr-4">{option}</span>
                  {submitted && isCorrect && <span className="font-bold text-xs shrink-0">&check; Correct</span>}
                  {submitted && isSelected && !isCorrect && <span className="font-bold text-xs shrink-0">&cross; Incorrect</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {submitted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-xl bg-grayscale-50 dark:bg-grayscale-950 border border-grayscale-200 dark:border-grayscale-800 text-xs text-grayscale-700 dark:text-grayscale-300 space-y-1"
            >
              <div className="font-bold text-pure-black dark:text-pure-white">
                Explanation:
              </div>
              <p className="leading-relaxed">{currentQuestion.explanation}</p>
            </motion.div>
          )}

          {/* Controls */}
          <div className="flex justify-end pt-4 border-t border-grayscale-200 dark:border-grayscale-800">
            {!submitted ? (
              <Button
                variant="primary"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleNextQuestion}
              >
                {currentIdx + 1 < questions.length ? 'Next Question →' : 'View Results'}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Quiz Finished Screen */
        <Card padding="lg" className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full border border-grayscale-300 dark:border-grayscale-700 bg-grayscale-100 dark:bg-grayscale-900 flex items-center justify-center text-pure-black dark:text-pure-white font-bold text-xl">
            &check;
          </div>

          <h2 className="text-3xl font-bold text-pure-black dark:text-pure-white">Quiz Completed!</h2>

          <p className="text-grayscale-600 dark:text-grayscale-300 text-base">
            You scored <span className="font-bold text-pure-black dark:text-pure-white tabular-nums">{score} / {questions.length}</span> correct answers.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-grayscale-100 dark:bg-grayscale-900 border border-grayscale-200 dark:border-grayscale-800 text-pure-black dark:text-pure-white font-semibold text-sm">
            Earned +{Math.round((score / questions.length) * 100) + 50} XP Bonus
          </div>

          <div className="pt-6 flex justify-center gap-4">
            <Button variant="secondary" onClick={() => navigate('/')}>
              More Topics
            </Button>
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              View Dashboard
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
