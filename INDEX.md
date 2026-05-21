# INDEX.md

# Complete File Index - LearnCraft Project

A comprehensive index of all files and their purposes.

---

## 📋 Quick Navigation

- [Configuration Files](#configuration-files)
- [Application Files](#application-files)
- [Documentation](#documentation)
- [Package Management](#package-management)

---

## 📝 Configuration Files

### TypeScript & Build
| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript compiler options (strict mode enabled) |
| `next.config.ts` | Next.js configuration with Turbopack and image optimization |
| `postcss.config.js` | PostCSS configuration for Tailwind CSS |
| `jest.config.ts` | Jest testing framework configuration |
| `jest.setup.js` | Jest setup and mocks |
| `middleware.ts` | Next.js middleware for security headers |

### Code Quality
| File | Purpose |
|------|---------|
| `.eslintrc.json` | ESLint rules for code quality |
| `.prettierrc.json` | Prettier code formatting rules |
| `.gitignore` | Git ignore rules for sensitive files |

### Environment & Deployment
| File | Purpose |
|------|---------|
| `.env.local.example` | Template for environment variables |
| `vercel.json` | Vercel deployment configuration |

---

## 📱 Application Files

### Root Layout & Pages

#### `app/` - Next.js App Router Directory

| File | Type | Purpose |
|------|------|---------|
| `app/layout.tsx` | Layout | Root layout with metadata API, AuthProvider |
| `app/page.tsx` | Page | Landing page with course discovery (Server Component) |
| `app/globals.css` | CSS | Global styles, Tailwind directives, animations |
| `app/error.tsx` | Error Boundary | Global error handling UI |
| `app/not-found.tsx` | 404 Page | Custom 404 page |
| `app/loading.tsx` | Loading State | Loading skeleton component |

### Course Pages

| File | Type | Purpose |
|------|------|---------|
| `app/courses/[courseId]/page.tsx` | Page | Course overview and chapter roadmap |
| `app/courses/[courseId]/[chapterId]/page.tsx` | Page | Lesson content with quiz and AI chat |

### API Routes

| File | Type | Purpose |
|------|------|---------|
| `app/api/chat/route.ts` | Route Handler | Gemini streaming endpoint for AI mentoring |

---

### React Components

#### `components/ui/` - Base UI Components

| File | Type | Purpose |
|------|------|---------|
| `components/ui/CourseCard.tsx` | Server Component | Course display card with hover effects |
| `components/ui/ProgressBar.tsx` | Client Component | Animated progress indicator |

#### `components/lesson/` - Learning Components

| File | Type | Purpose |
|------|------|---------|
| `components/lesson/ChapterContent.tsx` | Client Component | Renders lesson with syntax-highlighted code |
| `components/lesson/QuizBlock.tsx` | Client Component | Interactive quiz with scoring and feedback |

#### `components/ai/` - AI Components

| File | Type | Purpose |
|------|------|---------|
| `components/ai/MentorChat.tsx` | Client Component | Streaming AI chat sidebar |

#### `components/layout/` - Layout Components

| File | Type | Purpose |
|------|------|---------|
| `components/layout/Sidebar.tsx` | Client Component | Navigation sidebar with chapters list |

---

### Custom Hooks

#### `hooks/` - React Hooks (Client-side Only)

| File | Type | Purpose |
|------|------|---------|
| `hooks/useAuth.ts` | Hook | Firebase auth state management |
| `hooks/useProgress.ts` | Hook | Real-time progress tracking with Firestore listeners |
| `hooks/useChat.ts` | Hook | AI chat with streaming and optimistic updates |

---

### Library & Services

#### `lib/` - Utilities & Backend Services

| File | Type | Purpose |
|------|------|---------|
| `lib/firebase.ts` | Config | Firebase initialization, Auth, Firestore, Storage |
| `lib/db.ts` | Service | Firestore collection helpers and query functions |
| `lib/auth-context.tsx` | Context | Auth context provider for global auth state |
| `lib/utils.ts` | Utilities | General utility functions (cn, format, slugify, etc.) |
| `lib/sample-data.ts` | Reference | Sample data structures for Firestore seeding |

---

### Types & Constants

#### `types/` - TypeScript Interfaces

| File | Type | Purpose |
|------|------|---------|
| `types/index.ts` | Types | All TypeScript interfaces (User, Course, Lesson, etc.) |

#### `constants/` - Application Constants

| File | Type | Purpose |
|------|------|---------|
| `constants/index.ts` | Constants | UI text (French), routes, config, rate limits |

---

### Assets

#### `public/` - Static Files

```
public/
├── favicon.ico              # Website favicon
├── apple-touch-icon.png     # iOS home screen icon
└── ...other static assets
```

---

## 📖 Documentation

### Main Documentation

| File | Purpose | Read If |
|------|---------|---------|
| `README.md` | Comprehensive project guide | You're getting started |
| `GETTING_STARTED.md` | Detailed setup instructions | You want step-by-step setup |
| `ARCHITECTURE.md` | System design and architecture | You want to understand the design |
| `DEPLOYMENT.md` | Production deployment guide | You're deploying to production |
| `PROJECT_SUMMARY.md` | High-level project overview | You want a complete summary |
| `INDEX.md` | This file - complete file index | You're looking for a file |

---

## 📦 Package Management

### `package.json`
- Project metadata
- Scripts (dev, build, test, lint, format)
- Dependencies (Next.js, React, Firebase, Tailwind, etc.)
- DevDependencies (TypeScript, ESLint, Jest, etc.)

### `pnpm-lock.yaml`
- Locked dependency versions
- Ensures consistent installs across machines
- Auto-generated by pnpm

---

## 🗂️ Complete Folder Structure

```
learnCraft/
│
├── 📂 app/                                 # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   ├── 📂 courses/[courseId]/
│   │   ├── page.tsx
│   │   └── 📂 [chapterId]/
│   │       └── page.tsx
│   └── 📂 api/chat/
│       └── route.ts
│
├── 📂 components/
│   ├── 📂 ui/
│   │   ├── CourseCard.tsx
│   │   └── ProgressBar.tsx
│   ├── 📂 lesson/
│   │   ├── ChapterContent.tsx
│   │   └── QuizBlock.tsx
│   ├── 📂 ai/
│   │   └── MentorChat.tsx
│   └── 📂 layout/
│       └── Sidebar.tsx
│
├── 📂 hooks/
│   ├── useAuth.ts
│   ├── useProgress.ts
│   └── useChat.ts
│
├── 📂 lib/
│   ├── firebase.ts
│   ├── db.ts
│   ├── auth-context.tsx
│   ├── utils.ts
│   └── sample-data.ts
│
├── 📂 types/
│   └── index.ts
│
├── 📂 constants/
│   └── index.ts
│
├── 📂 public/
│   ├── favicon.ico
│   └── apple-touch-icon.png
│
├── 📄 Configuration Files
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── .eslintrc.json
│   ├── .prettierrc.json
│   ├── jest.config.ts
│   ├── jest.setup.js
│   ├── middleware.ts
│   └── vercel.json
│
├── 📄 Environment Files
│   ├── .env.local.example
│   └── .gitignore
│
├── 📄 Package Files
│   ├── package.json
│   └── pnpm-lock.yaml
│
└── 📄 Documentation
    ├── README.md
    ├── GETTING_STARTED.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    ├── PROJECT_SUMMARY.md
    └── INDEX.md (this file)
```

---

## 🔍 Finding Files by Purpose

### "I want to..."

#### ...add a new page
→ Create file in `app/new-page/page.tsx`

#### ...add a new component
→ Create file in `components/section/NewComponent.tsx`  
→ Add `'use client'` if it uses hooks

#### ...add a new API endpoint
→ Create file in `app/api/endpoint/route.ts`

#### ...add a new type
→ Add interface to `types/index.ts`

#### ...add a constant value
→ Add to `constants/index.ts`

#### ...add a utility function
→ Add to `lib/utils.ts`

#### ...add a database function
→ Add to `lib/db.ts`

#### ...modify styling
→ Edit `app/globals.css` or  
→ Update `tailwind.config.ts` for theme changes

#### ...change build configuration
→ Edit `next.config.ts`

#### ...setup environment variables
→ Copy `.env.local.example` → `.env.local` → fill in values

#### ...deploy to production
→ Read `DEPLOYMENT.md`

---

## 📊 File Statistics

### Code Files
- **TypeScript/TSX**: ~40 files
- **CSS**: 1 main file + Tailwind
- **Total Lines of Code**: ~3,500 LOC

### Documentation
- **README.md**: ~400 lines
- **GETTING_STARTED.md**: ~600 lines
- **ARCHITECTURE.md**: ~250 lines
- **DEPLOYMENT.md**: ~350 lines
- **PROJECT_SUMMARY.md**: ~450 lines
- **Total Documentation**: ~2,050 lines

### Configuration
- **Config Files**: 8 files
- **Package Management**: 2 files

---

## 🚀 Quick File Reference

### Modify These Files To Customize

| Task | File |
|------|------|
| Change UI colors | `tailwind.config.ts` |
| Change French text | `constants/index.ts` or component |
| Change routes | `constants/index.ts` (ROUTES object) |
| Add security headers | `middleware.ts` |
| Configure Firebase | `lib/firebase.ts` (in comments) |
| Change rate limiting | `app/api/chat/route.ts` |
| Modify styles | `app/globals.css` |

### Don't Modify Unless You Know What You're Doing

| File | Why |
|------|-----|
| `tsconfig.json` | Breaks type checking if misconfigured |
| `next.config.ts` | Can break build if incorrect |
| `middleware.ts` | Can block requests if broken |
| `jest.config.ts` | Can break tests if incorrect |

---

## 🔗 File Dependencies

### Core Dependencies

```
app/page.tsx
├── components/ui/CourseCard.tsx
├── lib/db.ts (getCourses)
└── constants/index.ts

app/courses/[courseId]/[chapterId]/page.tsx
├── components/lesson/ChapterContent.tsx
├── components/lesson/QuizBlock.tsx
├── components/ai/MentorChat.tsx
├── components/layout/Sidebar.tsx
├── lib/db.ts
└── types/index.ts

app/api/chat/route.ts
├── @google/generative-ai
├── lib/db.ts (saveChatMessage)
├── constants/index.ts
└── types/index.ts

hooks/useChat.ts
├── types/index.ts
├── lib/db.ts
└── app/api/chat/route.ts
```

---

## 📋 File Checklist

Use this when adding new features:

- [ ] TypeScript types updated in `types/index.ts`
- [ ] Constants updated in `constants/index.ts`
- [ ] Components properly marked with `'use client'` if needed
- [ ] Server Components don't use hooks
- [ ] All imports use `@/` alias
- [ ] Error handling implemented
- [ ] Types are strict (no `any`)
- [ ] Documentation added in JSDoc comments
- [ ] Tests written for new functions
- [ ] Styles follow Tailwind conventions
- [ ] French UI text used in components

---

## 🎓 Learning Path

### For Beginners
1. Start with `README.md`
2. Read `GETTING_STARTED.md`
3. Explore `components/ui/` folder
4. Study `types/index.ts`

### For Intermediate
1. Read `ARCHITECTURE.md`
2. Study `app/api/chat/route.ts`
3. Explore hooks in `hooks/`
4. Understand `lib/db.ts`

### For Advanced
1. Study `middleware.ts`
2. Read Firebase docs
3. Explore Next.js internals
4. Study performance optimizations

---

**Last Updated:** May 2026  
**Project Version:** 1.0.0 (Production Ready)

---

For more help, see [README.md](./README.md) or [GETTING_STARTED.md](./GETTING_STARTED.md)
