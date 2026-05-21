// constants/index.ts

export const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 20,
  TOKENS_PER_HOUR: 10000,
} as const;

export const GEMINI_CONFIG = {
  MODEL: 'gemini-1.5-flash',
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,
  TOP_P: 0.9,
} as const;

export const UI_TEXT = {
  COMMON: {
    LOADING: 'Chargement...',
    ERROR: 'Une erreur est survenue',
    SUCCESS: 'Succès',
    CANCEL: 'Annuler',
    SAVE: 'Enregistrer',
    DELETE: 'Supprimer',
    EDIT: 'Modifier',
    BACK: 'Retour',
    NEXT: 'Suivant',
    PREVIOUS: 'Précédent',
  },
  COURSES: {
    TITLE: 'Cours',
    MY_COURSES: 'Mes cours',
    EXPLORE: 'Explorer tous les cours',
    ENROLL: 'S\'inscrire',
    ENROLLED: 'Inscrit',
    HOURS: 'heures',
    STUDENTS: 'étudiants',
  },
  LESSONS: {
    TITLE: 'Leçons',
    LESSON_COMPLETE: 'Leçon terminée',
    NEXT_LESSON: 'Leçon suivante',
    START_QUIZ: 'Commencer le quiz',
  },
  QUIZ: {
    TITLE: 'Quiz',
    START: 'Commencer',
    SUBMIT: 'Soumettre',
    SCORE: 'Score',
    PASSED: 'Réussi',
    FAILED: 'Échoué',
    PASSING_SCORE: 'Score de passage',
  },
  CHAT: {
    MENTOR: 'Mentor IA',
    ASK_QUESTION: 'Poser une question...',
    SEND: 'Envoyer',
    TYPING: 'Le mentor est en train d\'écrire...',
  },
  AUTH: {
    LOGIN: 'Se connecter',
    LOGOUT: 'Se déconnecter',
    SIGNUP: 'S\'inscrire',
    EMAIL: 'Email',
    PASSWORD: 'Mot de passe',
    WELCOME: 'Bienvenue',
  },
  ERRORS: {
    NETWORK: 'Erreur réseau. Veuillez vérifier votre connexion.',
    AUTH: 'Authentification échouée. Veuillez réessayer.',
    RATE_LIMIT: 'Trop de requêtes. Veuillez attendre avant de continuer.',
    NOT_FOUND: 'Ressource non trouvée',
  },
} as const;

export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE: (courseId: string) => `/courses/${courseId}`,
  CHAPTER: (courseId: string, chapterId: string) =>
    `/courses/${courseId}/${chapterId}`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  DASHBOARD: '/dashboard',
} as const;

export const COURSE_CATEGORIES = [
  'frontend',
  'backend',
  'fullstack',
  'devops',
  'mobile',
] as const;

export const USER_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  CHAPTERS: 'chapters',
  LESSONS: 'lessons',
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quizQuestions',
  USER_PROGRESS: 'userProgress',
  BADGES: 'badges',
  CHAT_MESSAGES: 'chatMessages',
} as const;

export const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
