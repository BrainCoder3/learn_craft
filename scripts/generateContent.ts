// scripts/generateContent.ts
/**
 * Script to generate learning content using Google Gemini API and store it locally.
 * After generation, the content can be uploaded to Firebase Firestore.
 *
 * Usage (from project root):
 *   ts-node scripts/generateContent.ts "Frontend with React"
 *
 * Environment:
 *   GOOGLE_AI_KEY - Gemini API key (required)
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY - optional
 *   (If Firebase Admin credentials are not set, the upload step will be skipped.)
 */
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

// Optional Firebase Admin import (won’t fail if not present)
let admin: any = null;
try {
  admin = require('firebase-admin');
} catch (_) {
  console.warn('firebase-admin not installed – upload step will be skipped.');
}

const API_KEY = process.env.GOOGLE_AI_KEY;
if (!API_KEY) {
  console.error('❌ Missing GOOGLE_AI_KEY environment variable.');
  process.exit(1);
}

/** Generate content for a given course title using Gemini */
async function generateCourseContent(courseTitle: string): Promise<string> {
  const prompt = `You are an expert curriculum designer. Create a detailed course outline for "${courseTitle}".
  Include:
  1. Course description (max 200 words)
  2. List of chapters (title + 2‑3 sentence summary)
  3. For each chapter, a short lesson plan (key concepts, example code snippets, quick quiz ideas).
  Return the result in Markdown format.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    }
  );
  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${txt}`);
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini');
  return text.trim();
}

/** Save generated markdown to the local content folder */
function saveLocal(courseTitle: string, markdown: string) {
  const safeName = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dir = path.resolve(__dirname, '..', 'content');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${safeName}.md`);
  fs.writeFileSync(filePath, markdown, 'utf8');
  console.log(`✅ Saved content to ${filePath}`);
  return filePath;
}

/** Upload markdown string to Firestore under a collection called "generatedCourses" */
async function uploadToFirebase(courseTitle: string, markdown: string) {
  if (!admin) return;
  // Initialise Admin SDK – it will use GOOGLE_APPLICATION_CREDENTIALS if set
  if (!admin.apps?.length) {
    admin.initializeApp();
  }
  const db = admin.firestore();
  const docRef = db.collection('generatedCourses').doc();
  await docRef.set({ title: courseTitle, markdown, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  console.log(`🚀 Uploaded content to Firestore (doc ${docRef.id})`);
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: ts-node scripts/generateContent.ts "Course Title"');
    process.exit(1);
  }
  const courseTitle = args.join(' ');
  try {
    const markdown = await generateCourseContent(courseTitle);
    const filePath = saveLocal(courseTitle, markdown);
    await uploadToFirebase(courseTitle, markdown);
    console.log('✅ All done!');
  } catch (e) {
    console.error('❌ Error:', (e as Error).message);
    process.exit(1);
  }
})();
