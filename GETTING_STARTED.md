# GETTING STARTED

Complete step-by-step guide to set up LearnCraft locally and deploy to production.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Node.js** ≥ 18.17.0 ([Download](https://nodejs.org/))
- **pnpm** ≥ 8.0.0 (install with: `npm install -g pnpm`)
- **Git** ([Download](https://git-scm.com/))
- **Firebase account** ([Create free](https://firebase.google.com/))
- **Google account** (for Gemini API)
- **Vercel account** (optional, for deployment) ([Create free](https://vercel.com/))

## 🚀 Quick Start (5 minutes)

### 1. Clone or Setup

If starting fresh:
```bash
cd learnCraft
```

### 2. Install Dependencies

```bash
pnpm install
```

Expected output: `Progress: resolved 30, reused 28, downloaded 2, added 2`

### 3. Copy Environment Template

```bash
cp .env.local.example .env.local
```

### 4. Fill in Firebase Credentials

Open `.env.local` and replace placeholders:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=learncraft-xyz.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=learncraft-xyz
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=learncraft-xyz.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...

GOOGLE_GENERATIVE_AI_API_KEY=sk-proj-...
```

### 5. Run Development Server

```bash
pnpm dev
```

Output should show:
```
▲ Next.js 15.0.3
  - Local:        http://localhost:3000
  - Environments: .env.local

Ready in 2.5s
```

✅ **Success!** Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Detailed Setup Guide

### Step 1: Create Firebase Project

1. **Go to [Firebase Console](https://console.firebase.google.com/)**

2. **Click "Create a Project"**
   - Project name: `learncraft` (or any name)
   - Google Analytics: Optional
   - Click "Create project"

3. **Wait for project creation** (1-2 minutes)

### Step 2: Enable Firebase Services

#### A. Firestore Database
1. In left sidebar → **Build** → **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode**
   - ⚠️ WARNING: Test mode allows anyone to read/write
   - In production, you must set proper security rules (see README.md)
4. Select region: **europe-west1** (or closest to you)
5. Click **Enable**

#### B. Authentication
1. Left sidebar → **Build** → **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider
   - Provider: Email/Password
   - Enable "Email link (passwordless sign-in)" (optional)
   - Click **Enable** → **Save**

#### C. Storage
1. Left sidebar → **Build** → **Storage**
2. Click **Get started**
3. Choose **Start in test mode** (same warning as Firestore)
4. Select region: **europe-west1**
5. Click **Done**

### Step 3: Get Firebase Credentials

1. **Go to Project Settings**
   - Click ⚙️ icon → **Project Settings**

2. **Go to General tab**

3. **Find "Your apps" section** at bottom

4. **Create Web App** (if not exists)
   - Click `</>` icon
   - App nickname: `learncraft-web`
   - Click **Register app**

5. **Copy the Firebase Config**
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD...",  ← COPY THIS
     authDomain: "learncraft-xyz.firebaseapp.com",  ← COPY THIS
     projectId: "learncraft-xyz",  ← COPY THIS
     storageBucket: "learncraft-xyz.appspot.com",  ← COPY THIS
     messagingSenderId: "123456789",  ← COPY THIS
     appId: "1:123456789:web:abc...",  ← COPY THIS
   };
   ```

6. **Paste values into `.env.local`**
   - Remove `NEXT_PUBLIC_` prefix from config keys
   - Add `NEXT_PUBLIC_` prefix to each value in `.env.local`

### Step 4: Get Gemini API Key

1. **Go to [ai.google.dev](https://ai.google.dev/)**

2. **Click "Get API Key"**

3. **Select project**
   - If prompted, select your Firebase project
   - If not shown, click "Create new project"

4. **Click "Create API Key"**

5. **Copy the key** (looks like: `sk-proj-abc123...`)

6. **Paste into `.env.local`**
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=sk-proj-abc123...
   ```

### Step 5: Setup Firestore Collections

For development/testing with sample data:

1. **Go to Firestore Database**

2. **Create Collections** (click "Start collection"):

   ```
   Collection: users
   ├── Document: user-123
   └── Fields: (from sample-data.ts)
   
   Collection: courses
   ├── Document: react-fundamentals
   └── Fields: (from sample-data.ts)
   
   Collection: chapters
   Collection: lessons
   Collection: quizzes
   Collection: userProgress
   Collection: chatMessages
   Collection: badges
   ```

3. **For quick testing**, just click "Start collection" and use the UI or:
   - Use the sample data in `lib/sample-data.ts`
   - Import programmatically via admin SDK

### Step 6: Start Development Server

```bash
pnpm dev
```

Navigate to http://localhost:3000 and start exploring!

---

## 🛠️ Development Commands

### Common Tasks

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server (after build)
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Watch tests
pnpm test:watch
```

### Useful Patterns

**Add a new page:**
```bash
# Create app/new-page/page.tsx
```

**Add a new component:**
```bash
# Create components/section/NewComponent.tsx
# Add 'use client' if it uses hooks
```

**Add a new API route:**
```bash
# Create app/api/new-route/route.ts
```

---

## 🚀 Deployment to Vercel

### Option 1: Automatic from GitHub

**Easiest method:**

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/learncraft.git
   git push -u origin main
   ```

2. **Go to [Vercel](https://vercel.com/new)**

3. **Import from GitHub**
   - Select your `learncraft` repository
   - Click **Import**

4. **Configure Project**
   - Framework: Next.js ✓ (auto-detected)
   - Root Directory: ./
   - Leave build settings default

5. **Add Environment Variables**
   - Click "Environment Variables"
   - Add all variables from `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
     - `GOOGLE_GENERATIVE_AI_API_KEY`

6. **Click "Deploy"**

✅ **Your app is live!** Vercel provides a `.vercel.app` URL

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Add environment variables when prompted
# - Wait for deployment
```

### Option 3: Manual Deployment (Advanced)

```bash
# Build locally
pnpm build

# Upload .next folder and package.json to your server
# Run: pnpm start
```

---

## 🔐 Production Checklist

Before going live:

- [ ] **Environment Variables**
  - [ ] All `NEXT_PUBLIC_*` variables set
  - [ ] `GOOGLE_GENERATIVE_AI_API_KEY` set
  - [ ] `NODE_ENV=production`

- [ ] **Firestore Security Rules**
  - [ ] Update security rules (see `lib/firebase.ts` comments)
  - [ ] Test read/write permissions

- [ ] **Firebase Auth**
  - [ ] Enable additional auth methods if needed
  - [ ] Setup email templates
  - [ ] Configure authorized domains

- [ ] **Vercel KV (Optional)**
  - [ ] Setup Redis for rate limiting
  - [ ] Update `RATE_LIMIT` config in `constants/index.ts`

- [ ] **Domain**
  - [ ] Add custom domain to Vercel
  - [ ] Setup SSL certificate (auto with Vercel)

- [ ] **Monitoring**
  - [ ] Setup Sentry for error tracking
  - [ ] Enable Vercel Analytics
  - [ ] Setup Firebase monitoring

- [ ] **Testing**
  - [ ] Run `pnpm test`
  - [ ] Manual testing on production URL
  - [ ] Cross-browser testing

---

## 🐛 Troubleshooting

### "Cannot find module '@/...'"
```bash
# Make sure tsconfig.json has paths configured:
"paths": {
  "@/*": ["./*"]
}

# Then restart dev server
pnpm dev
```

### "Firebase config is missing"
```bash
# Verify .env.local exists and has all NEXT_PUBLIC_* variables:
cat .env.local | grep NEXT_PUBLIC

# Restart dev server if you just added variables:
pnpm dev
```

### "Gemini API returning errors"
```bash
# Check API key is valid:
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY"

# Check API is enabled in Google Cloud:
# https://console.cloud.google.com/apis/
```

### "Firestore permission denied"
```bash
# Update Firestore security rules:
# 1. Go to Firebase Console → Firestore → Rules
# 2. Paste rules from lib/firebase.ts (in comment block)
# 3. Update "test mode" to actual rules
# 4. Publish changes
```

### "Port 3000 already in use"
```bash
# Use different port:
pnpm dev -- -p 3001

# Or kill process using port 3000:
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -ti:3000 | xargs kill -9
```

### Build fails with "Turbopack error"
```bash
# Disable Turbopack temporarily in next.config.ts:
turbopack: undefined,

# Or rebuild:
pnpm build --no-cache
```

---

## 📚 Additional Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tutorials
- [Next.js Tutorial](https://nextjs.org/learn)
- [Firebase Getting Started](https://firebase.google.com/docs/build)
- [Gemini API Guide](https://ai.google.dev/tutorials)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## ❓ FAQ

**Q: Can I use this for production?**
A: Yes, this is production-ready code following all best practices.

**Q: What's the monthly cost?**
A: Free tier should work for small projects. See Firebase & Google Cloud pricing for scale.

**Q: Can I modify the UI?**
A: Absolutely! All components use Tailwind CSS and can be customized.

**Q: How do I add more courses?**
A: Add documents to Firestore `courses` collection with the structure from `types/index.ts`.

**Q: Can I self-host instead of using Vercel?**
A: Yes, any Node.js hosting works (Railway, Fly.io, DigitalOcean, AWS, etc.).

---

## 📞 Support

1. Check README.md for comprehensive documentation
2. Read ARCHITECTURE.md for system design
3. Search existing GitHub issues
4. Check troubleshooting section above
5. Ask in community forums (Stack Overflow, Discord)

---

Happy Learning! 🚀

Built with ❤️ for educators and learners
