import { GoogleGenAI } from '@google/genai';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './service-account.json';

console.log("Initializing progressive translation script...");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = initializeApp({
  credential: cert(serviceAccount as any)
});
const db = getFirestore(app);

// Simple rate limit helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text: string): Promise<string> {
  if (!text) return text;
  
  for(let i=0; i<10; i++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text into French. It is part of an interactive coding course. Keep any technical software terminology (e.g. "TypeScript", "Express"), code snippets, markdown formatting, HTML tags, or placeholders (like "{{answer}}") strictly intact. Only output the translation, without adding any introductory or concluding conversational text.\n\nText to translate:\n${text}`,
        config: { temperature: 0.1 }
      });
      return response.text || text;
    } catch(err: any) {
      if (err.status === 429 || err.status === 503) {
        console.warn(`Error ${err.status} hit, retrying in 10s...`);
        await sleep(10000 * (i + 1));
      } else {
        console.error(`Translation error: ${err.message}`);
        throw err;
      }
    }
  }
  return text;
}

async function translateObjectStrings(obj: any, keysToTranslate: string[]): Promise<any> {
  const translated = { ...obj };
  for (const key of keysToTranslate) {
    if (typeof translated[key] === 'string' && translated[key].length > 0) {
      translated[key] = await translateText(translated[key]);
    } else if (Array.isArray(translated[key])) {
      const translatedArray = [];
      for (const item of translated[key]) {
         if (typeof item === 'string') {
            translatedArray.push(await translateText(item));
         } else {
            translatedArray.push(item);
         }
      }
      translated[key] = translatedArray;
    }
  }
  return translated;
}

async function run() {
  console.log("Starting progressive translation on Firestore database...");
  const coursesSnap = await db.collection('courses').get();
  
  for (const courseDoc of coursesSnap.docs) {
    console.log(`\n===========================================`);
    console.log(`[COURSE] Translating ${courseDoc.id}...`);
    const courseData = courseDoc.data();
    
    // Check if we've already done this (optional but helpful if resuming)
    if (courseData._translated) {
       console.log(`Skipping previously translated course: ${courseDoc.id}`);
    } else {
       const transCourse = await translateObjectStrings(courseData, ['title', 'description']);
       transCourse._translated = true;
       await courseDoc.ref.update(transCourse);
       console.log(`[COURSE] Updated ${courseDoc.id}.`);
       // Prevent hitting limits too fast
       await sleep(500);
    }

    const chaptersSnap = await courseDoc.ref.collection('chapters').get();
    for (const chapterDoc of chaptersSnap.docs) {
      console.log(`  [CHAPTER] Translating ${chapterDoc.id}...`);
      const chapterData = chapterDoc.data();
      
      if (chapterData._translated) {
         console.log(`  Skipping chapter: ${chapterDoc.id}`);
      } else {
         const transChapter = await translateObjectStrings(chapterData, ['title', 'description']);
         transChapter._translated = true;
         await chapterDoc.ref.update(transChapter);
         await sleep(500);
      }

      const itemsSnap = await chapterDoc.ref.collection('items').get();
      for (const itemDoc of itemsSnap.docs) {
        console.log(`    [ITEM] Translating ${itemDoc.id}...`);
        const itemData = itemDoc.data();
        
        if (itemData._translated) {
           console.log(`    Skipping item: ${itemDoc.id}`);
           continue; 
        }

        const transItem = await translateObjectStrings(itemData, [
          'title', 'content', 'question', 'expectedAnswer', 'answer', 'requirements', 'description'
        ]);
        
        if (itemData.options && Array.isArray(itemData.options)) {
          const transOptions = await Promise.all(itemData.options.map((opt: string) => translateText(opt)));
          transItem.options = transOptions;
        }

        if (itemData.hints && Array.isArray(itemData.hints)) {
          const transHints = await Promise.all(itemData.hints.map((hint: string) => translateText(hint)));
          transItem.hints = transHints;
        }
        
        transItem._translated = true;
        await itemDoc.ref.update(transItem);
        // Small delay to pace requests
        await sleep(1500);
      }
    }
  }
  console.log("\n===========================================");
  console.log("Translation progressively completed!");
}

run().catch(console.error);
