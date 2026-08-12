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

// Helper to shuffle quiz question options so correct answer position is randomly distributed
function shuffleQuizQuestionOptions(question: GeneratedQuizQuestionPayload): GeneratedQuizQuestionPayload {
  const options = [...question.options];
  const targetCorrectIndex = question.correctIndex ?? 0;
  const correctText = options[targetCorrectIndex] || options[0];

  // Fisher-Yates shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const newCorrectIndex = options.indexOf(correctText);

  return {
    ...question,
    options,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
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
          correctIndex: { type: SchemaType.INTEGER, description: "0-indexed correct option (0, 1, 2, or 3)" },
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

  const rawQuestions: GeneratedQuizQuestionPayload[] = [
    {
      id: "q1",
      question: `What is the primary core principle underlying ${titleCaseTopic}?`,
      options: [
        `Bypassing error handling to maximize raw speed`,
        `Modular abstraction and predictable state management`,
        `Random execution without pre-defined boundaries`,
        `Exclusive reliance on legacy single-threaded processing`
      ],
      correctIndex: 1,
      explanation: `Modular abstraction and clear state boundaries are essential for maintainability and scalability in ${titleCaseTopic}.`
    },
    {
      id: "q2",
      question: `How does mastering ${titleCaseTopic} improve problem-solving efficiency?`,
      options: [
        `By eliminating the need for automated testing`,
        `By forcing all code to run on a single thread`,
        `By isolating concerns and reducing cognitive overhead`,
        `By replacing documentation with guessing`
      ],
      correctIndex: 2,
      explanation: `Isolating concerns minimizes cognitive load, making complex topics easier to reason about and debug.`
    },
    {
      id: "q3",
      question: `Which architectural pattern best complements ${titleCaseTopic}?`,
      options: [
        `Tightly coupled monolithic dependencies`,
        `Global mutable state shared across all components`,
        `Unstructured spaghetti code`,
        `Single responsibility with clear input/output contracts`
      ],
      correctIndex: 3,
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
        `Immediately forget the key takeaways`,
        `Avoid practicing for several months`,
        `Apply concepts through active recall and practical exercise`,
        `Rely solely on passive reading`
      ],
      correctIndex: 2,
      explanation: `Active recall and hands-on practice consolidate new knowledge into long-term memory.`
    }
  ];

  const shuffledQuiz = rawQuestions.map(shuffleQuizQuestionOptions);

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
    quiz: shuffledQuiz
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

      // Shuffle options & randomize correctIndex across A, B, C, D
      parsed.quiz = parsed.quiz.map(shuffleQuizQuestionOptions);

      console.log(`[GeminiService] Successfully generated content using ${modelName}`);
      return parsed;
    } catch (err: any) {
      if (err instanceof GeminiServiceError && err.code === 'SAFETY_BLOCKED') {
        throw err;
      }

      const errMsg = err?.message || String(err);
      console.warn(`[GeminiService] Model ${modelName} returned error:`, errMsg);
      lastError = err;

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

  console.warn(`[GeminiService] API call failed across all candidate models (${lastError?.message}). Serving structured fallback payload.`);
  return generateFallbackContent(topic);
}

/**
 * Reframe a section of content into an alternate tone ("Simpler", "Story form", "Exam-focused")
 * Fine-tuned prompt instructions for deep narrative storytelling, ELI5 simplicity, and exam key points.
 */
export async function reframeContentWithGemini(
  content: string,
  style: 'Simpler' | 'Story form' | 'Exam-focused'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  let styleInstruction = '';
  if (style === 'Simpler') {
    styleInstruction = `Rewrite this educational section in plain, intuitive language (ELI5). Use a clear real-world analogy, short sentences, and simple vocabulary. Remove all dense jargon and explain the core idea so a beginner can immediately grasp it.`;
  } else if (style === 'Story form') {
    styleInstruction = `Transform this educational section into a captivating, creative narrative story. Use a vivid real-world scenario (e.g., an engineer, architect, or investigator solving a critical problem), character perspective, and storytelling arc (setup, conflict, resolution) to bring the concepts to life organically. Make it immersive, engaging, and memorable to read.`;
  } else if (style === 'Exam-focused') {
    styleInstruction = `Reframe this educational section as an intense, high-yield study sheet for an exam. Structure key takeaways into bold bullet points, core definitions, test traps, and testable facts for rapid active recall.`;
  }

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    if (style === 'Simpler') {
      return `Simply put: Imagine building a house with LEGO blocks. ${content.replace(/(However,|Furthermore,|Consequently,)/gi, '')} Every piece snaps into place cleanly so the whole structure stays solid without breaking.`;
    }
    if (style === 'Story form') {
      return `Late on a stormy Tuesday night, Maya sat in front of glowing monitors. Her system was failing under heavy traffic until she applied this exact principle. ${content} Suddenly, the bottleneck cleared, servers stabilized, and the team celebrated a seamless deployment.`;
    }
    return `⚡ EXAM HIGH-YIELD SUMMARY:\n\n• Core Concept: ${content}\n• Test Trap: Pay attention to state boundaries and execution order.\n• Key Definition: Master the primary inputs and outputs for fast recall.`;
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const promptInstruction = `You are a master educator specializing in adaptive learning styles.
${styleInstruction}

Original Section Content:
"${content}"

CRITICAL GUIDELINES:
- Output ONLY the reframed section text directly. Do NOT include conversational prefixes like "Here is a story form version:" or markdown code block wrappers.
- Maintain full conceptual accuracy while completely transforming the narrative tone and structure.`;

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

  return `Reframed (${style}): ${content}`;
}

/**
 * Dig deeper into an incorrect quiz answer ("Explain why I was wrong")
 */
export async function explainMistakeWithGemini(
  question: string,
  userAnswer: string,
  correctAnswer: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return `Misconception breakdown: You selected "${userAnswer}", whereas the correct answer is "${correctAnswer}". The key difference lies in understanding how predictable execution boundaries prevent side effects.`;
  }

  const ai = new GoogleGenerativeAI(apiKey);
  const promptInstruction = `Act as an expert Apple-style tutor. Analyze the following quiz mistake concisely:
Question: "${question}"
Selected Choice (Incorrect): "${userAnswer}"
Correct Choice: "${correctAnswer}"

Explain specifically:
1. Why the selected choice is a common misconception.
2. The core mental model shift that makes "${correctAnswer}" correct.

Keep the response understated, precise, and under 3-4 sentences in a single clear paragraph.`;

  for (const modelName of PREFERRED_MODELS) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(promptInstruction);
      const text = result.response.text();
      if (text && text.trim()) return text.trim();
    } catch (err: any) {
      console.warn(`[ExplainMistake] Model ${modelName} error:`, err?.message);
    }
  }

  return `Analysis: Selecting "${userAnswer}" is a frequent mistake. "${correctAnswer}" is correct because it addresses the underlying architectural constraint.`;
}
