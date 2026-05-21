# ARCHITECTURE.md

# LearnCraft Architecture

## Overview

LearnCraft is a production-ready, full-stack web learning platform built with modern technologies following industry best practices.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Vercel CDN / Edge                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Next.js 15 (Edge Runtime)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Server Components (RSC)                             │  │
│  │  - Pages: Landing, Course, Chapter, Roadmap         │  │
│  │  - Layouts: Root, Auth Protection                   │  │
│  │  - Streaming: Progressive Rendering                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Node.js Runtime)                        │  │
│  │  - /api/chat: Gemini Streaming Endpoint             │  │
│  │  - Rate Limiting: In-memory (KV for production)     │  │
│  │  - CORS: Configured for security                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Client Components (React 19)                        │  │
│  │  - CourseCard, ProgressBar, QuizBlock               │  │
│  │  - MentorChat: Streaming UI with useOptimistic      │  │
│  │  - Sidebar: Interactive Navigation                  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌──────────────┐  ┌───────────┐
    │  Firebase  │  │  Gemini 1.5  │  │ Vercel KV │
    │ Firestore  │  │     Flash    │  │   (Redis) │
    │   (DB)     │  │      API     │  │  (Cache)  │
    └────────────┘  └──────────────┘  └───────────┘
           │
    ┌──────┴────────┐
    │               │
    ▼               ▼
  Auth        Storage
  (Email)     (Course Assets)
```

## Component Layers

### 1. Presentation Layer (UI)
- **Server Components**: CourseCard, ChapterContent
  - Static rendering when possible
  - Streaming for dynamic content
  - SEO optimized

- **Client Components**: ProgressBar, QuizBlock, MentorChat
  - Interactive state management
  - User event handling
  - Real-time updates

### 2. API Layer
- **Route Handlers** (`/api/chat`)
  - Google Gemini streaming integration
  - Rate limiting and validation
  - Error handling and logging

### 3. Business Logic Layer
- **Hooks** (`useAuth`, `useProgress`, `useChat`)
  - State management
  - Firebase real-time listeners
  - Data transformation

- **Database Layer** (`lib/db.ts`)
  - Firestore collection helpers
  - Query builders
  - CRUD operations

### 4. Data Layer
- **Firebase Firestore**
  - Document-oriented NoSQL
  - Real-time subscriptions
  - Scalable storage

- **Firebase Auth**
  - User authentication
  - Email/password, social login
  - Session management

- **Firebase Storage**
  - Course thumbnails
  - Resource files
  - User avatars

## Data Flow

### 1. Course Discovery Flow
```
User → Landing Page (RSC)
      ↓
   Query Courses (Firestore)
      ↓
   Render CourseCards (RSC)
      ↓
   Display with Tailwind Styling
```

### 2. Learning Flow
```
User → Chapter Page (RSC)
      ↓
   1. Load Chapter Content (Firestore)
   2. Load Lessons (Firestore) → ChapterContent Component
   3. Load Quiz (Firestore) → QuizBlock Component
   4. Initialize Chat State → MentorChat Component
      ↓
   User Interaction
      ↓
   Real-time Updates (Firestore Listeners)
```

### 3. AI Chat Flow
```
User Input → MentorChat Component (Client)
   ↓
useChat Hook → useOptimistic for instant UI
   ↓
POST /api/chat
   ↓
Gemini API (Streaming)
   ↓
Server-Sent Events (SSE)
   ↓
ReadableStream decoded in Browser
   ↓
Real-time UI Updates
   ↓
Save Message (Firestore)
```

### 4. Progress Tracking Flow
```
User Action (Quiz, Lesson Complete)
   ↓
Call saveQuizScore() or completeLessonInProgress()
   ↓
Update Firestore (userProgress collection)
   ↓
useProgress Hook detects change (onSnapshot listener)
   ↓
Real-time UI Update
```

## Database Schema

### Collections

#### `users`
```
{
  id: string (uid),
  email: string,
  displayName: string,
  role: 'student' | 'instructor' | 'admin',
  level: 'beginner' | 'intermediate' | 'advanced',
  preferences: { theme, language, notificationsEnabled },
  badges: string[],
  totalXp: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `courses`
```
{
  id: string,
  title: string,
  description: string,
  category: string,
  level: string,
  thumbnailUrl: string,
  authorId: string,
  chapterCount: number,
  estimatedHours: number,
  rating: number,
  enrollmentCount: number,
  isPublished: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `userProgress`
```
{
  id: string,
  userId: string,
  courseId: string,
  enrolledAt: Timestamp,
  completedLessonIds: string[],
  completedChapterIds: string[],
  quizScores: QuizScore[],
  totalXpGained: number,
  lastAccessedAt: Timestamp,
  isCompleted: boolean,
  completedAt?: Timestamp
}
```

## Performance Optimizations

### 1. Server-Side Rendering
- Next.js 15 App Router for file-based routing
- Server Components for pages and layouts
- Reduced JavaScript bundle size

### 2. Streaming and Suspense
```typescript
<Suspense fallback={<Loading />}>
  <ChapterContent_Suspense chapterId={chapterId} />
</Suspense>
```

### 3. Real-Time Updates
- Firestore `onSnapshot` listeners
- React 19 `useOptimistic` for instant UI feedback
- Minimal re-renders

### 4. Image Optimization
- Next.js Image component
- Lazy loading
- Responsive srcset

### 5. Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting
- Tree shaking enabled

## Security Measures

### 1. Firestore Security Rules
- Row-level security (RLS) for user data
- Public read access for courses
- Owner-only writes for user progress

### 2. Environment Variables
- Never commit secrets to repository
- Use `.env.local` for development
- Vercel secrets for production

### 3. API Validation
- Rate limiting on chat endpoint
- Input sanitization
- Error handling

### 4. CORS and Headers
- Security headers via middleware
- X-Frame-Options
- X-Content-Type-Options

## Scalability

### Horizontal Scaling
- Stateless Next.js servers (Vercel)
- Distributed databases (Firestore)
- CDN for static content

### Vertical Scaling
- Caching strategies (Redis KV)
- Database indexing (Firestore)
- Query optimization

### Cost Optimization
- Server Components reduce bundle size
- Caching minimizes API calls
- CDN reduces bandwidth

## Monitoring & Observability

### Recommended Tools
- **Vercel Analytics**: Performance metrics
- **Sentry**: Error tracking
- **Firebase Console**: Database monitoring
- **Google Cloud Monitoring**: API metrics

### Key Metrics
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Error rate and exceptions

## Deployment Pipeline

```
Git Push
  ↓
GitHub Workflow (CI/CD)
  ↓
[Build] pnpm install && pnpm build
  ↓
[Test] pnpm lint && pnpm type-check
  ↓
[Deploy] Vercel Deployment
  ↓
Environment Variables Injected
  ↓
Live on Vercel CDN
```

## Future Enhancements

1. **Offline Support**: PWA with service workers
2. **Real-time Collaboration**: Multi-user lessons
3. **Video Streaming**: HLS/DASH for video content
4. **Advanced Analytics**: User learning analytics
5. **Certification**: Completion certificates
6. **Gamification**: Advanced badge system
7. **Mobile App**: React Native version
8. **GraphQL**: Consider for complex queries

---

For more details, see README.md and individual component documentation.
