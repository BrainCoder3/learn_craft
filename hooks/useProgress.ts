// hooks/useProgress.ts
'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProgress } from '@/types/index';
import { FIREBASE_COLLECTIONS } from '@/constants/index';

interface UseProgressReturn {
  progress: UserProgress | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Real-time hook to track user progress using Firestore onSnapshot
 * Automatically subscribes to changes and unsubscribes on unmount
 */
export function useProgress(userId: string, courseId: string): UseProgressReturn {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !courseId) {
      setLoading(false);
      return;
    }

    try {
      const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        where('courseId', '==', courseId),
      ];

      const q = query(collection(db, FIREBASE_COLLECTIONS.USER_PROGRESS), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            setProgress({ id: doc.id, ...doc.data() } as UserProgress);
          } else {
            setProgress(null);
          }
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err instanceof Error ? err : new Error('Failed to load progress'));
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Progress subscription failed'));
      setLoading(false);
    }
  }, [userId, courseId]);

  return { progress, loading, error };
}

/**
 * Fetch all progress records for a user
 */
export function useUserProgressHistory(userId: string) {
  const [progressList, setProgressList] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, FIREBASE_COLLECTIONS.USER_PROGRESS),
        where('userId', '==', userId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as UserProgress));
          setProgressList(docs);
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError(err instanceof Error ? err : new Error('Failed to load progress history'));
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Progress history subscription failed'));
      setLoading(false);
    }
  }, [userId]);

  return { progressList, loading, error };
}
