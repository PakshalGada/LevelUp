export interface GeneratedLesson {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  durationMinutes: number;
  xpReward: number;
}

export const generateMockLesson = (topicId: string, topicTitle?: string): GeneratedLesson => {
  const title = topicTitle || topicId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    id: `lesson-${Date.now()}`,
    topicId,
    title: `Mastering ${title}`,
    summary: `An interactive breakdown of ${title} core concepts, real-world patterns, and best practices.`,
    content: [
      `Welcome to **${title}**! In this lesson, you will explore the foundational principles that top software engineers and creators use daily.`,
      `Key Concept 1: **Modular Architecture**. Breaking complex systems down into smaller, self-contained components drastically reduces cognitive load and enhances maintainability.`,
      `Key Concept 2: **State Synchronization**. Keeping user interfaces responsive requires predictable state flows and minimal side-effects.`,
      `Key Concept 3: **Gamified Retention**. Applying immediate reward loops (XP, streak multipliers, achievement badges) reinforces learning consistency.`
    ],
    keyTakeaways: [
      'Decompose complex problems into atomic modules.',
      'Maintain clear unidirectional data flow for state predictable operations.',
      'Consistently review micro-lessons to maintain your streak bonus.'
    ],
    durationMinutes: 5,
    xpReward: 150
  };
};
