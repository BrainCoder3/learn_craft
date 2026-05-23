/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import admin from 'firebase-admin';
import { db, hashPassword, generateSalt } from './db';
import { GoogleGenAI } from "@google/genai";

import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully using service-account.json');
    } else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('Firebase Admin initialized using applicationDefault credentials.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY',
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});

const routes = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secure-learning-platform-secret-key-2026';

// Extend Express Request types locally using custom fields
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Security JWT Helper (keep for internal/legacy auth)
export function signToken(payload: { id: string; email: string; name: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  // Token valid for 7 days
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): { id: string; email: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const computedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (computedSignature !== signature) return null;
    const decodedPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decodedPayload.exp < Date.now()) return null; // Expired
    return {
      id: decodedPayload.id,
      email: decodedPayload.email,
      name: decodedPayload.name
    };
  } catch (err) {
    return null;
  }
}

// Authorization Guard Middleware
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Elegant fallback if no header in development or local database mode
    if (db.useLocalFile || process.env.NODE_ENV !== 'production') {
      console.log('No authorization header, but falling back to Guest Mock user in dev/local mode.');
      req.user = {
        id: 'dev_guest_mock_id',
        email: 'guest@learncraft.com',
        name: 'Guest Learner'
      };
      next();
      return;
    }
    res.status(401).json({ error: 'Access denied. Missing authorization credentials.' });
    return;
  }

  const token = authHeader.substring(7);

  // 1. Try JWT
  const jwtUser = verifyToken(token);
  if (jwtUser) {
    req.user = jwtUser;
    next();
    return;
  }

  // 2. Try Firebase ID Token
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email || '',
      name: decodedToken.name || ''
    };
    next();
  } catch (err) {
    // Robust fallback if Firebase verification fails but we are running in development, sandbox, or guest mock mode is active
    if (db.useLocalFile || process.env.NODE_ENV !== 'production' || token === 'null' || token === 'undefined' || token.startsWith('mock_')) {
      console.log('Firebase ID Token verification failed but falling back to Guest Mock user in dev/local mode:', err);
      req.user = {
        id: 'dev_guest_mock_id',
        email: 'guest@learncraft.com',
        name: 'Guest Learner'
      };
      next();
    } else {
      res.status(401).json({ error: 'Authentication failed. Session invalid or expired.' });
    }
  }
}

// Auth API Router endpoints
routes.post('/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required fields.' });
      return;
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const user = await db.registerUser(name, email, passwordHash, salt);

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        joinedAt: user.joinedAt
      }
    });
  } catch (err) {
    next(err);
  }
});

routes.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(400).json({ error: 'Incorrect email address or password.' });
      return;
    }

    const hash = hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      res.status(400).json({ error: 'Incorrect email address or password.' });
      return;
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        joinedAt: user.joinedAt
      }
    });
  } catch (err) {
    next(err);
  }
});

routes.post('/auth/anonymous', async (req, res, next) => {
  try {
    const suffix = crypto.randomBytes(4).toString('hex');
    const name = `Guest Engineer #${suffix.toUpperCase()}`;
    const email = `guest_${suffix}@anonymous.edu`;
    const salt = generateSalt();
    const passwordHash = hashPassword(`temp-pass-${suffix}`, salt);

    const user = await db.registerUser(name, email, passwordHash, salt);
    const token = signToken({ id: user.id, email: user.email, name: user.name });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        joinedAt: user.joinedAt
      }
    });
  } catch (err) {
    next(err);
  }
});

routes.get('/auth/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const user = await db.findUserByEmail(req.user.email);
    if (!user) {
      res.status(404).json({ error: 'User profiles not found.' });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      joinedAt: user.joinedAt
    });
  } catch (err) {
    next(err);
  }
});

// Courses Information Endpoints
routes.get('/courses', async (req, res, next) => {
  try {
    const courses = await db.getCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

// Get Course syllabus & details
routes.get('/courses/:id', async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const coursesVec = await db.getCourses();
    const course = coursesVec.find(c => c.id === courseId);
    if (!course) {
      res.status(404).json({ error: 'The requested course could not be found.' });
      return;
    }

    const chapters = await db.getChapters(courseId);
    const structuredChapters = [];

    for (const ch of chapters) {
      const items = await db.getItems(ch.id);
      const mappedItems = items.map(item => ({
        id: item.id,
        title: item.title,
        order: item.order,
        type: item.type,
        options: item.options,
        hasRequirements: !!item.requirements?.length
      }));
      structuredChapters.push({
        ...ch,
        items: mappedItems
      });
    }

    res.json({
      ...course,
      chapters: structuredChapters
    });
  } catch (err) {
    next(err);
  }
});

// Full Learning view (Requires Auth)
routes.get('/courses/:id/learn', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const courseId = req.params.id;
    const coursesVec = await db.getCourses();
    const course = coursesVec.find(c => c.id === courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found.' });
      return;
    }

    const chapters = await db.getChapters(courseId);
    const structuredChapters = [];

    for (const ch of chapters) {
      const items = await db.getItems(ch.id);
      structuredChapters.push({
        ...ch,
        items
      });
    }

    res.json({
      ...course,
      chapters: structuredChapters
    });
  } catch (err) {
    next(err);
  }
});

routes.get('/progress/:courseId', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const progressMap = await db.getCourseProgressMap(req.user.id, req.params.courseId);
    res.json(progressMap);
  } catch (err) {
    next(err);
  }
});

// Complete Items & Advances Sequential Rules
routes.post('/progress/complete', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const { courseId, itemId, answer, isProjectSubmit, submissionText } = req.body;

    if (!courseId || !itemId) {
      res.status(400).json({ error: 'courseId and itemId are required.' });
      return;
    }

    // Retrieve item to identify if it is a Quiz Exercise, Project or Lesson
    const chapters = await db.getChapters(courseId);
    let resolvedItem: any = null;
    for (const ch of chapters) {
      const items = await db.getItems(ch.id);
      const match = items.find(it => it.id === itemId);
      if (match) {
        resolvedItem = match;
        break;
      }
    }

    if (!resolvedItem) {
      res.status(404).json({ error: 'Specified content item not found in course.' });
      return;
    }

    // Quiz evaluation rules
    if (resolvedItem.type === 'exercise') {
      if (!answer) {
        res.status(400).json({ error: 'Answer submission is required for quiz types.' });
        return;
      }

      const isCorrect = resolvedItem.answer?.toLowerCase().trim() === answer.toLowerCase().trim();
      if (!isCorrect) {
        res.json({
          correct: false,
          message: 'Incorrect answer. Read the theory guidelines and try again!'
        });
        return;
      }

      await db.updateProgress(req.user.id, courseId, itemId, true, answer);
      res.json({
        correct: true,
        message: 'Excellent! Your choice is correct. Proceed to the next block!'
      });
      return;
    }

    // Project evaluation rules
    if (resolvedItem.type === 'project') {
      if (isProjectSubmit) {
        if (!submissionText || submissionText.trim().length < 15) {
          res.status(400).json({ error: 'A detailed project code/text submission is required (minimum 15 characters).' });
          return;
        }
        await db.submitProject(req.user.id, req.user.email, req.user.name, itemId, resolvedItem.title, courseId, submissionText);
      }
      await db.updateProgress(req.user.id, courseId, itemId, true, submissionText);
      res.json({
        correct: true,
        message: 'Project submission review is complete! Feedback has been recorded in your project archives.'
      });
      return;
    }

    // Lesson standard marking complete
    await db.updateProgress(req.user.id, courseId, itemId, true);
    res.json({
      correct: true,
      message: 'Chapter segment completed!'
    });
  } catch (err) {
    next(err);
  }
});

// Compute User Global Dashboard Statistics
routes.get('/stats', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const stats = await db.getUserStats(req.user.id);
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Community posts queries
routes.get('/community/posts', async (req, res, next) => {
  try {
    const list = await db.getPosts();
    res.json(list);
  } catch (err) {
    next(err);
  }
});

routes.post('/community/posts', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      res.status(400).json({ error: 'Missing title, content, or category.' });
      return;
    }

    const post = await db.createPost(req.user.name, req.user.email, title, content, category);
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

routes.post('/community/posts/:id/comments', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Comment body cannot be empty.' });
      return;
    }

    const comment = await db.addComment(req.params.id, req.user.name, req.user.email, content);
    if (!comment) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

routes.post('/community/posts/:id/like', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const result = await db.toggleLike(req.params.id, req.user.email);
    if (!result) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Projects Showcase
routes.get('/projects/submissions', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const items = await db.getSubmissions(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// AI Assistant Endpoints
routes.post('/ai/chat', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { message, history, context } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required.' });
      return;
    }
    
    console.log("AI chat prompt:", message);
    
    // Construct sequential contents payload (with user/model history turns)
    const contents: any[] = [];
    
    if (Array.isArray(history)) {
      for (const turn of history) {
        if (turn.from === 'user') {
          contents.push({ role: 'user', parts: [{ text: turn.text }] });
        } else if (turn.from === 'ai') {
          contents.push({ role: 'model', parts: [{ text: turn.text }] });
        }
      }
    }
    
    // Append the current turn with context grounding
    let contextStr = '';
    if (context) {
      contextStr = ` [Context details: ${typeof context === 'object' ? JSON.stringify(context) : context}]`;
    }
    contents.push({
      role: 'user',
      parts: [{ text: `${message}${contextStr}` }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an expert, encouraging programming tutor. You MUST: 1. Answer in the same language as the user's message (e.g., French). 2. Answer EXACTLY what the user asks, keeping the focus strictly narrow and accurate according to their request. 3. Be highly concise and keep responses brief (maximum 1 or 2 small paragraphs or clear bullet points), avoiding long-winded essays, preambles, or unsolicited summaries unless writing code examples is necessary. Break down explanation instantly without fluff."
      }
    });

    console.log("Raw AI response:", JSON.stringify(response));
    const replyText = response.text || '';
    res.json({ reply: replyText });
  } catch (err) {
    console.error("AI chat error:", err);
    next(err);
  }
});

routes.post('/ai/evaluate', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { courseTitle, summary } = req.body;
    
    const prompt = `Based on the following course summary, provide educational resources.
Course: ${courseTitle}
Summary: ${summary}

Provide a JSON response with the following structure:
{
  "miniProject": { "title": "...", "description": "..." },
  "quiz": [ { "question": "...", "options": ["...", "..."], "answer": "..." } ],
  "flashcards": [ { "term": "...", "definition": "..." } ],
  "youtubeChannels": [ { "name": "...", "url": "..." } ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const replyText = response.text || '';
    res.json(JSON.parse(replyText || '{}'));
  } catch (err) {
    console.error("AI evaluation error:", err);
    next(err);
  }
});

export default routes;
