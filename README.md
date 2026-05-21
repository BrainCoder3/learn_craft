# LearnCraft - Interactive Web Learning Platform

An interactive web learning platform for programming and tech with AI mentoring, built with Next.js 15, Firebase, and Google Gemini.

## 🎯 Features

- **Interactive Courses**: Structured courses from beginner to advanced levels
- **AI Mentoring**: Real-time AI-powered mentor using Google Gemini 1.5 Flash
- **Interactive Quizzes**: Scored quizzes with instant feedback and explanations
- **Progress Tracking**: Real-time progress tracking with Firestore
- **Code Highlighting**: Syntax-highlighted code examples with Shiki
- **Mobile-First Design**: Fully responsive design with Tailwind CSS v4
- **French Interface**: Complete French UI with English code comments
- **Server Components**: Optimized with React 19 Server Components
- **Streaming Responses**: Real-time streaming for AI chat

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Firebase (Firestore, Auth, Storage)
- **AI**: Google Gemini 1.5 Flash via Next.js API Routes
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js ≥ 18.17.0
- pnpm ≥ 8.0.0
- Firebase account with Firestore enabled
- Google Gemini API key
- Vercel account (optional, for deployment)

## 🚀 Getting Started

### 1. Clone or Setup Project

```bash
cd learnCraft
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

**Required environment variables:**

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Setup Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database (start in test mode for development)
3. Enable Firebase Authentication (Email/Password)
4. Enable Firebase Storage
5. Copy credentials to `.env.local`

#### Firestore Collections Setup

Create these collections in Firestore:

- `users` - User profiles and authentication data
- `courses` - Course definitions
- `chapters` - Chapter information
- `lessons` - Lesson content
- `quizzes` - Quiz questions and metadata
- `userProgress` - Track user progress per course
- `chatMessages` - AI chat conversation history

### 5. Setup Google Gemini API

1. Go to https://ai.google.dev/
2. Click "Get API Key"
3. Create a new API key for your project
4. Add to `.env.local` as `GOOGLE_GENERATIVE_AI_API_KEY`

### 6. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
learnCraft/
├── app/                           # Next.js app directory
│   ├── layout.tsx                # Root layout with auth provider
│   ├── page.tsx                  # Landing page
│   ├── globals.css               # Global styles
│   ├── courses/
│   │   ├── [courseId]/
│   │   │   ├── page.tsx          # Course overview
│   │   │   └── [chapterId]/
│   │   │       └── page.tsx      # Lesson page with quiz & chat
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Gemini streaming endpoint
│   ├── error.tsx                 # Global error boundary
│   ├── not-found.tsx             # 404 page
│   └── loading.tsx               # Loading skeleton
│
├── components/                    # React components
│   ├── ui/
│   │   ├── CourseCard.tsx        # Course display card (Server)
│   │   └── ProgressBar.tsx       # Progress indicator (Client)
│   ├── lesson/
│   │   ├── ChapterContent.tsx    # Lesson content with code examples
│   │   └── QuizBlock.tsx         # Interactive quiz component
│   ├── ai/
│   │   └── MentorChat.tsx        # AI chat sidebar with streaming
│   └── layout/
│       └── Sidebar.tsx           # Navigation sidebar
│
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts                # Firebase auth state
│   ├── useProgress.ts            # Real-time progress tracking
│   └── useChat.ts                # AI chat with streaming
│
├── lib/                           # Utilities and services
│   ├── firebase.ts               # Firebase initialization
│   ├── db.ts                     # Firestore helpers
│   ├── auth-context.tsx          # Auth context provider
│   └── utils.ts                  # Utility functions
│
├── types/                         # TypeScript type definitions
│   └── index.ts                  # All interface definitions
│
├── constants/                     # Application constants
│   └── index.ts                  # UI text, routes, config
│
├── public/                        # Static assets
│
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                      # This file
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start dev server (hot reload)

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm type-check   # Run TypeScript type checking

# Testing
pnpm test         # Run tests once
pnpm test:watch   # Run tests in watch mode
```

## 🗺️ Routing

### Public Routes
- `/` - Landing page with course catalog
- `/courses/[courseId]` - Course overview and chapter list
- `/courses/[courseId]/[chapterId]` - Lesson with quiz and AI chat

### Protected Routes (Auth Required)
- `/profile` - User profile (placeholder)
- `/dashboard` - User dashboard (placeholder)

## 🔐 Security Features

- **Firebase Security Rules**: Configured for data privacy (see `lib/firebase.ts`)
- **TypeScript Strict Mode**: Full type safety throughout
- **Rate Limiting**: In-memory limiter (upgrade to Vercel KV for production)
- **Environment Variables**: Sensitive data never committed to repo
- **CORS Headers**: Security headers on all responses

## 🤖 AI Chat Integration

The AI mentor uses Google Gemini 1.5 Flash with:

- **Streaming Responses**: Real-time streaming for instant feedback
- **Context Awareness**: Chapter-aware responses with course context
- **Rate Limiting**: 20 requests/minute per user
- **Error Handling**: Graceful fallbacks for API failures
- **History Tracking**: Last 50 messages retained for context

### Chat API (`/api/chat`)

```typescript
// Request
POST /api/chat
{
  message: "Comment utiliser les useEffects?",
  courseId: "course-123",
  chapterId: "chapter-456",
  userId: "user-789",
  chapterTitle: "React Hooks",
  previousMessages: []
}

// Response: Streaming text (Server-Sent Events)
// Content streamed as chunked text
```

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'student' | 'instructor' | 'admin';
  level: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    theme: 'light' | 'dark';
    language: 'fr' | 'en';
    notificationsEnabled: boolean;
  };
  badges: string[];
  totalXp: number;
}
```

### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'mobile';
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnailUrl: string;
  chapterCount: number;
  estimatedHours: number;
  rating: number;
  enrollmentCount: number;
}
```

See `types/index.ts` for all type definitions.

## 🎨 Styling

### Tailwind CSS v4 Features
- CSS-first configuration
- Extended color palette with custom theme
- Custom animations and transitions
- Responsive design utilities
- Typography plugin for prose styling

### Custom CSS Classes
```css
.btn-primary     /* Primary button styling */
.btn-secondary   /* Secondary button styling */
.input-base      /* Form input base styling */
.focus-ring      /* Accessible focus states */
```

## 🚀 Deployment

### Deploying to Vercel

1. **Connect Repository**
```bash
npm install -g vercel
vercel link
```

2. **Add Environment Variables**
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add GOOGLE_GENERATIVE_AI_API_KEY
# ... add all other vars from .env.local
```

3. **Deploy**
```bash
vercel deploy --prod
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable Vercel KV for rate limiting
- [ ] Setup Firestore Security Rules
- [ ] Configure CORS if needed
- [ ] Setup monitoring/logging
- [ ] Configure backup strategy
- [ ] Setup domain and SSL

## 🛡️ Firestore Security Rules

See comments in `lib/firebase.ts` for the complete security rules template.

Key points:
- Users can only read their own progress
- Courses are publicly readable
- Quiz scores are only writable by owners
- Chat messages are private to sender

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Server Components by default
3. Mark Client Components with `'use client'`
4. Write French UI text, English comments
5. Run `pnpm lint` and `pnpm format` before committing

## 📝 Code Style

- **Functional components only** - No class components
- **Named exports for components** - Default export for pages
- **Absolute imports** - Use `@/` alias
- **async/await** - No `.then()` chains
- **const over let** - Never use `var`

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Clear cache and reinstall
pnpm store prune
pnpm install
```

### Firebase auth not working
- Check `.env.local` is copied from `.env.local.example`
- Verify Firebase project credentials
- Check Firestore Security Rules allow reads

### AI chat not responding
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
- Check Gemini API is enabled in Google Cloud
- Review rate limiting (20 req/min)

### Tailwind styles not applying
```bash
# Rebuild CSS
pnpm build

# Or in development
# Just save any file to trigger rebuild
```

## 📚 Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions:
1. Check the documentation
2. Search existing GitHub issues
3. Create a new issue with detailed information

---

Built with ❤️ for learning
#   l e a r n _ c r a f t  
 