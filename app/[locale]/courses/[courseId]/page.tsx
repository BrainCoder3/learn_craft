// app/[locale]/courses/[courseId]/page.tsx
import { notFound } from 'next/navigation';
import { getCourse, getChaptersByCourse } from '@/lib/db';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/index';
import { EnrollButton } from '@/components/ui/EnrollButton';

interface CoursePageProps {
  params: Promise<{ courseId: string; locale: string }>;
}

export async function generateStaticParams() {
  return [];
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;

  const [course, chapters] = await Promise.all([
    getCourse(courseId),
    getChaptersByCourse(courseId),
  ]);

  if (!course) {
    notFound();
  }

  const levelLabels: Record<string, string> = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
  };

  const firstChapterId = chapters[0]?.id;

  return (
    <main className="flex-1 bg-[var(--bg-base)]">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--interactive-primary)] via-[var(--color-brand-600)] to-[var(--color-brand-800)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(31,255,212,0.12),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-1 text-sm text-[var(--color-brand-200)] hover:text-white mb-6 transition-colors"
          >
            ← Retour aux cours
          </Link>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex-1 min-w-0">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white mb-3 uppercase tracking-wide">
                {course.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{course.title}</h1>
              <p className="text-[var(--color-brand-100)] text-lg leading-relaxed max-w-2xl">
                {course.description}
              </p>
            </div>
          </div>
          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-8 text-sm text-white/80">
            <span>⏱️ {course.estimatedHours}h de contenu</span>
            <span>📖 {chapters.length} chapitres</span>
            <span>👥 {course.enrollmentCount.toLocaleString('fr-FR')} étudiants</span>
            <span>★ {course.rating.toFixed(1)}/5</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-6 shadow-[var(--shadow-sm)]">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">À propos du cours</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Durée estimée</p>
                    <p className="text-xl font-semibold text-[var(--text-primary)]">{course.estimatedHours}h</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Niveau</p>
                    <p className="text-xl font-semibold text-[var(--text-primary)] capitalize">
                      {levelLabels[course.level]}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Étudiants inscrits</p>
                    <p className="text-xl font-semibold text-[var(--text-primary)]">
                      {course.enrollmentCount.toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Note</p>
                    <p className="text-xl font-semibold text-yellow-600">★ {course.rating.toFixed(1)}/5</p>
                  </div>
                </div>
              </div>

              {/* Chapters roadmap */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-6 shadow-[var(--shadow-sm)]">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                  Roadmap — {chapters.length} chapitre{chapters.length > 1 ? 's' : ''}
                </h2>

                {chapters.length > 0 ? (
                  <div className="space-y-3">
                    {chapters.map((chapter, idx) => (
                      <Link
                        key={chapter.id}
                        href={ROUTES.CHAPTER(courseId, chapter.id)}
                        className="group flex items-start gap-4 rounded-[var(--radius-md)] border border-[var(--border-default)] p-4 hover:border-[var(--interactive-primary)] hover:shadow-[var(--shadow-sm)] bg-[var(--bg-base)] transition-all duration-200"
                      >
                        {/* Step number */}
                        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-muted)] group-hover:bg-[var(--interactive-primary)] text-[var(--text-secondary)] group-hover:text-[var(--interactive-primary-text)] font-bold text-sm transition-colors duration-200">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--interactive-primary)] transition-colors truncate">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                            {chapter.description}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
                            ⏱️ {chapter.estimatedMinutes} minutes
                            {chapter.quizId && <span className="ml-2 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] px-2 py-0.5 text-[10px] font-medium">Quiz</span>}
                          </p>
                        </div>
                        <span className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--interactive-primary)] transition-colors">→</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)]">Aucun chapitre disponible pour le moment.</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-6 shadow-[var(--shadow-sm)] sticky top-6 space-y-6">
                {/* Enrollment */}
                <EnrollButton
                  courseId={courseId}
                  initialProgress={null}
                  firstChapterId={firstChapterId}
                />

                {/* Tags */}
                {course.tags.length > 0 && (
                  <div className="border-t border-[var(--border-default)] pt-5">
                    <p className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Mots-clés</p>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[var(--bg-muted)] border border-[var(--border-default)] px-3 py-1 text-xs text-[var(--text-secondary)] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructor */}
                <div className="border-t border-[var(--border-default)] pt-5">
                  <p className="text-sm text-[var(--text-secondary)]">
                    <span className="font-semibold text-[var(--text-primary)]">Instructeur :</span>{' '}
                    {course.authorName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
