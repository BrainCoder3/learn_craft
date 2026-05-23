import * as fs from 'fs';
import * as path from 'path';
import translate from 'translate';

// We can use Google or Yandex by default. translate.engine = "google";
translate.engine = "google";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function transText(text: string) {
  if (!text) return text;
  try {
    return await translate(text, "fr");
  } catch (e) {
    console.error("error translating", e);
    return text;
  }
}

async function run() {
  const filePath = path.join(process.cwd(), 'database.json');
  const rawData = fs.readFileSync(filePath, 'utf8');
  const database = JSON.parse(rawData);

  console.log("Database loaded. Translating Courses...");
  for (const c of database.courses || []) {
      c.title = await transText(c.title);
      c.description = await transText(c.description);
  }

  console.log("Translating Chapters...");
  for (const c of database.chapters || []) {
      c.title = await transText(c.title);
      await sleep(50);
  }

  console.log("Translating Items...");
  for (let i = 0; i < (database.items || []).length; i++) {
      const it = database.items[i];
      console.log(` Translating item ${i+1}/${database.items.length}`);
      if(it.title) it.title = await transText(it.title);
      if(it.content) it.content = await transText(it.content);
      if(it.question) it.question = await transText(it.question);
      if(it.expectedAnswer) it.expectedAnswer = await transText(it.expectedAnswer);
      if(it.answer) it.answer = await transText(it.answer);
      if(it.requirements) it.requirements = await transText(it.requirements);
      if(it.description) it.description = await transText(it.description);

      if(it.options) {
          for(let o=0; o<it.options.length; o++) {
              it.options[o] = await transText(it.options[o]);
          }
      }
      if(it.hints) {
          for(let o=0; o<it.hints.length; o++) {
              it.hints[o] = await transText(it.hints[o]);
          }
      }
  }

  console.log("Writing database-fr.json...");
  fs.writeFileSync(path.join(process.cwd(), 'database-fr.json'), JSON.stringify(database, null, 2));
  console.log("Complete!");
}

run();
