// components/ui/EnrollButton.tsx
'use client';

import { useState } from 'react';
import { enrollInCourse } from '@/lib/db';
import { useAuthContext } from '@/lib/auth-context';
import { useRouter } from '@/i18n/routing';
import type { UserProgress } from '@/types/index';

interface EnrollButtonProps {
  courseId: string;
  initialProgress: UserProgress | null;
  firstChapterId?: string;
}

/**
 * Client component for course enrollment.
 * Shows "Enroll" or "Continue" depending on existing progress.
 */
export function EnrollButton({ courseId, initialProgress, firstChapterId }: EnrollButtonProps) {
  const { firebaseUser } = useAuthContext();
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(initialProgress);
  const [loading, setLoading] = useState(false);

  const isEnrolled = !!progress;
  const completionPct = progress
    ? Math.round(
        (progress.completedChapterIds.length /
          Math.max(1, progress.completedChapterIds.length + 1)) *
          100
      )
    : 0;

  const handleClick = async () => {
    if (!firebaseUser) {
      router.push('/login');
      return;
    }

    if (isEnrolled) {
      // Navigate to first chapter or course overview
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dest = firstChapterId
        ? `/courses/${courseId}/${firstChapterId}`
        : `/courses/${courseId}`;
      router.push(dest as any);
      return;
    }

    setLoading(true);
    try {
      await enrollInCourse(firebaseUser.uid, courseId);
      // Optimistically update UI
      setProgress({
        id: 'new',
        userId: firebaseUser.uid,
        courseId,
        enrolledAt: new Date(),
        completedLessonIds: [],
        completedChapterIds: [],
        quizScores: [],
        totalXpGained: 0,
        lastAccessedAt: new Date(),
        isCompleted: false,
      });
    } catch (err) {
      console.error('Enrollment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        id={`enroll-btn-${courseId}`}
        onClick={handleClick}
        disabled={loading}
        className={`w-full rounded-[var(--radius-md)] px-6 py-3 font-semibold transition-all duration-200 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 disabled:cursor-not-allowed ${
          isEnrolled
            ? 'bg-[var(--color-success-600)] text-white hover:bg-[var(--color-success-700)]'
            : 'bg-[var(--interactive-primary)] text-[var(--interactive-primary-text)] hover:bg-[var(--interactive-primary-hover)]'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Inscription...
          </span>
        ) : isEnrolled ? (
          '▶ Continuer le cours'
        ) : (
          "✨ S'inscrire au cours"
        )}
      </button>

      {isEnrolled && (
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>Progression</span>
            <span>{completionPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-muted)]">
            <div
              className="h-full rounded-full bg-[var(--color-success-500)] transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      )}

      {!firebaseUser && (
        <p className="text-xs text-center text-[var(--text-muted)]">
          Connectez-vous pour vous inscrire
        </p>
      )}
    </div>
  );
}
