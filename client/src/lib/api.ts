import { Lesson } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface GenerateLessonResponse {
  status: string;
  source: string;
  data: Lesson;
}

export async function fetchGeneratedLesson(topicId: string, topicTitle?: string): Promise<GenerateLessonResponse> {
  const response = await fetch(`${API_BASE}/api/generate-lesson`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topicId, topicTitle }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lesson: ${response.statusText}`);
  }

  return response.json();
}

export async function checkServerHealth(): Promise<{ status: string; service: string }> {
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    if (!response.ok) throw new Error('Health check failed');
    return await response.json();
  } catch (err) {
    console.warn('Backend server not reachable directly, using fallback mock mode.', err);
    return { status: 'offline', service: 'LevelUp Client (Standalone Mode)' };
  }
}
