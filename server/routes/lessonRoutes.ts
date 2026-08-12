import { Router, Request, Response } from 'express';
import { generateMockLesson } from '../services/lessonService.js';

const router = Router();

// POST /api/generate-lesson
router.post('/generate-lesson', (req: Request, res: Response) => {
  try {
    const { topicId, topicTitle } = req.body || {};
    
    if (!topicId) {
      res.status(400).json({ error: 'Missing topicId parameter' });
      return;
    }

    // Proxy endpoint returns mock lesson data (LLM call will replace this in future phases)
    const lesson = generateMockLesson(topicId, topicTitle);
    
    res.json({
      status: 'success',
      source: 'mock-express-proxy',
      data: lesson
    });
  } catch (error) {
    console.error('Error generating lesson:', error);
    res.status(500).json({ error: 'Failed to generate lesson' });
  }
});

export default router;
