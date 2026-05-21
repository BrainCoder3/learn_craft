// types/index.ts

/**
 * User profile and authentication
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
  preferences: {
    theme: 'light' | 'dark';
    language: 'fr' | 'en';
    notificationsEnabled: boolean;
  };
  badges: string[];
  totalXp: number;
}

/**
 * Course structure
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'mobile';
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  authorId: string;
  authorName: string;
  chapterCount: number;
  estimatedHours: number;
  tags: string[];
  rating: number;
  enrollmentCount: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chapter within a course
 */
export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
  quizId?: string;
  estimatedMinutes: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lesson content
 */
export interface Lesson {
  id: string;
  chapterId: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  codeExamples: CodeExample[];
  resources?: LessonResource[];
  estimatedMinutes: number;
  videoUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Code example with syntax highlighting
 */
export interface CodeExample {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation?: string;
  output?: string;
}

/**
 * Lesson resource (links, files, references)
 */
export interface LessonResource {
  id: string;
  title: string;
  type: 'link' | 'file' | 'documentation';
  url: string;
  description?: string;
}

/**
 * Quiz structure
 */
export interface Quiz {
  id: string;
  chapterId: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  estimatedMinutes: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Individual quiz question
 */
export interface QuizQuestion {
  id: string;
  quizId: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  order: number;
}

/**
 * User progress tracking
 */
export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  completedLessonIds: string[];
  completedChapterIds: string[];
  quizScores: QuizScore[];
  totalXpGained: number;
  lastAccessedAt: Date;
  isCompleted: boolean;
  completedAt?: Date;
}

/**
 * Quiz score record
 */
export interface QuizScore {
  quizId: string;
  score: number;
  maxScore: number;
  attemptCount: number;
  passedAt?: Date;
}

/**
 * Achievement badges
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  criteria: {
    type: 'course-completion' | 'quiz-streak' | 'xp-milestone' | 'first-course';
    threshold: number;
  };
  createdAt: Date;
}

/**
 * AI chat message
 */
export interface ChatMessage {
  id: string;
  userId: string;
  courseId: string;
  chapterId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: {
    prompt: number;
    completion: number;
  };
}

/**
 * Chat context for AI requests
 */
export interface ChatContext {
  userId: string;
  courseId: string;
  chapterId: string;
  userLevel: User['level'];
  chapterTitle: string;
  chapterSummary: string;
  previousMessages: ChatMessage[];
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Streaming response for AI chat
 */
export interface StreamingResponse {
  success: boolean;
  message?: string;
  error?: string;
  tokens?: {
    promptTokens: number;
    completionTokens: number;
  };
}

/**
 * Rate limit tracking (for Vercel KV or in-memory fallback)
 */
export interface RateLimitEntry {
  userId: string;
  requestCount: number;
  resetTime: number;
  tokens: number;
}
