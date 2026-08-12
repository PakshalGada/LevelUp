import { Router, Request, Response } from 'express';
import { generateContentWithGemini, reframeContentWithGemini, GeminiServiceError } from '../services/llmService.js';

const router = Router();

// Basic in-memory sliding window rate limiter
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 15;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };
  const validTimestamps = record.timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, { timestamps: validTimestamps });
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, { timestamps: validTimestamps });
  return true;
}

const handleGenerateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        status: 'error',
        code: 'RATE_LIMITED',
        message: 'Rate limit exceeded. Please wait a minute before requesting another topic.'
      });
      return;
    }

    const { topic, topicTitle, topicId } = req.body || {};
    const rawTopic = topic || topicTitle || topicId;

    if (!rawTopic || typeof rawTopic !== 'string') {
      res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT',
        message: 'Please provide a valid topic string.'
      });
      return;
    }

    const sanitizedTopic = rawTopic.trim().replace(/[\r\n\t]/g, ' ');

    if (sanitizedTopic.length === 0 || sanitizedTopic.length > 200) {
      res.status(400).json({
        status: 'error',
        code: 'INVALID_INPUT_LENGTH',
        message: 'Topic must be between 1 and 200 characters long.'
      });
      return;
    }

    const result = await generateContentWithGemini(sanitizedTopic);

    res.json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    if (error instanceof GeminiServiceError) {
      const statusCode = 
        error.code === 'MISSING_API_KEY' ? 503 :
        error.code === 'SAFETY_BLOCKED' ? 422 :
        error.code === 'RATE_LIMITED' ? 429 : 500;

      res.status(statusCode).json({
        status: 'error',
        code: error.code,
        message: error.message
      });
      return;
    }

    console.error('Unhandled error in /api/generate-content:', error);
    res.status(500).json({
      status: 'error',
      code: 'INTERNAL_ERROR',
      message: error?.message || 'An unexpected error occurred while generating content.'
    });
  }
};

/**
 * POST /api/reframe-content
 * Reframe a paragraph/section into alternate tone ("Simpler", "Story form", "Exam-focused")
 */
router.post('/reframe-content', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, style } = req.body || {};

    if (!content || typeof content !== 'string') {
      res.status(400).json({ status: 'error', message: 'Missing section content to reframe.' });
      return;
    }

    const validStyles = ['Simpler', 'Story form', 'Exam-focused'];
    const targetStyle = validStyles.includes(style) ? (style as 'Simpler' | 'Story form' | 'Exam-focused') : 'Simpler';

    const reframedContent = await reframeContentWithGemini(content, targetStyle);

    res.json({
      status: 'success',
      style: targetStyle,
      reframedContent,
    });
  } catch (err: any) {
    console.error('Error in /api/reframe-content:', err);
    res.status(500).json({ status: 'error', message: err?.message || 'Failed to reframe content.' });
  }
});

router.post('/generate-content', handleGenerateContent);
router.post('/generate-lesson', handleGenerateContent);

export default router;
