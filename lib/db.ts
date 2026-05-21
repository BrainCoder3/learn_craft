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
  QueryDocumentSnapshot,
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

/**
 * Generic get single document by ID
 */
export const getDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
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
  return getDocument<Course>(FIREBASE_COLLECTIONS.COURSES, courseId);
};

/**
 * Get all published courses with pagination
 */
export const getCourses = async (pageSize: number = 20): Promise<Course[]> => {
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
  return getDocument<Chapter>(FIREBASE_COLLECTIONS.CHAPTERS, chapterId);
};

/**
 * Get all chapters for a course
 */
export const getChaptersByCourse = async (courseId: string): Promise<Chapter[]> => {
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
  return getDocument<Lesson>(FIREBASE_COLLECTIONS.LESSONS, lessonId);
};

/**
 * Get all lessons for a chapter
 */
export const getLessonsByChapter = async (chapterId: string): Promise<Lesson[]> => {
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
  return getDocument<Quiz>(FIREBASE_COLLECTIONS.QUIZZES, quizId);
};

/**
 * Get user progress for a course
 */
export const getUserProgress = async (
  userId: string,
  courseId: string
): Promise<UserProgress | null> => {
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
  return getDocument<User>(FIREBASE_COLLECTIONS.USERS, userId);
};

/**
 * Create or update user document
 */
export const upsertUser = async (userId: string, userData: Partial<User>): Promise<void> => {
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
