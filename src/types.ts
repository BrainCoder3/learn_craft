/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ItemType = 'lesson' | 'exercise' | 'project';

export interface Course {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  studentCount?: number;
  thumbnail?: string;
  icon?: string;
  enrolledCount?: number;
}

export interface Chapter {
  id: string;
  courseId: string;
  chapterNumber: number;
  title: string;
  description: string;
  lessonCount: number;
  duration: string;
}

export interface LearningItem {
  id: string;
  chapterId: string;
  courseId: string;
  title: string;
  order: number;
  type: ItemType;
  // Specific properties
  content?: string; // markdown for lessons
  question?: string; // prompt for exercises
  options?: string[]; // multiple choice options if any for exercises
  answer?: string; // correct answer / keywords
  requirements?: string[]; // requirements list for projects
  hints?: string[]; // hints list for projects
}

export interface UserProgress {
  userId: string;
  itemId: string;
  courseId: string;
  completed: boolean;
  score?: number;
  submittedAnswer?: string;
  completedAt?: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorEmail: string;
  title: string;
  content: string;
  likes: number;
  likedBy: string[]; // List of emails who liked
  commentsCount: number;
  createdAt: string;
  category: string;
  comments?: PostComment[];
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

export interface ProjectSubmission {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  itemId: string;
  itemTitle: string;
  courseId: string;
  submissionText: string;
  feedback?: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
}

export interface UserStats {
  chaptersDone: number;
  totalChapters: number;
  projectsBuilt: number;
  percentComplete: number;
  timeSpentMinutes: number;
  streak?: number;
}
