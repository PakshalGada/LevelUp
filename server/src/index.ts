import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import lessonRoutes from '../routes/lessonRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), service: 'LevelUp Express Backend' });
});

// Routes
app.use('/api', lessonRoutes);

app.listen(PORT, () => {
  console.log(`⚡ LevelUp Express Server running on http://localhost:${PORT}`);
});
