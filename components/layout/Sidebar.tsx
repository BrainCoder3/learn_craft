// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Chapter } from '@/types/index';
import { ROUTES } from '@/constants/index';

interface SidebarProps {
  courseId: string;
  chapters: Chapter[];
  currentChapterId?: string;
}

/**
 * Client Component - navigation sidebar for course chapters
 */
export function Sidebar({ courseId, chapters, currentChapterId }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 rounded-lg bg-primary-600 p-3 text-white shadow-lg md:hidden hover:bg-primary-700"
        aria-label="Basculer la navigation"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-30 w-64 transform bg-gray-900 text-white shadow-lg transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-700 p-6">
            <Link href={ROUTES.HOME} className="flex items-center gap-3 font-bold text-lg">
              <span className="text-2xl">📚</span>
              <span>LearnCraft</span>
            </Link>
          </div>

          {/* Chapters list */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 text-xs font-semibold uppercase text-gray-400">Chapitres</p>

            <ul className="space-y-2">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    href={ROUTES.CHAPTER(courseId, chapter.id)}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                      currentChapterId === chapter.id
                        ? 'bg-primary-600 font-semibold text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>📖</span>
                      <span className="truncate">{chapter.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-700 p-4">
            <Link
              href={ROUTES.HOME}
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Retour aux cours
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
