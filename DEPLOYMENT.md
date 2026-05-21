# DEPLOYMENT.md

# Production Deployment Guide

Complete guide for deploying LearnCraft to production with best practices.

## 🎯 Deployment Overview

### Deployment Strategy: Vercel + Firebase

```
GitHub Repository
    ↓
Vercel (CI/CD Pipeline)
    ↓
Build & Test
    ↓
Deploy to Edge Network
    ↓
Firebase Backend (Global)
    ↓
Live Application
```

### Timeline
- Build: 2-3 minutes
- Deployment: 1-2 minutes
- Total: 3-5 minutes

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing: `pnpm test`
- [ ] No TypeScript errors: `pnpm type-check`
- [ ] No ESLint warnings: `pnpm lint`
- [ ] All components documented with JSDoc comments
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials or secrets

### Security
- [ ] `.env.local` NOT committed to Git
- [ ] `.gitignore` includes all sensitive files
- [ ] All `NEXT_PUBLIC_*` variables don't contain secrets
- [ ] Firestore Security Rules reviewed and set correctly
- [ ] Firebase Auth methods configured
- [ ] CORS properly configured
- [ ] API rate limiting enabled

### Performance
- [ ] Bundle size analyzed: `npm run build`
- [ ] Images optimized (under 100KB)
- [ ] Code split properly for lazy loading
- [ ] Database indexes created in Firestore
- [ ] CDN caching headers set

### Content
- [ ] Metadata updated (title, description)
- [ ] Favicon added to `/public`
- [ ] Social media preview images ready
- [ ] French UI text proofread
- [ ] Error messages are user-friendly

---

## 🚀 Step-by-Step Deployment

### 1. Prepare Repository

```bash
# Ensure all changes are committed
git status

# Pull latest changes
git pull origin main

# Create feature branch for deployment prep
git checkout -b deploy/production

# Run all checks
pnpm lint
pnpm type-check
pnpm test
pnpm build

# Commit any changes
git add .
git commit -m "chore: prepare for production"

# Push to GitHub
git push origin deploy/production
```

### 2. Update Vercel Secrets

**Via Vercel Dashboard:**

1. Go to Project Settings → Environment Variables
2. Update/add all variables:

```env
# Public (safe to commit prefix removed from value)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=learncraft-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=learncraft-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=learncraft-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Secret (production only)
GOOGLE_GENERATIVE_AI_API_KEY=sk-proj-abc123...

# Optional (for advanced features)
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### 3. Setup Custom Domain

1. **In Vercel Dashboard:**
   - Project → Domains
   - Click "Add"
   - Enter your domain (e.g., `learncraft.com`)

2. **Update DNS Records:**
   - Vercel provides DNS instructions
   - Or update your registrar's nameservers

3. **SSL Certificate:**
   - Vercel automatically provides free SSL
   - Certificate renewed automatically

### 4. Configure Firestore for Production

**Update Security Rules:**

1. Go to Firebase Console → Firestore → Rules
2. Replace test mode rules with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users only
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId);
      allow update, delete: if isOwner(userId) || isAdmin();
    }
    
    // Courses (public read, admin write)
    match /courses/{courseId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
      
      // Chapters subcollection
      match /chapters/{chapterId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();
        
        // Lessons subcollection
        match /lessons/{lessonId} {
          allow read: if isAuthenticated();
          allow write: if isAdmin();
        }
      }
    }
    
    // Quizzes
    match /quizzes/{quizId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    
    // User progress (private)
    match /userProgress/{progressId} {
      allow read, write: if isOwner(resource.data.userId) || isAdmin();
      allow create: if isOwner(request.resource.data.userId);
    }
    
    // Chat messages (private)
    match /chatMessages/{messageId} {
      allow read, write: if isOwner(resource.data.userId);
      allow create: if isOwner(request.resource.data.userId);
    }
    
    // Badges (public read)
    match /badges/{badgeId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

3. Click "Publish"

**Create Firestore Indexes:**

For optimal query performance:

1. Go to Firestore → Indexes
2. Create indexes for:

```
Collection: courses
Index: (category, createdAt desc)
Index: (category, isPublished, createdAt desc)

Collection: chapters
Index: (courseId, order asc)

Collection: lessons
Index: (chapterId, order asc)

Collection: userProgress
Index: (userId, courseId)
Index: (userId, lastAccessedAt desc)

Collection: chatMessages
Index: (userId, chapterId, timestamp desc)
```

### 5. Setup Firebase Authentication

**Production Settings:**

1. Go to Firebase → Authentication
2. Configure authorized domains:
   - Add your production domain
   - Keep localhost:3000 for development

3. Email Templates:
   - Customize email verification
   - Customize password reset

### 6. Enable Rate Limiting (Optional)

**Option A: Vercel KV (Recommended)**

1. Go to Vercel → Storage
2. Create KV database
3. Copy credentials to `.env.local` and Vercel:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

4. Update rate limiter in `lib/db.ts`:
```typescript
// Replace in-memory limiter with Vercel KV
import { kv } from '@vercel/kv';

async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `rate-limit:${userId}`;
  const current = await kv.incr(key);
  if (current === 1) {
    await kv.expire(key, 60); // 1 minute
  }
  return current <= 20; // 20 requests/minute
}
```

**Option B: Keep In-Memory (For MVP)**

- Works fine for < 100 concurrent users
- Resets on deployment (acceptable for most apps)

### 7. Deploy

```bash
# Option 1: Automatic (recommended)
# Push to main branch - Vercel auto-deploys
git checkout main
git merge deploy/production
git push origin main

# Option 2: Manual via CLI
vercel --prod

# Option 3: Vercel Dashboard
# Click "Deploy" button
```

**Verify Deployment:**

```bash
# Check deployment status
vercel status

# Get production URL
vercel ls

# Test API endpoint
curl https://yourdomain.com/api/chat
```

---

## 🔍 Post-Deployment Verification

### Functionality Tests

- [ ] Landing page loads
- [ ] Course listing displays
- [ ] Can navigate to course page
- [ ] Can navigate to lesson page
- [ ] AI chat loads and responds
- [ ] Quiz functionality works
- [ ] Progress tracking works

### Performance Tests

```bash
# Run Lighthouse audit
vercel analytics enable

# Visit https://yourdomain.com
# Open DevTools → Lighthouse
# Run audit
```

**Target Metrics:**
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

### Security Tests

```bash
# Check security headers
curl -I https://yourdomain.com

# Expected headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# X-XSS-Protection: 1; mode=block

# Test CORS
curl -H "Origin: https://example.com" https://yourdomain.com/api/chat
```

### Monitoring Setup

1. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/nextjs
   ```
   - Create Sentry account
   - Add DSN to `.env.local`
   - Wrap app with Sentry

2. **Vercel Analytics** (Performance)
   - Auto-enabled with Next.js
   - View in Vercel Dashboard

3. **Firebase Console**
   - Monitor Firestore usage
   - Track Authentication events
   - View Cloud Function logs

---

## 📊 Scaling Strategy

### Phase 1: MVP (< 1000 users)
- Current setup is sufficient
- Monitor Firestore quota
- Use in-memory rate limiting

### Phase 2: Growth (1K - 10K users)
- Enable Vercel KV for rate limiting
- Setup database backups
- Implement caching strategy
- Setup CDN for large files

### Phase 3: Scale (> 10K users)
- Consider data sharding
- Implement read replicas
- Use Cloud Functions for background jobs
- Setup dedicated database instance

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@main
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          production: true
```

### Setup:

1. Create Vercel tokens in account settings
2. Add to GitHub Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

3. On each push to `main`, GitHub Actions will:
   - Run tests and linting
   - Build the project
   - Deploy to Vercel if all checks pass

---

## 🔐 Production Environment Variables

### Required for Production

```env
# Firebase (from production Firebase project)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (production)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=learncraft-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=learncraft-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=learncraft-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321:web:xyz...

# Gemini API (production key)
GOOGLE_GENERATIVE_AI_API_KEY=sk-proj-... (production)

# App URL (production domain)
NEXT_PUBLIC_APP_URL=https://learncraft.com

# Optional but recommended
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Analytics (optional)
SENTRY_DSN=https://...
```

### How to Rotate Secrets

1. Generate new keys (Firebase, Gemini)
2. Update in Vercel dashboard
3. Trigger new deployment
4. Monitor for errors
5. If issues, rollback to previous version

---

## 🆘 Rollback Procedure

If something goes wrong in production:

**Option 1: Vercel Dashboard Rollback**
1. Go to Deployments
2. Find previous stable deployment
3. Click "Promote to Production"

**Option 2: Git Rollback**
```bash
# Find last stable commit
git log --oneline

# Rollback to specific commit
git revert abc123
git push origin main

# Vercel will auto-deploy
```

---

## 📞 Support During Deployment

### Quick Troubleshooting

**Deployment failed:**
- Check Vercel build logs
- Ensure all environment variables are set
- Run `pnpm build` locally to reproduce

**Blank page in production:**
- Check browser console for errors
- Check Network tab for failed requests
- Verify Firebase credentials are correct

**API errors:**
- Check Cloud Functions logs in Firebase
- Verify rate limiting isn't triggered
- Check error logs in Sentry

---

## 📚 Resources

- [Vercel Deployment Guide](https://vercel.com/docs/concepts/deployments/overview)
- [Firebase Production Guide](https://firebase.google.com/docs/rules)
- [Next.js Production Guide](https://nextjs.org/docs/going-to-production)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)

---

**Deployment checklist completed? Ready to go live!** 🚀
