// app/[locale]/courses/[courseId]/[chapterId]/page.tsx
import { notFound } from 'next/navigation';
import { getChapter, getLessonsByChapter, getQuiz, getChaptersByCourse } from '@/lib/db';
import { ChapterContent } from '@/components/lesson/ChapterContent';
import { QuizBlock } from '@/components/lesson/QuizBlock';
import { MentorChat } from '@/components/ai/MentorChat';
import { Sidebar } from '@/components/layout/Sidebar';
import { Link } from '@/i18n/routing';
import { ROUTES } from '@/constants/index';
import { Suspense } from 'react';

interface ChapterPageProps {
  params: Promise<{ courseId: string; chapterId: string; locale: string }>;
}

export async function generateStaticParams() {
  return [];
}

async function LessonContent({ chapterId }: { chapterId: string }) {
  const lessons = await getLessonsByChapter(chapterId);

  if (lessons.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning-200)] bg-[var(--color-warning-50)] p-8 text-center">
        <p className="text-2xl mb-2">📝</p>
        <p className="text-[var(--color-warning-800)] font-medium">
          Aucune leçon disponible dans ce chapitre.
        </p>
      </div>
    );
  }

  return (
    <>
      {lessons.map((lesson) => (
        <div key={lesson.id} className="mb-8">
          <ChapterContent lesson={lesson} />
        </div>
      ))}
    </>
  );
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { courseId, chapterId } = await params;

  const [chapter, chapters, quiz] = await Promise.all([
    getChapter(chapterId),
    getChaptersByCourse(courseId),
    getQuiz(chapterId).catch(() => null),
  ]);

  if (!chapter) {
    notFound();
  }

  const currentIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = chapters[currentIndex - 1];
  const nextChapter = chapters[currentIndex + 1];

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Sidebar */}
      <Sidebar courseId={courseId} chapters={chapters} currentChapterId={chapterId} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Sticky chapter header */}
        <div className="sticky top-0 z-20 border-b border-[var(--border-default)] bg-[var(--surface-default)]/90 backdrop-blur-md px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link
              href={ROUTES.COURSE(courseId)}
              className="inline-flex items-center gap-1 text-xs text-[var(--interactive-primary)] hover:opacity-80 mb-2 transition-opacity"
            >
              ← Retour au cours
            </Link>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                  {chapter.title}
                </h1>
                {chapter.description && (
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                    {chapter.description}
                  </p>
                )}
              </div>
              <span className="flex-shrink-0 text-xs text-[var(--text-muted)] whitespace-nowrap">
                {currentIndex + 1}/{chapters.length}
              </span>
            </div>
          </div>
        </div>

        {/* Lesson content */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Lesson content card */}
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-default)] p-6 sm:p-8 shadow-[var(--shadow-sm)]">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-16 text-[var(--text-muted)]">
                    <div className="flex gap-2 items-center">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Chargement du contenu...
                    </div>
                  </div>
                }
              >
                <LessonContent chapterId={chapterId} />
              </Suspense>
            </div>

            {/* Quiz section */}
            {quiz && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    🧠 Quiz du chapitre
                  </h2>
                  <span className="text-xs rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-700)] px-3 py-1 font-medium">
                    {quiz.questions.length} question{quiz.questions.length > 1 ? 's' : ''}
                  </span>
                </div>
                <QuizBlock
                  quiz={quiz}
                  userProgressId="temp-progress-id"
                  onComplete={(score, maxScore) => {
                    console.log(`Quiz completed: ${score}/${maxScore}`);
                  }}
                />
              </div>
            )}

            {/* Chapter navigation */}
            <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-8 gap-4">
              {prevChapter ? (
                <Link
                  href={ROUTES.CHAPTER(courseId, prevChapter.id)}
                  className="btn-secondary flex items-center gap-2 min-w-0"
                >
                  <span>←</span>
                  <span className="truncate hidden sm:block">{prevChapter.title}</span>
                  <span className="sm:hidden">Précédent</span>
                </Link>
              ) : (
                <Link href={ROUTES.COURSE(courseId)} className="btn-secondary">
                  ← Vue d&apos;ensemble
                </Link>
              )}

              <Link
                href={ROUTES.COURSE(courseId)}
                className="flex-shrink-0 text-xs text-[var(--text-muted)] hover:text-[var(--interactive-primary)] transition-colors hidden sm:block"
              >
                Tous les chapitres
              </Link>

              {nextChapter ? (
                <Link
                  href={ROUTES.CHAPTER(courseId, nextChapter.id)}
                  className="btn-primary flex items-center gap-2 min-w-0"
                >
                  <span className="truncate hidden sm:block">{nextChapter.title}</span>
                  <span className="sm:hidden">Suivant</span>
                  <span>→</span>
                </Link>
              ) : (
                <div className="btn-secondary opacity-50 cursor-default">
                  Terminé ✅
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* AI Mentor Chat FAB */}
      <MentorChat
        userId="user-id-temp"
        courseId={courseId}
        chapterId={chapterId}
        chapterTitle={chapter.title}
      />
    </div>
  );
}
