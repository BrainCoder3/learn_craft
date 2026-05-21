// Sample data for Firestore seeding
// Use these structures to populate your Firestore database

export const sampleCourses = [
  {
    id: 'react-fundamentals',
    title: 'React: Les Fondamentaux',
    description: 'Apprenez React.js et construisez des interfaces utilisateur interactives avec des composants réutilisables.',
    category: 'frontend',
    level: 'beginner',
    thumbnailUrl: 'https://via.placeholder.com/400x300?text=React+Fundamentals',
    authorId: 'instructor-1',
    authorName: 'Sarah Johnson',
    chapterCount: 8,
    estimatedHours: 12,
    tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
    rating: 4.8,
    enrollmentCount: 5234,
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-05-20'),
  },
  {
    id: 'nodejs-backend',
    title: 'Node.js et Express: Développement Backend',
    description: 'Maîtrisez Node.js et Express pour construire des APIs REST robustes et des serveurs performants.',
    category: 'backend',
    level: 'intermediate',
    thumbnailUrl: 'https://via.placeholder.com/400x300?text=Node.js+Express',
    authorId: 'instructor-2',
    authorName: 'Marc Dupont',
    chapterCount: 10,
    estimatedHours: 15,
    tags: ['Node.js', 'Express', 'Backend', 'API'],
    rating: 4.7,
    enrollmentCount: 3891,
    isPublished: true,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-05-18'),
  },
];

export const sampleChapters = [
  {
    id: 'react-ch1',
    courseId: 'react-fundamentals',
    title: 'Introduction à React',
    description: 'Découvrez les concepts fondamentaux de React et pourquoi il\'s si populaire.',
    order: 1,
    lessonIds: ['lesson-1', 'lesson-2', 'lesson-3'],
    quizId: 'quiz-react-1',
    estimatedMinutes: 45,
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-05-20'),
  },
];

export const sampleLessons = [
  {
    id: 'lesson-1',
    chapterId: 'react-ch1',
    courseId: 'react-fundamentals',
    title: 'Qu\'est-ce que React?',
    content: '<h2>React est une bibliothèque JavaScript</h2><p>React est une bibliothèque de code ouvert créée par Facebook...</p>',
    order: 1,
    codeExamples: [
      {
        id: 'code-1',
        title: 'Composant React simple',
        language: 'jsx',
        code: `function HelloWorld() {
  return <h1>Bonjour React!</h1>;
}

export default HelloWorld;`,
        explanation: 'Ceci est un composant fonctionnel React qui retourne du JSX.',
        output: 'Bonjour React!',
      },
    ],
    resources: [
      {
        id: 'res-1',
        title: 'Documentation React officielle',
        type: 'documentation',
        url: 'https://react.dev',
        description: 'La documentation complète de React',
      },
    ],
    estimatedMinutes: 20,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isPublished: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-05-20'),
  },
];

export const sampleQuiz = {
  id: 'quiz-react-1',
  chapterId: 'react-ch1',
  courseId: 'react-fundamentals',
  title: 'Quiz: Introduction à React',
  description: 'Testez vos connaissances sur les fondamentaux de React',
  questions: [
    {
      id: 'q1',
      quizId: 'quiz-react-1',
      type: 'multiple-choice',
      question: 'Qu\'est-ce que React?',
      options: [
        'Une bibliothèque JavaScript',
        'Un framework backend',
        'Un langage de programmation',
        'Un outil de design',
      ],
      correctAnswer: 'Une bibliothèque JavaScript',
      explanation: 'React est une bibliothèque JavaScript créée par Facebook pour construire des interfaces utilisateur.',
      points: 10,
      order: 1,
    },
    {
      id: 'q2',
      quizId: 'quiz-react-1',
      type: 'true-false',
      question: 'React utilise JSX pour écrire du code.',
      options: ['Vrai', 'Faux'],
      correctAnswer: 'Vrai',
      explanation: 'JSX est une extension de la syntaxe JavaScript qui vous permet d\'écrire du code ressemblant à du HTML.',
      points: 10,
      order: 2,
    },
  ],
  passingScore: 70,
  estimatedMinutes: 15,
  isPublished: true,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-05-20'),
};

export const sampleUserProgress = {
  id: 'progress-user1-react',
  userId: 'user-123',
  courseId: 'react-fundamentals',
  enrolledAt: new Date('2024-05-01'),
  completedLessonIds: ['lesson-1', 'lesson-2'],
  completedChapterIds: [],
  quizScores: [
    {
      quizId: 'quiz-react-1',
      score: 80,
      maxScore: 100,
      attemptCount: 2,
      passedAt: new Date('2024-05-10'),
    },
  ],
  totalXpGained: 150,
  lastAccessedAt: new Date('2024-05-20'),
  isCompleted: false,
};

export const sampleBadges = [
  {
    id: 'badge-first-course',
    name: 'Premier Cours',
    description: 'Terminez votre premier cours',
    iconUrl: 'https://via.placeholder.com/100?text=First+Course',
    criteria: {
      type: 'course-completion' as const,
      threshold: 1,
    },
    createdAt: new Date('2024-01-01'),
  },
];

export const sampleChatMessages = [
  {
    id: 'msg-1',
    userId: 'user-123',
    courseId: 'react-fundamentals',
    chapterId: 'react-ch1',
    role: 'user' as const,
    content: 'Comment fonctionnent les hooks React?',
    timestamp: new Date('2024-05-20T10:00:00'),
  },
  {
    id: 'msg-2',
    userId: 'user-123',
    courseId: 'react-fundamentals',
    chapterId: 'react-ch1',
    role: 'assistant' as const,
    content:
      'Les hooks React sont des fonctions qui vous permettent d\'utiliser l\'état et d\'autres fonctionnalités React sans écrire une classe...',
    timestamp: new Date('2024-05-20T10:00:30'),
    tokens: {
      prompt: 15,
      completion: 45,
    },
  },
];

export const sampleUser = {
  id: 'user-123',
  email: 'student@learncraft.com',
  displayName: 'Jean Dupont',
  avatarUrl: 'https://via.placeholder.com/200?text=JP',
  role: 'student' as const,
  level: 'intermediate' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-05-20'),
  preferences: {
    theme: 'light' as const,
    language: 'fr' as const,
    notificationsEnabled: true,
  },
  badges: ['badge-first-course'],
  totalXp: 450,
};
