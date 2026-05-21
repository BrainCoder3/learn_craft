// components/ui/CourseCard.tsx
// Server Component - no 'use client' directive

import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/types/index';
import { ROUTES } from '@/constants/index';

interface CourseCardProps {
  course: Course;
}

/**
 * Server Component - displays a single course as a card
 * Fully rendered on server for optimal SEO and performance
 */
export async function CourseCard({ course }: CourseCardProps) {
  const categoryLabels: Record<string, string> = {
    frontend: 'Front-end',
    backend: 'Back-end',
    fullstack: 'Full-stack',
    devops: 'DevOps',
    mobile: 'Mobile',
  };

  const levelLabels: Record<string, string> = {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
  };

  return (
    <Link href={ROUTES.COURSE(course.id)}>
      <article className="group relative h-full overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary-500 bg-white">
        {/* Thumbnail */}
        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-2xl">📚</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col p-4">
          {/* Category badge */}
          <span className="mb-2 inline-block w-fit rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            {categoryLabels[course.category]}
          </span>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">{course.description}</p>

          {/* Metadata */}
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">⏱️ {course.estimatedHours}h</span>
            <span className="flex items-center gap-1">
              👥 {course.enrollmentCount.toLocaleString('fr-FR')}
            </span>
            <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800 font-medium">
              ★ {course.rating.toFixed(1)}
            </span>
          </div>

          {/* Level indicator */}
          <span className="mt-2 text-xs font-medium text-gray-600">
            Niveau: {levelLabels[course.level]}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 -inset-1 rounded-lg border-2 border-primary-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10 pointer-events-none" />
      </article>
    </Link>
  );
}
