// hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types/index';
import { getUser } from '@/lib/db';

interface UseAuthReturn {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Client-side hook to track Firebase auth state and user profile
 */
export function useAuth(): UseAuthReturn {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      try {
        setFirebaseUser(fbUser);

        if (fbUser) {
          const userData = await getUser(fbUser.uid);
          setUser(userData);
        } else {
          setUser(null);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { firebaseUser, user, loading, error };
}
