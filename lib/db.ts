// lib/db.ts
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  setDoc,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User,
  Course,
  Chapter,
  Lesson,
  Quiz,
  UserProgress,
  ChatMessage,
  QuizScore,
} from '@/types/index';
import { FIREBASE_COLLECTIONS } from '@/constants/index';
import * as sampleData from './sample-data';

// Helper to detect mock mode
export const isMockMode = (): boolean => false;

// Helper to deep copy objects to avoid modifying original sample data structures
const deepCopy = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (Array.isArray(obj)) return obj.map(deepCopy) as any;
  const copy: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
};

// Simulated Database state
let memoryDb: {
  users: Record<string, any>;
  courses: any[];
  chapters: any[];
  lessons: any[];
  quizzes: any[];
  userProgress: any[];
  chatMessages: any[];
} = {
  users: {},
  courses: [],
  chapters: [],
  lessons: [],
  quizzes: [],
  userProgress: [],
  chatMessages: [],
};

const initMockDb = () => {
  if (memoryDb.courses.length > 0) return; // already initialized

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('learncraft_mock_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const parseDates = (obj: any): any => {
          if (obj === null || typeof obj !== 'object') return obj;
          if (Array.isArray(obj)) return obj.map(parseDates);
          for (const key in obj) {
            if (typeof obj[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj[key])) {
              obj[key] = new Date(obj[key]);
            } else if (typeof obj[key] === 'object') {
              obj[key] = parseDates(obj[key]);
            }
          }
          return obj;
        };
        memoryDb = parseDates(parsed);
        return;
      } catch (e) {
        console.error('Failed to parse saved mock db, resetting', e);
      }
    }
  }

  // Initialize with sample data
  memoryDb.courses = deepCopy(sampleData.sampleCourses);
  memoryDb.chapters = deepCopy(sampleData.sampleChapters);
  memoryDb.lessons = deepCopy(sampleData.sampleLessons);
  memoryDb.quizzes = [deepCopy(sampleData.sampleQuiz)];
  memoryDb.userProgress = [deepCopy(sampleData.sampleUserProgress)];
  memoryDb.chatMessages = deepCopy(sampleData.sampleChatMessages);
  memoryDb.users = {
    [sampleData.sampleUser.id]: deepCopy(sampleData.sampleUser),
  };
};

const saveMockDb = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('learncraft_mock_db', JSON.stringify(memoryDb));
  }
};

/**
 * Generic get single document by ID
 */
export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  if (isMockMode()) {
    initMockDb();
    if (collectionName === FIREBASE_COLLECTIONS.COURSES) {
      return (memoryDb.courses.find((c) => c.id === docId) || null) as any;
    }
    if (collectionName === FIREBASE_COLLECTIONS.CHAPTERS) {
      return (memoryDb.chapters.find((c) => c.id === docId) || null) as any;
    }
    if (collectionName === FIREBASE_COLLECTIONS.LESSONS) {
      return (memoryDb.lessons.find((c) => c.id === docId) || null) as any;
    }
    if (collectionName === FIREBASE_COLLECTIONS.QUIZZES) {
      return (memoryDb.quizzes.find((c) => c.id === docId) || null) as any;
    }
    if (collectionName === FIREBASE_COLLECTIONS.USERS) {
      return (memoryDb.users[docId] || null) as any;
    }
    if (collectionName === FIREBASE_COLLECTIONS.USER_PROGRESS) {
      return (memoryDb.userProgress.find((p) => p.id === docId) || null) as any;
    }
    return null;
  }

  try {
    const docRef = doc(db, collectionName, docId);
    const docSnapshot = await getDoc(docRef);
    return (docSnapshot.exists() ? docSnapshot.data() : null) as T | null;
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${docId}:`, error);
    return null;
  }
};

/**
 * Generic query documents
 */
export const queryDocuments = async <T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as unknown as T));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
};

/**
 * Get single course by ID
 */
export const getCourse = async (courseId: string): Promise<Course | null> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.courses.find((c) => c.id === courseId) || null;
  }
  return getDocument<Course>(FIREBASE_COLLECTIONS.COURSES, courseId);
};

/**
 * Get all published courses with pagination
 */
export const getCourses = async (pageSize: number = 20): Promise<Course[]> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.courses
      .filter((c) => c.isPublished)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, pageSize);
  }
  return queryDocuments<Course>(FIREBASE_COLLECTIONS.COURSES, [
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]);
};

/**
 * Get courses by category
 */
export const getCoursesByCategory = async (
  category: string,
  pageSize: number = 20
): Promise<Course[]> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.courses
      .filter((c) => c.category === category && c.isPublished)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, pageSize);
  }
  return queryDocuments<Course>(FIREBASE_COLLECTIONS.COURSES, [
    where('category', '==', category),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ]);
};

/**
 * Get chapter by ID
 */
export const getChapter = async (chapterId: string): Promise<Chapter | null> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.chapters.find((c) => c.id === chapterId) || null;
  }
  return getDocument<Chapter>(FIREBASE_COLLECTIONS.CHAPTERS, chapterId);
};

/**
 * Get all chapters for a course
 */
export const getChaptersByCourse = async (courseId: string): Promise<Chapter[]> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.chapters
      .filter((c) => c.courseId === courseId && c.isPublished)
      .sort((a, b) => a.order - b.order);
  }
  return queryDocuments<Chapter>(FIREBASE_COLLECTIONS.CHAPTERS, [
    where('courseId', '==', courseId),
    where('isPublished', '==', true),
    orderBy('order', 'asc'),
  ]);
};

/**
 * Get lesson by ID
 */
export const getLesson = async (lessonId: string): Promise<Lesson | null> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.lessons.find((l) => l.id === lessonId) || null;
  }
  return getDocument<Lesson>(FIREBASE_COLLECTIONS.LESSONS, lessonId);
};

/**
 * Get all lessons for a chapter
 */
export const getLessonsByChapter = async (chapterId: string): Promise<Lesson[]> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.lessons
      .filter((l) => l.chapterId === chapterId && l.isPublished)
      .sort((a, b) => a.order - b.order);
  }
  return queryDocuments<Lesson>(FIREBASE_COLLECTIONS.LESSONS, [
    where('chapterId', '==', chapterId),
    where('isPublished', '==', true),
    orderBy('order', 'asc'),
  ]);
};

/**
 * Get quiz by ID
 */
export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.quizzes.find((q) => q.id === quizId) || null;
  }
  return getDocument<Quiz>(FIREBASE_COLLECTIONS.QUIZZES, quizId);
};

/**
 * Get user progress for a course
 */
export const getUserProgress = async (
  userId: string,
  courseId: string
): Promise<UserProgress | null> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.userProgress.find((p) => p.userId === userId && p.courseId === courseId) || null;
  }
  const docs = await queryDocuments<UserProgress>(
    FIREBASE_COLLECTIONS.USER_PROGRESS,
    [where('userId', '==', userId), where('courseId', '==', courseId)]
  );
  return docs.length > 0 ? docs[0] : null;
};

/**
 * Get all user progress records
 */
export const getUserProgressByUser = async (userId: string): Promise<UserProgress[]> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.userProgress
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime());
  }
  return queryDocuments<UserProgress>(FIREBASE_COLLECTIONS.USER_PROGRESS, [
    where('userId', '==', userId),
    orderBy('lastAccessedAt', 'desc'),
  ]);
};

/**
 * Update user progress
 */
export const updateUserProgress = async (
  progressId: string,
  updates: Partial<UserProgress>
): Promise<void> => {
  if (isMockMode()) {
    initMockDb();
    const idx = memoryDb.userProgress.findIndex((p) => p.id === progressId);
    if (idx !== -1) {
      memoryDb.userProgress[idx] = {
        ...memoryDb.userProgress[idx],
        ...updates,
        updatedAt: new Date(),
      };
      saveMockDb();
    }
    return;
  }
  try {
    const docRef = doc(db, FIREBASE_COLLECTIONS.USER_PROGRESS, progressId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    throw error;
  }
};

/**
 * Mark lesson as completed
 */
export const completeLessonInProgress = async (
  progressId: string,
  lessonId: string
): Promise<void> => {
  if (isMockMode()) {
    initMockDb();
    const idx = memoryDb.userProgress.findIndex((p) => p.id === progressId);
    if (idx === -1) throw new Error('Progress not found');
    const data = memoryDb.userProgress[idx];
    const updatedLessonIds = Array.from(new Set([...data.completedLessonIds, lessonId]));

    // Also check if all lessons in the chapter are completed to mark chapter as completed
    const lesson = memoryDb.lessons.find((l) => l.id === lessonId);
    const completedChapterIds = [...data.completedChapterIds];
    if (lesson) {
      const chapterLessons = memoryDb.lessons.filter((l) => l.chapterId === lesson.chapterId);
      const allCompleted = chapterLessons.every((l) => updatedLessonIds.includes(l.id));
      if (allCompleted && !completedChapterIds.includes(lesson.chapterId)) {
        completedChapterIds.push(lesson.chapterId);
      }
    }

    memoryDb.userProgress[idx] = {
      ...data,
      completedLessonIds: updatedLessonIds,
      completedChapterIds,
      lastAccessedAt: new Date(),
    };
    saveMockDb();
    return;
  }
  try {
    const docRef = doc(db, FIREBASE_COLLECTIONS.USER_PROGRESS, progressId);
    const progress = await getDoc(docRef);

    if (!progress.exists()) throw new Error('Progress not found');

    const data = progress.data() as UserProgress;
    const updatedLessonIds = Array.from(new Set([...data.completedLessonIds, lessonId]));

    await updateDoc(docRef, {
      completedLessonIds: updatedLessonIds,
      lastAccessedAt: new Date(),
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    throw error;
  }
};

/**
 * Save quiz score
 */
export const saveQuizScore = async (
  progressId: string,
  quizId: string,
  score: number,
  maxScore: number
): Promise<void> => {
  if (isMockMode()) {
    initMockDb();
    const idx = memoryDb.userProgress.findIndex((p) => p.id === progressId);
    if (idx === -1) throw new Error('Progress not found');
    const data = memoryDb.userProgress[idx];
    const existingScore = data.quizScores.find((q: any) => q.quizId === quizId);

    const updatedScores: QuizScore[] = existingScore
      ? data.quizScores.map((q: any) =>
        q.quizId === quizId
          ? {
            ...q,
            score,
            maxScore,
            attemptCount: q.attemptCount + 1,
            passedAt: score >= maxScore * 0.7 ? new Date() : q.passedAt,
          }
          : q
      )
      : [
        ...data.quizScores,
        {
          quizId,
          score,
          maxScore,
          attemptCount: 1,
          passedAt: score >= maxScore * 0.7 ? new Date() : undefined,
        },
      ];

    memoryDb.userProgress[idx] = {
      ...data,
      quizScores: updatedScores,
      totalXpGained: data.totalXpGained + Math.floor(score / 2),
      lastAccessedAt: new Date(),
    };
    saveMockDb();
    return;
  }
  try {
    const docRef = doc(db, FIREBASE_COLLECTIONS.USER_PROGRESS, progressId);
    const progress = await getDoc(docRef);

    if (!progress.exists()) throw new Error('Progress not found');

    const data = progress.data() as UserProgress;
    const existingScore = data.quizScores.find((q) => q.quizId === quizId);

    const updatedScores: QuizScore[] = existingScore
      ? data.quizScores.map((q) =>
        q.quizId === quizId
          ? {
            ...q,
            score,
            maxScore,
            attemptCount: q.attemptCount + 1,
            passedAt: score >= maxScore * 0.7 ? new Date() : q.passedAt,
          }
          : q
      )
      : [
        ...data.quizScores,
        {
          quizId,
          score,
          maxScore,
          attemptCount: 1,
          passedAt: score >= maxScore * 0.7 ? new Date() : undefined,
        },
      ];

    await updateDoc(docRef, {
      quizScores: updatedScores,
      totalXpGained: data.totalXpGained + Math.floor(score / 2),
      lastAccessedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving quiz score:', error);
    throw error;
  }
};

/**
 * Save chat message
 */
export const saveChatMessage = async (message: Omit<ChatMessage, 'id'>): Promise<string> => {
  if (isMockMode()) {
    initMockDb();
    const id = `mock-msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const messageWithId = {
      ...message,
      id,
    };
    memoryDb.chatMessages.push(messageWithId);
    saveMockDb();
    return id;
  }
  try {
    const docRef = doc(collection(db, FIREBASE_COLLECTIONS.CHAT_MESSAGES));
    const messageWithId = {
      ...message,
      id: docRef.id,
    };
    await setDoc(docRef, messageWithId);
    return docRef.id;
  } catch (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
};

/**
 * Get chat history for a user in a chapter (limit last 50 messages)
 */
export const getChatHistory = async (
  userId: string,
  chapterId: string
): Promise<ChatMessage[]> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.chatMessages
      .filter((m) => m.userId === userId && m.chapterId === chapterId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);
  }
  return queryDocuments<ChatMessage>(FIREBASE_COLLECTIONS.CHAT_MESSAGES, [
    where('userId', '==', userId),
    where('chapterId', '==', chapterId),
    orderBy('timestamp', 'desc'),
    limit(50),
  ]);
};

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
  if (isMockMode()) {
    initMockDb();
    return memoryDb.users[userId] || null;
  }
  return getDocument<User>(FIREBASE_COLLECTIONS.USERS, userId);
};

/**
 * Create or update user document
 */
export const upsertUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  if (isMockMode()) {
    initMockDb();
    const existingUser = memoryDb.users[userId];
    if (existingUser) {
      memoryDb.users[userId] = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
    } else {
      memoryDb.users[userId] = {
        id: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: userData.email || '',
        displayName: userData.displayName || '',
        avatarUrl: userData.avatarUrl || '',
        role: userData.role || 'student',
        level: userData.level || 'beginner',
        preferences: {
          theme: 'light',
          language: 'fr',
          notificationsEnabled: true,
          ...userData.preferences,
        },
        badges: userData.badges || [],
        totalXp: userData.totalXp || 0,
        ...userData,
      };
    }
    saveMockDb();
    return;
  }
  try {
    const docRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
    const existingUser = await getDoc(docRef);

    if (existingUser.exists()) {
      await updateDoc(docRef, userData);
    } else {
      const newUser = {
        id: userId,
        createdAt: new Date(),
        ...userData,
      };
      await setDoc(docRef, newUser);
    }
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
};

/**
 * Enroll a user in a course (creates UserProgress doc if not exists)
 * Returns the progress document ID
 */
export const enrollInCourse = async (userId: string, courseId: string): Promise<string> => {
  if (isMockMode()) {
    initMockDb();
    const existing = await getUserProgress(userId, courseId);
    if (existing) return existing.id;

    const id = `mock-progress-${Date.now()}`;
    const progress: UserProgress = {
      id,
      userId,
      courseId,
      enrolledAt: new Date(),
      completedLessonIds: [],
      completedChapterIds: [],
      quizScores: [],
      totalXpGained: 0,
      lastAccessedAt: new Date(),
      isCompleted: false,
    };
    memoryDb.userProgress.push(progress);
    saveMockDb();
    return id;
  }
  try {
    // Check for existing enrollment first
    const existing = await getUserProgress(userId, courseId);
    if (existing) return existing.id;

    const docRef = doc(collection(db, FIREBASE_COLLECTIONS.USER_PROGRESS));
    const progress: UserProgress = {
      id: docRef.id,
      userId,
      courseId,
      enrolledAt: new Date(),
      completedLessonIds: [],
      completedChapterIds: [],
      quizScores: [],
      totalXpGained: 0,
      lastAccessedAt: new Date(),
      isCompleted: false,
    };
    await setDoc(docRef, progress);
    return docRef.id;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

/**
 * Get all courses a user is enrolled in (via their progress records)
 */
export const getEnrolledCourses = async (userId: string): Promise<{ progress: UserProgress; course: Course | null }[]> => {
  const progressList = await getUserProgressByUser(userId);
  const results = await Promise.all(
    progressList.map(async (progress) => ({
      progress,
      course: await getCourse(progress.courseId),
    }))
  );
  return results;
};
