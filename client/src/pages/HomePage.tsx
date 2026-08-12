import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code2, 
  BrainCircuit, 
  ShieldAlert, 
  Cloud, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Server,
  Zap,
  BookOpen
} from 'lucide-react';
import { Topic } from '../types';
import { checkServerHealth, fetchGeneratedLesson } from '../lib/api';

const MOCK_TOPICS: Topic[] = [
  {
    id: 'web-dev-101',
    title: 'React 19 & Modern UI State',
    description: 'Master server components, custom hooks, and high-performance state management.',
    category: 'web-dev',
    level: 'Beginner',
    xpReward: 150,
    icon: 'Code2',
    lessonsCount: 6,
  },
  {
    id: 'ts-mastery',
    title: 'TypeScript Type Gymnastics',
    description: 'Generics, conditional types, mapped types, and strict type safety.',
    category: 'web-dev',
    level: 'Intermediate',
    xpReward: 200,
    icon: 'Code2',
    lessonsCount: 8,
  },
  {
    id: 'ai-prompting',
    title: 'LLM Prompt Engineering',
    description: 'Learn zero-shot, few-shot, and chain-of-thought techniques for LLM agents.',
    category: 'ai-ml',
    level: 'Intermediate',
    xpReward: 250,
    icon: 'BrainCircuit',
    lessonsCount: 5,
  },
  {
    id: 'sec-essentials',
    title: 'Web Application Security',
    description: 'OWASP Top 10, JWT security, XSS mitigation, and secure API architecture.',
    category: 'cybersecurity',
    level: 'Advanced',
    xpReward: 300,
    icon: 'ShieldAlert',
    lessonsCount: 7,
  },
  {
    id: 'cloud-microservices',
    title: 'Cloud & Serverless Systems',
    description: 'Containerization, Kubernetes basics, and event-driven architectures.',
    category: 'cloud',
    level: 'Advanced',
    xpReward: 350,
    icon: 'Cloud',
    lessonsCount: 10,
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState<{ status: string; service: string } | null>(null);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [loadingTest, setLoadingTest] = useState(false);

  useEffect(() => {
    checkServerHealth().then(setServerStatus);
  }, []);

  const handleTestApiCall = async () => {
    setLoadingTest(true);
    try {
      const res = await fetchGeneratedLesson('web-dev-101', 'React 19 & Modern UI State');
      setTestResponse(res);
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-8 sm:p-12 border border-dark-700/60 bg-gradient-to-r from-dark-850 via-dark-800 to-dark-900">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Phase 0 Scaffold Active
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Level Up Your Tech Skills with <span className="text-gradient-cyan">Interactive Micro-Lessons</span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed">
            Choose a topic, absorb byte-sized insights, complete quick quizzes, gain XP, and climb the leaderboard!
          </p>

          {/* Express Backend Proxy Health Verification Banner */}
          <div className="p-4 rounded-xl bg-dark-950/80 border border-dark-700/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-neon-purple" />
                <div>
                  <div className="text-xs text-slate-400 font-mono">EXPRESS BACKEND PROXY</div>
                  <div className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Status: {serverStatus ? serverStatus.status.toUpperCase() : 'Checking...'}</span>
                    <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
                  </div>
                </div>
              </div>

              <button
                onClick={handleTestApiCall}
                disabled={loadingTest}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30 transition-all flex items-center gap-2"
              >
                {loadingTest ? <Zap className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                Test POST /api/generate-lesson
              </button>
            </div>

            {testResponse && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-dark-900 rounded-lg border border-neon-green/30 text-xs font-mono text-slate-300 overflow-x-auto"
              >
                <div className="text-neon-green font-bold mb-1">✓ Verified Client-Server Response:</div>
                <pre>{JSON.stringify(testResponse, null, 2)}</pre>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Topic Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-neon-cyan" /> Available Quests & Topics
            </h2>
            <p className="text-sm text-slate-400">Select a quest to start generating micro-lessons and earning XP.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_TOPICS.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono border ${
                    topic.level === 'Beginner' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    topic.level === 'Intermediate' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                    'bg-purple-500/10 border-purple-500/30 text-purple-400'
                  }`}>
                    {topic.level}
                  </span>
                  
                  <span className="flex items-center gap-1 text-xs font-bold text-neon-green">
                    +{topic.xpReward} XP
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-dark-700/50 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {topic.lessonsCount} Micro-lessons
                </span>

                <button
                  onClick={() => navigate(`/lesson/${topic.id}`)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-dark-700 group-hover:bg-gradient-to-r group-hover:from-neon-purple group-hover:to-neon-cyan group-hover:text-dark-950 text-white transition-all duration-200 flex items-center gap-1.5"
                >
                  Start Quest <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
};
