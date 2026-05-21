// app/[locale]/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/lib/auth-context';
import { getEnrolledCourses, getCourses } from '@/lib/db';
import { Link, useRouter } from '@/i18n/routing';
import { AuthButton } from '@/components/ui/AuthButton';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import type { UserProgress, Course } from '@/types/index';

interface EnrolledItem {
  progress: UserProgress;
  course: Course | null;
}

const levelLabels: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
};

const categoryEmojis: Record<string, string> = {
  frontend: '🎨',
  backend: '⚙️',
  fullstack: '🔗',
  devops: '🚀',
  mobile: '📱',
};

export default function DashboardPage() {
  const { firebaseUser, user, loading } = useAuthContext();
  const router = useRouter();
  const [enrolled, setEnrolled] = useState<EnrolledItem[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [loading, firebaseUser, router]);

  useEffect(() => {
    if (!firebaseUser) return;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [enrolledData, allCourses] = await Promise.all([
          getEnrolledCourses(firebaseUser.uid),
          getCourses(6),
        ]);
        setEnrolled(enrolledData);
        const enrolledIds = new Set(enrolledData.map((e) => e.progress.courseId));
        setSuggestedCourses(allCourses.filter((c) => !enrolledIds.has(c.id)));
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [firebaseUser]);

  if (loading || !firebaseUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="animate-pulse text-[var(--text-muted)]">Chargement...</div>
      </div>
    );
  }

  const displayName =
    user?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Apprenant';
  const totalXp = enrolled.reduce((sum, e) => sum + e.progress.totalXpGained, 0);
  const completedCourses = enrolled.filter((e) => e.progress.isCompleted).length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--surface-default)]/80 border-b border-[var(--border-default)] transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--text-accent)] bg-clip-text text-transparent"
            >
              LearnCraft
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors">
                Accueil
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-[var(--interactive-primary)]">
                Tableau de bord
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Bonjour, {displayName} 👋
          </h1>
          <p className="text-[var(--text-secondary)]">Continuez là où vous vous êtes arrêté.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Cours inscrits', value: enrolled.length, icon: '📚' },
            { label: 'Cours terminés', value: completedCourses, icon: '✅' },
            { label: 'XP total', value: totalXp, icon: '⚡' },
            { label: 'Badges', value: user?.badges?.length ?? 0, icon: '🏆' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-5 shadow-[var(--shadow-sm)] flex flex-col gap-2"
            >
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</span>
              <span className="text-sm text-[var(--text-muted)]">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Enrolled courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Mes cours</h2>

          {loadingData ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 rounded-[var(--radius-lg)] bg-[var(--bg-muted)] animate-pulse" />
              ))}
            </div>
          ) : enrolled.length === 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] p-12 text-center">
              <p className="text-4xl mb-4">🎓</p>
              <p className="text-lg font-medium text-[var(--text-secondary)] mb-4">
                Vous n&apos;êtes inscrit à aucun cours pour l&apos;instant.
              </p>
              <Link href="/" className="btn-primary">
                Découvrir les cours →
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {enrolled.map(({ progress, course }) => {
                if (!course) return null;
                const pct = Math.round(
                  (progress.completedChapterIds.length / Math.max(1, course.chapterCount)) * 100
                );
                return (
                  <Link
                    key={progress.id}
                    href={`/courses/${course.id}` as Parameters<typeof Link>[0]['href']}
                    className="group rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--interactive-primary)] transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-3xl">
                        {categoryEmojis[course.category] || '📚'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--interactive-primary)] transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {levelLabels[course.level]} · {course.estimatedHours}h
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                        <span>
                          {progress.completedChapterIds.length}/{course.chapterCount} chapitres
                        </span>
                        <span className="font-semibold text-[var(--interactive-primary)]">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[var(--bg-muted)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--text-accent)] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {progress.isCompleted && (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-success-600)] bg-[var(--color-success-50)] px-2 py-1 rounded-full">
                        ✅ Terminé
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Suggested courses */}
        {suggestedCourses.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
              Cours recommandés
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {suggestedCourses.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}` as Parameters<typeof Link>[0]['href']}
                  className="group rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--interactive-primary)] transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{categoryEmojis[course.category] || '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--interactive-primary)] transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {levelLabels[course.level]} · {course.chapterCount} chapitres
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-yellow-600 font-medium">★ {course.rating.toFixed(1)}</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {course.enrollmentCount.toLocaleString('fr-FR')} étudiants
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
