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

function fetch(url: string, init?: any) {
  return import('node-fetch').then(m => m.default(url, init));
}

// Optional Firebase Admin import (won't fail if not present)
let admin: any = null;
try {
  admin = require('firebase-admin');
} catch (_) {
  console.warn('firebase-admin not installed – upload step will be skipped.');
}

const API_KEY = process.env.GOOGLE_AI_KEY;
if (!API_KEY) {
  console.warn('⚠️ GOOGLE_AI_KEY not set – proceeding with mock data');
}

interface LessonPlan {
  title: string;
  concepts: string[];
  codeSnippet?: string;
  quizIdeas?: string[];
}

interface ChapterSchema {
  title: string;
  summary: string;
  lessons: LessonPlan[];
}

interface CourseSchema {
  description: string;
  chapters: ChapterSchema[];
}

/** Convert a CourseSchema object to a markdown string */
function schemaToMarkdown(schema: CourseSchema, title: string): string {
  const mdLines: string[] = [];
  mdLines.push(`# ${title}`);
  mdLines.push('');
  mdLines.push(schema.description);
  mdLines.push('');
  schema.chapters.forEach((chap, idx) => {
    mdLines.push(`## Chapter ${idx + 1}: ${chap.title}`);
    mdLines.push('');
    mdLines.push(chap.summary);
    mdLines.push('');
    chap.lessons.forEach((lesson) => {
      mdLines.push(`### Lesson: ${lesson.title}`);
      mdLines.push('');
      if (lesson.concepts && lesson.concepts.length) {
        mdLines.push('**Key Concepts:**');
        lesson.concepts.forEach((c) => mdLines.push(`- ${c}`));
        mdLines.push('');
      }
      if (lesson.codeSnippet) {
        mdLines.push('```typescript');
        mdLines.push(lesson.codeSnippet);
        mdLines.push('```');
        mdLines.push('');
      }
      if (lesson.quizIdeas && lesson.quizIdeas.length) {
        mdLines.push('**Quiz Ideas:**');
        lesson.quizIdeas.forEach((q) => mdLines.push(`- ${q}`));
        mdLines.push('');
      }
    });
    mdLines.push('---');
    mdLines.push('');
  });
  return mdLines.join('\n');
}

/** Generate content for a given course title using Gemini, expecting structured JSON output */
async function generateCourseContent(courseTitle: string): Promise<string> {
  const prompt = `You are an expert curriculum designer. Create a detailed course outline for "${courseTitle}".
Return a JSON object matching this TypeScript interface:
interface CourseSchema {
  description: string; // course description (max 200 words)
  chapters: {
    title: string; // chapter title
    summary: string; // 2‑3 sentence summary
    lessons: {
      title: string; // lesson title
      concepts: string[]; // key concepts
      codeSnippet?: string; // optional code example
      quizIdeas?: string[]; // optional quiz questions
    }[];
  }[];
}
Provide ONLY the JSON (no additional text).`;

  if (!API_KEY) {
    console.warn('❗ GOOGLE_AI_KEY not set – using mock data for testing');
    const mock: CourseSchema = {
      description: `Mock description for ${courseTitle}`,
      chapters: [
        {
          title: 'Introduction',
          summary: 'Overview of the course topics.',
          lessons: [
            {
              title: 'Getting Started',
              concepts: ['Concept A', 'Concept B'],
              codeSnippet: 'console.log("Hello World");',
              quizIdeas: ['What does console.log do?'],
            },
          ],
        },
        {
          title: 'Advanced Topics',
          summary: 'Deep dive into advanced subjects.',
          lessons: [
            {
              title: 'Advanced Lesson',
              concepts: ['Advanced Concept'],
              codeSnippet: 'function advanced() { return true; }',
              quizIdeas: ['Explain the advanced function.'],
            },
          ],
        },
      ],
    };
    return schemaToMarkdown(mock, courseTitle);
  }
  const model = "gemini-flash-lite-latest";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
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
  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No content returned from Gemini');
  let parsed: CourseSchema;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error('Failed to parse Gemini response as JSON');
  }
  return schemaToMarkdown(parsed, courseTitle);
}

/** Save generated markdown to the local content folder */
function saveLocal(courseTitle: string, markdown: string) {
  const safeName = courseTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const dir = path.resolve(process.cwd(), 'content');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${safeName}.md`);
  fs.writeFileSync(filePath, markdown, 'utf8');
  console.log(`✅ Saved content to ${filePath}`);
  return filePath;
}

/** Upload markdown string to Firestore under a collection called "generatedCourses" */
async function uploadToFirebase(courseTitle: string, markdown: string) {
  if (!admin) return;
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
    saveLocal(courseTitle, markdown);
    await uploadToFirebase(courseTitle, markdown);
    console.log('✅ All done!');
  } catch (e) {
    console.error('❌ Error:', (e as Error).message);
    process.exit(1);
  }
})();