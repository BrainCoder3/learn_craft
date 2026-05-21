// app/courses/[courseId]/page.tsx
import { notFound } from 'next/navigation';
import { getCourse, getChaptersByCourse } from '@/lib/db';
import { CourseCard } from '@/components/ui/CourseCard';
import Link from 'next/link';
import { ROUTES } from '@/constants/index';

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

/**
 * Course overview/roadmap page
 * Uses async params for Next.js 15 compatibility
 */
export async function generateStaticParams() {
  // In production, pre-generate popular course IDs
  // For now, return empty to use ISR (Incremental Static Regeneration)
  return [];
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;

  // Fetch course and chapters in parallel
  const [course, chapters] = await Promise.all([
    getCourse(courseId),
    getChaptersByCourse(courseId),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <main className="flex-1">
      {/* Header */}
      <div className="relative h-48 sm:h-64 overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Link
                href={ROUTES.HOME}
                className="text-sm text-primary-100 hover:text-white mb-4 inline-block transition-colors"
              >
                ← Retour
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{course.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Course info */}
              <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-2xl font-bold mb-4">À propos du cours</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">{course.description}</p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Durée estimée</p>
                    <p className="text-xl font-semibold text-gray-900">{course.estimatedHours}h</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Niveau</p>
                    <p className="text-xl font-semibold text-gray-900 capitalize">
                      {course.level === 'beginner'
                        ? 'Débutant'
                        : course.level === 'intermediate'
                          ? 'Intermédiaire'
                          : 'Avancé'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Étudiants inscrits</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {course.enrollmentCount.toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Note</p>
                    <p className="text-xl font-semibold text-yellow-600">
                      ★ {course.rating.toFixed(1)}/5
                    </p>
                  </div>
                </div>
              </div>

              {/* Chapters */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="text-2xl font-bold mb-6">Chapitres ({chapters.length})</h2>

                {chapters.length > 0 ? (
                  <div className="space-y-3">
                    {chapters.map((chapter, idx) => (
                      <Link
                        key={chapter.id}
                        href={ROUTES.CHAPTER(courseId, chapter.id)}
                        className="block rounded-lg border border-gray-200 p-4 transition-all hover:border-primary-500 hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-semibold">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {chapter.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {chapter.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              ⏱️ {chapter.estimatedMinutes} minutes
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aucun chapitre disponible</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6 sticky top-6">
                <button className="w-full rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700 mb-4">
                  S'inscrire au cours
                </button>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Mots-clés:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary-100 px-3 py-1 text-xs text-primary-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4 pt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Instructeur:</strong> {course.authorName}
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
