// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-firebase-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mock-firebase-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-firebase-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mock-firebase-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

/**
 * Initialize Firebase only once (singleton pattern)
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Firebase Authentication
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore Database
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase Storage
 */
export const storage: FirebaseStorage = getStorage(app);

/**
 * Enable offline persistence (optional, for PWA-like behavior)
 * Note: Only works in browser context, not in Server Components
 */
export const enablePersistence = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Offline persistence is enabled by default for web
      // Additional configuration can be added here if needed
    } catch (error) {
      console.warn('Firestore offline persistence already enabled:', error);
    }
  }
};

/**
 * ============================================
 * FIRESTORE SECURITY RULES (Reference)
 * ============================================
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // User profiles - readable by owner and admins
 *     match /users/{userId} {
 *       allow read: if request.auth.uid == userId || hasRole('admin');
 *       allow write: if request.auth.uid == userId || hasRole('admin');
 *     }
 * 
 *     // Public course data - readable by all authenticated users
 *     match /courses/{courseId} {
 *       allow read: if request.auth != null;
 *       allow write: if hasRole('admin') || hasRole('instructor');
 * 
 *       // Chapters are subcollections
 *       match /chapters/{chapterId} {
 *         allow read: if request.auth != null;
 *         allow write: if hasRole('admin') || hasRole('instructor');
 * 
 *         // Lessons are subcollections
 *         match /lessons/{lessonId} {
 *           allow read: if request.auth != null;
 *           allow write: if hasRole('admin') || hasRole('instructor');
 *         }
 *       }
 *     }
 * 
 *     // Quiz data
 *     match /quizzes/{quizId} {
 *       allow read: if request.auth != null;
 *       allow write: if hasRole('admin') || hasRole('instructor');
 * 
 *       match /questions/{questionId} {
 *         allow read: if request.auth != null;
 *         allow write: if hasRole('admin') || hasRole('instructor');
 *       }
 *     }
 * 
 *     // User progress - readable only by owner
 *     match /userProgress/{docId} {
 *       allow read: if request.auth.uid == resource.data.userId;
 *       allow create: if request.auth.uid == request.resource.data.userId;
 *       allow update: if request.auth.uid == resource.data.userId;
 *       allow delete: if request.auth.uid == resource.data.userId;
 *     }
 * 
 *     // Chat messages - readable only by sender
 *     match /chatMessages/{docId} {
 *       allow read: if request.auth.uid == resource.data.userId;
 *       allow create: if request.auth.uid == request.resource.data.userId;
 *     }
 * 
 *     // Helper function to check user role
 *     function hasRole(role) {
 *       return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == role;
 *     }
 *   }
 * }
 */

export default app;
