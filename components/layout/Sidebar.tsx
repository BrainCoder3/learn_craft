// components/layout/Sidebar.tsx
'use client';

import { useRouter } from '@/i18n/routing';
import { useState } from 'react';
import { Chapter } from '@/types/index';
import { ROUTES } from '@/constants/index';

interface SidebarProps {
  courseId: string;
  chapters: Chapter[];
  currentChapterId?: string;
}

/**
 * Client Component - navigation sidebar for course chapters, using design tokens
 */
export function Sidebar({ courseId, chapters, currentChapterId }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const currentIndex = chapters.findIndex((c) => c.id === currentChapterId);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        id="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-[var(--interactive-primary)] text-[var(--interactive-primary-text)] shadow-[var(--shadow-lg)] md:hidden hover:bg-[var(--interactive-primary-hover)] transition-colors"
        aria-label="Basculer la navigation"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-30 w-72 flex flex-col clay-card transition-transform duration-300 md:relative md:translate-x-0 md:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-default)] px-5 py-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--text-accent)] bg-clip-text text-transparent"
            >
              📚 LearnCraft
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
            >
              ✕
            </button>
          </div>

          {/* Progress summary */}
          {chapters.length > 0 && (
            <div className="px-5 py-3 border-b border-[var(--border-default)] bg-[var(--bg-subtle)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1.5">
                <span>Progression</span>
                <span>{currentIndex + 1}/{chapters.length}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-[var(--bg-muted)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--text-accent)] transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / chapters.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Chapter list */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Chapitres
            </p>
            <ul className="space-y-1">
              {chapters.map((chapter, idx) => {
                const isActive = currentChapterId === chapter.id;
                const isDone = idx < currentIndex;
                return (
                  <li key={chapter.id}>
                    <button
                      id={`sidebar-chapter-${chapter.id}`}
                      onClick={() => {
                        router.push(ROUTES.CHAPTER(courseId, chapter.id) as Parameters<typeof router.push>[0]);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-left transition-all duration-150 ${
                        isActive
                          ? 'bg-[var(--interactive-primary)] text-[var(--interactive-primary-text)] font-semibold shadow-[var(--shadow-sm)]'
                          : isDone
                          ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDone
                          ? 'bg-[var(--color-success-100)] text-[var(--color-success-700)]'
                          : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </span>
                      <span className="truncate flex-1">{chapter.title}</span>
                      {chapter.quizId && (
                        <span className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-brand-100)] text-[var(--color-brand-700)]'
                        }`}>
                          Quiz
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-[var(--border-default)] p-4">
            <button
              onClick={() => router.push(ROUTES.COURSE(courseId) as Parameters<typeof router.push>[0])}
              className="flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--interactive-primary)] transition-colors"
            >
              ← Vue d&apos;ensemble du cours
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 clay-overlay md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
