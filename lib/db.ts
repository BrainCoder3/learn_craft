// lib/db.ts
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { User, Course, Chapter, Lesson, Quiz, UserProgress, ChatMessage, QuizScore } from '@/types/index';
import { FIREBASE_COLLECTIONS } from '@/constants/index';

/** Generic get single document by ID */
export const getDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  } catch (error) {
    console.error(`Error fetching ${collectionName}/${docId}:`, error);
    return null;
  }
};

/** Generic query documents with constraints */
export const queryDocuments = async <T>(collectionName: string, constraints: any[] = []): Promise<T[]> => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
};

/** Courses */
export const getCourse = (courseId: string) => getDocument<Course>(FIREBASE_COLLECTIONS.COURSES, courseId);
export const getCourses = async (pageSize: number = 20) =>
  queryDocuments<Course>(FIREBASE_COLLECTIONS.COURSES, [where('isPublished', '==', true), orderBy('createdAt', 'desc'), limit(pageSize)]);
export const getCoursesByCategory = async (category: string, pageSize: number = 20) =>
  queryDocuments<Course>(FIREBASE_COLLECTIONS.COURSES, [where('category', '==', category), where('isPublished', '==', true), orderBy('createdAt', 'desc'), limit(pageSize)]);

/** Chapters */
export const getChapter = (chapterId: string) => getDocument<Chapter>(FIREBASE_COLLECTIONS.CHAPTERS, chapterId);
export const getChaptersByCourse = async (courseId: string) =>
  queryDocuments<Chapter>(FIREBASE_COLLECTIONS.CHAPTERS, [where('courseId', '==', courseId), where('isPublished', '==', true), orderBy('order', 'asc')]);

/** Lessons */
export const getLesson = (lessonId: string) => getDocument<Lesson>(FIREBASE_COLLECTIONS.LESSONS, lessonId);
export const getLessonsByChapter = async (chapterId: string) =>
  queryDocuments<Lesson>(FIREBASE_COLLECTIONS.LESSONS, [where('chapterId', '==', chapterId), where('isPublished', '==', true), orderBy('order', 'asc')]);

/** Quizzes */
export const getQuiz = (quizId: string) => getDocument<Quiz>(FIREBASE_COLLECTIONS.QUIZZES, quizId);

/** User Progress */
export const getUserProgress = async (userId: string, courseId: string) => {
  const docs = await queryDocuments<UserProgress>(FIREBASE_COLLECTIONS.USER_PROGRESS, [where('userId', '==', userId), where('courseId', '==', courseId)]);
  return docs[0] || null;
};
export const getUserProgressByUser = async (userId: string) =>
  queryDocuments<UserProgress>(FIREBASE_COLLECTIONS.USER_PROGRESS, [where('userId', '==', userId), orderBy('lastAccessedAt', 'desc')]);

export const updateUserProgress = async (progressId: string, updates: Partial<UserProgress>) => {
  const docRef = doc(db, FIREBASE_COLLECTIONS.USER_PROGRESS, progressId);
  await updateDoc(docRef, { ...updates, updatedAt: new Date() });
};

export const completeLessonInProgress = async (progressId: string, lessonId: string) => {
  const docRef = doc(db, FIREBASE_COLLECTIONS.USER_PROGRESS, progressId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Progress not found');
  const data = snap.data() as UserProgress;
  const completedLessonIds = Array.from(new Set([...data.completedLessonIds, lessonId]));
  await updateDoc(docRef, { completedLessonIds, lastAccessedAt: new Date() });
};

export const saveQuizScore = async (progressId: string, quizId: string, score: number, maxScore: number) => {
  const docRef = doc(db, FIREBASE_COLLECTIONS.USER_PROGRESS, progressId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error('Progress not found');
  const data = snap.data() as UserProgress;
  const existing = data.quizScores.find((q) => q.quizId === quizId);
  const updatedScores: QuizScore[] = existing
    ? data.quizScores.map((q) =>
        q.quizId === quizId
          ? { ...q, score, maxScore, attemptCount: q.attemptCount + 1, passedAt: score >= maxScore * 0.7 ? new Date() : q.passedAt }
          : q
      )
    : [...data.quizScores, { quizId, score, maxScore, attemptCount: 1, passedAt: score >= maxScore * 0.7 ? new Date() : undefined }];
  await updateDoc(docRef, { quizScores: updatedScores, totalXpGained: data.totalXpGained + Math.floor(score / 2), lastAccessedAt: new Date() });
};

/** Chat */
export const saveChatMessage = async (message: Omit<ChatMessage, 'id'>): Promise<string> => {
  const colRef = collection(db, FIREBASE_COLLECTIONS.CHAT_MESSAGES);
  const docRef = doc(colRef);
  const msg = { ...message, id: docRef.id };
  await setDoc(docRef, msg);
  return docRef.id;
};

export const getChatHistory = async (userId: string, chapterId: string) =>
  queryDocuments<ChatMessage>(FIREBASE_COLLECTIONS.CHAT_MESSAGES, [where('userId', '==', userId), where('chapterId', '==', chapterId), orderBy('timestamp', 'desc'), limit(50)]);

/** Users */
export const getUser = (userId: string) => getDocument<User>(FIREBASE_COLLECTIONS.USERS, userId);

export const upsertUser = async (userId: string, userData: Partial<User>) => {
  const docRef = doc(db, FIREBASE_COLLECTIONS.USERS, userId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    await updateDoc(docRef, userData);
  } else {
    await setDoc(docRef, { id: userId, createdAt: new Date(), ...userData });
  }
};

export const enrollInCourse = async (userId: string, courseId: string): Promise<string> => {
  const existing = await getUserProgress(userId, courseId);
  if (existing) return existing.id;
  const colRef = collection(db, FIREBASE_COLLECTIONS.USER_PROGRESS);
  const docRef = doc(colRef);
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
};

export const getEnrolledCourses = async (userId: string) => {
  const progressList = await getUserProgressByUser(userId);
  const results = await Promise.all(
    progressList.map(async (progress) => ({ progress, course: await getCourse(progress.courseId) }))
  );
  return results;
};
