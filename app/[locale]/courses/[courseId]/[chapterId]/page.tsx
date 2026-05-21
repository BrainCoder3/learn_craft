// app/courses/[courseId]/[chapterId]/page.tsx
import { notFound } from 'next/navigation';
import { getChapter, getLessonsByChapter, getQuiz } from '@/lib/db';
import { ChapterContent } from '@/components/lesson/ChapterContent';
import { QuizBlock } from '@/components/lesson/QuizBlock';
import { MentorChat } from '@/components/ai/MentorChat';
import { Sidebar } from '@/components/layout/Sidebar';
import { getChaptersByCourse } from '@/lib/db';
import Link from 'next/link';
import { ROUTES } from '@/constants/index';
import { Suspense } from 'react';

interface ChapterPageProps {
  params: Promise<{ courseId: string; chapterId: string }>;
}

/**
 * Chapter/Lesson page with content, quiz, and AI chat
 * Server Component with streaming support
 */
export async function generateStaticParams() {
  // ISR strategy - rebuild on-demand
  return [];
}

async function ChapterContent_Suspense({ chapterId }: { chapterId: string }) {
  const lessons = await getLessonsByChapter(chapterId);

  if (lessons.length === 0) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <p className="text-yellow-800">Aucune leçon disponible dans ce chapitre.</p>
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

  // Fetch data in parallel
  const [chapter, chapters, quiz] = await Promise.all([
    getChapter(chapterId),
    getChaptersByCourse(courseId),
    getQuiz(chapterId).catch(() => null), // Quiz is optional
  ]);

  if (!chapter) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar navigation */}
      <Sidebar courseId={courseId} chapters={chapters} currentChapterId={chapterId} />

      {/* Main content */}
      <main className="flex-1 md:ml-0">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <Link
              href={ROUTES.COURSE(courseId)}
              className="text-sm text-primary-600 hover:text-primary-700 mb-4 inline-block transition-colors"
            >
              ← Retour au cours
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{chapter.title}</h1>
            <p className="text-gray-600 mt-2">{chapter.description}</p>
          </div>
        </div>

        {/* Content area */}
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Lesson content */}
            <div className="mb-12 rounded-lg border border-gray-200 bg-white p-8">
              <Suspense fallback={<div className="text-center py-8">Chargement du contenu...</div>}>
                <ChapterContent_Suspense chapterId={chapterId} />
              </Suspense>
            </div>

            {/* Quiz section */}
            {quiz && (
              <div className="mb-12">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">Quiz</h2>
                <div className="rounded-lg border border-gray-200 bg-white p-8">
                  <QuizBlock
                    quiz={quiz}
                    userProgressId="temp-progress-id"
                    onComplete={(score, maxScore) => {
                      console.log(`Quiz completed: ${score}/${maxScore}`);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Navigation footer */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-8 mt-12">
              <Link
                href={ROUTES.CHAPTER(
                  courseId,
                  chapters[chapters.findIndex((c) => c.id === chapterId) - 1]?.id || '',
                )}
                className="btn-secondary"
              >
                ← Chapitre précédent
              </Link>
              <Link href={ROUTES.COURSE(courseId)} className="btn-secondary">
                Tous les chapitres
              </Link>
              <Link
                href={ROUTES.CHAPTER(
                  courseId,
                  chapters[chapters.findIndex((c) => c.id === chapterId) + 1]?.id || '',
                )}
                className="btn-secondary"
              >
                Chapitre suivant →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* AI Mentor Chat */}
      <MentorChat
        userId="user-id-temp"
        courseId={courseId}
        chapterId={chapterId}
        chapterTitle={chapter.title}
      />
    </div>
  );
}
