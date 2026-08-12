import { create } from 'zustand';
import { GeneratedContent } from '../types';
import { generateContent, ApiError } from '../lib/api';

const LOADING_MESSAGES = [
  'Consulting the archive...',
  'Drafting your lesson...',
  'Writing the quiz...',
  'Refining conceptual explanations...',
  'Finalizing lesson structure...'
];

interface ContentStoreState {
  cache: Record<string, GeneratedContent>;
  isGenerating: boolean;
  loadingStatus: string;
  error: { message: string; code?: string; topic?: string } | null;

  generateTopicContent: (topic: string) => Promise<string>;
  getContent: (topicId: string) => GeneratedContent | null;
  clearError: () => void;
}

export const useContentStore = create<ContentStoreState>((set, get) => ({
  cache: {},
  isGenerating: false,
  loadingStatus: LOADING_MESSAGES[0],
  error: null,

  generateTopicContent: async (topic: string): Promise<string> => {
    const slug = topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';

    // Return cached if present
    const existing = get().cache[slug];
    if (existing) {
      return slug;
    }

    set({ isGenerating: true, error: null, loadingStatus: LOADING_MESSAGES[0] });

    let messageIdx = 0;
    const interval = setInterval(() => {
      messageIdx = (messageIdx + 1) % LOADING_MESSAGES.length;
      set({ loadingStatus: LOADING_MESSAGES[messageIdx] });
    }, 1500);

    try {
      const content = await generateContent(topic);
      const generatedSlug = content.lesson.topicId || slug;

      set((state) => ({
        cache: {
          ...state.cache,
          [generatedSlug]: content,
          [slug]: content,
        },
        isGenerating: false,
        error: null,
      }));

      clearInterval(interval);
      return generatedSlug;
    } catch (err: any) {
      clearInterval(interval);

      let userMsg = "Failed to generate topic content. Please try again.";
      let code = "UNKNOWN_ERROR";

      if (err instanceof ApiError) {
        code = err.code || 'API_ERROR';
        if (err.code === 'SAFETY_BLOCKED') {
          userMsg = "That topic couldn't be generated — try rephrasing it.";
        } else if (err.code === 'MISSING_API_KEY') {
          userMsg = "Google Gemini API key is missing. Please configure GEMINI_API_KEY in server/.env.";
        } else if (err.code === 'RATE_LIMITED') {
          userMsg = "Server is busy. Please wait a moment before generating another topic.";
        } else {
          userMsg = err.message;
        }
      }

      set({
        isGenerating: false,
        error: { message: userMsg, code, topic },
      });

      throw err;
    }
  },

  getContent: (topicId: string) => {
    return get().cache[topicId] || null;
  },

  clearError: () => {
    set({ error: null });
  },
}));
