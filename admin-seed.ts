import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from './service-account.json';
import * as fs from 'fs';
import * as path from 'path';

console.log("Initializing Admin App for project:", serviceAccount.project_id);

const app = initializeApp({
  credential: cert(serviceAccount as any)
});

// Use the default database since learncraft2-dev is a new project
const db = getFirestore(app);

async function runSeed() {
  console.log("Reading database-fr.json...");
  const rawData = fs.readFileSync(path.join(process.cwd(), 'database-fr.json'), 'utf8');
  const database = JSON.parse(rawData);

  const { courses, chapters, items } = database;

  console.log("Seeding Database from database.json...");
  const pathsWritten: string[] = [];

  // Since we are overriding, we might want to just set/overwrite.
  // We can skip cleaning or we can clean. Merging is fine (overwrite).

  if (courses && Array.isArray(courses)) {
    for (const c of courses) {
      const { id, ...data } = c;
      const docPath = `courses/${id}`;
      await db.doc(docPath).set(data);
      pathsWritten.push(docPath);
      console.log(`[COURSE] Written to ${docPath}`);
    }
  }

  if (chapters && Array.isArray(chapters)) {
    for (const ch of chapters) {
      const { courseId, id, ...data } = ch;
      const docPath = `courses/${courseId}/chapters/${id}`;
      await db.doc(docPath).set(data);
      pathsWritten.push(docPath);
      console.log(`[CHAPTER] Written to ${docPath}`);
    }
  }

  if (items && Array.isArray(items)) {
    for (const it of items) {
      const { courseId, chapterId, id, ...data } = it;
      const docPath = `courses/${courseId}/chapters/${chapterId}/items/${id}`;
      await db.doc(docPath).set(data);
      pathsWritten.push(docPath);
      console.log(`[ITEM] Written to ${docPath}`);
    }
  }

  console.log("\n=================================");
  console.log("Seed complete");
  console.log("Total documents written:", pathsWritten.length);
  console.log("=================================\n");
}

runSeed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed execution failed:", err);
    process.exit(1);
  });
