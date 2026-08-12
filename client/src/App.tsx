import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LessonPage } from './pages/LessonPage';
import { QuizPage } from './pages/QuizPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LevelUpModal } from './components/ui/LevelUpModal';
import { useGameStore } from './store/useGameStore';

export const App: React.FC = () => {
  const { recordDailyActivity } = useGameStore();

  useEffect(() => {
    // Record daily activity & streak calculation on app startup
    recordDailyActivity();
  }, [recordDailyActivity]);

  return (
    <Router>
      <Layout>
        <LevelUpModal />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson/:topicId" element={<LessonPage />} />
          <Route path="/quiz/:topicId" element={<QuizPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
