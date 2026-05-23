import React from 'react';
import { Terminal, Lightbulb, Zap, BarChart3, Gamepad2, Code2, Database, BookOpen } from 'lucide-react';

interface CourseIconProps {
  course: {
    id: string;
    title: string;
    icon?: string;
  };
  className?: string; // Kept for interface compatibility
}

function getCourseIconDetails(id: string, title: string) {
  const normId = id.toLowerCase();
  const normTitle = title.toLowerCase();

  // 0. Electronics / Current
  if (
    normId === 'electronics-current' ||
    normId.includes('electronic') ||
    normId.includes('circuit') ||
    normTitle.includes('electronic') ||
    normTitle.includes('courant') ||
    normTitle.includes('circuits') ||
    normTitle.includes('electrical') ||
    normTitle.includes('électricité') ||
    normTitle.includes('électronique')
  ) {
    return {
      Icon: Zap,
      bgColor: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
    };
  }

  // 1. Python Basic
  if (normId === 'py-basic' || normId === 'basic-python' || (normTitle.includes('python') && normTitle.includes('bas'))) {
    return {
      Icon: Terminal,
      bgColor: 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-400',
    };
  }

  // 2. Python for Data Science
  if (normId === 'py-ds' || normId.includes('datascience') || normTitle.includes('science des données') || normTitle.includes('data science')) {
    return {
      Icon: BarChart3,
      bgColor: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400',
    };
  }

  // 3. Python for Game Dev
  if (normId === 'py-game' || normId.includes('game') || normTitle.includes('jeux vidéo') || normTitle.includes('game dev')) {
    return {
      Icon: Gamepad2,
      bgColor: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400',
    };
  }

  // 4. Advanced TypeScript / JavaScript
  if (
    normId === 'ts-advanced' || 
    normId === 'basic-javascript' || 
    normId.includes('typescript') || 
    normId.includes('javascript') || 
    normTitle.includes('typescript') || 
    normTitle.includes('javascript')
  ) {
    return {
      Icon: Code2,
      bgColor: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400',
    };
  }

  // 5. Fullstack Express
  if (normId === 'fullstack-express' || normId.includes('express') || normTitle.includes('fullstack') || normTitle.includes('api')) {
    return {
      Icon: Database,
      bgColor: 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400',
    };
  }

  // Fallbacks based on keywords in title
  if (normTitle.includes('python')) {
    return { Icon: Terminal, bgColor: 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-400' };
  }
  if (normTitle.includes('data') || normTitle.includes('analyse')) {
    return { Icon: BarChart3, bgColor: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400' };
  }
  if (normTitle.includes('game') || normTitle.includes('jeux') || normTitle.includes('jeu')) {
    return { Icon: Gamepad2, bgColor: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400' };
  }
  if (normTitle.includes('code') || normTitle.includes('programmation')) {
    return { Icon: Code2, bgColor: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-400' };
  }

  return {
    Icon: BookOpen,
    bgColor: 'bg-slate-100 dark:bg-slate-950/40 text-slate-800 dark:text-slate-400',
  };
}

export default function CourseIcon({ course }: CourseIconProps) {
  const { Icon, bgColor } = getCourseIconDetails(course.id, course.title);

  return (
    <div className={`w-full h-full flex items-center justify-center ${bgColor} select-none transition-colors duration-300`}>
      <Icon className="w-3/5 h-3/5 stroke-[2.5]" />
    </div>
  );
}
