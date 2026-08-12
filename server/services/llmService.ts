import { GoogleGenerativeAI, SchemaType, ResponseSchema } from '@google/generative-ai';
import { SYSTEM_TUTOR_PROMPT, buildUserPrompt } from '../prompts.js';

export interface GeneratedLessonSection {
  heading: string;
  content: string;
}

export interface GeneratedLessonPayload {
  title: string;
  summary: string;
  sections: GeneratedLessonSection[];
  estimatedReadTime: number;
}

export interface GeneratedQuizQuestionPayload {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedContentResult {
  lesson: GeneratedLessonPayload;
  quiz: GeneratedQuizQuestionPayload[];
}

export class GeminiServiceError extends Error {
  code: 'MISSING_API_KEY' | 'SAFETY_BLOCKED' | 'RATE_LIMITED' | 'PARSING_FAILED' | 'GEMINI_API_ERROR';
  
  constructor(message: string, code: GeminiServiceError['code']) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
  }
}

// Preferred models list in order of fallback for Google AI Studio API
const PREFERRED_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-pro'
];

if (process.env.GEMINI_MODEL && !PREFERRED_MODELS.includes(process.env.GEMINI_MODEL)) {
  PREFERRED_MODELS.unshift(process.env.GEMINI_MODEL);
}

// Define exact Gemini JSON response schema
const contentResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    lesson: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "Engaging lesson title" },
        summary: { type: SchemaType.STRING, description: "1-2 sentence high-level overview" },
        sections: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              heading: { type: SchemaType.STRING, description: "Section heading" },
              content: { type: SchemaType.STRING, description: "Detailed explanatory content paragraph" }
            },
            required: ["heading", "content"]
          }
        },
        estimatedReadTime: { type: SchemaType.INTEGER, description: "Estimated read time in minutes" }
      },
      required: ["title", "summary", "sections", "estimatedReadTime"]
    },
    quiz: {
      type: SchemaType.ARRAY,
      description: "Exactly 5 conceptual multiple choice questions",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Unique question id e.g. q1, q2" },
          question: { type: SchemaType.STRING, description: "The conceptual question text" },
          options: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Exactly 4 multiple choice options"
          },
          correctIndex: { type: SchemaType.INTEGER, description: "0-indexed correct option (0 to 3)" },
          explanation: { type: SchemaType.STRING, description: "Explanation of correct and distractor choices" }
        },
        required: ["id", "question", "options", "correctIndex", "explanation"]
      }
    }
  },
  required: ["lesson", "quiz"]
};

/**
 * Generate fallback content when Gemini API key is missing or model endpoint is unreachable
 */
function generateFallbackContent(topic: string): GeneratedContentResult {
  const cleanTopic = topic.trim();
  const titleCaseTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  return {
    lesson: {
      title: `Mastering ${titleCaseTopic}: Core Principles & Architecture`,
      summary: `A foundational guide to understanding ${titleCaseTopic}, covering core mental models, key architectural components, and practical application.`,
      sections: [
        {
          heading: `1. Introduction to ${titleCaseTopic}`,
          content: `${titleCaseTopic} represents a fundamental concept in modern technology and problem-solving. By breaking down complex systems into modular abstractions, learners can understand how data and logic flow seamlessly.`
        },
        {
          heading: `2. Core Architecture & Mental Models`,
          content: `At its core, ${titleCaseTopic} relies on predictable execution patterns, clear boundary separation, and active state management. Understanding these underlying mechanics prevents unexpected edge cases and ensures maintainability.`
        },
        {
          heading: `3. Best Practices & Practical Implementation`,
          content: `When applying ${titleCaseTopic} in real-world scenarios, focus on clarity, modular design, and rigorous testing. Establishing strong foundational habits early yields long-term efficiency and scalability.`
        }
      ],
      estimatedReadTime: 4
    },
    quiz: [
      {
        id: "q1",
        question: `What is the primary core principle underlying ${titleCaseTopic}?`,
        options: [
          `Modular abstraction and predictable state management`,
          `Random execution without pre-defined boundaries`,
          `Exclusive reliance on legacy single-threaded processing`,
          `Bypassing error handling to maximize raw speed`
        ],
        correctIndex: 0,
        explanation: `Modular abstraction and clear state boundaries are essential for maintainability and scalability in ${titleCaseTopic}.`
      },
      {
        id: "q2",
        question: `How does mastering ${titleCaseTopic} improve problem-solving efficiency?`,
        options: [
          `By isolating concerns and reducing cognitive overhead`,
          `By eliminating the need for automated testing`,
          `By forcing all code to run on a single thread`,
          `By replacing documentation with guessing`
        ],
        correctIndex: 0,
        explanation: `Isolating concerns minimizes cognitive load, making complex topics easier to reason about and debug.`
      },
      {
        id: "q3",
        question: `Which architectural pattern best complements ${titleCaseTopic}?`,
        options: [
          `Single responsibility with clear input/output contracts`,
          `Tightly coupled monolithic dependencies`,
          `Global mutable state shared across all components`,
          `Unstructured spaghetti code`
        ],
        correctIndex: 0,
        explanation: `Decoupled components with clear input/output contracts ensure predictability and clean maintenance.`
      },
      {
        id: "q4",
        question: `What is a common pitfall when first learning ${titleCaseTopic}?`,
        options: [
          `Over-complicating early abstractions before understanding core mechanics`,
          `Writing unit tests early in the process`,
          `Using clear variable naming conventions`,
          `Reading official documentation`
        ],
        correctIndex: 0,
        explanation: `Premature abstraction adds unnecessary complexity before the underlying mechanics are fully understood.`
      },
      {
        id: "q5",
        question: `What is the recommended next step after completing this lesson on ${titleCaseTopic}?`,
        options: [
          `Apply concepts through active recall and practical exercise`,
          `Immediately forget the key takeaways`,
          `Avoid practicing for several months`,
          `Rely solely on passive reading`
        ],
        correctIndex: 0,
        explanation: `Active recall and hands-on practice consolidate new knowledge into long-term memory.`
      }
    ]
  };
}

/**
 * Generate structured lesson and quiz content using Google Gemini API
 */
export async function generateContentWithGemini(topic: string, isRetry = false): Promise<GeneratedContentResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    console.warn('[GeminiService] GEMINI_API_KEY missing or placeholder. Serving fallback structured content.');
    return generateFallbackContent(topic);
  }

  const ai = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  // Try candidate models in order if one returns 404 / unavailable
  for (const modelName of PREFERRED_MODELS) {
    try {
      console.log(`[GeminiService] Calling Gemini API model: ${modelName} for topic "${topic}"`);

      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_TUTOR_PROMPT,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: contentResponseSchema,
          temperature: 0.7,
        }
      });

      const prompt = buildUserPrompt(topic);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        const candidates = result.response.candidates;
        const blockReason = candidates?.[0]?.finishReason;
        if (blockReason === 'SAFETY' || blockReason === 'RECITATION' || blockReason === 'BLOCKLIST') {
          throw new GeminiServiceError(
            "That topic couldn't be generated — try rephrasing it.",
            'SAFETY_BLOCKED'
          );
        }
        throw new GeminiServiceError('Empty response received from Gemini API.', 'GEMINI_API_ERROR');
      }

      let parsed: GeneratedContentResult;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseErr) {
        if (!isRetry) {
          console.warn('JSON parsing failed on initial Gemini response, retrying once...', parseErr);
          return generateContentWithGemini(topic, true);
        }
        throw new GeminiServiceError('Failed to parse response JSON from Gemini API.', 'PARSING_FAILED');
      }

      if (!parsed.lesson || !parsed.quiz || !Array.isArray(parsed.quiz)) {
        if (!isRetry) {
          console.warn('Malformed JSON structure from Gemini, retrying once...');
          return generateContentWithGemini(topic, true);
        }
        throw new GeminiServiceError('Invalid JSON structure returned by Gemini API.', 'PARSING_FAILED');
      }

      console.log(`[GeminiService] Successfully generated content using ${modelName}`);
      return parsed;
    } catch (err: any) {
      if (err instanceof GeminiServiceError && err.code === 'SAFETY_BLOCKED') {
        throw err;
      }

      const errMsg = err?.message || String(err);
      console.warn(`[GeminiService] Model ${modelName} returned error:`, errMsg);
      lastError = err;

      // If model not found or deprecated, try next model
      if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('no longer available') || errMsg.includes('API version')) {
        console.warn(`[GeminiService] Model ${modelName} unavailable on API version, trying next model in preference list...`);
        continue;
      }

      if (errMsg.includes('SAFETY') || errMsg.includes('blocked')) {
        throw new GeminiServiceError("That topic couldn't be generated — try rephrasing it.", 'SAFETY_BLOCKED');
      }

      if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded')) {
        throw new GeminiServiceError("Service is currently busy or rate-limited. Please wait a moment and try again.", 'RATE_LIMITED');
      }

      break;
    }
  }

  // If API key is invalid or all model calls failed, serve fallback structured content gracefully
  console.warn(`[GeminiService] API call failed across all candidate models (${lastError?.message}). Serving structured fallback payload.`);
  return generateFallbackContent(topic);
}

/**
 * Reframe a section of content into an alternate tone ("Simpler", "Story form", "Exam-focused")
 */
export async function reframeContentWithGemini(
  content: string,
  style: 'Simpler' | 'Story form' | 'Exam-focused'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    // Fallback reframed text if API key missing
    if (style === 'Simpler') {
      return `In simple terms: ${content.replace(/(However,|Furthermore,|Consequently,)/gi, '')} Basically, think of it like building blocks fitting together smoothly.`;
    }
    if (style === 'Story form') {
      return `Imagine a team working under tight deadlines. ${content} Step by step, each piece fell into place, revealing a clear blueprint for success.`;
    }
    return `EXAM FOCUS: Key concept to remember: ${content} High-yield takeaway for tests: identify core inputs, state flow, and expected boundary outputs.`;
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const promptInstruction = `Reframe the following educational section text into an alternate tone: "${style}".
Keep the explanation accurate and clear.
Style guidelines:
- "Simpler": ELI5 style, plain language, intuitive analogies, no jargon.
- "Story form": Narrative framing, real-world metaphor, storytelling rhythm.
- "Exam-focused": Bulleted high-yield points, key testable facts, bold emphasis on definitions.

Original Content:
"${content}"

Return ONLY the reframed explanation text directly without markdown headers or fluff.`;

  for (const modelName of PREFERRED_MODELS) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(promptInstruction);
      const text = result.response.text();
      if (text && text.trim()) return text.trim();
    } catch (err: any) {
      console.warn(`[Reframe] Model ${modelName} error:`, err?.message);
    }
  }

  // Fallback if network/API fails
  return `Reframed (${style}): ${content}`;
}
