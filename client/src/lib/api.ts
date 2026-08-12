import { GeneratedContent, Lesson, QuizQuestion } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface GenerateContentApiResponse {
  status: 'success' | 'error';
  code?: string;
  message?: string;
  data?: {
    lesson: {
      title: string;
      summary: string;
      sections: Array<{ heading: string; content: string }>;
      estimatedReadTime: number;
    };
    quiz: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }>;
  };
}

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

/**
 * Call backend LLM generator endpoint for a given topic
 */
export async function generateContent(topic: string): Promise<GeneratedContent> {
  const response = await fetch(`${API_BASE}/api/generate-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  const data: GenerateContentApiResponse = await response.json().catch(() => ({
    status: 'error',
    message: 'Invalid server response.',
  }));

  if (!response.ok || data.status === 'error') {
    throw new ApiError(
      data.message || `Generation request failed (${response.status})`,
      data.code || (response.status === 422 ? 'SAFETY_BLOCKED' : 'SERVER_ERROR')
    );
  }

  if (!data.data || !data.data.lesson || !data.data.quiz) {
    throw new ApiError('Received invalid structured content payload from server.', 'PARSING_FAILED');
  }

  const topicSlug = topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';

  const lesson: Lesson = {
    id: `lesson-${topicSlug}`,
    topicId: topicSlug,
    title: data.data.lesson.title,
    summary: data.data.lesson.summary,
    sections: data.data.lesson.sections,
    keyTakeaways: data.data.lesson.sections.map(s => s.heading),
    durationMinutes: data.data.lesson.estimatedReadTime || 4,
    xpReward: 100,
  };

  const quiz: QuizQuestion[] = data.data.quiz.map((q, idx) => ({
    id: q.id || `q-${idx + 1}`,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex ?? 0,
    correctAnswer: q.correctIndex ?? 0,
    explanation: q.explanation,
  }));

  return { lesson, quiz };
}

// Backward compatible alias
export async function fetchGeneratedLesson(topicId: string, topicTitle?: string) {
  const content = await generateContent(topicTitle || topicId);
  return {
    status: 'success',
    source: 'gemini-llm',
    data: content.lesson,
  };
}

export async function checkServerHealth(): Promise<{ status: string; service: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (!response.ok) throw new Error('Health check failed');
    return await response.json();
  } catch (err) {
    return { status: 'offline', service: 'LevelUp Standalone' };
  }
}
