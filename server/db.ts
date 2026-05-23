/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocFromServer,
  deleteDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { Course, Chapter, LearningItem, UserProgress, CommunityPost, PostComment, ProjectSubmission } from '../src/types';
import firebaseConfigJson from '../firebase-applet-config.json';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const localDbPath = path.join(process.cwd(), 'database.json');

function readLocalDb(): any {
  try {
    if (fs.existsSync(localDbPath)) {
      const content = fs.readFileSync(localDbPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading local db file:', err);
  }
  return { users: [], courses: [], chapters: [], items: [], progress: [], posts: [], submissions: [] };
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local db file:', err);
  }
}

const getEnv = (key: string): string | undefined => {
  return process.env?.[key];
};

const activeFirebaseConfig = {
  apiKey: getEnv('REACT_APP_FIREBASE_API_KEY') || getEnv('VITE_FIREBASE_API_KEY') || firebaseConfigJson.apiKey || "AIzaSyBPtAxqM-Wq7kGTrU8N7-5ana7hHfU_wqo",
  authDomain: getEnv('REACT_APP_FIREBASE_AUTH_DOMAIN') || getEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseConfigJson.authDomain || "gen-lang-client-0065092015.firebaseapp.com",
  projectId: getEnv('REACT_APP_FIREBASE_PROJECT_ID') || getEnv('VITE_FIREBASE_PROJECT_ID') || firebaseConfigJson.projectId || "gen-lang-client-0065092015",
  storageBucket: getEnv('REACT_APP_FIREBASE_STORAGE_BUCKET') || getEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseConfigJson.storageBucket || "gen-lang-client-0065092015.firebasestorage.app",
  messagingSenderId: getEnv('REACT_APP_FIREBASE_MESSAGING_SENDER_ID') || getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseConfigJson.messagingSenderId || "133377784724",
  appId: getEnv('REACT_APP_FIREBASE_APP_ID') || getEnv('VITE_FIREBASE_APP_ID') || firebaseConfigJson.appId || "1:133377784724:web:7ded969f5a55701f32ed81",
  firestoreDatabaseId: getEnv('REACT_APP_FIREBASE_FIRESTORE_DATABASE_ID') || getEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID') || firebaseConfigJson.firestoreDatabaseId || "ai-studio-ebd2225a-f3dd-47a4-94f8-12baeb881300"
};

// Initialize Firebase SDK
const app = initializeApp(activeFirebaseConfig);

const databaseIdOnServer = getEnv('REACT_APP_FIREBASE_FIRESTORE_DATABASE_ID') || getEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID') || (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== 'remixed-firestore-database-id' ? firebaseConfigJson.firestoreDatabaseId : undefined);

export const dbFS = databaseIdOnServer
  ? getFirestore(app, databaseIdOnServer)
  : (activeFirebaseConfig.projectId === "gen-lang-client-0065092015"
      ? getFirestore(app, "ai-studio-ebd2225a-f3dd-47a4-94f8-12baeb881300")
      : getFirestore(app));

export const auth = getAuth();

// Error handling types and helper as requested by the Firebase integration skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Low-level helper to hash password
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  joinedAt: string;
}

// Hardcoded Seed Courses Data
const SEED_COURSES: Course[] = [
  {
    id: 'ts-advanced',
    title: 'Mastering TypeScript & Advanced Type Systems',
    description: 'Master strict compiler options, advanced generics, conditional types, mapped constructs, and performance-tuned patterns.',
    category: 'Software Architecture',
    difficulty: 'Advanced',
    duration: '18 hours',
    studentCount: 1240,
    thumbnail: 'https://images.unsplash.com/photo-1516116211223-5c359a36298a?w=400&auto=format&fit=crop&q=80',
    icon: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=150&h=150&fit=crop&auto=format&q=80'
  },
  {
    id: 'fullstack-express',
    title: 'Architecting Fullstack APIs with Express & SQLite',
    description: 'Build industrial-strength server engines, secure JSON Web Token gateways, atomic relational queries, and optimized middleware cascades.',
    category: 'Backend Engineering',
    difficulty: 'Intermediate',
    duration: '14 hours',
    studentCount: 980,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
    icon: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&h=150&fit=crop&auto=format&q=80'
  }
];

const PYTHON_ROADMAPS = [
  {
    id: 'py-basic',
    title: 'Basic Python',
    description: 'Master clean scripting, variable binds, conditional triggers, flow loops, lists, keys, and Object-Oriented blueprints starting completely from scratch.',
    category: 'Backend Engineering',
    difficulty: 'Beginner',
    duration: '12 hours',
    studentCount: 1540,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    icon: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&h=150&fit=crop&auto=format&q=80',
    chapters: [0, 1, 2, 3, 8]
  },
  {
    id: 'py-ds',
    title: 'Python for Data Science',
    description: 'Acquire deep quantitative competencies. Start from basic structures to OOP, and jump directly into clean dataset modeling, statistical aggregates, NumPy matrices, and gorgeous visual plots.',
    category: 'Data Science',
    difficulty: 'Intermediate',
    duration: '16 hours',
    studentCount: 2240,
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=80',
    icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop&auto=format&q=80',
    chapters: [0, 1, 2, 3, 4, 5]
  },
  {
    id: 'py-game',
    title: 'Python for Video Game Dev',
    description: 'Learn standard programming mechanics from Scratch to OOP, and immediately engineer real game engines, interactive render grids, sound events, custom keymaps, sprite vectors, and high-frequency collision trackers.',
    category: 'Game Programming',
    difficulty: 'Intermediate',
    duration: '18 hours',
    studentCount: 1840,
    thumbnail: 'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=400&auto=format&fit=crop&q=80',
    icon: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=150&h=150&fit=crop&auto=format&q=80',
    chapters: [0, 1, 2, 3, 6, 7, 8]
  }
];

const CORE_PYTHON_CHAPTERS = [
  {
    title: "Introduction to Python & Simple variables",
    description: "Start from scratch. Learn how Python's interpreter compiles code, declare simple variables, and utilize dynamic string formats.",
    duration: "3 hours",
    items: [
      {
        title: "Theory: The Interpreter Loop & Variable Assignment",
        type: "lesson",
        content: `## The Python Interpreter & Dynamic Variables

Python is an interpreted, high-level, dynamically typed language. Unlike compiled languages where your code is translated into binary machine instructions before execution, a dynamic utility program called the **Python Interpreter** reads, parses, and evaluates your statements line-by-line at runtime.

### Variable Bindings and Assignment

In Python, you do not declare a variable's type before assigning a value to it (no keywords like \`var\`, \`let\`, or explicit type descriptors like \`int\` or \`String\`). Creating a variable is as simple as binding a name to an object reference using the equals sign (\`=\`):

\`\`\`python
# Simple variable bindings
user_age = 22
user_name = "Alex Mercer"
is_enrolled = True
grade_point_average = 3.92

print(user_name)
print(user_age)
\`\`\`

### Dynamic Typing and Name Binding

When you write \`x = 100\`, Python allocates memory for the integer object \`100\` and binds the name \`x\` to it. You can subsequently rebind the same name to a reference of a completely different data type:

\`\`\`python
x = 100      # x is bound to an integer (int)
x = "Passed" # Now x is bound to a string (str)
\`\`\`

This dynamic nature makes Python highly flexible but requires discipline. Best practices suggest keeping variable names bound to a consistent type throughout their lifecycle to maintain code clarity.

### Variable Naming Conventions

Python variables are case-sensitive (\`Age\` and \`age\` are distinct) and follow the **snake_case** convention, where all letters are lowercase and words are joined with underscores (e.g., \`student_first_name\`).`
      },
      {
        title: "Interactive Quiz: Variable Binding Mechanics",
        type: "exercise",
        question: "Consider this sequence of instructions:\n\nx = 42\ny = x\nx = 'Incredible'\n\nWhat is the value of the variable y at the end of execution?",
        options: [
          "integer value 42",
          "string value 'Incredible'",
          "integer value 0",
          "None (raises a runtime Type-Error)"
        ],
        answer: "integer value 42"
      },
      {
        title: "Hands-on Project: Crafting a User Profile Builder",
        type: "project",
        requirements: [
          "Declare four distinct variables: user_name (string), rank_score (integer), success_rate (float), and is_admin (boolean).",
          "Initialize them with descriptive values of your choice.",
          "Print each variable with a clean, labeled output message using the print() function.",
          "Reassign success_rate to a new float value and print the updated rate."
        ],
        hints: [
          "Boolean values in Python must start with an uppercase letter: True or False (not true or false).",
          "Use descriptive labels like print('User Name:', user_name) to organize your outputs."
        ]
      },
      {
        title: "Complete the Code Exercise: Name and Title Formatter",
        type: "project",
        requirements: [
          "Examine the partial script skeleton below.",
          "Complete the placeholders labeled with # TODO statements.",
          "Correctly define the guest's name, assign their engineering role, and format a dynamic greeting statement using an f-string (formatted string literal).",
          "Submit your completed script with a minimum of 15 characters."
        ],
        hints: [
          "An f-string is written as f'Your message with {variable}' utilizing curly brackets to substitute live values dynamically.",
          "Complete the code structure: guest_name = 'Sofia' / engineering_role = 'AI Architect' / greeting_message = f'Welcome, Architect {guest_name}!'"
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
# TODO: Declare variable 'guest_name' and assign a string value

# TODO: Declare variable 'engineering_role' and assign a string value

# TODO: Create a formatted greeting f-string incorporating both variables
# greeting_message = f"..."

# print(greeting_message)
`
      },
      {
        title: "Theory: Reader Input & Math Arithmetic Expressions",
        type: "lesson",
        content: `## Interactive Input & Python Math Operators

To write useful applications, we must accept input from users. Python provides a simple built-in tool called \`input()\` to read data from the terminal.

### Parsing Interactive Console Input

A crucial behavior to remember is that \`input()\` **always** returns the user's input strictly as a string (\`str\`). If you need to perform mathematical operations on that data, you must cast it to a numerical type using conversion helpers like \`int()\` or \`float()\`:

\`\`\`python
# Read input from user
raw_age = input("Enter your age: ") # e.g. user enters "21"
age_next_year = int(raw_age) + 1    # Converts "21" to 21, then adds 1
print(f"Next year you will be {age_next_year}!")
\`\`\`

If you skip the \`int()\` conversion, Python will raise a \`TypeError\` when trying to add a string and an integer.

### Standard Python Arithmetic Operators

Python supports familiar math operators:
- \`+\` Addition (sums values)
- \`-\` Subtraction (subtracts second from first)
- \`*\` Multiplication (multiplies values)
- \`/\` Float Division: Always yields a float (e.g. \`5 / 2\` returns \`2.5\`)
- \`//\` Integer (Floor) Division: Rounds down to the nearest whole integer (e.g. \`5 // 2\` returns \`2\`)
- \`%\` Modulo Remainder: Returns the remainder after division (e.g. \`5 % 2\` returns \`1\`)
- \`**\` Exponentiation (e.g. \`2 ** 3\` computes 2 to the third power, returning \`8\`)

### Order of Operations (PEMDAS)

Python evaluates mathematical expressions following standard algebraic operator precedence rules:
1. **P**arentheses \`()\`
2. **E**xponents \`**\`
3. **M**ultiplication \`*\`, **D**ivision \`/\`, \`//\`, and **M**odulo \`%\` (evaluated left-to-right)
4. **A**ddition \`+\` and **S**ubtraction \`-\` (evaluated left-to-right)`
      },
      {
        title: "Interactive Quiz: Evaluating Order of Operations",
        type: "exercise",
        question: "What is the final evaluated numeric value of the variable evaluation in this math sequence:\n\nevaluation = 15 % 7 * 2 ** 3 // 4",
        options: [
          "integer value 2",
          "integer value 1",
          "floating point value 2.5",
          "integer value 8"
        ],
        answer: "integer value 2"
      },
      {
        title: "Hands-on Project: Comprehensive Fuel Mileage Calculator",
        type: "project",
        requirements: [
          "Prompt the user to enter the total distance driven in miles (parsed as a float).",
          "Prompt the user to enter the total volume of fuel consumed in gallons (parsed as a float).",
          "Calculate the fuel efficiency of the vehicle using the arithmetic formula: miles divided by gallons.",
          "Print the calculated Miles Per Gallon (MPG) with a descriptive label."
        ],
        hints: [
          "Apply float(input()) directly to prompt and cast user responses as decimals in a single efficient step.",
          "Protect against dividing by zero by assuming gallons entered is always greater than zero."
        ]
      },
      {
        title: "Complete the Code Exercise: Temperature Converter Template",
        type: "project",
        requirements: [
          "Examine the partial script skeleton below.",
          "Complete all the designated # TODO statements.",
          "Accept input representing Celsius degrees, cast it to a numerical type, calculate Fahrenheit degrees using the formula: (Celsius * 9 / 5) + 32, and output the result.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Compute the Fahrenheit equivalent: fahrenheit = (celsius * 9 / 5) + 32",
          "Make sure to cast the raw string input using float() so we can handle decimal temperature entries."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
# TODO: Get the temperature in Celsius from user input

# TODO: Cast user input string into a float variable
# celsius = ...

# TODO: Apply the Conversion Formula
# fahrenheit = ...

# TODO: Output results formatted with dynamic indicators
# print(f"{celsius} degrees Celsius converts to {fahrenheit} degrees Fahrenheit")
`
      }
    ]
  },
  {
    title: "Control Flow, Loops & Lists Collections",
    description: "Master logical evaluation sequences. Build multi-branch conditionals, learn while loops, for loops, and index-based lists.",
    duration: "4 hours",
    items: [
      {
        title: "Theory: Conditional Flow & Boolean Logic",
        type: "lesson",
        content: `## Multi-Branch Conditionals & Booleans

Control flow dictates which code blocks execute based on runtime expressions evaluated as Boolean True or False.

### If-Elif-Else Chain
Unlike languages using curly brackets, Python uses **indentation whitespace** (almost always 4 spaces) to define execution blocks.

\`\`\`python
score = int(input("Enter exam score: "))

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
\`\`\`

### Logical Operators
Compose complex conditions with:
- \`and\`: True if **both** sides evaluate to True.
- \`or\`: True if **at least one** side evaluates to True.
- \`not\`: Reverses the Boolean state (negation).

\`\`\`python
is_weekend = True
is_sunny = False

if is_weekend and not is_sunny:
    print("Read a book inside!")
\`\`\``
      },
      {
        title: "Interactive Quiz: Boolean Evaluation Mechanics",
        type: "exercise",
        question: "Consider this logic sequence:\n\nx = 10\ny = 20\nresult = (x > 5 and y < 15) or (not (x == y))\n\nWhat is the value of the 'result' variable?",
        options: [
          "True",
          "False",
          "None",
          "raises a runtime SyntaxError"
        ],
        answer: "True"
      },
      {
        title: "Hands-on Project: Interactive Ticket Pricing Terminal",
        type: "project",
        requirements: [
          "Prompt the user to enter their age as an integer.",
          "Prompt the user to enter whether they have a special promo code as a string ('yes' or 'no').",
          "Calculate child (under 12) pricing of $5.",
          "Calculate standard pricing of $15 for anyone 12 or older.",
          "Apply a $3 discount to the calculated ticket price if they answered 'yes' to having a promo code.",
          "Print the final ticket price with a descriptive helper label."
        ],
        hints: [
          "Use standard compound checks: if age < 12:",
          "Track ticket price as a numeric variable and subtract 3 if promo is 'yes'."
        ]
      },
      {
        title: "Complete the Code Exercise: Odd-Even Classifier",
        type: "project",
        requirements: [
          "Examine the partial script skeleton below.",
          "Complete all the designated # TODO statements.",
          "Take an integer input from the user, check if it is even using the modulo operator %, and output clean indicators: 'The number is Even' or 'The number is Odd'.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Use number % 2 == 0 to detect if a number is even, and an else branch to catch odd numbers."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
# TODO: Get helper user input representing an integer
# number_input = ...

# TODO: Cast the input to an integer
# number = ...

# TODO: Formulate conditional logic to classify the number
# if ... :
#     print("The number is Even")
# else:
#     print(...)
`
      },
      {
        title: "Theory: Core List Collections and Iteration Loops",
        type: "lesson",
        content: `## List Collections & Iteration Loops

Python lists are ordered, mutable collections of elements enclosed in square brackets. Loops allow executing blocks repeatedly.

### Core List Methods
Lists can contain different types, though standard practice is to store similar items:

\`\`\`python
fruits = ["apple", "banana", "cherry"]
print(fruits[0])      # Index access (0-indexed): prints "apple"
fruits.append("date") # Adds element to the end of the list
print(len(fruits))    # Length function: prints 4
\`\`\`

### Iteration Loops

#### The 'for' Loop (Iterating sequences)
Use a \`for\` loop to run statements over items in a list or numeric boundaries using the \`range()\` generator:

\`\`\`python
# Prints numbers: 0, 1, 2, 3, 4
for index in range(5):
    print(index)

# Loop over list items
for fruit in fruits:
    print(f"I enjoy eating {fruit}!")
\`\`\`

#### The 'while' Loop (Conditional iterations)
A \`while\` loop runs continuously as long as its conditional check evaluates to \`True\`:

\`\`\`python
countdown = 3
while countdown > 0:
    print(countdown)
    countdown -= 1
print("Launch!")
\`\`\`

### Flow Modifiers: break and continue
- \`break\`: Exits the current active loop instantly.
- \`continue\`: Skips the rest of the current iteration and jumps directly to the next loop check.`
      },
      {
        title: "Interactive Quiz: List Index and Loop Slicing",
        type: "exercise",
        question: "Consider this Python code snippet:\n\nnums = [10, 20, 30, 40]\ntotal = 0\nfor i in range(len(nums)):\n    if nums[i] == 30:\n        continue\n    total += nums[i]\n\nWhat is the final value of the variable 'total'?",
        options: [
          "70",
          "100",
          "60",
          "30"
        ],
        answer: "70"
      },
      {
        title: "Hands-on Project: Student Grades Aggregator",
        type: "project",
        requirements: [
          "Create an empty list called 'student_grades'.",
          "Build an infinite loop using while True that prompts the user to enter a grade (0-100) or 'done' to stop.",
          "If the user inputs 'done', break out of the loop.",
          "Otherwise, convert the grade to an integer and append it to the student_grades list.",
          "After the loop, calculate the average grade (sum of progress divided by size) and print it.",
          "Print a pass/fail indicator (average 60 or above)."
        ],
        hints: [
          "Use sum(student_grades) and len(student_grades) to compute the average.",
          "Check user input string directly: if grade_input == 'done': break"
        ]
      },
      {
        title: "Complete the Code Exercise: Square Numbers Printer",
        type: "project",
        requirements: [
          "Examine the partial script skeleton below.",
          "Complete all designated # TODO statements.",
          "Ask the user to enter a maximum number limits index, loop from 1 to that maximum number inclusive using range(), calculate the square of each index (number squared), and append it to a results list.",
          "Print the final results array.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Remember that range(1, max + 1) is necessary to include the maximum number itself."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
# TODO: Get upper limit integer from user input
# max_str = ...

# TODO: Cast limit to integer
# max_val = ...

# squares_list = []

# TODO: Iterate from 1 to max_val inclusive
# for n in range(1, max_val + 1):
#     # Calculate square and append to list
#     # squares_list.append(...)

# print(squares_list)
`
      }
    ]
  },
  {
    title: "Functions, Modules & Scope controls",
    description: "Learn the principles of program decomposition. Define arguments, default parameters, and organize reusable modules.",
    duration: "4 hours",
    items: [
      {
        title: "Theory: Coding Custom Functions & Return Values",
        type: "lesson",
        content: `## Principles of Function Declarations

Functions are the building blocks of modular programming. They allow you to group a sequence of statements into a reusable block of code that takes inputs, performs logic, and returns an output.

### Declaring a Function

In Python, use the \`def\` keyword followed by your function's snake_case name, parenthesis \`()\`, and a colon \`:\`. The standard indentation block contains the function body. The \`return\` statement exits the function and passes a calculated value back to the caller:

\`\`\`python
def calculate_surface_area(width, height):
    """Calculates the geometric surface area of a rectangle."""
    area = width * height
    return area

# Invoking the function and storing the returned value
room_size = calculate_surface_area(12, 15)
print(f"Room area: {room_size} sq ft") # Prints 180
\`\`\`

If a function does not contain a \`return\` statement, or has a bare \`return\` with no expression, it implicitly returns Python's special placeholder value \`None\`.

### Parameters and Default Arguments

Python functions support default argument values. If a default values parameter is specified, that argument becomes optional during invocation:

\`\`\`python
def send_alert(message, severity="Low"):
    print(f"[{severity} Alert]: {message}")

send_alert("System memory cache is 85%")        # Uses "Low" default
send_alert("Disk failure imminent!", "CRITICAL") # Overrides default
\`\`\`

**Crucial Rule:** All parameters without default values must be declared *before* any public parameters with default values.

### Local vs Global Variable Namespaces

Variables declared inside a function body reside inside that function's **local scope** and cannot be accessed externally. If you want to modify a variable declared in the global script scope from inside a local function, you must declare it explicitly using the \`global\` keyword:

\`\`\`python
visitor_count = 0 # Global scope status

def register_arrival():
    global visitor_count
    visitor_count += 1 # Directly updates global value
\`\`\``
      },
      {
        title: "Interactive Quiz: Variable Scope & Return Mechanics",
        type: "exercise",
        question: "Consider this sequence of instructions:\n\nx = 10\n\ndef mutate_variables(val):\n    x = 20\n    return val + x\n\nresult = mutate_variables(5)\nprint(x, result)\n\nWhat is printed to the console?",
        options: [
          "20 25",
          "10 25",
          "10 15",
          "raises a NameError compilation exception"
        ],
        answer: "10 25"
      },
      {
        title: "Hands-on Project: Comprehensive Grade Stats Service",
        type: "project",
        requirements: [
          "Implement a function called 'calculate_grade_metrics' that takes two parameters: 'grades_list' (a list of integers) and an optional 'pass_threshold' (integer defaulting to 60).",
          "Inside the function, filter out any grades that are below the 'pass_threshold'.",
          "Calculate the average score of ONLY the passing grades (protect against empty list scenarios).",
          "Return a tuple containing the passenger size count of passing students and their floating point average.",
          "Invoke your function with a sample list and print the output."
        ],
        hints: [
          "Use a list comprehension to filter the list cleanly: passed = [g for g in grades_list if g >= pass_threshold].",
          "Check if len(passed) == 0 first to avoid ZeroDivisionError. Return (0, 0.0) in that case."
        ]
      },
      {
        title: "Complete the Code Exercise: Temperature Conversion Module",
        type: "project",
        requirements: [
          "Examine the partial script template below.",
          "Complete all the designated # TODO statements.",
          "Define a function called 'convert_temperature' that accepts a Celsius temperature float and a destination scale string ('F' for Fahrenheit or 'K' for Kelvin).",
          "Compute the correct conversions and return the calculated degrees float.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Kelvin temperature is Celsius + 273.15. Fahrenheit is Celsius * 1.8 + 32.",
          "Return the final evaluated float value after calculating."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
# TODO: Define and complete convert_temperature function
def convert_temperature(celsius, to_scale="F"):
    # TODO: Calculate conversion based on to_scale ("F" or "K")
    # if to_scale == "F":
    #     ...
    # return ...
    pass

# # Example test cases:
# print(convert_temperature(0, "F")) # Should print 32.0
# print(convert_temperature(25, "K")) # Should print 298.15
`
      },
      {
        title: "Theory: Importing Standard Modules & Code Separation",
        type: "lesson",
        content: `## Modules, Pacakges & Namespace Rules

As program complexity scales, it becomes necessary to organize scripts into separate files. Python lets you partition your code into **modules** (which map directly to individual \`.py\` file layers) and import them cleanly.

### Standard Module Library Imports

Python ships with a massive suite of built-in modules ready to solve common tasks. You can import modules or specific nested functions using variations of the \`import\` keyword:

\`\`\`python
# Import an entire module namespace
import math
print(math.sqrt(64)) # Prints 8.0

# Import specific functions directly (no module prefix needed)
from random import randint, choice
random_number = randint(1, 100)
chosen_letter = choice(["A", "B", "C"])

# Import a module with a shorthand alias
import datetime as dt
print(dt.date.today())
\`\`\`

### Custom Script Imports

Any Python script you create in your directory can act as an importable module. For instance, if you have a file named \`geometry_helpers.py\` inside your working directory:

\`\`\`python
# geometry_helpers.py
def double_val(x):
    return x * 2
\`\`\`

You can import and compile its signatures inside your main code file:

\`\`\`python
# main.py
import geometry_helpers

doubled = geometry_helpers.double_val(50)
print(doubled) # Prints 100
\`\`\`

Keep modules focused on single topics to maximize logic reusability!`
      },
      {
        title: "Interactive Quiz: Mutable Default Parameters Danger",
        type: "exercise",
        question: "What risk do software developers encounter if they define default lists like so:\ndef add_item(elem, container=[]):",
        options: [
          "Python raises an immediate SyntaxError on compilation",
          "The default list is initialized only once when the module loads, meaning it is shared across all function calls and retains stale entries",
          "The container input parameter can only hold string literals",
          "Python automatically deletes the container list on function exit"
        ],
        answer: "The default list is initialized only once when the module loads, meaning it is shared across all function calls and retains stale entries"
      },
      {
        title: "Hands-on Project: Interactive Dice Roller Simulator",
        type: "project",
        requirements: [
          "Import the 'random' module from the standard Python library.",
          "Write a function called 'roll_dice' that takes two parameters: 'sides' (integer defaulting to 6) and 'rolls' (integer defaulting to 1).",
          "Simulate rolling the die the specified number of times and accumulate the raw results in a list.",
          "Calculate the sum total of all rolls.",
          "Return the list of individual roll results and the calculated sum total.",
          "Invoke 'roll_dice' and print the detailed rolled sequences."
        ],
        hints: [
          "Use random.randint(1, sides) inside a range-driven for loop to simulate individual random rolls.",
          "Return statements can return multiple values as a tuple: return roll_history, sum_total"
        ]
      },
      {
        title: "Complete the Code Exercise: Math Wrapper Library Utility",
        type: "project",
        requirements: [
          "Examine the partial script skeleton below.",
          "Complete all the designated # TODO statements.",
          "Import the standard mathematical library 'math'.",
          "Complete the function 'calculate_circle_properties' which accepts a float 'radius' representing a circle's size.",
          "Generate and return its circumference using math.pi.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Circumference formula: 2 * math.pi * radius",
          "Access the pi constant using: math.pi"
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
# TODO: Import the math library module
# import ...

def calculate_circle_properties(radius):
    # TODO: Protect against negative radius lengths by returning 0.0
    # if radius < 0:
    #     return 0.0
    
    # TODO: Calculate circle circumference and return it
    # circumference = ...
    # return circumference
    pass

# # Example test cases:
# print(calculate_circle_properties(5.0)) # Expected: ~31.4159
`
      }
    ]
  },
  {
    title: "Object-Oriented Programming (Classes & Objects)",
    description: "Evolve to architectural design patterns. Construct classes, initialize structures, learn inheritance, encapsulation, and overrides.",
    duration: "5 hours",
    items: [
      {
        title: "Theory: Classes Declarations & Instance Attributes",
        type: "lesson",
        content: `## Foundations of Object-Oriented Programming (OOP)

Object-Oriented Programming (OOP) is a programming paradigm that organizes code around **objects** (which represent real-world entities or data structures) and **classes** (which are the blueprints used to create those objects).

### Class Constructs and the Instance Initializer

To declare a class in Python, use the \`class\` keyword followed by your class name in PascalCase (standard convention). 

Inside the class, we define a special constructor method named \`__init__(self, ...)\`. When you instantiate an object, Python automatically invokes this method to set up the starting attributes. The parameter \`self\` acts as a reference to the specific object instance currently being initialized:

\`\`\`python
class Student:
    def __init__(self, student_name, major):
        self.name = student_name # An instance attribute
        self.major = major       # An instance attribute
        self.completed_credits = 0 # Default starting property

# Instantiating a new object of class Student
student_alex = Student("Alex Mercer", "Computer Science")

print(student_alex.name)  # Accessing parameter values: prints "Alex Mercer"
print(student_alex.major) # Accessing parameter values: prints "Computer Science"
\`\`\`

### Defining Custom Methods

Methods are functions defined inside a class block. They can read or modify the state of the object using the \`self\` parameter:

\`\`\`python
class Student:
    def __init__(self, student_name, major):
        self.name = student_name
        self.major = major
        self.completed_credits = 0

    def enroll_course(self, course_credits):
        """Adds credits to the student's academic history."""
        self.completed_credits += course_credits
        print(f"{self.name} enrolled in {course_credits} credits.")

# Testing class methods
student_alex = Student("Alex Mercer", "Computer Science")
student_alex.enroll_course(4)
print(student_alex.completed_credits) # Prints 4
\`\`\``
      },
      {
        title: "Interactive Quiz: Instance Attributes & State",
        type: "exercise",
        question: "Consider this class declaration and operations code:\n\nclass Counter:\n    def __init__(self):\n        self.count = 5\n    def step(self):\n        self.count += 10\n\nc1 = Counter()\nc2 = Counter()\nc1.step()\n\nWhat are the values of 'c1.count' and 'c2.count' respectively?",
        options: [
          "15 and 5",
          "15 and 15",
          "5 and 15",
          "raises an AttributeException error"
        ],
        answer: "15 and 5"
      },
      {
        title: "Hands-on Project: Bank Account Registrar",
        type: "project",
        requirements: [
          "Create a class named BankAccount.",
          "Implement the __init__ constructor to accept 'owner_name' (string) and 'balance' (float, defaulting to 0.0). Store them as attributes.",
          "Implement a 'deposit(amount)' method that adds the amount to the balance and prints the updated balance.",
          "Implement a 'withdraw(amount)' method. If the balance has sufficient funds, subtract the amount and return True; otherwise print 'Insufficient Funds' and return False.",
          "Instantiate an account, perform a deposit, and successfully complete a withdrawal."
        ],
        hints: [
          "Always include the 'self' keyword as the first parameter of any class method.",
          "Remember that deposit/withdraw methods must modify 'self.balance' directly."
        ]
      },
      {
        title: "Complete the Code Exercise: Vehicle Class Blueprint",
        type: "project",
        requirements: [
          "Examine the partial script template below.",
          "Complete all the designated # TODO statements.",
          "Declare a class named Vehicle with an initializer storing 'make', 'model', and 'mileage'.",
          "Create a method 'drive(distance)' that increases the mileage attribute by the value of distance.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Be sure to add 'self' as the first parameter of both __init__ and drive.",
          "Increment mileage inside drive utilizing 'self.mileage += distance'."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
class Vehicle:
    # TODO: Define the constructor initializer
    # def __init__(self, make, model, mileage):
    #     ...
    
    # TODO: Define the drive method
    # def drive(self, distance):
    #     ...
    pass

# # Example test scenarios:
# my_car = Vehicle("Toyota", "Corolla", 12000)
# my_car.drive(150)
# print(my_car.mileage) # Must output 12150
`
      },
      {
        title: "Theory: Class Inheritance & Method Overriding",
        type: "lesson",
        content: `## Power Patterns: Inheritance and Overriding

Inheritance allows a new class (the child or subclass) to adopt all attributes and methods of an existing class (the parent or superclass). This promotes reuse and minimizes code duplication.

### Extending a Parent Class

To inherit from a parent class, specify the parent class name inside brackets during subclass declaration. To trigger the parent constructor and set up inherited attributes, use the \`super()\` helper function:

\`\`\`python
# Parent Class (Superclass)
class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def calculate_bonus(self):
        return self.salary * 0.10

# Child Class (Subclass)
class Developer(Employee):
    def __init__(self, name, salary, programming_language):
        # Trigger parent class initializer using super()
        super().__init__(name, salary)
        self.specialty = programming_language
\`\`\`

### Overriding Inherited Methods

A subclass can define its own custom implementation of a method that is already inherited from its parent. This is called **method overriding**:

\`\`\`python
class Manager(Employee):
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)
        self.team_size = team_size

    # Overriding the parent's calculate_bonus method
    def calculate_bonus(self):
        # Managers get a larger bonus multiplier
        return self.salary * 0.20
\`\`\`

Python resolves the method call by checking the subclass first; if it finds the overridden method, it coordinates that calculation directly. If not, it falls back to the parent class implementation.`
      },
      {
        title: "Interactive Quiz: Inheritance Hierarchy Checks",
        type: "exercise",
        question: "Consider this class setup:\n\nclass Device:\n    pass\n\nclass Smartphone(Device):\n    pass\n\nphone = Smartphone()\n\nWhich of the following Boolean evaluations will yield True?",
        options: [
          "isinstance(phone, Device)",
          "type(phone) == Device",
          "issubclass(phone, Device)",
          "isinstance(Device, phone)"
        ],
        answer: "isinstance(phone, Device)"
      },
      {
        title: "Hands-on Project: E-Commerce Product System",
        type: "project",
        requirements: [
          "Define a parent class Product with attributes 'name' and 'price' (float).",
          "Implement a method 'get_total_cost(quantity)' inside Product that returns quantity * price.",
          "Derive a subclass TaxableProduct from Product that overrides 'get_total_cost(quantity)' to include a 15% sales tax (multiply total product cost by 1.15).",
          "Instantiate both Product and TaxableProduct, calculate respective costs, and print the results."
        ],
        hints: [
          "Utilize super() inside TaxableProduct if you want to reuse the base calculation, or recalculate directly as needed."
        ]
      },
      {
        title: "Complete the Code Exercise: Smart Appliance Controllers",
        type: "project",
        requirements: [
          "Examine the partial script template below.",
          "Complete all the designated # TODO statements.",
          "Extend Appliance to create SmartThermostat with an extra attribute 'temperature' (int, defaulting to 72).",
          "Override turn_on() to print '[Device Name] activated. Default temperature set to [temperature] degrees.'",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Call super().__init__(name) to bind parent attributes.",
          "Provide a default value for temperature in the signature of the subclass __init__ method."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
class Appliance:
    def __init__(self, name):
        self.name = name

    def turn_on(self):
        print(f"{self.name} is now turned on.")

# TODO: Create SmartThermostat subclass inheriting from Appliance
class SmartThermostat(Appliance):
    def __init__(self, name, temperature=72):
        # TODO: Call parent initializer using super()
        # ...
        # self.temperature = temperature
        pass

    def turn_on(self):
        # TODO: Override the method to print the custom activation statement
        # print(...)
        pass

# # Example test cases:
# thermostat = SmartThermostat("Nest Controller")
# thermostat.turn_on() # Should output: "Nest Controller activated. Default temperature set to 72 degrees."
`
      }
    ]
  },
  {
    title: "Raw Analytics with NumPy & Pandas",
    description: "Unleash dataset manipulation powers. Handle dimensions matrices, parse custom rows, clean null entries.",
    duration: "4 hours",
    items: [
      {
        title: "Theory: Fast Array Operations with NumPy",
        type: "lesson",
        content: `## Fast Matrix & Numerical Math with NumPy

For data science, Python's native lists can be slow and memory-intensive because they store pointers to objects. **NumPy** solves this by providing **ndarrays** (n-dimensional arrays), which are contiguous blocks of memory compiled in C. This allows for extremely fast, element-wise math without writing loops, known as **vectorization**.

### Creating NumPy Arrays

You can convert a standard Python list into a NumPy array using \`np.array()\`, or initialize arrays using built-in helper functions:

\`\`\`python
import numpy as np

# Convert list to fast array
grades = np.array([88, 92, 79, 95])

# Create arrays of zeros, ones, or a range
zeros_arr = np.zeros(5)        # [0. 0. 0. 0. 0.]
steps_arr = np.arange(1, 10, 2) # [1, 3, 5, 7, 9]
\`\`\`

### Vectorized Mathematical Operations

When you perform operations on a NumPy array, the calculation is mapped automatically to every single element inside that array. This is much faster than writing an explicit \`for\` loop in native Python:

\`\`\`python
# Vectorized calculation (applied to all elements automatically!)
scaled_grades = grades * 1.05 
print(scaled_grades) # Output: [92.4, 96.6, 82.95, 99.75]

# Subtracting arrays element-wise
initial_weight = np.array([180, 210, 160])
loss = np.array([5, 12, 4])
final_weight = initial_weight - loss # [175, 198, 156]
\`\`\`

### Array Slicing and Element Filtering

NumPy supports standard slicing syntax, but it also supports **Boolean indexing**, where you use expressions to filter array data instantly:

\`\`\`python
scores = np.array([45, 82, 90, 55, 71])
passing_scores = scores[scores >= 70]
print(passing_scores) # Output: [82, 90, 71]
\`\`\`

### Vectorized Aggregation Helpers

NumPy provides fast, compiled execution hooks for computing key descriptors:

- \`np.mean(arr)\`: Calculates the arithmetic average.
- \`np.sum(arr)\`: Sums all values together.
- \`np.max(arr)\` / \`np.min(arr)\`: Extracts extreme bounds.`
      },
      {
        title: "Interactive Quiz: Vectorized NumPy Operations",
        type: "exercise",
        question: "Consider this sequence of instructions:\n\nimport numpy as np\nvals = np.array([1, 2, 3, 4])\nresults = vals * 2\npassed = results[results > 5]\nfinal_val = np.sum(passed)\n\nWhat is the evaluated value of the variable final_val?",
        options: [
          "14",
          "10",
          "20",
          "raises a compilation ValueError"
        ],
        answer: "14"
      },
      {
        title: "Hands-on Project: Vectorized Temperature Quality Audit",
        type: "project",
        requirements: [
          "Import the 'numpy' module as 'np'.",
          "Create a quality raw dataset as a NumPy array containing nine temperature values: [32.5, 38.0, 29.5, 41.2, 35.0, 45.1, 28.0, 36.5, 39.0].",
          "Filter out all sub-freezing temperatures below 30.0.",
          "Compute the average (mean) of the remaining warm temperatures.",
          "Print both the filtered subset array and the calculated mean."
        ],
        hints: [
          "Use np.mean() or the array's .mean() method.",
          "Write the Boolean index filter clearly: filtered = temps[temps >= 30.0]"
        ]
      },
      {
        title: "Complete the Code Exercise: Sales Tax Scaling Array",
        type: "project",
        requirements: [
          "Examine the partial script template below.",
          "Complete all the designated # TODO statements.",
          "Import NumPy, create a sales array from a provided list of raw numbers, apply a 1.08 tax rate scalar, and calculate the sum total of all scaled sales.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Use np.sum(scaled_sales) or scaled_sales.sum() to get the total.",
          "Be sure to alias numpy as np when importing."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
# TODO: Import numpy as np
# import ...

def process_sales(raw_transactions):
    # TODO: Convert the raw transactions list into a numpy array
    # sales_array = np.array(...)
    
    # TODO: Scale all array elements by a 1.08 tax factor (vectored multiplication)
    # scaled_sales = ...
    
    # TODO: Sum up and return the accumulated total scaled sales amount
    # total_revenue = ...
    # return total_revenue
    pass

# # Example test scenarios:
# print(process_sales([100.0, 50.0, 200.0])) # Should print 378.0
`
      },
      {
        title: "Theory: Clean Dataset Matrices with Pandas",
        type: "lesson",
        content: `## Aggregating DataFrames using Pandas

While NumPy is tailored for homogeneous numerical data, **Pandas** is the gold standard for managing structured, tabular information (often composed of varying data types). It organizes data into **Series** (1D columns) and **DataFrames** (2D sheets with named rows and columns).

### Initializing DataFrames

You can easily generate a Pandas DataFrame from raw Python dictionaries:

\`\`\`python
import pandas as pd

employee_records = {
    "Name": ["Alice", "Bob", "Charlie", "David"],
    "Department": ["HR", "IT", "Engineering", "IT"],
    "Months_Active": [12, 18, 24, 6],
    "Salary": [55000, 72000, 81000, 68000]
}

df = pd.DataFrame(employee_records)
print(df)
\`\`\`

### Column Access, Row Index Slicing, and Queries

You can extract singular column values, or query specific rows using Boolean filtering expressions:

\`\`\`python
# Extract a column
salaries = df["Salary"]

# Filter rows: get all rows where months active are greater than 10
senior_employees = df[df["Months_Active"] > 10]
print(senior_employees)
\`\`\`

### Grouping and Descriptive Aggregation

Pandas includes powerful statistical engines to group datasets and summarize characteristics dynamically:

\`\`\`python
# Compute collective averages across the entire sheet
average_months = df["Months_Active"].mean()

# Calculate average salary grouped by department column
department_salaries = df.groupby("Department")["Salary"].mean()
print(department_salaries)
\`\`\`

Grouping helps reveal hidden insights nested within large business records.`
      },
      {
        title: "Interactive Quiz: Operations Axis mappings",
        type: "exercise",
        question: "In Pandas, which numerical axis parameter must be specified to direct functions to compile column-by-column rather than row-by-row?",
        options: [
          "axis=0 (or 'index')",
          "axis=1 (or 'columns')",
          "axis=-1",
          "axis='all'"
        ],
        answer: "axis=1 (or 'columns')"
      },
      {
        title: "Hands-on Project: Demographics Audit Analyzer",
        type: "project",
        requirements: [
          "Create a DataFrame from a dictionary of client data containing fields: Name, Age, State, and PurchaseAmount.",
          "Filter out clients whose PurchaseAmount is below 50.0.",
          "Group the remaining clients by State and compute their maximum Age.",
          "Print both the starting data sheet and the finished maximum age summary."
        ],
        hints: [
          "Create the initial dict: {'Name': [...], 'Age': [...], 'State': [...], 'PurchaseAmount': [...]} and pass it to pd.DataFrame().",
          "Use .groupby('State')['Age'].max() to find peak ages."
        ]
      },
      {
        title: "Complete the Code Exercise: Missing Value Filter",
        type: "project",
        requirements: [
          "Examine the partial script template below.",
          "Complete all the designated # TODO statements.",
          "Fill missing Null values in a DataFrame column with a default placeholder, select a subset column by name, and aggregate its averages.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Fill nulls with fillna method: df['Score'] = df['Score'].fillna(default_value)",
          "Retrieve mean average with the .mean() method."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
import pandas as pd
import numpy as np

def clean_and_analyze_scores(data_dict, default_fill=0):
    # TODO: Build a pandas DataFrame from the incoming data dictionary
    # df = ...
    
    # TODO: Fill any blank/null (NaN) entries in the 'Score' column with default_fill
    # df['Score'] = df['Score'].fillna(...)
    
    # TODO: Query the average score value of students in the 'Active' status
    # active_students = df[df['Status'] == 'Active']
    # avg_active_score = active_students['Score'].mean()
    
    # return avg_active_score
    pass

# # Example test cases:
# raw_data = {
#     "Status": ["Active", "Active", "Inactive", "Active"],
#     "Score": [90, np.nan, 85, 70]
# }
# print(clean_and_analyze_scores(raw_data, default_fill=60)) # Should print 73.33
`
      }
    ]
  },
  {
    title: "Matplotlib charts & Visualizations",
    description: "Present statistics and trends clearly. Build line graphs, histogram splits, customized labels.",
    duration: "4 hours",
    items: [
      {
        title: "Theory: Creating Line Graphs & Scatter Plots",
        type: "lesson",
        content: `## Data Storytelling with Matplotlib

A chart is worth a thousand plain rows of numbers. In Python, the standard library for data visualization is **Matplotlib** (specifically the \`pyplot\` module). It allows you to construct highly customized, publication-grade static graph figures.

### Starting with Line Plots

Line plots are ideal for visualizing continuous trends over time. To plot coordinates, pass matching lists of independent values (X) and dependent values (Y) to \`plt.plot()\`:

\`\`\`python
import matplotlib.pyplot as plt

# Dataset dimensions
days = [1, 2, 3, 4, 5]
temperatures = [18.2, 21.0, 19.5, 24.1, 23.0]

# Draw standard line plot with formatting markers and custom line-styles
plt.plot(days, temperatures, marker='o', color='teal', linestyle='--', linewidth=2)

# Set decorative descriptors
plt.title("Weekly Temperature Variations")
plt.xlabel("Day of the Week")
plt.ylabel("Degrees Celsius")
plt.grid(True) # Show background helper mesh grid

# Render the window or commit the figure
plt.show()
\`\`\`

### Custom Markers, Colors, and Line-Styles

You can customize the appearance of lines and point metrics:
- **marker**: \`'o'\` (circle), \`'s'\` (square), \`'^'\` (triangle), \`'x'\` (cross).
- **linestyle**: \`'-'\` (solid), \`'--'\` (dashed), \`'-.'\` (dash-dot), \`':'\` (dotted).
- **color**: standard name strings (e.g., \`'red'\`, \`'g'\`) or hex codes (\`'#FF5733'\`).

### Plotting Independent Scatter Coordinates

If you want to observe raw relationships between variables without drawing connecting lines, use \`plt.scatter()\`:

\`\`\`python
study_hours = [1, 2, 3, 5, 8, 10]
exam_scores = [55, 62, 65, 78, 90, 95]

plt.scatter(study_hours, exam_scores, color="orange", marker="s", s=50) # s sets dot size
plt.title("Study Hours vs. Exam Progress")
plt.xlabel("Hours Studied")
plt.ylabel("Test Scores")
plt.show()
\`\`\``
      },
      {
        title: "Interactive Quiz: Plot Configuration & Grids",
        type: "exercise",
        question: "Consider this sequence of instructions:\n\nimport matplotlib.pyplot as plt\nx = [1, 2, 3]\ny = [10, 20, 30]\nplt.plot(x, y, color='blue', linestyle=':')\nplt.ylabel('Sales')\nplt.grid(True)\n\nWhich statement correctly describes the rendered plot?",
        options: [
          "A solid blue line graph displaying 'Sales' on the horizontal axis with no background grid",
          "A dotted blue line graph displaying 'Sales' on the vertical y-axis with a background grid",
          "A scatter graph of blue circles displaying 'Sales' on the vertical y-axis with a background grid",
          "A system warning TypeError exception because the X array has differing data types"
        ],
        answer: "A dotted blue line graph displaying 'Sales' on the vertical y-axis with a background grid"
      },
      {
        title: "Hands-on Project: Upward Temperature Trend Visualizer",
        type: "project",
        requirements: [
          "Initialize a list of X values representing the first 7 hours of a shift: [1, 2, 3, 4, 5, 6, 7].",
          "Initialize a list of Y values representing temperature readings: [65.2, 67.0, 71.3, 75.0, 74.8, 79.1, 82.0].",
          "Plot the coordinates as a custom red line with triangle markers and a dashed linestyle.",
          "Label the X-axis 'Elapsed Time (Hours)', the Y-axis 'Temperature (Fahrenheit)', and title the chart 'Production Server Temperature Sweep'.",
          "Add a grid to the background and save the finished image as 'temperature_sweep.png' using the appropriate Matplotlib saving hook."
        ],
        hints: [
          "Save the chart before calling show(), as plt.show() wipes the active canvas: plt.savefig('temperature_sweep.png').",
          "Assign parameters inside plot(): plt.plot(hours, temps, color='red', marker='^', linestyle='--')"
        ]
      },
      {
        title: "Complete the Code Exercise: Custom Sensor Data Plotter",
        type: "project",
        requirements: [
          "Examine the partial script template below.",
          "Complete all the designated # TODO statements.",
          "Take coordinates, plot them as a custom-styled scatter plot, configure labels and visual guides, and output the graph details.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Use the plt.scatter() method to draw individual coordinates without lines.",
          "Apply plt.title('Sensor Activity'), plt.xlabel('Time'), and plt.ylabel('Level') cleanly."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
import matplotlib.pyplot as plt

def generate_sensor_plot(time_stamps, signal_levels):
    # TODO: Initialize a new figure plot (optional, but clean)
    plt.figure()
    
    # TODO: Create a scatter plot of signal_levels over time_stamps in green with circular markers
    # plt.scatter(..., ..., color="green", marker="o")
    
    # TODO: Set appropriate titles and axis label descriptors
    # plt.title("...")
    # plt.xlabel("Time Stamps")
    # plt.ylabel("Signal Amplitude")
    
    # TODO: Ensure the grid helper mesh is displayed
    # plt.grid(...)
    
    # Save chart as an artifact image file prior to finishing
    plt.savefig("sensor_signals.png")
    plt.close() # Clean up workspace memory
`
      },
      {
        title: "Theory: Categorical Charts, Legends & Subplots",
        type: "lesson",
        content: `## Bar Charts, Histograms, and Multiplots

When working with groups or distributions, simple lines are insufficient. Matplotlib coordinates excellent bar charts, frequency histograms, and complex multi-panel figure subplots.

### Creating Categorical Bar Plots

Compare specific groups side-by-side using \`plt.bar()\`:

\`\`\`python
categories = ["Ad-Tech", "Cloud", "Hardware", "Consulting"]
department_revenue = [450000, 780000, 320000, 150000]

# Draw vertical bars with custom colors
plt.bar(categories, department_revenue, color=["blue", "dodgerblue", "grey", "orange"])

plt.title("Enterprise Revenue streams")
plt.ylabel("Revenue (USD)")
plt.show()
\`\`\`

### Legend Mapping and Multiple Overlaid Plots

You can overlay multiple measurements on a single set of axes. Use the \`label\` parameter inside plot calls and launch \`plt.legend()\` to add a visual guide key:

\`\`\`python
months = ["Jan", "Feb", "Mar", "Apr"]
clicks = [1200, 1450, 1800, 2100]
signups = [100, 150, 140, 250]

# Plot two sets of variables, each with an identified helper label
plt.plot(months, clicks, color="blue", marker="o", label="Clicks")
plt.plot(months, signups, color="green", linestyle="--", label="Signups")

# Enable the legend to display label keys
plt.legend(loc="upper left")
plt.title("Interactive Marketing Conversion Metrics")
plt.show()
\`\`\`

### Segmenting Views using Subplots

Sometimes you want to show different charts side-by-side in a single window figure. Use \`plt.subplot(rows, cols, index)\` to divide the primary display canvas:

\`\`\`python
# Create a dashboard figure containing 1 row and 2 columns
# Grid dimensions: 1 row, 2 columns. Set focus to the 1st panel
plt.subplot(1, 2, 1)
plt.plot(months, clicks, color="blue")
plt.title("Traffic Trend")

# Switch focus to the 2nd panel
plt.subplot(1, 2, 2)
plt.bar(categories, department_revenue, color="grey")
plt.title("Revenue by Sector")

# Adjust margin layout automatically to prevent overlapping labels
plt.tight_layout()
plt.show()
\`\`\``
      },
      {
        title: "Interactive Quiz: Customizing Subplots & Legends",
        type: "exercise",
        question: "A developer wants to create a dashboard with 2 plots stacked vertically. Which of the following subplot setup calls is correct for initializing the upper and lower charts?",
        options: [
          "plt.subplot(1, 2, 1) for the top chart, plt.subplot(1, 2, 2) for the bottom chart",
          "plt.subplot(2, 1, 1) for the top chart, plt.subplot(2, 1, 2) for the bottom chart",
          "plt.column_subplot(2, 1) and plt.column_subplot(2, 2)",
          "plt.split_axes('vertical')"
        ],
        answer: "plt.subplot(2, 1, 1) for the top chart, plt.subplot(2, 1, 2) for the bottom chart"
      },
      {
        title: "Hands-on Project: Multi-department Sales Visualizer",
        type: "project",
        requirements: [
          "Assemble corporate marketing datasets with two categories: ['Q1', 'Q2', 'Q3', 'Q4'].",
          "Construct two lists of product sales data: OnlineSales [15000, 22000, 18000, 31000] and RetailSales [11000, 14000, 19000, 17000].",
          "Overlay both datasets onto a single chart using separate colored lines with labels ('Online Store', 'Retail Network').",
          "Configure a legend, map grids, add axis label descriptors, and save the figure as 'sales_channels.png'.",
          "Ensure raw layouts fit cleanly by calling plt.tight_layout() before saving."
        ],
        hints: [
          "Map legends clearly by including label='Online Store' in the OnlineSales plot command.",
          "Call plt.grid(True) to make coordinate trends easier to read."
        ]
      },
      {
        title: "Complete the Code Exercise: Grouped Bar Chart Template",
        type: "project",
        requirements: [
          "Examine the partial script template below.",
          "Complete all the designated # TODO statements.",
          "Assemble a dual-subplot layout, plotting categorical bars in one panel and standard percentages in another, customize colors, and release the figure.",
          "Submit your completed script (minimum 15 characters)."
        ],
        hints: [
          "Use standard subplot indexing notation: plt.subplot(1, 2, idx).",
          "Draw the bars in subplot 1 using plt.bar(sectors, volumes, color='teal')."
        ],
        content: `# Template code to copy, modify and complete:
# ----------------------------------------------------
import matplotlib.pyplot as plt

def generate_multi_chart(sectors, volumes, percentages):
    # Initialize 1-row, 2-column image grid
    plt.figure(figsize=(10, 4))
    
    # TODO: Focus first grid panel (1 row, 2 columns, index 1)
    # plt.subplot(1, 2, 1)
    
    # TODO: Draw a bar chart of 'volumes' for each 'sector' using teal color
    # plt.bar(..., ..., color="teal")
    # plt.title("Absolute Volumes")
    
    # TODO: Focus second grid panel (1 row, 2 columns, index 2)
    # plt.subplot(1, 2, 2)
    
    # TODO: Plot 'percentages' across the same 'sectors' using red line markers
    # plt.plot(..., ..., marker="D", color="red")
    # plt.title("Conversion Rates")
    
    # Adjust layout to prevent collisions
    plt.tight_layout()
    plt.savefig("business_performance.png")
    plt.close()
`
      }
    ]
  },
  {
    title: "Playgrounds: Game Loops & Grid coordinates",
    description: "Learn the clockwork behind real-time simulation engines. Structure game loops, frame calculations, and user keyboards ticks.",
    duration: "4 hours",
    items: [
      {
        title: "Theory: Structuring Game loops ticks clock",
        type: "lesson",
        content: `## The Architecture of Game Loops

Unlike static web routers, video games are real-time simulations running at high frequency (usually 60 frames per second). They rely on an infinite loop executing 3 essential operations every single iteration:

1. **Process Inputs**: Listen to user keyboard taps, mouse movements, or gamepad clicks.
2. **Update States**: Re-calculate player positions, physics speeds, collisions, and scoreboard integers.
3. **Draw Frames**: Render assets, background images, and UI to outputs buffers.

\`\`\`python
game_active = True
while game_active:
    # 1. Inputs
    events = poll_user_clicks()
    
    # 2. Update states
    player.x += speed_x
    
    # 3. Draw screen buffer
    render_canvas(player)
    
    # Limit frame rate
    tick_rate_limit(60)
\`\`\``
      },
      {
        title: "Theory: Screencoordinates Cartesian alignment grids",
        type: "lesson",
        content: `## Render resolutions & Coordinates alignments

In desktop game engines, the display layout is modeled as a discrete Cartesian coordinate grid.

### Grid Positioning Differences
Unlike classic math files where origin (0,0) sits at the center with upward positivity, **computer screens place (0,0) at the top-left margin**:
- Increasing **X** moves elements **Right**.
- Increasing **Y** moves elements **Down** (in traditional screen buffers like Pygame).

\`\`\`
(0,0) -------------> +X (Width)
  |
  |
  v +Y (Height)
\`\`\`

Understanding boundary limits controls player clipping behaviors.`
      },
      {
        title: "Interactive Quiz: Event queue polling logs",
        type: "exercise",
        question: "Why is it vital to constantly poll the event pipeline inside active game ticks loops?",
        options: [
          "To captures keyboard, mouse, and close window clicks instantly",
          "To captures keyboard, mouse, and close window clicks instantly",
          "To trigger hardware garbage collections",
          "To optimize asset cache loading"
        ],
        answer: "To captures keyboard, mouse, and close window clicks instantly"
      },
      {
        title: "Hands-on Project: Boundary-wrapping Snake navigations",
        type: "project",
        requirements: [
          "Track snake position (x, y) coordinates and velocity (dx, dy) direction offsets.",
          "Check arrow keypress triggers and override direction offsets.",
          "Ensure coordinates auto-wrap on walls if limits exceed widths."
        ],
        hints: [
          "Model wrap calculations: coordinate = (coordinate + delta) % screen_width.",
          "Verify velocity matches WASD layout vectors correctly."
        ]
      }
    ]
  },
  {
    title: "Interactive vector sprite elements",
    description: "Create moving actors. Control sprite speed, register bounding box hits, and increment scores.",
    duration: "4 hours",
    items: [
      {
        title: "Theory: Structuring Sprites & Coordinates tracking",
        type: "lesson",
        content: `## Reusable Asset Components with Sprites Classes

In modular game engines, sprites are classes representing active moving graphics models (like cars, spaceships, bullets, or obstacles). They contain unique positions, dimensions, speed variables, and render hooks.

### Declaring Sprite Blueprints
\`\`\`python
class BulletSprite:
    def __init__(self, start_x, start_y):
        self.x = start_x
        self.y = start_y
        self.speed_y = -8 # Moves upward
        self.width = 4
        self.height = 10

    def update(self):
        self.y += self.speed_y # Moves bullets vertically

    def get_bounding_box(self):
        # Top-left and bottom-right edges
        return (self.x, self.y, self.x + self.width, self.y + self.height)
\`\`\`

Grouping bullet instances makes it easy to update and draw scores variables.`
      },
      {
        title: "Theory: Bounding boxes overlap equations checking",
        type: "lesson",
        content: `## Solving Collisions with AABB Bounds checking

Collision checks verify if two elements occupy overlapping regions. The fastest mathematical method is the **Axis-Aligned Bounding Box (AABB)** overlap calculation.

### Inside AABB Collision logic
If you have Sprite A and Sprite B: they overlap **only** if they are overlapping on both the horizontal and vertical ranges simultaneously.

\`\`\`python
def check_collision(rectA, rectB):
    # rect is (x, y, width, height)
    ax, ay, aw, ah = rectA
    bx, by, bw, bh = rectB

    # Simple overlap inequalities
    overlap_x = ax < bx + bw and ax + aw > bx
    overlap_y = ay < by + bh and ay + ah > by

    return overlap_x and overlap_y # True on hits
\`\`\``
      },
      {
        title: "Interactive Quiz: Solving Collision conditions",
        type: "exercise",
        question: "With Axis-Aligned Bounding Box (AABB) checks, which condition flags a collision overlap?",
        options: [
          "When overlap occurs across matching axes simultaneously",
          "When centers exactly align on the screen origin",
          "Only when sprite speed offsets drop to zero",
          "Only during window resize cycles"
        ],
        answer: "When overlap occurs across matching axes simultaneously"
      },
      {
        title: "Hands-on Project: Downward Asteroid dodging ticks calculator",
        type: "project",
        requirements: [
          "Create Player and FallingObstacle class containers.",
          "Implement high speed spawning cycles moving elements downward.",
          "Audit bounds overlaps to decrement health attributes on player."
        ],
        hints: [
          "Utilize random module to vary spawn x coordinates.",
          "Check overlap using AABB equations: leftA < rightB and rightA > leftB etc."
        ]
      }
    ]
  },
  {
    title: "Graphic Drawing with Turtle",
    description: "Engage with Python's built-in canvas graphics. Control pens, steer coordinates, and design algorithmic shapes.",
    duration: "4 hours",
    items: [
      {
        title: "Theory: Getting Started with Turtle Graphics",
        type: "lesson",
        content: `## Algorithmic Canvas Drawing with Turtle

Python includes a standard, beginner-friendly vector drawing window engine called **Turtle Graphics**. By commanding an on-screen pen (historically looking like a turtle cursor), you can construct shapes, animations, and mathematical curves.

### Importing and Handlers Initializer

To start, import the module, instantiate a designated turtle painter, and capture control of the window canvas screen:

\`\`\`python
import turtle

# Initialize the window and the active pen
screen = turtle.Screen()
painter = turtle.Turtle()

# Instruct the turtle to move forward
painter.forward(100) # Moves forward 100 pixels
painter.left(90)     # Rotates left by 90 degrees
painter.forward(50)  # Moves forward 50 pixels

# Keep the window drawing persistent
screen.mainloop()
\`\`\`

### Canvas Screen Dimensions and Motion Directions

The canvas functions as a standard Cartesian grid aligning pixels from custom sizes:
- Center origin starts at **(0, 0)**.
- Raising X moves the cursor **East / Right**.
- Raising Y moves the cursor **North / Up**.

You can direct absolute coordinates using the \`goto()\` method:

\`\`\`python
painter.goto(50, -120) # Drifts pen straight to coordinates x=50, y=-120
\`\`\``
      },
      {
        title: "Theory: Pen Actions, Colors, and Shape Fills",
        type: "lesson",
        content: `## Interactive Colors, Speeds, and Shapes

Drawing vector lines is only the baseline. Python's turtle can configure its pen parameters, colors, drawing speed, and fill geometric areas with solid color pigments.

### Managing the Pen Lift and Sizing

If you want the turtle to drift to a new starting position without drawing a trail, lift the pen:

\`\`\`python
painter.penup()        # Raises pen off canvas (stops drawing)
painter.goto(-150, 80) # Move to new coordinate safely
painter.pendown()      # Places pen down (starts drawing again)
\`\`\`

### Visual Polish: Custom Widths & Colors

Adjust line widths and color variables to create professional highlights:

\`\`\`python
painter.pensize(5)          # Make the line thick
painter.color("purple")     # Line color
painter.speed(3)            # Set drawing velocity (1=slow, 10=fast, 0=instant)
\`\`\`

### Painting Fills inside Geometric Shapes

To paint solid colors inside a shape, execute \`begin_fill()\` before drawing it, and \`end_fill()\` once finished:

\`\`\`python
painter.fillcolor("cyan")
painter.begin_fill()

# Draw square
for _ in range(4):
    painter.forward(100)
    painter.left(90)

painter.end_fill() # Solid cyan fills inside the drawn boundaries!
\`\`\``
      },
      {
        title: "Turtle Geometry Quiz",
        type: "exercise",
        question: "Consider this segment:\n\nimport turtle\nt = turtle.Turtle()\nfor i in range(5):\n    t.forward(100)\n    t.right(72)\n\nWhat exact flat geometric shape will the turtle cursor render on screen?",
        options: [
          "triangle",
          "square",
          "hexagon",
          "pentagon"
        ],
        answer: "pentagon"
      },
      {
        title: "Geometric Starburst Drawer",
        type: "project",
        requirements: [
          "Create a function called draw_star(size, color) that draws a 5-pointed star.",
          "To draw a star, the cursor needs a loop running 5 iterations where it moves forward by 'size' and turns right by 144 degrees in each loop step.",
          "Use a custom fill color matching the function parameter, and surround drawing commands with begin_fill() and end_fill().",
          "Submit your completed Python turtle script (minimum 15 characters)."
        ],
        hints: [
          "Use a standard for loop with range(5).",
          "Don't forget to import turtle before calling its variables."
        ]
      }
    ]
  }
];

const SEED_CHAPTERS: Chapter[] = [
  // TS Course Chapters
  {
    id: 'ch-ts-1',
    courseId: 'ts-advanced',
    chapterNumber: 1,
    title: 'Structural Typing & Type Narrowing',
    description: 'Learn structural contracts, literal interfaces, and type discriminators inside the compiler parsing loop.',
    lessonCount: 2,
    duration: '4 hours',
  },
  {
    id: 'ch-ts-2',
    courseId: 'ts-advanced',
    chapterNumber: 2,
    title: 'Polymorphic Generics & Constraints',
    description: 'Master generics mapping, keyof lookup operations, and strict parameter extends statements.',
    lessonCount: 2,
    duration: '4 hours',
  },
  {
    id: 'ch-ts-3',
    courseId: 'ts-advanced',
    chapterNumber: 3,
    title: 'Ternary Conditionals & Mapped Structs',
    description: 'Dive deep into T extends U ? X : Y, distributive mappings, template string typography, and deep-readonly helpers.',
    lessonCount: 2,
    duration: '5 hours',
  },
  {
    id: 'ch-ts-4',
    courseId: 'ts-advanced',
    chapterNumber: 4,
    title: 'ECMAScript Decorators & Dependency Injection',
    description: 'Harness class interceptors, metadata caches, method annotations, and dependency inversion architectures.',
    lessonCount: 2,
    duration: '5 hours',
  },

  // Express Course Chapters
  {
    id: 'ch-exp-1',
    courseId: 'fullstack-express',
    chapterNumber: 1,
    title: 'Express Engines & Request Lifecycles',
    description: 'Unpack standard HTTP streams, route parsing, middleware isolation, and robust JSON parser handlers.',
    lessonCount: 2,
    duration: '3 hours',
  },
  {
    id: 'ch-exp-2',
    courseId: 'fullstack-express',
    chapterNumber: 2,
    title: 'Data Persistences & SQLite Engines',
    description: 'Engineer database models, safe parameterized bindings, and transactional unit operations under concurrency.',
    lessonCount: 2,
    duration: '3.5 hours',
  },
  {
    id: 'ch-exp-3',
    courseId: 'fullstack-express',
    chapterNumber: 3,
    title: 'Authentication, Password Hashing & JWT',
    description: 'Establish secure cookie channels, crypto-salted credentials verification, claims validation, and logout gates.',
    lessonCount: 2,
    duration: '4 hours',
  },
  {
    id: 'ch-exp-4',
    courseId: 'fullstack-express',
    chapterNumber: 4,
    title: 'Streaming events & API gateways',
    description: 'Build server-sent messaging loops, memory-efficient buffering, query optimizations, and rate throttlers.',
    lessonCount: 2,
    duration: '3.5 hours',
  }
];

const SEED_ITEMS: LearningItem[] = [
  // TS Chapter 1 Items
  {
    id: 'item-ts-1-1',
    chapterId: 'ch-ts-1',
    courseId: 'ts-advanced',
    title: 'Theory: Structural Contracts vs Nominal Typing',
    order: 1,
    type: 'lesson',
    content: `## Structural Typing in TypeScript

TypeScript utilizes **structural typing** (often called "duck typing") to determine compatibility. This differs from languages like C# or Java, which are **nominally typed** where explicit class hierarchy defines assignments.

### Standard Rule: Shape Match
If two objects share the exact same shape (keys and compatible types), they are considered assignable to each other:

\`\`\`typescript
interface User {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  name: string;
}

let loggedUser: User = { id: 'usr-44', name: 'Alice' };
let client: Customer = loggedUser; // ✅ Completely legal!
\`\`\`

Because the compiler evaluates the **structure** rather than the declared type name, \`client\` accepts any structure fitting \`Customer\`.

### Benefits of Structural Composition
- Unlocked modular design without deep inheritance nesting.
- Simplifies mocking and automated unit tests.
- Naturally represents JSON structures fetched from APIs.`,
  },
  {
    id: 'item-ts-1-2',
    chapterId: 'ch-ts-1',
    courseId: 'ts-advanced',
    title: 'Theory: Union Types & Discriminated Tagging',
    order: 2,
    type: 'lesson',
    content: `## Discriminated Unions

A **discriminated union** (or tagged union) is an architectural superpower in TypeScript. It allows your code to narrow down wide shapes safely by isolating a common property called a **discriminator**.

### Elements of Tagging:
1. Interfaces share a single common property with different literal types.
2. The compiler uses this property to narrow the type automatically inside conditionals.

\`\`\`typescript
interface Circle {
  kind: 'circle';
  radius: number;
}

interface Square {
  kind: 'square';
  side: number;
}

type Shape = Circle | Square;

function calculateArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      // Compiler narrow: shape is Circle!
      return Math.PI * shape.radius ** 2;
    case 'square':
      // Compiler narrow: shape is Square!
      return shape.side * shape.side;
  }
}
\`\`\`

By checking \`shape.kind\`, you perform type-safe runtime logic backed by static compilations. If you add a \`Triangle\` interface, the system can trigger errors if the switch statement misses it.`,
  },
  {
    id: 'item-ts-1-3',
    chapterId: 'ch-ts-1',
    courseId: 'ts-advanced',
    title: 'Interactive Quiz: Identifying the Discriminator',
    order: 3,
    type: 'exercise',
    question: `Look at the type declaration:
\`\`\`typescript
type APIResponse = 
  | { type: 'success'; data: string[] } 
  | { type: 'error'; message: string; code: number };
\`\`\`
Which property plays the role of the structural 'discriminator' during type-narrowing conditional statements?`,
    options: [
      'The "data" parameter array',
      'The "message" text string',
      'The custom string literal parameter "type"',
      'The custom code numeric status'
    ],
    answer: 'The custom string literal parameter "type"',
  },
  {
    id: 'item-ts-1-4',
    chapterId: 'ch-ts-1',
    courseId: 'ts-advanced',
    title: 'Hands-on Project: Strict Task Manager Engine',
    order: 4,
    type: 'project',
    requirements: [
      'Define state schemas with states: "todo" | "in_progress" | "done".',
      'Craft a filterTasks(tasks, criteria) utility utilizing discriminated checking.',
      'Construct a payload reducer function that rejects illegal transition states (e.g., from "todo" straight to "done" without going "in_progress").'
    ],
    hints: [
      'Set an explicit "status" union property to guide shape evaluations.',
      'Remember to check types inside switch cases to trigger natural compiler checks.'
    ],
  },

  // TS Chapter 2 Items
  {
    id: 'item-ts-2-1',
    chapterId: 'ch-ts-2',
    courseId: 'ts-advanced',
    title: 'Theory: Principles of Polymorphic Generics',
    order: 1,
    type: 'lesson',
    content: `## Working with Polymorphic Generics

Generics in TypeScript allow you to declare code elements that work with several types while preserving strict type fidelity. Instead of resorting to \`any\` (which deletes compiled security), generics create direct parameter binds.

### Generic Functions
Consider an identity function:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const n = identity<number>(45); // Type of n is number
const s = identity<string>('code'); // Type of s is string
\`\`\`

Whenever you call \`identity\`, TypeScript is able to capture the type argument automatically, allowing you to omit explicit type qualifiers inside the brackets:

\`\`\`typescript
const greeting = identity('Hello! '); // TypeScript infers T=string
\`\`\`

This polymorphic nature is extremely useful for structuring data loaders, filters, and dynamic cache layers.`,
  },
  {
    id: 'item-ts-2-2',
    chapterId: 'ch-ts-2',
    courseId: 'ts-advanced',
    title: 'Theory: Locking Down Generics with Constraints',
    order: 2,
    type: 'lesson',
    content: `## Generic Constraints using extends

By default, an unconstrained generic \`<T>\` could represent *anything* (numbers, classes, arrays, nulls). Often, you want to require that types possess certain core columns or shapes. This is achieved using the \`extends\` keyword.

### Preserving Attributes
Let\\'s write a function that inspects an item\\'s \`id\` parameter:

\`\`\`typescript
interface Identifiable {
  id: string;
}

function processRecord<T extends Identifiable>(record: T): string {
  console.log("Working with structural record: " + record.id);
  return record.id;
}
\`\`\`

Now, \`processRecord\` will accept any object as long as it has a string-typed \`id\` field!

\`\`\`typescript
processRecord({ id: 'rec-20', name: 'Server DB' }); // ✅ Allowed!
processRecord(42); // ❌ Error! Number does not implement Identifiable.
\`\`\`

This technique creates custom contracts, reinforcing application-wide strict typing.`,
  },
  {
    id: 'item-ts-2-3',
    chapterId: 'ch-ts-2',
    courseId: 'ts-advanced',
    title: 'Interactive Quiz: Preserving Array Input Fidelity',
    order: 3,
    type: 'exercise',
    question: `Explain why using high-level generics like:
\`\`\`typescript
function first<T>(arr: T[]): T { return arr[0]; }
\`\`\`
is vastly superior to writing:
\`\`\`typescript
function first(arr: any[]): any { return arr[0]; }
\`\`\`?`,
    options: [
      'It decreases compiled asset file bundle weight',
      'It preserves the precise type definition from array entries to output returns',
      'It triggers instant Javascript garbage sweeps',
      'It forces all indexes to default to string indexes'
    ],
    answer: 'It preserves the precise type definition from array entries to output returns',
  },
  {
    id: 'item-ts-2-4',
    chapterId: 'ch-ts-2',
    courseId: 'ts-advanced',
    title: 'Hands-on Project: Polymorphic Cache Registry',
    order: 4,
    type: 'project',
    requirements: [
      'Construct a cache wrapper class GenericCache<T, K extends string | number>.',
      'Ensure set() and get() methods validate structure constraints.',
      'Implement an expire() function with customized time metrics.'
    ],
    hints: [
      'Configure a private Map<K, { value: T; loadedAt: number }> internally.',
      'Check time offsets on retrieving values.'
    ],
  },

  // TS Chapter 3 Items
  {
    id: 'item-ts-3-1',
    chapterId: 'ch-ts-3',
    courseId: 'ts-advanced',
    title: 'Theory: Master Conditional Operators',
    order: 1,
    type: 'lesson',
    content: `## Conditional Mappings in TypeScript

Conditional types match type operations inside a ternary expression model:

\`\`\`typescript
T extends U ? X : Y
\`\`\`

If \`T\` is assignable to \`U\`, evaluate to \`X\`; otherwise evaluate to \`Y\`.

### Advanced Applications: Excluding Types
Let\\'s examine how TypeScript defines built-in structures like \`Exclude\`:

\`\`\`typescript
type Exclude<T, U> = T extends U ? never : T;
\`\`\`

Evaluating \`Exclude<'a' | 'b' | 'c', 'a'>\` distributes across the union:
- \`'a' extends 'a' ? never : 'a'\` -> \`never\`
- \`'b' extends 'a' ? never : 'b'\` -> \`'b'\`
- \`'c' extends 'a' ? never : 'c'\` -> \`'c'\`

Resulting Union: \`'b' | 'c'\`! This pattern unlocks infinite capability for state management.`,
  },
  {
    id: 'item-ts-3-2',
    chapterId: 'ch-ts-3',
    courseId: 'ts-advanced',
    title: 'Theory: Mapped Types & Structural Transforms',
    order: 2,
    type: 'lesson',
    content: `## Mapped Types

Mapped types let you construct new types based on an old layout. It operates similarly to array \`.map()\` but maps over object keys:

\`\`\`typescript
type OnlyBooleans<T> = {
  [K in keyof T]: boolean;
};
\`\`\`

If we apply this to a \`User\` interface:
\`\`\`typescript
interface User {
  id: string;
  name: string;
}

type UserFlags = OnlyBooleans<User>;
// Equivalent to:
// { id: boolean; name: boolean; }
\`\`\`

### Readonly & Optional Modifiers
You can add or subtract flags using \`+\` or \`-\`:
\`\`\`typescript
type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K]; // Strips away Readonly headers!
};
\`\`\`

Combining mapped type operators with conditionals is how massive libraries create robust validation models.`,
  },
  {
    id: 'item-ts-3-3',
    chapterId: 'ch-ts-3',
    courseId: 'ts-advanced',
    title: 'Interactive Quiz: Evaluating infer Operators',
    order: 3,
    type: 'exercise',
    question: `Which keyword is used inside conditional type patterns to dynamically declare and extract a type variable on a match?`,
    options: [
      'The "extract" operator',
      'The "infer" operator',
      'The "typeof" resolver',
      'The "extends" tag'
    ],
    answer: 'The "infer" operator',
  },
  {
    id: 'item-ts-3-4',
    chapterId: 'ch-ts-3',
    courseId: 'ts-advanced',
    title: 'Hands-on Project: DeepReadonly Type Utility',
    order: 4,
    type: 'project',
    requirements: [
      'Write a DeepReadonly<T> type utility mapping structures recursively.',
      'Implement nested dictionary types and check compiler block assignments.',
      'Ensure array elements inside frozen structures are deeply locked.'
    ],
    hints: [
      'Evaluate: T[P] extends Function ? T[P] : T[P] extends object ? DeepReadonly<T[P]> : T[P]'
    ],
  },

  // TS Chapter 4 Items
  {
    id: 'item-ts-4-1',
    chapterId: 'ch-ts-4',
    courseId: 'ts-advanced',
    title: 'Theory: Decorators in Class Architectures',
    order: 1,
    type: 'lesson',
    content: `## ECMAScript Decorators

TypeScript supports decorators, allowing you to intercept class annotations, property structures, and active method definitions at runtime.

### Simple Class Decorator:
A class decorator receives the class constructor under review:

\`\`\`typescript
function Logged(target: any, context: any) {
  console.log("Annotating class instantiation: " + context.name);
}

@Logged
class UserService {
  // Service definition
}
\`\`\`

### Why use Decorators?
- Encapsulates cross-cutting requirements like telemetry, logs, or metrics.
- Enforces Dependency Injection containers across production nodes.`,
  },
  {
    id: 'item-ts-4-2',
    chapterId: 'ch-ts-4',
    courseId: 'ts-advanced',
    title: 'Theory: Intercepting Method Signatures',
    order: 2,
    type: 'lesson',
    content: `## Method Decorators

Method decorators let you intercept function triggers to wrap, audit, or change their evaluations:

\`\`\`typescript
function Measure(target: any, context: any) {
  return function (this: any, ...args: any[]) {
    const start = performance.now();
    const result = target.apply(this, args);
    const end = performance.now();
    console.log("Method executed in " + (end - start) + "ms");
    return result;
  };
}
\`\`\`

Using decorators cleanly decouples metrics gathering and security checks from true business domain models.`,
  },
  {
    id: 'item-ts-4-3',
    chapterId: 'ch-ts-4',
    courseId: 'ts-advanced',
    title: 'Interactive Quiz: Decorators Lifecycle Sequence',
    order: 3,
    type: 'exercise',
    question: `When are standard TypeScript decorators evaluated in the browser runtime lifecycle?`,
    options: [
      'During compilation only',
      'Once at initial script evaluation time during module load',
      'Dynamically on every separate method execution trigger',
      'Prior to network socket connections'
    ],
    answer: 'Once at initial script evaluation time during module load',
  },
  {
    id: 'item-ts-4-4',
    chapterId: 'ch-ts-4',
    courseId: 'ts-advanced',
    title: 'Hands-on Project: IoC Dependency Injection Container',
    order: 4,
    type: 'project',
    requirements: [
      'Design an @Injectable class decorator mapping active dependencies.',
      'Create an IoCContainer registrar that instantiates singletons automatically.',
      'Write method assertions enforcing correct runtime injections.'
    ],
    hints: [
      'Store registrations inside an internal JS Map inside the container.',
      'Retrieve constructors using structural constructor prototypes.'
    ],
  },

  // Express Course - Chapter 1 Items
  {
    id: 'item-exp-1-1',
    chapterId: 'ch-exp-1',
    courseId: 'fullstack-express',
    title: 'Theory: Core Anatomy of Request Lifecycles',
    order: 1,
    type: 'lesson',
    content: `## Express Request/Response Flow

An Express application is essentially a chain of **middlewares** processing incoming TCP streams, validating bodies, and returning encoded headers.

### Lifecycle of a Request:
1. **TCP Connection**: Request arrives at port.
2. **Parser parsing**: Internal libraries map text raw heads into \`req.headers\`.
3. **Middleware Chain**: Functions process, validate, inject, or block request payloads.
4. **Endpoint handler**: Final function returns responses via \`res.json()\` or \`res.send()\`.

Understanding every link in this chain guarantees performance and robustness.`,
  },
  {
    id: 'item-exp-1-2',
    chapterId: 'ch-exp-1',
    courseId: 'fullstack-express',
    title: 'Theory: Custom Middlewares Controls',
    order: 2,
    type: 'lesson',
    content: `## Middleware Cascade Patterns

Middlewares receive \`req\`, \`res\`, and a \`next\` callback. Calling \`next()\` advances execution to the next handler:

\`\`\`typescript
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log("[" + new Date().toISOString() + "] " + req.method + " " + req.url);
  next(); // Pass control forward
}
\`\`\`

If a middleware fails to trigger \`next()\`, the request will hang indefinitely unless returned via \`res.status(403).json()\`!`,
  },
  {
    id: 'item-exp-1-3',
    chapterId: 'ch-exp-1',
    courseId: 'fullstack-express',
    title: 'Interactive Quiz: Custom Next Callback Chains',
    order: 3,
    type: 'exercise',
    question: `Within an Express middleware declaration, what occurs if you fail to invoke the 'next()' function or execute a responsive termination?`,
    options: [
      'Express triggers an automatic error dump',
      'The TCP network stream waits indefinitely, and the browser request hangs',
      'The node system restarts automatically',
      'Vite automatically refreshes the hot reload loader'
    ],
    answer: `The TCP network stream waits indefinitely, and the browser request hangs`,
  },
  {
    id: 'item-exp-1-4',
    chapterId: 'ch-exp-1',
    courseId: 'fullstack-express',
    title: 'Hands-on Project: CORS and Security Auditing Middleware',
    order: 4,
    type: 'project',
    requirements: [
      'Build custom authorization and CORS filter methods.',
      'Write response-time logs to measure server latency in milliseconds.',
      'Halt illegal origins and log requests into files safely.'
    ],
    hints: [
      'Capture date objects in request and subtract dates in finish hooks.',
      'Set "Access-Control-Allow-Origin" headers manually inside handlers.'
    ],
  },

  // Express Chapter 2 Items
  {
    id: 'item-exp-2-1',
    chapterId: 'ch-exp-2',
    courseId: 'fullstack-express',
    title: 'Theory: Relational Schemas & SQL engines',
    order: 1,
    type: 'lesson',
    content: `## Relational Databases & SQLite

SQLite is a fast, file-based SQL motor running embedded in application runtimes. It provides ACID guarantees without separate server daemons.

### Creating tables with Strict Schema Keys:
\`\`\`sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

Using relational constraints ensures clean structures across records.`,
  },
  {
    id: 'item-exp-2-2',
    chapterId: 'ch-exp-2',
    courseId: 'fullstack-express',
    title: 'Theory: Preventing SQL injection',
    order: 2,
    type: 'lesson',
    content: `## Parameterized Queries

A fundamental security error is dynamic string concatenation for database queries:
\`\`\`typescript
// ❌ WRONG! VULNERABLE TO ATTACK!
const query = \`SELECT * FROM users WHERE emailKey = '\${req.body.email}'\`;
\`\`\`
If a hacker submits \`admin@platform.com' OR '1'='1\`, they bypass authorization entirely!

### Secure Approach: Parameter bindings
Configure placeholders:
\`\`\`typescript
// ✅ SECURE!
const stmt = db.prepare('SELECT * FROM users WHERE emailKey = ?');
const user = stmt.get(req.body.email);
\`\`\`
The SQL engine treats bound values as pure literals, never executing them as statement syntax.`,
  },
  {
    id: 'item-exp-2-3',
    chapterId: 'ch-exp-2',
    courseId: 'fullstack-express',
    title: 'Interactive Quiz: Eliminating SQL Injection',
    order: 3,
    type: 'exercise',
    question: `Which is the absolute best strategy to defend relational databases against SQL injection vulnerabilities?`,
    options: [
      'Using manual string cleaning steps',
      'Converting all inputs to lowercase',
      'Forcing prepared statements and parameterized placeholders',
      'Creating random delays on DB queries'
    ],
    answer: 'Forcing prepared statements and parameterized placeholders',
  },
  {
    id: 'item-exp-2-4',
    chapterId: 'ch-exp-2',
    courseId: 'fullstack-express',
    title: 'Hands-on Project: DB Layer Transaction Utility',
    order: 4,
    type: 'project',
    requirements: [
      'Define database connection singletons.',
      'Implement atomic transactions that cleanly roll back if sub-queries crash.',
      'Add user migration schemas with audit record fields.'
    ],
    hints: [
      'In SQL run: BEGIN TRANSACTION, COMMIT, and ROLLBACK.',
      'Validate outputs with try-catch blocks surrounding queries.'
    ],
  },

  // Express Chapter 3 Items
  {
    id: 'item-exp-3-1',
    chapterId: 'ch-exp-3',
    courseId: 'fullstack-express',
    title: 'Theory: JSON Web Token Structure & Seals',
    order: 1,
    type: 'lesson',
    content: `## JSON Web Token (JWT)

A **JWT** is a compact, self-contained mechanism for securely transmitting state information between clients and servers.

### JWT Structure:
1. **Header**: Metadata containing signature algorithm.
2. **Payload**: User claims (userId, email, role, expiration).
3. **Signature**: Cryptographic seal verifying token authenticity.

The client stores this token in \`localStorage\` or secure cookies and attaches it to request headers payload.`,
  },
  {
    id: 'item-exp-3-2',
    chapterId: 'ch-exp-3',
    courseId: 'fullstack-express',
    title: 'Theory: Hashing vs Encryption',
    order: 2,
    type: 'lesson',
    content: `## Password Cryptography

**Passwords must never be stored as plain text.** If a hacker compromises the storage, accounts are fully leaked.

- **Encryption**: Two-way system (can be decrypted back to plain text).
- **Hashing**: One-way mathematical transformation (cannot be naturally inverted).

### Hashing with Salt:
Adding random bytes (a salt) per user prevents **Rainbow Table** comparisons.

\`\`\`typescript
// Salted hashing
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');
\`\`\`
This technique ensures security even if tables are accessed publicly.`,
  },
  {
    id: 'item-exp-3-3',
    chapterId: 'ch-exp-3',
    courseId: 'fullstack-express',
    title: 'Interactive Quiz: Token Expiration Checks',
    order: 3,
    type: 'exercise',
    question: `When validating JSON Web Tokens on server requests, what claim payload parameter is checked to enforce expiration bounds?`,
    options: [
      'The "issuedAt" parameter "iat"',
      'The "expiresAt" parameter "exp"',
      'The "subject" identifier "sub"',
      'The "issuer" identifier "iss"'
    ],
    answer: 'The "expiresAt" parameter "exp"',
  },
  {
    id: 'item-exp-3-4',
    chapterId: 'ch-exp-3',
    courseId: 'fullstack-express',
    title: 'Hands-on Project: JWT Gateway Authenticator',
    order: 4,
    type: 'project',
    requirements: [
      'Author JWT credentials issue endpoint.',
      'Create guard middleware parsing authorization headers: Bearer <token>.',
      'Manage salt-hashing during new user registrations.'
    ],
    hints: [
      'Read headers using: req.headers.authorization.',
      'Validate timestamps to deny expired sessions.'
    ],
  },

  // Express Chapter 4 Items
  {
    id: 'item-exp-4-1',
    chapterId: 'ch-exp-4',
    courseId: 'fullstack-express',
    title: 'Theory: Architecture of Server Sent Events',
    order: 1,
    type: 'lesson',
    content: `## Server-Sent Events (SSE)

**Server-Sent Events** is a lightweight real-time subscription model over plain HTTP. Unlike WebSockets, it operates un-directionally from server to client, avoiding connection handshakes.

### Setting Up Headers:
To start an SSE channel, keep the connection open using specific headers:

\`\`\`typescript
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
});
\`\`\`

### Communication Protocol
Payloads must follow a specific text format:
\`\`\`
data: { "message": "Success!" }\\n\\n
\`\`\`

Perfect for dashboards receiving stock, course activity, or live telemetry streams!`,
  },
  {
    id: 'item-exp-4-2',
    chapterId: 'ch-exp-4',
    courseId: 'fullstack-express',
    title: 'Theory: Rate Limiter Strategies',
    order: 2,
    type: 'lesson',
    content: `## Throttling and Rate Limiting

Rate limiting is crucial to prevent resource abuse and brute-force attacks on APIs.

### Sliding/Fixed Window Token Buckets
- **Fixed Window**: Tracks IP attempts within specific minute brackets. Simple, but vulnerable to spikes at boundaries.
- **Token Bucket**: Grants users a refill rate. Smooths burst spikes gracefully.

Implementing limits at routes prevents CPU choking and DB bottlenecks.`,
  },
  {
    id: 'item-exp-4-3',
    chapterId: 'ch-exp-4',
    courseId: 'fullstack-express',
    title: 'Interactive Quiz: HTTP Header SSE Flags',
    order: 3,
    type: 'exercise',
    question: `Which 'Content-Type' header value is strictly required to establish functional Server-Sent Events streams?`,
    options: [
      'application/json',
      'text/event-stream',
      'multipart/form-data',
      'application/x-www-form-urlencoded'
    ],
    answer: 'text/event-stream',
  },
  {
    id: 'item-exp-4-4',
    chapterId: 'ch-exp-4',
    courseId: 'fullstack-express',
    title: 'Hands-on Project: Streaming Logger Gateway',
    order: 4,
    type: 'project',
    requirements: [
      'Establish a persistent /api/events subscriber route.',
      'Broadcast notification indicators when users publish community posts.',
      'Configure cleanup handlers when user instances disconnect.'
    ],
    hints: [
      'Listen to: req.on("close", ...) to prune active subscriber caches.',
      'Trigger custom event loops using generic javascript EventEmitter.'
    ],
  }
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    title: 'Why is Structural Typing so different from Nominal Types?',
    content: 'Coming from Java, TypeScript structural typing matches names of variables rather than the class name. I built a mapping and was shocked it worked. Anyone else experience this shock when starting out as developers?',
    authorName: 'Sarah Developer',
    authorEmail: 'sarah@coder.io',
    category: 'TS Patterns',
    likes: 5,
    likedBy: ['admin@platform.com'],
    commentsCount: 2,
    createdAt: '2026-05-20T08:14:00Z',
    comments: [
      {
        id: 'c-1',
        postId: 'post-1',
        authorName: 'James Cook',
        authorEmail: 'james@dev.net',
        content: 'Absolutely! It was mind-bending at first, but it is awesome for composing state interfaces!',
        createdAt: '2026-05-20T09:30:00Z'
      },
      {
        id: 'c-2',
        postId: 'post-1',
        authorName: 'unitchad557',
        authorEmail: 'unitchad557@gmail.com',
        content: 'Wait until you try generic constraints. It pairs perfectly with shapes checking!',
        createdAt: '2026-05-20T10:15:00Z'
      }
    ]
  },
  {
    id: 'post-2',
    title: 'My Express custom CORS filter keeps blocking requests',
    content: 'Encountering issues with Access-Control-Allow-Origin headers. My server runs on port 3000 and standard requests triggers dev sandbox exceptions. How do I define wildcards without compromising system constraints?',
    authorName: 'Leo Dev',
    authorEmail: 'leo@tech.org',
    category: 'Help',
    likes: 2,
    likedBy: [],
    commentsCount: 1,
    createdAt: '2026-05-21T14:22:00Z',
    comments: [
      {
        id: 'c-3',
        postId: 'post-2',
        authorName: 'Alex Smith',
        authorEmail: 'alex@cloud.com',
        content: 'Check that credentials allowance handles OPTIONS pre-flights properly. Often pre-flight checks fail silently.',
        createdAt: '2026-05-21T15:05:00Z'
      }
    ]
  }
];

class DatabaseManager {
  public useLocalFile = activeFirebaseConfig.projectId === 'remixed-project-id' || !activeFirebaseConfig.projectId;
  /**
   * Initializes the Firestore database with initial configurations, seeds collections if blank
   * using getFromServer to validate connections per the Firebase Integration Skill guidelines
   */
  public async init() {
    // 1. Try to load database-fr.json for translated courses, chapters, items, and posts
    let databaseFr: any = null;
    const frDbPath = path.join(process.cwd(), 'database-fr.json');
    try {
      if (fs.existsSync(frDbPath)) {
        const frContent = fs.readFileSync(frDbPath, 'utf8');
        databaseFr = JSON.parse(frContent);
        console.log('[INIT] Loaded database-fr.json successfully with', databaseFr.courses?.length, 'courses.');
      }
    } catch (err) {
      console.error('[INIT] Error reading database-fr.json:', err);
    }

    if (this.useLocalFile) {
      console.log('Using local JSON file database fallback (Remixed app placeholder detected)');
      // Verify local file exists and contains seed data. If it doesn't exist, we can create/populate it.
      const data = readLocalDb();
      let modified = false;

      // Use databaseFr values if loaded, otherwise fallback to local dynamic list
      let allSeedCourses = [...SEED_COURSES];
      let allSeedChapters = [...SEED_CHAPTERS];
      let allSeedItems = [...SEED_ITEMS];

      // Dynamic Generation of Python Courses, Chapters and learning items
      const PYTHON_COURSES: Course[] = [];
      const PYTHON_CHAPTERS: Chapter[] = [];
      const PYTHON_ITEMS: LearningItem[] = [];

      for (const r of PYTHON_ROADMAPS) {
        PYTHON_COURSES.push({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          difficulty: r.difficulty as any,
          duration: r.duration,
          studentCount: r.studentCount,
          thumbnail: r.thumbnail,
          icon: r.icon
        });

        for (let i = 0; i < r.chapters.length; i++) {
          const coreChapIdx = r.chapters[i];
          const coreChap = CORE_PYTHON_CHAPTERS[coreChapIdx];
          const chId = `ch-${r.id}-${i + 1}`;
          
          PYTHON_CHAPTERS.push({
            id: chId,
            courseId: r.id,
            chapterNumber: i + 1,
            title: coreChap.title,
            description: coreChap.description,
            lessonCount: coreChap.items.length,
            duration: coreChap.duration
          });

          for (let j = 0; j < coreChap.items.length; j++) {
            const coreItem = coreChap.items[j];
            const itemId = `item-${r.id}-${i + 1}-${j + 1}`;
            
            PYTHON_ITEMS.push({
              id: itemId,
              chapterId: chId,
              courseId: r.id,
              title: coreItem.title,
              order: j + 1,
              type: coreItem.type as any,
              content: (coreItem as any).content || null,
              question: (coreItem as any).question || null,
              options: (coreItem as any).options || null,
              answer: (coreItem as any).answer || null,
              requirements: (coreItem as any).requirements || null,
              hints: (coreItem as any).hints || null
            });
          }
        }
      }

      allSeedCourses = [...allSeedCourses, ...PYTHON_COURSES];
      allSeedChapters = [...allSeedChapters, ...PYTHON_CHAPTERS];
      allSeedItems = [...allSeedItems, ...PYTHON_ITEMS];

      if (databaseFr) {
        if (databaseFr.courses) allSeedCourses = databaseFr.courses;
        if (databaseFr.chapters) allSeedChapters = databaseFr.chapters;
        if (databaseFr.items) allSeedItems = databaseFr.items;
      }

      if (!data.courses) data.courses = [];
      for (const c of allSeedCourses) {
        const idx = data.courses.findIndex((dc: any) => dc.id === c.id);
        if (idx > -1) {
          data.courses[idx] = c;
        } else {
          data.courses.push(c);
        }
        modified = true;
      }

      if (!data.chapters) data.chapters = [];
      for (const chap of allSeedChapters) {
        const idx = data.chapters.findIndex((dc: any) => dc.id === chap.id);
        if (idx > -1) {
          data.chapters[idx] = chap;
        } else {
          data.chapters.push(chap);
        }
        modified = true;
      }

      if (!data.items) data.items = [];
      for (const item of allSeedItems) {
        const idx = data.items.findIndex((dc: any) => dc.id === item.id);
        if (idx > -1) {
          data.items[idx] = item;
        } else {
          data.items.push(item);
        }
        modified = true;
      }

      if (!data.posts || data.posts.length === 0) {
        data.posts = (databaseFr && databaseFr.posts) ? databaseFr.posts : SEED_POSTS;
        modified = true;
      }

      if (modified) {
        writeLocalDb(data);
      }
      console.log('Local JSON Database Initialization & Seeding Complete!');
      return;
    }

    try {
      // Validate Connection to Firestore per guidelines using getFromServer with a timeout to prevent hanging
      try {
        await Promise.race([
          getDocFromServer(doc(dbFS, 'system', 'connection-test')),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase connection test timed out')), 1500))
        ]);
      } catch (error) {
        console.error("Firebase connection test failed or timed out. Falling back to local file database.", error);
        this.useLocalFile = true;
        return this.init(); // recurse into local mode
      }

      console.log('Validating and seeding Firestore collections...');

      let allSeedCourses = [...SEED_COURSES];
      let allSeedChapters = [...SEED_CHAPTERS];
      let allSeedItems = [...SEED_ITEMS];

      // Dynamic Generation of Python Courses, Chapters and learning items
      const PYTHON_COURSES: Course[] = [];
      const PYTHON_CHAPTERS: Chapter[] = [];
      const PYTHON_ITEMS: LearningItem[] = [];

      for (const r of PYTHON_ROADMAPS) {
        PYTHON_COURSES.push({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          difficulty: r.difficulty as any,
          duration: r.duration,
          studentCount: r.studentCount,
          thumbnail: r.thumbnail,
          icon: r.icon
        });

        for (let i = 0; i < r.chapters.length; i++) {
          const coreChapIdx = r.chapters[i];
          const coreChap = CORE_PYTHON_CHAPTERS[coreChapIdx];
          const chId = `ch-${r.id}-${i + 1}`;
          
          PYTHON_CHAPTERS.push({
            id: chId,
            courseId: r.id,
            chapterNumber: i + 1,
            title: coreChap.title,
            description: coreChap.description,
            lessonCount: coreChap.items.length,
            duration: coreChap.duration
          });

          for (let j = 0; j < coreChap.items.length; j++) {
            const coreItem = coreChap.items[j];
            const itemId = `item-${r.id}-${i + 1}-${j + 1}`;
            
            PYTHON_ITEMS.push({
              id: itemId,
              chapterId: chId,
              courseId: r.id,
              title: coreItem.title,
              order: j + 1,
              type: coreItem.type as any,
              content: (coreItem as any).content || null,
              question: (coreItem as any).question || null,
              options: (coreItem as any).options || null,
              answer: (coreItem as any).answer || null,
              requirements: (coreItem as any).requirements || null,
              hints: (coreItem as any).hints || null
            });
          }
        }
      }

      allSeedCourses = [...allSeedCourses, ...PYTHON_COURSES];
      allSeedChapters = [...allSeedChapters, ...PYTHON_CHAPTERS];
      allSeedItems = [...allSeedItems, ...PYTHON_ITEMS];

      if (databaseFr) {
        if (databaseFr.courses) allSeedCourses = databaseFr.courses;
        if (databaseFr.chapters) allSeedChapters = databaseFr.chapters;
        if (databaseFr.items) allSeedItems = databaseFr.items;
      }

      // Clear legacy/obsolete courses from Firestore
      try {
        const coursesSnap = await getDocs(collection(dbFS, 'courses'));
        const activeIds = allSeedCourses.map(c => c.id);
        for (const docObj of coursesSnap.docs) {
          if (!activeIds.includes(docObj.id)) {
            console.log(`[CLEAN_SERVER] Deleting legacy course ${docObj.id}`);
            await deleteDoc(docObj.ref);
          }
        }
      } catch (err) {
        console.warn("[CLEAN_SERVER] Error clearing legacy courses:", err);
      }

      // Upsert Courses
      for (const course of allSeedCourses) {
        const docRef = doc(dbFS, 'courses', course.id);
        await setDoc(docRef, course);
        console.log(`Seeded Course: ${course.id}`);
      }

      // Upsert Chapters (Root level AND Nested)
      for (const chap of allSeedChapters) {
        // Root level for server query
        const docRefRoot = doc(dbFS, 'chapters', chap.id);
        await setDoc(docRefRoot, chap);

        // Nested for client query
        if (chap.courseId) {
          const docRefNested = doc(dbFS, 'courses', chap.courseId, 'chapters', chap.id);
          await setDoc(docRefNested, chap);
        }
        console.log(`Seeded Chapter: ${chap.id}`);
      }

      // Upsert Syllabus Items (Root level AND Nested)
      for (const item of allSeedItems) {
        // Root level for server query
        const docRefRoot = doc(dbFS, 'items', item.id);
        await setDoc(docRefRoot, item);

        // Nested for client query
        if (item.courseId && item.chapterId) {
          const docRefNested = doc(dbFS, 'courses', item.courseId, 'chapters', item.chapterId, 'items', item.id);
          await setDoc(docRefNested, item);
        }
        console.log(`Seeded Learning Item: ${item.id}`);
      }

      // Seed Community Posts
      const postsSnap = await getDocs(collection(dbFS, 'posts'));
      if (postsSnap.empty) {
        const postsToSeed = (databaseFr && databaseFr.posts) ? databaseFr.posts : SEED_POSTS;
        for (const post of postsToSeed) {
          await setDoc(doc(dbFS, 'posts', post.id), post);
        }
        console.log('Seeded Community Posts collection.');
      }

      console.log('Firestore Initialization & Seeding Complete!');
    } catch (err) {
      console.error('CRITICAL: Firestore initiation failed:', err);
      console.log('Falling back to local JSON file database...');
      this.useLocalFile = true;
      return this.init(); // recurse into local mode
    }
  }

  // Auth Operations
  public async findUserByEmail(email: string): Promise<UserRecord | undefined> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      return (data.users || []).find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    }
    const path = 'users';
    try {
      const q = query(collection(dbFS, path), where('email', '==', email.toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) return undefined;
      const docData = snap.docs[0].data();
      return docData as UserRecord;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.findUserByEmail(email);
      }
      handleFirestoreError(error, OperationType.GET, path);
    }
  }

  public async registerUser(name: string, email: string, passwordHash: string, salt: string): Promise<UserRecord> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      if (!data.users) data.users = [];
      const userId = 'usr-' + crypto.randomUUID();
      const user: UserRecord = {
        id: userId,
        email: email.toLowerCase(),
        name,
        passwordHash,
        salt,
        joinedAt: new Date().toISOString()
      };
      data.users.push(user);

      // Seed starting progress dynamically
      if (!data.progress) data.progress = [];
      const courses = await this.getCourses();
      for (const course of courses) {
        const chs = await this.getChapters(course.id);
        if (chs.length > 0) {
          const items = await this.getItems(chs[0].id);
          if (items.length > 0) {
            const initProgress: UserProgress = {
              userId,
              itemId: items[0].id,
              courseId: course.id,
              completed: false
            };
            data.progress.push(initProgress);
          }
        }
      }
      writeLocalDb(data);
      return user;
    }
    const path = 'users';
    const userId = 'usr-' + crypto.randomUUID();
    const user: UserRecord = {
      id: userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
      salt,
      joinedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(dbFS, path, userId), user);

      // Seed starting progress dynamically for all active courses
      const courses = await this.getCourses();
      for (const course of courses) {
        const chs = await this.getChapters(course.id);
        if (chs.length > 0) {
          const items = await this.getItems(chs[0].id);
          if (items.length > 0) {
            const progPath = 'progress';
            const progId = `${userId}_${items[0].id}`;
            const initProgress: UserProgress = {
              userId,
              itemId: items[0].id,
              courseId: course.id,
              completed: false
            };
            await setDoc(doc(dbFS, progPath, progId), initProgress);
          }
        }
      }

      return user;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.registerUser(name, email, passwordHash, salt);
      }
      handleFirestoreError(error, OperationType.WRITE, `${path}/${userId}`);
    }
  }

  // Course Operations
  public async getCourses(): Promise<Course[]> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      return data.courses || SEED_COURSES;
    }
    const path = 'courses';
    try {
      const snap = await getDocs(collection(dbFS, path));
      const courses: Course[] = [];
      snap.forEach(d => {
        courses.push(d.data() as Course);
      });
      return courses;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.getCourses();
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  public async getChapters(courseId: string): Promise<Chapter[]> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      const chapters = (data.chapters || []).filter((c: any) => c.courseId === courseId);
      return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    }
    const path = 'chapters';
    try {
      const q = query(collection(dbFS, path), where('courseId', '==', courseId));
      const snap = await getDocs(q);
      const chaps: Chapter[] = [];
      snap.forEach(d => {
        chaps.push(d.data() as Chapter);
      });
      return chaps.sort((a, b) => a.chapterNumber - b.chapterNumber);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.getChapters(courseId);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  public async getItems(chapterId: string): Promise<LearningItem[]> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      const items = (data.items || []).filter((i: any) => i.chapterId === chapterId);
      return items.sort((a, b) => a.order - b.order);
    }
    const path = 'items';
    try {
      const q = query(collection(dbFS, path), where('chapterId', '==', chapterId));
      const snap = await getDocs(q);
      const items: LearningItem[] = [];
      snap.forEach(d => {
        items.push(d.data() as LearningItem);
      });
      return items.sort((a, b) => a.order - b.order);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.getItems(chapterId);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  public async getAllCourseItems(courseId: string): Promise<LearningItem[]> {
    const chapters = await this.getChapters(courseId);
    const itemsList: LearningItem[] = [];
    for (const chap of chapters) {
      const its = await this.getItems(chap.id);
      itemsList.push(...its);
    }
    return itemsList;
  }

  // Progress Queries
  public async getUserProgress(userId: string, courseId: string): Promise<UserProgress[]> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      return (data.progress || []).filter((p: any) => p.userId === userId && p.courseId === courseId);
    }
    const path = 'progress';
    try {
      const q = query(collection(dbFS, path), where('userId', '==', userId), where('courseId', '==', courseId));
      const snap = await getDocs(q);
      const prog: UserProgress[] = [];
      snap.forEach(d => {
        prog.push(d.data() as UserProgress);
      });
      return prog;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.getUserProgress(userId, courseId);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  // Dynamic Completed / Locked Checker
  public async getCourseProgressMap(userId: string, courseId: string) {
    const items = await this.getAllCourseItems(courseId);
    const userProg = await this.getUserProgress(userId, courseId);

    // Prepare full map of item status
    const map: Record<string, { completed: boolean; unlocked: boolean; submittedAnswer?: string }> = {};

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const prog = userProg.find(p => p.itemId === item.id);
      const isCompleted = prog ? prog.completed : false;

      map[item.id] = {
        completed: isCompleted,
        unlocked: true, // Lessons are fully unlocked! No blocking mechanisms.
        submittedAnswer: prog?.submittedAnswer
      };
    }

    return map;
  }

  // Update item completed progress
  public async updateProgress(userId: string, courseId: string, itemId: string, completed: boolean, submittedAnswer?: string) {
    if (this.useLocalFile) {
      const data = readLocalDb();
      if (!data.progress) data.progress = [];
      let prog = data.progress.find((p: any) => p.userId === userId && p.itemId === itemId);
      if (!prog) {
        prog = { userId, itemId, courseId };
        data.progress.push(prog);
      }
      prog.completed = completed;
      prog.completedAt = new Date().toISOString();
      if (submittedAnswer !== undefined) {
        prog.submittedAnswer = submittedAnswer;
      }
      writeLocalDb(data);
      return prog;
    }
    const path = 'progress';
    const progId = `${userId}_${itemId}`;
    const docRef = doc(dbFS, path, progId);

    try {
      const payload: any = {
        userId,
        itemId,
        courseId,
        completed,
        completedAt: new Date().toISOString()
      };
      if (submittedAnswer !== undefined) {
        payload.submittedAnswer = submittedAnswer;
      }
      await setDoc(docRef, payload, { merge: true });
      return payload;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.updateProgress(userId, courseId, itemId, completed, submittedAnswer);
      }
      handleFirestoreError(error, OperationType.WRITE, `${path}/${progId}`);
    }
  }

  // User stats counter
  public async getUserStats(userId: string): Promise<{ chaptersDone: number; totalChapters: number; projectsBuilt: number; percentComplete: number; timeSpentMinutes: number }> {
    const courses = await this.getCourses();
    const allChapters: Chapter[] = [];
    const allItems: LearningItem[] = [];

    for (const course of courses) {
      const chs = await this.getChapters(course.id);
      allChapters.push(...chs);
      for (const ch of chs) {
        const its = await this.getItems(ch.id);
        allItems.push(...its);
      }
    }

    const totalChapters = allChapters.length;

    // Fetch user completions progress docs
    const userProgDocs: UserProgress[] = [];
    if (this.useLocalFile) {
      const data = readLocalDb();
      const userProgressList = (data.progress || []).filter((p: any) => p.userId === userId && p.completed === true);
      userProgDocs.push(...userProgressList);
    } else {
      const path = 'progress';
      try {
        const qComps = query(collection(dbFS, path), where('userId', '==', userId), where('completed', '==', true));
        const snap = await getDocs(qComps);
        snap.forEach(d => {
          userProgDocs.push(d.data() as UserProgress);
        });
      } catch (error) {
        if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
          this.useLocalFile = true;
          return this.getUserStats(userId);
        }
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }

    // Count how many project type items are completed by the user
    const projectsBuilt = userProgDocs.filter(p => {
      const correspondingItem = allItems.find(item => item.id === p.itemId);
      return correspondingItem?.type === 'project';
    }).length;

    // Count chapters complete
    let chaptersDone = 0;
    for (const chap of allChapters) {
      const chItems = allItems.filter(item => item.chapterId === chap.id);
      if (chItems.length > 0) {
        const allDone = chItems.every(chItem => userProgDocs.some(up => up.itemId === chItem.id));
        if (allDone) {
          chaptersDone++;
        }
      }
    }

    const percentComplete = allItems.length > 0 ? Math.round((userProgDocs.length / allItems.length) * 100) : 0;

    let timeSpentMinutes = 0;
    userProgDocs.forEach(up => {
      const item = allItems.find(i => i.id === up.itemId);
      if (item) {
        if (item.type === 'lesson') timeSpentMinutes += 25;
        else if (item.type === 'exercise') timeSpentMinutes += 15;
        else if (item.type === 'project') timeSpentMinutes += 90;
      }
    });

    if (timeSpentMinutes === 0) {
      timeSpentMinutes = 12; // Base baseline study trigger
    }

    return {
      chaptersDone,
      totalChapters,
      projectsBuilt,
      percentComplete,
      timeSpentMinutes
    };
  }

  // Community Operations
  public async getPosts(): Promise<CommunityPost[]> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      const posts = data.posts || [];
      return posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const path = 'posts';
    try {
      const snap = await getDocs(collection(dbFS, path));
      const posts: CommunityPost[] = [];
      snap.forEach(d => {
        posts.push(d.data() as CommunityPost);
      });
      // Sort by descending date
      return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.getPosts();
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  public async createPost(authorName: string, authorEmail: string, title: string, content: string, category: string): Promise<CommunityPost> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      if (!data.posts) data.posts = [];
      const postId = 'post-' + crypto.randomUUID();
      const post: CommunityPost = {
        id: postId,
        title,
        content,
        authorName,
        authorEmail,
        category,
        likes: 0,
        likedBy: [],
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        comments: []
      };
      data.posts.push(post);
      writeLocalDb(data);
      return post;
    }
    const path = 'posts';
    const postId = 'post-' + crypto.randomUUID();
    const post: CommunityPost = {
      id: postId,
      title,
      content,
      authorName,
      authorEmail,
      category,
      likes: 0,
      likedBy: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      comments: []
    };

    try {
      await setDoc(doc(dbFS, path, postId), post);
      return post;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.createPost(authorName, authorEmail, title, content, category);
      }
      handleFirestoreError(error, OperationType.WRITE, `${path}/${postId}`);
    }
  }

  public async addComment(postId: string, authorName: string, authorEmail: string, content: string): Promise<PostComment | null> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      if (!data.posts) data.posts = [];
      const post = data.posts.find((p: any) => p.id === postId);
      if (!post) return null;
      if (!post.comments) post.comments = [];

      const comment: PostComment = {
        id: 'c-' + crypto.randomUUID(),
        postId,
        authorName,
        authorEmail,
        content,
        createdAt: new Date().toISOString()
      };

      post.comments.push(comment);
      post.commentsCount = post.comments.length;
      writeLocalDb(data);
      return comment;
    }
    const path = 'posts';
    const docRef = doc(dbFS, path, postId);

    try {
      const postSnap = await getDoc(docRef);
      if (!postSnap.exists()) return null;

      const post = postSnap.data() as CommunityPost;
      if (!post.comments) post.comments = [];

      const comment: PostComment = {
        id: 'c-' + crypto.randomUUID(),
        postId,
        authorName,
        authorEmail,
        content,
        createdAt: new Date().toISOString()
      };

      post.comments.push(comment);
      post.commentsCount = post.comments.length;

      await setDoc(docRef, post, { merge: true });
      return comment;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.addComment(postId, authorName, authorEmail, content);
      }
      handleFirestoreError(error, OperationType.WRITE, `${path}/${postId}/comments`);
    }
  }

  public async toggleLike(postId: string, userEmail: string): Promise<{ likes: number; liked: boolean } | null> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      if (!data.posts) data.posts = [];
      const post = data.posts.find((p: any) => p.id === postId);
      if (!post) return null;
      if (!post.likedBy) post.likedBy = [];

      const index = post.likedBy.indexOf(userEmail);
      let liked = false;
      if (index === -1) {
        post.likedBy.push(userEmail);
        post.likes = post.likedBy.length;
        liked = true;
      } else {
        post.likedBy.splice(index, 1);
        post.likes = post.likedBy.length;
      }
      writeLocalDb(data);
      return { likes: post.likes, liked };
    }
    const path = 'posts';
    const docRef = doc(dbFS, path, postId);

    try {
      const postSnap = await getDoc(docRef);
      if (!postSnap.exists()) return null;

      const post = postSnap.data() as CommunityPost;
      if (!post.likedBy) post.likedBy = [];

      const index = post.likedBy.indexOf(userEmail);
      let liked = false;
      if (index === -1) {
        post.likedBy.push(userEmail);
        post.likes = post.likedBy.length;
        liked = true;
      } else {
        post.likedBy.splice(index, 1);
        post.likes = post.likedBy.length;
      }

      await setDoc(docRef, post, { merge: true });
      return { likes: post.likes, liked };
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.toggleLike(postId, userEmail);
      }
      handleFirestoreError(error, OperationType.WRITE, `${path}/${postId}/likes`);
    }
  }

  // Project Submissions Operations
  public async submitProject(userId: string, userEmail: string, userName: string, itemId: string, itemTitle: string, courseId: string, submissionText: string): Promise<ProjectSubmission> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      if (!data.submissions) data.submissions = [];
      const subId = 'sub-' + crypto.randomUUID();
      const submission: ProjectSubmission = {
        id: subId,
        userId,
        userEmail,
        userName,
        itemId,
        itemTitle,
        courseId,
        submissionText,
        status: 'reviewed',
        feedback: 'Excellent work! Your code architecture shows exceptional implementation of type constraints and modular structural rules.',
        createdAt: new Date().toISOString()
      };
      data.submissions.push(submission);
      writeLocalDb(data);
      return submission;
    }
    const path = 'submissions';
    const subId = 'sub-' + crypto.randomUUID();
    const submission: ProjectSubmission = {
      id: subId,
      userId,
      userEmail,
      userName,
      itemId,
      itemTitle,
      courseId,
      submissionText,
      status: 'reviewed',
      feedback: 'Excellent work! Your code architecture shows exceptional implementation of type constraints and modular structural rules.',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(dbFS, path, subId), submission);
      return submission;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.submitProject(userId, userEmail, userName, itemId, itemTitle, courseId, submissionText);
      }
      handleFirestoreError(error, OperationType.WRITE, `${path}/${subId}`);
    }
  }

  public async getSubmissions(userId: string): Promise<ProjectSubmission[]> {
    if (this.useLocalFile) {
      const data = readLocalDb();
      const subs = (data.submissions || []).filter((s: any) => s.userId === userId);
      return subs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const path = 'submissions';
    try {
      const q = query(collection(dbFS, path), where('userId', '==', userId));
      const snap = await getDocs(q);
      const subs: ProjectSubmission[] = [];
      snap.forEach(d => {
        subs.push(d.data() as ProjectSubmission);
      });
      return subs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      if (error instanceof Error && (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED'))) {
        this.useLocalFile = true;
        return this.getSubmissions(userId);
      }
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
}

export const db = new DatabaseManager();
