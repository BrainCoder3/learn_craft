import dotenv from 'dotenv';
dotenv.config();

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "AIzaSyBPtAxqM-Wq7kGTrU8N7-5ana7hHfU_wqo",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0065092015.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0065092015",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0065092015.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "133377784724",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "1:133377784724:web:7ded969f5a55701f32ed81"
};

console.log("Seeding with Firebase config projectId:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-ebd2225a-f3dd-47a4-94f8-12baeb881300");

const coursesToSeed = [
  {
    path: "courses/basic-python",
    data: {
      title: "Basic Python",
      icon: "🐍",
      enrolledCount: 0,
      description: "Lean programming structure from basic variables to dynamic interactive operations in under 4 hours."
    }
  }
];

const chaptersToSeed = [
  {
    path: "courses/basic-python/chapters/chapter-1",
    data: {
      title: "Getting Started with Python",
      order: 1
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-2",
    data: {
      title: "Variables & Data Types",
      order: 2
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-3",
    data: {
      title: "Control Flow",
      order: 3
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-4",
    data: {
      title: "Functions",
      order: 4
    }
  }
];

const itemsToSeed = [
  // Chapter 1 Items
  {
    path: "courses/basic-python/chapters/chapter-1/items/item-1-1",
    data: {
      order: 1,
      type: "lesson",
      title: "What is Python?",
      duration: "10 mins",
      content: "Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, it is widely used in web development, data science, automation, and AI. Python uses indentation to define code blocks instead of curly braces."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-1/items/item-1-2",
    data: {
      order: 2,
      type: "lesson",
      title: "Installing Python & Setting Up",
      duration: "10 mins",
      content: "Download Python from python.org. During installation on Windows, check 'Add Python to PATH'. Verify by running 'python --version' in your terminal. Use VS Code with the Python extension as your editor."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-1/items/item-1-3",
    data: {
      order: 3,
      type: "exercise",
      title: "Python Basics Quiz",
      duration: "5 mins",
      question: "What symbol is used to write a comment in Python?",
      expectedAnswer: "#",
      answer: "#", // Add both for compatibility
      options: ["#", "//", "/*", "--"]
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-1/items/item-1-4",
    data: {
      order: 4,
      type: "project",
      title: "Hello World Project",
      duration: "15 mins",
      requirements: "Write a Python script that prints 'Hello, World!' to the console. Then modify it to ask the user for their name and print 'Hello, [name]!'. Submit your code below."
    }
  },

  // Chapter 2 Items
  {
    path: "courses/basic-python/chapters/chapter-2/items/item-2-1",
    data: {
      order: 1,
      type: "lesson",
      title: "Variables in Python",
      duration: "10 mins",
      content: "A variable stores a value. In Python you do not need to declare a type: x = 5, name = 'Alice', is_active = True. Variable names must start with a letter or underscore, cannot contain spaces, and are case-sensitive."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-2/items/item-2-2",
    data: {
      order: 2,
      type: "lesson",
      title: "Data Types: int, float, str, bool",
      duration: "10 mins",
      content: "Python has four primitive types: int (whole numbers), float (decimal numbers), str (text in quotes), and bool (True or False). Use type() to check any variable's type. Convert between types with int(), float(), str(), bool()."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-2/items/item-2-3",
    data: {
      order: 3,
      type: "exercise",
      title: "Data Types Exercise",
      duration: "5 mins",
      question: "What data type is the result of: type(3.14)?",
      expectedAnswer: "float",
      answer: "float",
      options: ["int", "float", "str", "bool"]
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-2/items/item-2-4",
    data: {
      order: 4,
      type: "project",
      title: "Personal Info Script",
      duration: "20 mins",
      requirements: "Create a script that stores your name (str), age (int), height in meters (float), and whether you are a student (bool). Print each with a label. Example: 'Name: Alice'. Submit your code below."
    }
  },

  // Chapter 3 Items
  {
    path: "courses/basic-python/chapters/chapter-3/items/item-3-1",
    data: {
      order: 1,
      type: "lesson",
      title: "If / Elif / Else",
      duration: "10 mins",
      content: "Conditional statements let your program make decisions. Syntax: if condition: / elif condition: / else: — each block must be indented. Use == (equal), != (not equal), >, <, >=, <= for comparisons."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-3/items/item-3-2",
    data: {
      order: 2,
      type: "lesson",
      title: "Loops: for and while",
      duration: "15 mins",
      content: "A for loop iterates over a sequence: 'for i in range(5)' runs 5 times. A while loop runs as long as a condition is true. Use 'break' to exit early and 'continue' to skip to the next iteration."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-3/items/item-3-3",
    data: {
      order: 3,
      type: "exercise",
      title: "Loop Exercise",
      duration: "5 mins",
      question: "What does range(3) produce?",
      expectedAnswer: "0, 1, 2",
      answer: "0, 1, 2",
      options: ["0, 1, 2", "1, 2, 3", "0, 1", "0, 1, 2, 3"]
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-3/items/item-3-4",
    data: {
      order: 4,
      type: "project",
      title: "Number Guessing Game",
      duration: "30 mins",
      requirements: "Build a number guessing game. The program picks a random number between 1 and 10. The user keeps guessing until correct. Print 'Too high', 'Too low', or 'Correct!' after each guess. Submit your code below."
    }
  },

  // Chapter 4 Items
  {
    path: "courses/basic-python/chapters/chapter-4/items/item-4-1",
    data: {
      order: 1,
      type: "lesson",
      title: "Defining and Calling Functions",
      duration: "10 mins",
      content: "Functions are reusable blocks of code. Define with 'def function_name():' and call by writing 'function_name()'. Functions can accept parameters and return values using the 'return' keyword."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-4/items/item-4-2",
    data: {
      order: 2,
      type: "lesson",
      title: "Parameters, Arguments & Return",
      duration: "10 mins",
      content: "Parameters are variables in the function definition. Arguments are values passed when calling. A function returns a value with 'return'. Without a return statement the function returns None by default."
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-4/items/item-4-3",
    data: {
      order: 3,
      type: "exercise",
      title: "Functions Exercise",
      duration: "5 mins",
      question: "What keyword sends a value back from a function?",
      expectedAnswer: "return",
      answer: "return",
      options: ["return", "yield", "send", "result"]
    }
  },
  {
    path: "courses/basic-python/chapters/chapter-4/items/item-4-4",
    data: {
      order: 4,
      type: "project",
      title: "Calculator Function",
      duration: "25 mins",
      requirements: "Write a script with 4 functions: add(a,b), subtract(a,b), multiply(a,b), divide(a,b). Each returns the result. divide() must handle division by zero by returning 'Error: division by zero'. Print results for each. Submit your code below."
    }
  }
];

async function seed() {
  console.log("Starting Seeding Process to Firestore...");
  
  const writtenPaths: string[] = [];

  // Seed courses
  for (const item of coursesToSeed) {
    const parts = item.path.split('/');
    const docRef = doc(db, parts[0], parts[1]);
    await setDoc(docRef, item.data);
    console.log(`Wrote: ${item.path}`);
    writtenPaths.push(item.path);
  }

  // Seed chapters
  for (const item of chaptersToSeed) {
    const parts = item.path.split('/');
    const docRef = doc(db, parts[0], parts[1], parts[2], parts[3]);
    await setDoc(docRef, item.data);
    console.log(`Wrote: ${item.path}`);
    writtenPaths.push(item.path);
  }

  // Seed items
  for (const item of itemsToSeed) {
    const parts = item.path.split('/');
    const docRef = doc(db, parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
    await setDoc(docRef, item.data);
    console.log(`Wrote: ${item.path}`);
    writtenPaths.push(item.path);
  }

  console.log("----------------------------------------");
  console.log("Seed complete");
  console.log("Total paths written:", writtenPaths.length);
  writtenPaths.forEach(p => console.log(` - ${p}`));
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed with error:", err);
  process.exit(1);
});
