import { Router, Request, Response } from 'express';
import { generateContentWithGemini, GeminiServiceError } from '../services/llmService.js';

const router = Router();

// Basic in-memory sliding window rate limiter
// Limits each IP to 10 generation requests per minute
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [] };
  
  // Filter out timestamps older than the window
  const validTimestamps = record.timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, { timestamps: validTimestamps });
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, { timestamps: validTimestamps });
  return true;
}

const handleGenerateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown-ip';
    
    // Check rate limit
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
 * POST /api/generate-content
 * Generate lesson + 5-question quiz via Gemini API with structured JSON output
 */
router.post('/generate-content', handleGenerateContent);

// Legacy backward-compatible endpoint alias
router.post('/generate-lesson', handleGenerateContent);

export default router;
