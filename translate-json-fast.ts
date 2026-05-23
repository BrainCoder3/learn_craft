import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

console.log("Initializing fast batch translation script...");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function translateBatch(items: any[]): Promise<any[]> {
  for (let i = 0; i < 5; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert technical translator. Translate the following JSON array of objects to French. 
Translate these specific keys if they exist: "title", "description", "content", "question", "expectedAnswer", "answer", "requirements", "hints", "options". 
Keep all IDs, courseIds, chapterIds, and exact technical terms (e.g. TypeScript, Express, Python) untranslated.
Keep code blocks, markdown, and placeholders exactly as they are.
Return EXACTLY the same JSON structure, just with French text for the string fields.\n\nJSON:\n${JSON.stringify(items, null, 2)}`,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "[]";
      return JSON.parse(text);
    } catch (err: any) {
      console.warn(`Attempt ${i + 1} failed. Retrying... ${err.message}`);
      await sleep(3000 * (i + 1));
    }
  }
  return items; // fallback to original if failed
}

async function run() {
  const filePath = path.join(process.cwd(), 'database.json');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const database = JSON.parse(rawData);

  console.log("Database loaded in memory. Translating Courses...");
  if (database.courses) {
    const translatedCourses = await translateBatch(database.courses);
    database.courses = translatedCourses;
    console.log("Courses translated.");
  }

  console.log("Translating Chapters...");
  if (database.chapters) {
    const batches = [];
    const BATCH_SIZE = 4;
    for (let i = 0; i < database.chapters.length; i += BATCH_SIZE) {
      batches.push(database.chapters.slice(i, i + BATCH_SIZE));
    }
    const translatedBatches = [];
    for (let i = 0; i < batches.length; i++) {
      console.log(` Translating chapters batch ${i + 1}/${batches.length}...`);
      translatedBatches.push(await translateBatch(batches[i]));
      await sleep(500); // base rate limit
    }
    database.chapters = translatedBatches.flat();
    console.log("Chapters translated.");
  }

  console.log("Translating Items...");
  if (database.items) {
    const batches = [];
    const BATCH_SIZE = 5;
    for (let i = 0; i < database.items.length; i += BATCH_SIZE) {
      batches.push(database.items.slice(i, i + BATCH_SIZE));
    }
    const translatedBatches = [];
    for (let i = 0; i < batches.length; i++) {
      console.log(` Translating items batch ${i + 1}/${batches.length}...`);
      translatedBatches.push(await translateBatch(batches[i]));
      await sleep(1000); // play nice with rate limits
    }
    database.items = translatedBatches.flat();
    console.log("Items translated.");
  }

  console.log("Writing database-fr.json...");
  fs.writeFileSync(path.join(process.cwd(), 'database-fr.json'), JSON.stringify(database, null, 2));
  console.log("Complete! Fast translation done.");
}

run().catch(console.error);
