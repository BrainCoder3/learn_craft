export interface LessonStep {
  type: 'info' | 'quiz';
  title: string;
  markdown?: string;
  codeSnippet?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
}

/**
 * Returns exactly 10 educational steps (mix of information and quiz drills) for any lesson.
 */
export function getLessonSteps(itemId: string, itemTitle: string, itemContent: string): LessonStep[] {
  // 1. WHAT IS PYTHON?
  if (itemId === 'item-1-1') {
    return [
      {
        type: 'info',
        title: 'Introduction to Python',
        markdown: `Welcome to your first step! **Python** is one of the world's most beloved coding languages. It is highly readable and used everywhere from small scripts to advanced Artificial Intelligence models.`,
        codeSnippet: `# Here is what Python looks like
print("Hello Learner!")`
      },
      {
        type: 'quiz',
        title: 'Concept Check: Readability',
        question: 'Who created the Python programming language in 1991?',
        options: ['Guido van Rossum', 'Dennis Ritchie', 'Bjarne Stroustrup', 'James Gosling'],
        correctAnswer: 'Guido van Rossum'
      },
      {
        type: 'info',
        title: 'Dynamic Typing and Interpretation',
        markdown: `Unlike compiled languages like C++ or Java, Python is **interpreted**. This means code runs line-by-line using an interpreter, which allows for instant testing and high trial-and-error speed.`,
        codeSnippet: `x = 5          # No need to declare "int x"
x = "Now text!" # Dynamically changes type`
      },
      {
        type: 'quiz',
        title: 'Concept Check: Running Method',
        question: 'Which term describes how Python executes source code?',
        options: ['Compiled beforehand', 'Interpreted line-by-line', 'Translated to Assembly', 'Decoded by hardware'],
        correctAnswer: 'Interpreted line-by-line'
      },
      {
        type: 'info',
        title: 'Code Blocks & Indentation',
        markdown: `While other languages use curly brackets \`{}\` or semicolons \`;\` to define context, Python uses **indentation** (standardized to 4 spaces) to nest code blocks. Clean lines are required!`,
        codeSnippet: `if True:
    print("This is correctly indented")`
      },
      {
        type: 'quiz',
        title: 'Concept Check: Syntax Blocks',
        question: 'What does Python use to group statements and define nested blocks of code?',
        options: ['Curly braces {}', 'Parentheses ()', 'Indentation (whitespaces)', 'Semicolons ;'],
        correctAnswer: 'Indentation (whitespaces)'
      },
      {
        type: 'info',
        title: 'Versatile Ecosystem',
        markdown: `Python has a massive library ecosystem. Major modern frameworks like **TensorFlow** (AI), **Django** (Web development), and **Pandas** (Data analysis) are entirely Python-focused, powering systems at NASA, Google, and Netflix.`,
        codeSnippet: `# Standard libraries can be imported with a simple command:
import math
print(math.sqrt(16))`
      },
      {
        type: 'quiz',
        title: 'Concept Check: Use Cases',
        question: 'Which of the following fields is Python NOT typically designed for as a primary tool?',
        options: ['Data Science and AI', 'Web Development Backend', 'Embedded High-Speed Kernel Programming', 'Automation Scripting'],
        correctAnswer: 'Embedded High-Speed Kernel Programming'
      },
      {
        type: 'info',
        title: 'Your Learning Journey',
        markdown: `Throughout this path, you'll practice real Python scripts inside your built-in sandboxes. You will write code, evaluate variables, and run projects to build memory blocks.`,
      },
      {
        type: 'quiz',
        title: 'Final Mastery Check',
        question: 'Is Python case-sensitive? (Does "MyVar" differ from "myvar"?)',
        options: ['Yes, Python is completely case-sensitive', 'No, names are identical in Python', 'Only inside class definitions', 'Only when working with numbers'],
        correctAnswer: 'Yes, Python is completely case-sensitive'
      }
    ];
  }

  // 2. INSTALLING PYTHON
  if (itemId === 'item-1-2') {
    return [
      {
        type: 'info',
        title: 'Downloading Python SDK',
        markdown: `To write Python on your local computer, download the installer from the official website **python.org**. Always choose the latest stable version 3.x release.`,
      },
      {
        type: 'quiz',
        title: 'Website Check',
        question: 'What is the official primary domain to download Python installers?',
        options: ['python.org', 'python.com', 'pythonapi.net', 'github.com/python'],
        correctAnswer: 'python.org'
      },
      {
        type: 'info',
        title: 'The "Add to PATH" Install Option',
        markdown: `**CRITICAL STEP**: On Windows installers, you must check the box that says **"Add python.exe to PATH"** before clicking install. If skipped, your system terminal will not recognize 'python' calls.`,
      },
      {
        type: 'quiz',
        title: 'Installer Settings Check',
        question: 'Why must you check the "Add Python to PATH" option during setup?',
        options: ['To allow the command line to locate and run python', 'To install extra math modules', 'To choose an installation directory', 'To trigger desktop shortcuts'],
        correctAnswer: 'To allow the command line to locate and run python'
      },
      {
        type: 'info',
        title: 'Debugging in Terminal',
        markdown: `Open your system Terminal (or Command Prompt) and type the command below. If Python is correctly mounted, it will return the version number currently running.`,
        codeSnippet: `python --version`
      },
      {
        type: 'quiz',
        title: 'Terminal Check Drill',
        question: 'Which terminal command is used to verify Python is installed on your operating system?',
        options: ['python --version', 'python --check', 'run python', 'verify -p'],
        correctAnswer: 'python --version'
      },
      {
        type: 'info',
        title: 'Choosing a Code Editor',
        markdown: `Though Python comes with a default editor called **IDLE**, developers prefer full-fledged utilities like **VS Code** (Visual Studio Code) or **PyCharm**. VS Code is lightweight, open-source, and has robust Python tools.`,
      },
      {
        type: 'quiz',
        title: 'Editor Choice Check',
        question: 'Which of the following is a highly popular extension-ready code editor for Python developers?',
        options: ['VS Code', 'Google Chrome Diagnostics', 'Adobe Photoshop CC', 'Disk Utility'],
        correctAnswer: 'VS Code'
      },
      {
        type: 'info',
        title: 'Writing Your First File',
        markdown: `Python code files must always end with the **.py** file suffix. For example, \`sandbox.py\`. In the command prompt, you execute the script by passing the filename to python.`,
        codeSnippet: `python sandbox.py`
      },
      {
        type: 'quiz',
        title: 'Suffix Check',
        question: 'What is the correct file extension for standard Python source code files?',
        options: ['.py', '.pt', '.python', '.ipynb'],
        correctAnswer: '.py'
      }
    ];
  }

  // 3. VARIABLES IN PYTHON
  if (itemId === 'item-2-1') {
    return [
      {
        type: 'info',
        title: 'What is a Variable?',
        markdown: `A **variable** is a named container holding data in computer memory. Imagine it as a labeled storage box. Assigning a value is done using the single equals sign (\`=\`).`,
        codeSnippet: `score = 100
player_name = "Guest"`
      },
      {
        type: 'quiz',
        title: 'Variable Concept Check',
        question: 'What operator is used to assign a new value to a variable in Python?',
        options: ['=', '==', ':=', '->'],
        correctAnswer: '='
      },
      {
        type: 'info',
        title: 'No Explicit Type Declaration',
        markdown: `In language structures like C++ or Java, you have to write the variable type. Python is **dynamically-typed**, which automatically infers the category of your variables.`,
        codeSnippet: `age = 22 # Python knows this is an integer!`
      },
      {
        type: 'quiz',
        title: 'Typing System Drill',
        question: 'How does Python know what type of data is stored in your variable?',
        options: ['It dynamic infers it at runtime from the value', 'You must pre-declare it', 'It matches the variable name', 'All variables are strings'],
        correctAnswer: 'It dynamic infers it at runtime from the value'
      },
      {
        type: 'info',
        title: 'Re-assigning Variables',
        markdown: `Because variables can mutate, you can re-assign them to holding other values, or values of differing types. Values update sequentially.`,
        codeSnippet: `money = 5
money = 10 # Old '5' is replaced by '10' in memory!`
      },
      {
        type: 'quiz',
        title: 'Sequence Re-assignment Quiz',
        question: 'After running: a = 2; a = 3; a = 4, what is the final value stored in variable "a"?',
        options: ['2', '3', '4', '9'],
        correctAnswer: '4'
      },
      {
        type: 'info',
        title: 'Naming Rules - Part 1',
        markdown: `Variable names are custom, but must follow strict specifications:
- Must start with a **letter** or an **underscore** (\`_\`).
- Cannot start with a **number**!`,
        codeSnippet: `# Valid variable names:
_user_token = "A19s"
user_age = 25

# Invalid names:
# 1st_place = "Gold" (Throws SyntaxError)`
      },
      {
        type: 'quiz',
        title: 'Naming Legality Check',
        question: 'Which of the following is an INVALID variable name in Python?',
        options: ['total_score', 'total1', '1total', '_total'],
        correctAnswer: '1total'
      },
      {
        type: 'info',
        title: 'Naming Rules - Part 2 & Snake Case',
        markdown: `Python variables are case-sensitive and cannot contain spaces. The standard convention is **snake_case** (lowercase connected by underscores).`,
        codeSnippet: `current_high_score = 9999`
      },
      {
        type: 'quiz',
        title: 'Style check',
        question: 'Which word style is the Python PEP 8 standard convention for variables and function names?',
        options: ['camelCase', 'snake_case', 'PascalCase', 'SCREAMING-KEBAB-CASE'],
        correctAnswer: 'snake_case'
      }
    ];
  }

  // 4. DATA TYPES
  if (itemId === 'item-2-2') {
    return [
      {
        type: 'info',
        title: 'Four Core Primitives',
        markdown: `Python has four dominant fundamental data types:
1. **int** is a whole integer.
2. **float** holds decimals.
3. **str** is string text in quotes.
4. **bool** is a logical Boolean.`,
      },
      {
        type: 'quiz',
        title: 'Data Type Categories',
        question: 'What type is the value True in Python?',
        options: ['str', 'int', 'bool', 'float'],
        correctAnswer: 'bool'
      },
      {
        type: 'info',
        title: 'Integers (int)',
        markdown: `Integers are positive or negative count values with no decimals at all. They support arithmetic natively.`,
        codeSnippet: `items = 15
negative_degrees = -4`
      },
      {
        type: 'quiz',
        title: 'Integers Quiz',
        question: 'Which value is recognized as an integer (int)?',
        options: ['45', '45.0', '"45"', 'True'],
        correctAnswer: '45'
      },
      {
        type: 'info',
        title: 'Floats (float)',
        markdown: `Floats represent real numbers and decimals. If you combine an integer and a float in basic maths, the output becomes a float.`,
        codeSnippet: `height = 1.75
divided_num = 10 / 2 # Division ALWAYS returns a float!`
      },
      {
        type: 'quiz',
        title: 'Float Induction',
        question: 'Running: result = 10 / 2 results in which data type in Python?',
        options: ['int', 'float', 'bool', 'str'],
        correctAnswer: 'float'
      },
      {
        type: 'info',
        title: 'Strings (str)',
        markdown: `Strings store text. They must be wrapped in identical single (\`'\`) or double (\`"\`) quotation marks.`,
        codeSnippet: `city = "San Francisco"
message = 'Hello world'`
      },
      {
        type: 'quiz',
        title: 'String Wrapping Check',
        question: 'Which of the following creates a correct string variable?',
        options: ['name = "Alice"', 'name = "Alice\'', 'name = Alice', 'name = (Alice)'],
        correctAnswer: 'name = "Alice"'
      },
      {
        type: 'info',
        title: 'Type Checking & Casting',
        markdown: `You can check an object's type with \`type()\`. You can cast (force-convert) values using \`int()\`, \`float()\`, \`str()\`, and \`bool()\`.`,
        codeSnippet: `str_number = "100"
converted_int = int(str_number)`
      },
      {
        type: 'quiz',
        title: 'Type Casting Drill',
        question: 'What does calling type(str(5.5)) return in Python?',
        options: ['int', 'float', 'str', 'bool'],
        correctAnswer: 'str'
      }
    ];
  }

  // 5. IF / ELIF / ELSE
  if (itemId === 'item-3-1') {
    return [
      {
        type: 'info',
        title: 'Making Logic Branches',
        markdown: `Programming logic requires decisions. **Branching** uses \`if\` statements which execute specific indented code only if the condition evaluates to \`True\`.`,
        codeSnippet: `score = 80
if score >= 50:
    print("Passed!")`
      },
      {
        type: 'quiz',
        title: 'Indentation Structure Check',
        question: 'What character completes the IF/ELIF statement line, signaling the start of the indented code block?',
        options: [': (colon)', '; (semicolon)', '{ (brace)', 'arrow (->)'],
        correctAnswer: ': (colon)'
      },
      {
        type: 'info',
        title: 'Adding default clauses: else',
        markdown: `Use an \`else\` block to run fallback scripts when the active condition of the matching IF was \`False\`.`,
        codeSnippet: `age = 15
if age >= 18:
    print("Adult")
else:
    print("Minor")`
      },
      {
        type: 'quiz',
        title: 'Else Sequence Drill',
        question: 'Under what condition does code inside an else block execute?',
        options: ['When the associated IF statement condition is False', 'When the associated IF statement is True', 'Always on every run', 'Never, it exists for comments only'],
        correctAnswer: 'When the associated IF statement condition is False'
      },
      {
        type: 'info',
        title: 'Multiple branch logic: elif',
        markdown: `When checking multiple alternative options sequentially, use **elif** (short for else-if). Only the first True branch executes.`,
        codeSnippet: `grade = 85
if grade >= 90:
    print("A")
elif grade >= 80:
    print("B")
else:
    print("C")`
      },
      {
        type: 'quiz',
        title: 'Elif Flow Control',
        question: 'What is "elif" short for in Python?',
        options: ['else-if', 'element-if', 'either-if', 'extend-list-if'],
        correctAnswer: 'else-if'
      },
      {
        type: 'info',
        title: 'Comparison Operators',
        markdown: `Python evaluates conditions using:
- \`==\` (is equal to)
- \`!=\` (is NOT equal to)
- \`>\` (greater than)
- \`<\` (less than)
- \`>=\` / \`<=\``,
        codeSnippet: `x = 5
print(x == 5) # Prints True`
      },
      {
        type: 'quiz',
        title: 'Comparison Drill',
        question: 'Which comparison operator represents "not equal"?',
        options: ['!=', '<>', 'not==', '!=='],
        correctAnswer: '!='
      },
      {
        type: 'info',
        title: 'Combining Conditions with Operators',
        markdown: `Combine conditions using keywords:
- **and**: Both conditions must be True.
- **or**: At least one must be True.
- **not**: Reverses the boolean truth value.`,
        codeSnippet: `if age > 12 and age < 20:
    print("Teenager")`
      },
      {
        type: 'quiz',
        title: 'Logical Operator Quiz',
        question: 'What is the output of the expression: True and not False?',
        options: ['True', 'False', 'None', 'SyntaxError'],
        correctAnswer: 'True'
      }
    ];
  }

  // 6. LOOPS: FOR AND WHILE
  if (itemId === 'item-3-2') {
    return [
      {
        type: 'info',
        title: 'Why Loops?',
        markdown: `Do not copy and paste duplicate code. **Loops** let us run a block of statements repeatedly, either a set number of times or as long as a condition remains met.`,
      },
      {
        type: 'quiz',
        title: 'Loop Objective Check',
        question: 'What design anti-pattern does utilizing loops primarily resolve?',
        options: ['Unnecessary copy-pasting of identical code', 'Storing integers', 'Connecting to databases', 'Casting strings to floats'],
        correctAnswer: 'Unnecessary copy-pasting of identical code'
      },
      {
        type: 'info',
        title: 'For Loops & ranges',
        markdown: `The **for** loop executes scripts across an iterable (such as a list) or a range of integers generated using the \`range()\` library.`,
        codeSnippet: `for i in range(3):
    print(i) # Prints 0, then 1, then 2`
      },
      {
        type: 'quiz',
        title: 'Range Count Drill',
        question: 'How many iterations run inside: for i in range(10): ?',
        options: ['9', '10', '11', '0'],
        correctAnswer: '10'
      },
      {
        type: 'info',
        title: 'While Loops',
        markdown: `The **while** loop runs repeatedly as long as its logical condition evaluates to \`True\`. Make sure to increase variables to avoid infinite loops!`,
        codeSnippet: `counter = 0
while counter < 3:
    print(counter)
    counter += 1`
      },
      {
        type: 'quiz',
        title: 'While Loop Logic',
        question: 'What happens if the logical condition of a while loop never becomes False?',
        options: ['The loop runs forever (Infinite loop / freeze)', 'The program stops on step 1', 'The loop executes exactly 1 time', 'It automatically exits'],
        correctAnswer: 'The loop runs forever (Infinite loop / freeze)'
      },
      {
        type: 'info',
        title: 'Exiting Early: break',
        markdown: `Use the **break** keyword inside loops to exit the loop block immediately, skipping all remaining passes.`,
        codeSnippet: `for num in range(100):
    if num == 3:
        break
    print(num) # Prints only 0, 1, 2`
      },
      {
        type: 'quiz',
        title: 'Break Keyword Check',
        question: 'Which keyword forces immediate exit from a loop block?',
        options: ['break', 'exit', 'terminate', 'pass'],
        correctAnswer: 'break'
      },
      {
        type: 'info',
        title: 'Skipping steps: continue',
        markdown: `Use **continue** to skip the remaining code in the *current* cycle and jump immediately to the next iteration.`,
        codeSnippet: `for x in range(4):
    if x == 2:
        continue
    print(x) # Prints 0, 1, 3`
      },
      {
        type: 'quiz',
        title: 'Continue Step Quiz',
        question: 'What is the action of the continue statement inside a loop?',
        options: ['Skip remainder of current pass and jump to next iteration', 'Exit loop altogether', 'Re-initialize the loop variables', 'Double execution speed'],
        correctAnswer: 'Skip remainder of current pass and jump to next iteration'
      }
    ];
  }

  // 7. DEFINING & CALLING FUNCTIONS
  if (itemId === 'item-4-1') {
    return [
      {
        type: 'info',
        title: 'Understanding Functions',
        markdown: `A **function** is an isolated block of reusable statements designed to carry out a specific task. They keep code organized, clean, and modular.`,
      },
      {
        type: 'quiz',
        title: 'Function Definition Terminology',
        question: 'What is the primary motivation for grouping code inside custom functions?',
        options: ['To re-use logical behaviors without duplicating scripts', 'To make files larger', 'To increase memory usage', 'To write strings faster'],
        correctAnswer: 'To re-use logical behaviors without duplicating scripts'
      },
      {
        type: 'info',
        title: 'The "def" Keyword',
        markdown: `In Python, declare functions using the keyword **def**, followed by the function name, parentheses, and a colon. Code must be indented!`,
        codeSnippet: `def greet_user():
    print("Welcome back!")`
      },
      {
        type: 'quiz',
        title: 'Declaration Keyword Check',
        question: 'What keyword defines a standard function in Python?',
        options: ['def', 'func', 'function', 'define'],
        correctAnswer: 'def'
      },
      {
        type: 'info',
        title: 'Calling Functions',
        markdown: `Declaring a function just defines it. To execute it, you must "call" or "invoke" it by writing its name with parentheses.`,
        codeSnippet: `greet_user() # Runs the code inside!`
      },
      {
        type: 'quiz',
        title: 'Call Action Drill',
        question: 'If you write a function without calling it, what does the interpreter output?',
        options: ['It defines it but does not execute its nested instructions', 'It throws a compilation crash error', 'It runs it automatically', 'It prints None on terminal'],
        correctAnswer: 'It defines it but does not execute its nested instructions'
      },
      {
        type: 'info',
        title: 'Python Scoping rules',
        markdown: `Variables created *inside* a function are local to that function. They cannot be read outside the function envelope, which prevents variable bleeding.`,
        codeSnippet: `def setup_num():
    secret = 99
# print(secret) would raise a NameError!`
      },
      {
        type: 'quiz',
        title: 'Scoping Quiz',
        question: 'Can you read a variable declared inside a function from normal code outside the function?',
        options: ['No, local scope isolates it inside the function', 'Yes, variables are always global', 'Only if the variable stands for an integer', 'Only if we call it twice'],
        correctAnswer: 'No, local scope isolates it inside the function'
      },
      {
        type: 'info',
        title: 'Functions Order Requirement',
        markdown: `Python reads files line-by-line. You must define a function *before* you call it, otherwise Python won't know it exists.`,
        codeSnippet: `# Correct sequence:
def call_me():
    print("Ok")

call_me() # This works!`
      },
      {
        type: 'quiz',
        title: 'Execution Sequence Check',
        question: 'What error is thrown if you call a function higher in a file than its def statement?',
        options: ['NameError', 'TypeError', 'SyntaxError', 'IndexError'],
        correctAnswer: 'NameError'
      }
    ];
  }

  // 8. PARAMETERS, ARGUMENTS & RETURN
  if (itemId === 'item-4-2') {
    return [
      {
        type: 'info',
        title: 'Sending Input and Getting Output',
        markdown: `To make functions dynamic, we pass values inside. We list **parameters** in the function definition, and we pass real **arguments** when invoking it.`,
        codeSnippet: `def say_hello(username): # username is a parameter
    print("Hello " + username)

say_hello("Emma") # "Emma" is an argument`
      },
      {
        type: 'quiz',
        title: 'Variables vs Values Terminology',
        question: 'Which term refers to the actual value passed into a function when calling it?',
        options: ['Argument', 'Parameter', 'Instance', 'Return'],
        correctAnswer: 'Argument'
      },
      {
        type: 'info',
        title: 'Returning values with: return',
        markdown: `To send numerical or text values back to the code that called the function, use the key term **return**. Return instantly exits the function.`,
        codeSnippet: `def double_num(x):
    return x * 2

result = double_num(5) # result gets 10`
      },
      {
        type: 'quiz',
        title: 'Return Character Check',
        question: 'Which keyword sends data back from a function and instantly terminates its execution loop?',
        options: ['return', 'break', 'yield', 'back'],
        correctAnswer: 'return'
      },
      {
        type: 'info',
        title: 'Default return value',
        markdown: `If a function finishes executing and does not encounter an explicit return statement, it outputs a special null object value: **None**.`,
        codeSnippet: `def play():
    x = 5
print(play()) # Prints None!`
      },
      {
        type: 'quiz',
        title: 'None Indicator Quiz',
        question: 'What does a Python function return by default if it contains no return statement?',
        options: ['None', 'False', '0', 'Null'],
        correctAnswer: 'None'
      },
      {
        type: 'info',
        title: 'Positional and Keyword Arguments',
        markdown: `You can pass arguments in order (positional), or state them explicitly (keyword) which lets you assign values in any sequence.`,
        codeSnippet: `def describe_pet(name, animal_type):
    print(name + " is a " + animal_type)

# Keyword style:
describe_pet(animal_type="cat", name="Whiskers")`
      },
      {
        type: 'quiz',
        title: 'Keyword Argument Drill',
        question: 'When using keyword arguments (e.g. name="Emma"), is the order of arguments strictly checked?',
        options: ['No, explicit keywords map values regardless of sequence', 'Yes, arguments must match exact position', 'Only inside calculations', 'Only when working with floats'],
        correctAnswer: 'No, explicit keywords map values regardless of sequence'
      },
      {
        type: 'info',
        title: 'Default parameters',
        markdown: `You can set default values in parameters. If the caller omits that argument, the default is used instead.`,
        codeSnippet: `def welcome(name="User"):
    print("Hi " + name)`
      },
      {
        type: 'quiz',
        title: 'Default Fallback Quiz',
        question: 'For def welcome(name="User"), what does welcome() print?',
        options: ['Hi User', 'Hi', 'throws an error', 'Hi None'],
        correctAnswer: 'Hi User'
      }
    ];
  }

  // 9. OBJECT-ORIENTED PROGRAMMING (POO) BASICS
  if (itemId === 'item-5-1') {
    return [
      {
        type: 'info',
        title: 'Introduction to OOP',
        markdown: `**Object-Oriented Programming** (POO / OOP) is a programming paradigm that uses **classes** and **objects** to model real-world things and relationships. It groups related data (attributes) and behaviors (methods) together.`,
        codeSnippet: `class Student:
    pass # A class defines the blueprint`
      },
      {
        type: 'quiz',
        title: 'Class vs. Object Concept',
        question: 'What is the relationship between a Class and an Object in Python?',
        options: [
          'A class is a blueprint, and an object is a concrete instance of that blueprint',
          'An object is a blueprint, and a class is a concrete instance of that blueprint',
          'A class and an object are any two standard functions',
          'A class is only used to store private numbers'
        ],
        correctAnswer: 'A class is a blueprint, and an object is a concrete instance of that blueprint'
      },
      {
        type: 'info',
        title: 'Defining Constructors with __init__',
        markdown: `The \`__init__\` method is the class **constructor**. It initializes unique object attributes when you instantiate a new class object. The first parameter is always \`self\`, which references the active instance.`,
        codeSnippet: `class Student:
    def __init__(self, name, grade):
        self.name = name   # Instance attribute
        self.grade = grade # Instance attribute

alice = Student("Alice", "A") # Instantiation`
      },
      {
        type: 'quiz',
        title: 'The Constructor Quiz',
        question: 'What is the standard name of the constructor method in a Python class?',
        options: ['__init__', '__new__', 'constructor', '__init_subclass__'],
        correctAnswer: '__init__'
      },
      {
        type: 'info',
        title: 'Understanding self',
        markdown: `The parameter \`self\` acts as a pointer pointing back to the active instance itself. When calling methods, Python passes the object reference into \`self\` automatically under the hood.`,
        codeSnippet: `class Dog:
    def __init__(self, name):
        self.name = name

my_dog = Dog("Rex")
# 'Rex' becomes my_dog.name`
      },
      {
        type: 'quiz',
        title: 'The self Parameter Drill',
        question: 'When writing class methods, why must "self" be placed as the first parameter?',
        options: [
          'To reference and permit changes on the current specific object instance',
          'To declare the method is public',
          'To format the code for standard web services',
          'To load the NumPy background processor'
        ],
        correctAnswer: 'To reference and permit changes on the current specific object instance'
      },
      {
        type: 'info',
        title: 'Defining and Calling Class Methods',
        markdown: `**Methods** are functions defined inside a class that carry out specific tasks on the object's instance state. Include \`self\` as the first parameter to read/write attributes.`,
        codeSnippet: `class Student:
    def __init__(self, name):
        self.name = name

    def say_hello(self):
        return f"Hi, I'm {self.name}!"

student = Student("Bob")
print(student.say_hello()) # Output: Hi, I'm Bob!`
      },
      {
        type: 'quiz',
        title: 'Calling Methods Quiz',
        question: 'If you have a Class instance named `car_instance` which contains a method called `drive()`, how do you call it?',
        options: ['car_instance.drive()', 'drive(car_instance)', 'car_instance->drive()', 'Car.drive(car_instance)()'],
        correctAnswer: 'car_instance.drive()'
      }
    ];
  }

  // 10. ADVANCED OOP: INHERITANCE & ENCAPSULATION
  if (itemId === 'item-5-2') {
    return [
      {
        type: 'info',
        title: 'OOP Inheritance',
        markdown: `**Inheritance** allows you to define a new class (child class) that adopts all attributes and methods of an existing class (parent class). This avoids redundant code duplication.`,
        codeSnippet: `class Vehicle:
    def honk(self):
        return "Beep!"

class Car(Vehicle): # Inherits honk()
    pass

my_car = Car()
print(my_car.honk()) # "Beep!"`
      },
      {
        type: 'quiz',
        title: 'Inheritance Syntax Quiz',
        question: 'How do you specify that class `ElectricCar` inherits from class `Vehicle`?',
        options: [
          'class ElectricCar(Vehicle):',
          'class ElectricCar inherits Vehicle:',
          'class ElectricCar : public Vehicle:',
          'class ElectricCar : Vehicle:'
        ],
        correctAnswer: 'class ElectricCar(Vehicle):'
      },
      {
        type: 'info',
        title: 'Method Overriding',
        markdown: `A child class can redefine a method inherited from its parent. This is known as **Method Overriding**. It lets you customize standard parent class behaviors for specialized kids.`,
        codeSnippet: `class Cat:
    def speak(self):
        return "Meow"

class Lion(Cat):
    def speak(self): # Overrides Cat.speak()
        return "ROAR!"`
      },
      {
        type: 'quiz',
        title: 'Overriding Concept Check',
        question: 'What occurs when a child class implements a method with the exact same name as an inherited parent method?',
        options: [
          'The child’s method overrides and takes precedence over the parent’s method',
          'Python raises a SyntaxError',
          'The parent class is automatically deleted',
          'The methods are merged together sequentially'
        ],
        correctAnswer: 'The child’s method overrides and takes precedence over the parent’s method'
      },
      {
        type: 'info',
        title: 'Encapsulation & Private Members',
        markdown: `**Encapsulation** keeps properties and inner helper methods safe from external tampering. To mark attributes as "protected" or "private" within Python conventions, prefix their names with internal underscores:
- \`_variable\`: Protected (warning constraint).
- \`__variable\`: Private (triggers name mangling protection).`,
        codeSnippet: `class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance # Private attribute`
      },
      {
        type: 'quiz',
        title: 'Private Properties Indicator',
        question: 'To signal that an attribute should be guarded as highly private/managed, what prefix naming convention is used?',
        options: ['Double underscores (e.g., __balance)', 'All uppercase letters (e.g., BALANCE)', 'Asterisk indicators (e.g., *balance)', 'A dollarsign prefix (e.g., $balance)'],
        correctAnswer: '__balance'
      },
      {
        type: 'info',
        title: 'Polymorphism',
        markdown: `**Polymorphism** means "many forms". It allows diverse objects to be accessed through the same interface. For example, different classes can all implement a \`.speak()\` method, and you can loop and call them dynamically without checking their explicit types.`,
        codeSnippet: `animals = [Lion(), Cat()]
for animal in animals:
    print(animal.speak()) # Executes clean class-specific sound!`
      },
      {
        type: 'quiz',
        title: 'Polymorphism Choice Quiz',
        question: 'Which OOP core pillar enables different object types to share common interface names but implement unique behaviors?',
        options: ['Polymorphism', 'Inheritance', 'Encapsulation', 'Abstraction'],
        correctAnswer: 'Polymorphism'
      }
    ];
  }

  // 11. CUSTOM MODULES & IMPORT BASICS
  if (itemId === 'item-6-1') {
    return [
      {
        type: 'info',
        title: 'Modularizing Python Code',
        markdown: `As your projects grow, putting all code in a single file becomes hard to manage. Python **Modules** allow you to write reusable functions and classes in separate \`.py\` files and import them cleanly.`,
        codeSnippet: `# file: custom_math.py
def double(x):
    return x * 2`
      },
      {
        type: 'quiz',
        title: 'Module Filename Extension',
        question: 'What file extension must a text file have in order to be imported as a Python module?',
        options: ['.py', '.mod', '.pyc', '.pym'],
        correctAnswer: '.py'
      },
      {
        type: 'info',
        title: 'Import Syntax and Variations',
        markdown: `You can import helper files using different variations depending on your needs:
- \`import module_name\`: Loads the entire file (access properties with a prefix).
- \`from module_name import helper\`: Imports only a selective function (use directly with no prefix).
- \`import module_name as alias\`: Provides a localized shortcut name.`,
        codeSnippet: `import custom_math as cm
print(cm.double(5)) # Output: 10`
      },
      {
        type: 'quiz',
        title: 'Selective Import Usage',
        question: 'If you use `from custom_math import double`, how do you call the function in your code?',
        options: ['double(5)', 'custom_math.double(5)', 'from.double(5)', 'import.double(5)'],
        correctAnswer: 'double(5)'
      },
      {
        type: 'info',
        title: 'The Entry-Point Guard',
        markdown: `When a module is imported, Python runs all of its top-level statements. To design modules that can run as scripts *and* be imported safely as library files, wrap executable testing statements in an **entry guard block**.`,
        codeSnippet: `if __name__ == "__main__":
    print("This runs only if executed directly, NOT on import!")`
      },
      {
        type: 'quiz',
        title: 'Main Entry Variable',
        question: 'Which built-in variable gets populated with "__main__" if the script is run directly?',
        options: ['__name__', '__file__', '__main__', '__status__'],
        correctAnswer: '__name__'
      }
    ];
  }

  // 12. PACKAGE MANAGEMENT with pip & venv
  if (itemId === 'item-6-2') {
    return [
      {
        type: 'info',
        title: 'Introduction to pip',
        markdown: `**pip** is Python's standard package manager. It connects to the PyPI registry repository to download and install thousands of pre-coded packages written by developers worldwide.`,
        codeSnippet: `# Run in your terminal/command prompt to download requests
pip install requests`
      },
      {
        type: 'quiz',
        title: 'Checking Installed Packages',
        question: 'Which pip terminal command displays all currently installed external libraries?',
        options: ['pip list', 'pip show', 'pip check', 'pip status'],
        correctAnswer: 'pip list'
      },
      {
        type: 'info',
        title: 'Managing Dependencies: requirements.txt',
        markdown: `Production apps track required dependencies inside a \`requirements.txt\` file. You can install all listed packages on any system instantly using one command:`,
        codeSnippet: `# requirements.txt content:
requests==2.31.0

# Install command:
pip install -r requirements.txt`
      },
      {
        type: 'quiz',
        title: 'Bulk Install Command',
        question: 'What flag must be passed to pip install to read a dependencies list from a text file?',
        options: ['-r', '-f', '-i', '-d'],
        correctAnswer: '-r'
      },
      {
        type: 'info',
        title: 'Virtual Environments (venv)',
        markdown: `Global updates can break old apps that depend on specific library versions. A **Virtual Environment** is a self-contained sandbox folder that hosts its own Python interpreter and project libraries.`,
        codeSnippet: `# Create a virtual environment folder named 'myenv'
python -m venv myenv`
      },
      {
        type: 'quiz',
        title: 'Venv Creation Command',
        question: 'Which standard Python terminal command constructs a virtual environment named "myenv"?',
        options: ['python -m venv myenv', 'python create myenv', 'pip install myenv', 'venv construct myenv'],
        correctAnswer: 'python -m venv myenv'
      }
    ];
  }

  // 13. TURTLE GRAPHICS BASICS
  if (itemId === 'item-7-1') {
    return [
      {
        type: 'info',
        title: 'Welcome to Turtle Graphics',
        markdown: `Turtle is a pre-installed Python module that draws line graphics. Imagine a real turtle carrying a pen walking over a blank sheet of paper.`,
        codeSnippet: `import turtle
t = turtle.Turtle() # Custom pen constructor`
      },
      {
        type: 'quiz',
        title: 'Turtle Base Check',
        question: 'Is turtle part of standard Python, or does it require external PIP installation?',
        options: ['It is fully built into Python', 'It requires pip install turtle', 'It only works inside Google Chrome', 'It is a separate language'],
        correctAnswer: 'It is fully built into Python'
      },
      {
        type: 'info',
        title: 'Pen Movement commands',
        markdown: `Direct the cursor through basic functions:
- \`forward(pixels)\` moves forward.
- \`backward(pixels)\` moves backward.
- \`left(degrees)\` rotates left.
- \`right(degrees)\` rotates right.`,
        codeSnippet: `t.forward(100)
t.left(90)`
      },
      {
        type: 'quiz',
        title: 'Angle Rotations Drill',
        question: 'To draw a perfect right-angle corner, by how many degrees must you rotate left() or right()?',
        options: ['90 degrees', '45 degrees', '180 degrees', '360 degrees'],
        correctAnswer: '90 degrees'
      },
      {
        type: 'info',
        title: 'Drawing a Square',
        markdown: `To draw a square, you move forward and rotate 90 degrees iteratively, running exactly 4 times. Using loops streamlines this perfectly.`,
        codeSnippet: `for _ in range(4):
    t.forward(100)
    t.right(90)`
      },
      {
        type: 'quiz',
        title: 'Loop Refactoring Quiz',
        question: 'What loop is most efficient to construct a square using turtle?',
        options: ['for i in range(4):', 'while True:', 'for i in range(45):', 'if sides == 4:'],
        correctAnswer: 'for i in range(4):'
      },
      {
        type: 'info',
        title: 'Lifting the Pen: penup() and pendown()',
        markdown: `To move the turtle to another coordinates without sketching lines, use \`penup()\`. Restoring drawings is done with \`pendown()\`.`,
        codeSnippet: `t.penup()
t.goto(100, 100)
t.pendown()`
      },
      {
        type: 'quiz',
        title: 'Trail Management Check',
        question: 'Which instruction disables drawing trails while moving the cursor across the canvas?',
        options: ['t.penup()', 't.lift()', 't.stop()', 't.draw(False)'],
        correctAnswer: 't.penup()'
      },
      {
        type: 'info',
        title: 'Canvas Screen Keep Alive',
        markdown: `At the bottom of local scripts, always call \`screen.mainloop()\` or \`turtle.done()\` to keep the drawing window active. Otherwise, it will close instantly.`,
        codeSnippet: `screen = turtle.Screen()
# Drawing commands here
screen.mainloop() # Keeps window responsive`
      },
      {
        type: 'quiz',
        title: 'Window Stability Drill',
        question: 'Which method stops the drawing window from immediately exiting upon script completion?',
        options: ['screen.mainloop()', 'turtle.abort()', 'time.sleep()', 'sys.exit()'],
        correctAnswer: 'screen.mainloop()'
      }
    ];
  }

  // 14. TURTLE COLORS, PEN ACTIONS & GEOMETRY
  if (itemId === 'item-7-2') {
    return [
      {
        type: 'info',
        title: 'Customizing Pen Styles',
        markdown: `Add colors and widths. Change the line thickness using \`pensize(width)\`. Choose custom coloring using string color variables.`,
        codeSnippet: `t.pensize(5)
t.color("purple")`
      },
      {
        type: 'quiz',
        title: 'Width Control Check',
        question: 'Which method increases the thickness of lines sketched by the turtle pen?',
        options: ['pensize()', 'penweight()', 'setwidth()', 'line_bold()'],
        correctAnswer: 'pensize()'
      },
      {
        type: 'info',
        title: 'Painting Solid Color Fills',
        markdown: `Fill geometric shapes by setting a fill color, starting details with \`begin_fill()\`, drawing the shape, and closing boundaries with \`end_fill()\`.`,
        codeSnippet: `t.fillcolor("gold")
t.begin_fill()
# Draw square...
t.end_fill()`
      },
      {
        type: 'quiz',
        title: 'Fills Boundaries Quiz',
        question: 'What method is written matching begin_fill() to conclude and trigger the paint fill inside a drawn shape?',
        options: ['end_fill()', 'stop_fill()', 'paint()', 'close()'],
        correctAnswer: 'end_fill()'
      },
      {
        type: 'info',
        title: 'Cartesian Coordinate Movement',
        markdown: `The drawing canvas is a coordinates grid. The origin (0,0) starts at the absolute center. Command coordinates dynamically using \`goto(x, y)\`.`,
        codeSnippet: `t.goto(-200, 150) # Moves direct to Top-Left`
      },
      {
        type: 'quiz',
        title: 'Center Coordinate Quiz',
        question: 'What coordinate represent the center starting position (origin) of the Turtle canvas?',
        options: ['(0, 0)', '(100, 100)', '(-1, -1)', '(center, center)'],
        correctAnswer: '(0, 0)'
      },
      {
        type: 'info',
        title: 'Adjusting Velocity speeds',
        markdown: `Adjust movement velocity using \`speed()\`. Parameters vary from index 1 (slowest) to 10 (fastest). Value \`0\` is specialized and makes drawing instant.`,
        codeSnippet: `t.speed(0) # Drawing updates immediately`
      },
      {
        type: 'quiz',
        title: 'Instant Velocities',
        question: 'What speed value renders turtle vector motions instantly without intermediate scrolling animations?',
        options: ['0', '11', '100', 'None'],
        correctAnswer: '0'
      },
      {
        type: 'info',
        title: 'Turtle Shapes',
        markdown: `The cursor icon look is customizable! Change it using \`shape()\` which supports settings like "arrow", "turtle", "circle", "square", or "triangle".`,
        codeSnippet: `t.shape("turtle") # Shows cute turtle icon`
      },
      {
        type: 'quiz',
        title: 'Icon Customization Check',
        question: 'Which instruction changes the icon shape of the pencil cursor to a turtle?',
        options: ['t.shape("turtle")', 't.set_icon("turtle")', 't.cursor("turtle")', 't.avatar("turtle")'],
        correctAnswer: 't.shape("turtle")'
      }
    ];
  }

  // 15. TKINTER GUI BASICS
  if (itemId === 'item-8-1') {
    return [
      {
        type: 'info',
        title: 'Introduction to Tkinter',
        markdown: `**Tkinter** is Python's standard, pre-installed toolkit for creating Graphical User Interfaces (GUIs). It lets you build interactive desktop applications wrapper around system window rendering.`,
        codeSnippet: `import tkinter as tk
root = tk.Tk() # Main window constructor`
      },
      {
        type: 'quiz',
        title: 'Library Check',
        question: 'Is Tkinter usually pre-installed with standard desktop Python distributions?',
        options: ['Yes, it comes built-in with standard Python installs', 'No, it requires installing from pip', 'No, it is only available as a web app', 'No, it is deprecated and removed'],
        correctAnswer: 'Yes, it comes built-in with standard Python installs'
      },
      {
        type: 'info',
        title: 'Initializing Root Window',
        markdown: `Every Tkinter app must have a main/root window created via \`tk.Tk()\`. You can set its title using \`title(text)\` and set its width and height size via \`geometry("widthxheight")\`.`,
        codeSnippet: `root = tk.Tk()
root.title("Solar Tracker Dashboard")
root.geometry("450x300")`
      },
      {
        type: 'quiz',
        title: 'Geometry Convention Quiz',
        question: 'Which geometry parameter format is correct to size a Tkinter window to 450px width and 300px height?',
        options: ['root.geometry("450x300")', 'root.geometry(450, 300)', 'root.size(450, 300)', 'root.geometry("450,300")'],
        correctAnswer: 'root.geometry("450x300")'
      },
      {
        type: 'info',
        title: 'Adding Labels',
        markdown: `To write text labels on screen, use the \`Label\` widget. To make widgets visible in Tkinter, you must explicitly use a layout manager like \`pack()\` to arrange and place them.`,
        codeSnippet: `label = tk.Label(root, text="Hello world!")
label.pack()`
      },
      {
        type: 'quiz',
        title: 'Display Check',
        question: 'Suppose you instantiate a label widget. What method is strictly required to make it visible?',
        options: ['pack() or grid()', 'show()', 'render()', 'display()'],
        correctAnswer: 'pack() or grid()'
      },
      {
        type: 'info',
        title: 'The Event Main Loop',
        markdown: `At the very bottom of any Tkinter code block, you MUST invoke \`root.mainloop()\`. This starts the desktop event listener, keeping the window open and reacting to actions.`,
        codeSnippet: `root.mainloop() # Must run at end of script`
      },
      {
        type: 'quiz',
        title: 'Process Alive Check',
        question: 'What method starts Tkinter’s event listening loop and keeps the window responsive on screen?',
        options: ['root.mainloop()', 'root.keep_alive()', 'root.run_until_complete()', 'root.listen()'],
        correctAnswer: 'root.mainloop()'
      },
      {
        type: 'info',
        title: 'Widgets Catalog',
        markdown: `Tkinter includes built-in component widgets: \`Label\`, \`Button\`, \`Entry\` (text fields), \`Frame\` (containment blocks), \`Canvas\` (custom drawing pixels), and \`Checkbutton\`.`,
      },
      {
        type: 'quiz',
        title: 'Tkinter Widget Matcher',
        question: 'Which Tkinter widget is specifically designed to allow users to input thin strings of single-line text?',
        options: ['Entry', 'Label', 'Button', 'Textarea'],
        correctAnswer: 'Entry'
      }
    ];
  }

  // 16. TKINTER EVENTS & INTERACTION
  if (itemId === 'item-8-2') {
    return [
      {
        type: 'info',
        title: 'Receiving Text via Entry Fields',
        markdown: `To collect inputs, use the \`tk.Entry\` widget. You can dynamically read its contents anytime using the \`.get()\` built-in method.`,
        codeSnippet: `username_field = tk.Entry(root)
username_field.pack()
# Read later via username_field.get()`
      },
      {
        type: 'quiz',
        title: 'Input Reading Call',
        question: 'Which method retrieves the current text typed inside a tk.Entry widget?',
        options: ['get()', 'getValue()', 'text()', 'read()'],
        correctAnswer: 'get()'
      },
      {
        type: 'info',
        title: 'Interactive Buttons and commands',
        markdown: `Creating a button is done via \`tk.Button\`. Use the keyword argument \`command\` to link a Python function representing the click click event handler.`,
        codeSnippet: `def onClick():
    print("Clicked!")

action_btn = tk.Button(root, text="Process", command=onClick)`
      },
      {
        type: 'quiz',
        title: 'Callback Syntax Quiz',
        question: 'When binding the onClick function to the command parameter of a button, what is the correct syntax?',
        options: ['command=onClick', 'command=onClick()', 'command="onClick"', 'command=lambda: onClick()()'],
        correctAnswer: 'command=onClick'
      },
      {
        type: 'info',
        title: 'Updating Widget Attributes',
        markdown: `To modify properties of already placed widgets (like a label's text display), use the \`.config()\` or \`.configure()\` dynamic method.`,
        codeSnippet: `info_label = tk.Label(root, text="Status: Standard")
info_label.pack()

# Sometime later inside handler:
info_label.config(text="Status: Updated!")`
      },
      {
        type: 'quiz',
        title: 'Widget Alteration Quiz',
        question: 'Which method alters existing attributes (like background or text) on an already rendered Tkinter widget?',
        options: ['config()', 'update()', 'set()', 'change()'],
        correctAnswer: 'config()'
      },
      {
        type: 'info',
        title: 'Grid Layout Matrices',
        markdown: `Instead of vertical block packing, arrange interactive forms in clean spreadsheets using \`grid(row, column)\`. Coordinates start at 0.`,
        codeSnippet: `name_label.grid(row=0, column=0)
name_field.grid(row=0, column=1)
submit_button.grid(row=1, columnspan=2)`
      },
      {
        type: 'quiz',
        title: 'Tabular Layout Selectors',
        question: 'Which Tkinter geometry manager schedules widgets into row and column coordinates?',
        options: ['grid()', 'pack()', 'place()', 'table()'],
        correctAnswer: 'grid()'
      },
      {
        type: 'info',
        title: 'Frames as Modular Segments',
        markdown: `Group layout modules using \`tk.Frame\`. This nests layouts cleanly, maintaining beautiful margins and division spacing.`,
        codeSnippet: `header_frame = tk.Frame(root)
header_frame.pack(pady=10)
# Places labels inside the specific frame instead of the root!
title_lbl = tk.Label(header_frame, text="My App")`
      },
      {
        type: 'quiz',
        title: 'Grouping Objects Check',
        question: 'Which widget serves as a container element used to group, space and coordinate related widgets?',
        options: ['Frame', 'Group', 'Box', 'Canvas'],
        correctAnswer: 'Frame'
      }
    ];
  }

  // 17. NUMPY BASICS & NDARRAYS
  if (itemId === 'item-9-1') {
    return [
      {
        type: 'info',
        title: 'Introduction to NumPy',
        markdown: `**NumPy** (Numerical Python) is the foundation of scientific computing, data science, and machine learning in Python. It provides high-performance multidimensional array objects and tools to manipulate them.`,
        codeSnippet: `import numpy as np
# The standard alias is 'np'`
      },
      {
        type: 'quiz',
        title: 'Namespace Alias Quiz',
        question: 'What is the standard, globally recognized community import alias used for NumPy?',
        options: ['import numpy as np', 'import numpy as num', 'import numpy as npy', 'import numpy as math'],
        correctAnswer: 'import numpy as np'
      },
      {
        type: 'info',
        title: 'The NDArray Object',
        markdown: `Traditional Python lists are slow because they store full reference pointers for each item. NumPy resolves this with the **ndarray** (N-dimensional array), which stores uniform data closely together in continuous memory.`,
        codeSnippet: `grades = [85, 90, 78, 92]
array_grades = np.array(grades)
print(type(array_grades)) # Output: <class 'numpy.ndarray'>`
      },
      {
        type: 'quiz',
        title: 'Memory and Structure Check',
        question: 'Why are NumPy arrays significantly more efficient than standard Python lists?',
        options: [
          'They store homogeneous data in contiguous blocks of memory',
          'They only support complex floating numbers',
          'They store data on external cloud databases automatically',
          'They allow mixing multiple types like strings and lists in one block'
        ],
        correctAnswer: 'They store homogeneous data in contiguous blocks of memory'
      },
      {
        type: 'info',
        title: 'Quick Array Generators',
        markdown: `You don't need to write standard list loops to create arrays. NumPy has super-charged built-in utility generators:
- \`np.zeros(size)\`: Fills an array with 0s.
- \`np.ones(size)\`: Fills an array with 1s.
- \`np.arange(start, stop, step)\`: Generates sequences of spaced numbers.`,
        codeSnippet: `zeros_arr = np.zeros(5)       # [0., 0., 0., 0., 0.]
sequence_arr = np.arange(1, 10, 2) # [1, 3, 5, 7, 9]`
      },
      {
        type: 'quiz',
        title: 'Sequence Range Quiz',
        question: 'Which statement creates a NumPy array containing numbers starting from 0 up to 9 (inclusive of 0, excluding 10)?',
        options: ['np.arange(10)', 'np.arange(0, 11)', 'np.zeros(10)', 'np.range(10)'],
        correctAnswer: 'np.arange(10)'
      },
      {
        type: 'info',
        title: 'Array Attributes (Inspection)',
        markdown: `Once you have an array, you can inspect it using its main attributes:
- \`.shape\`: Returns a tuple of dimensions (rows, cols).
- \`.ndim\`: Returns the number of dimensions/axes.
- \`.dtype\`: Tells you the data type stored inside (e.g., int64, float64).`,
        codeSnippet: `matrix = np.array([[1, 2], [3, 4]])
print(matrix.shape) # (2, 2)
print(matrix.ndim)  # 2`
      },
      {
        type: 'quiz',
        title: 'Datatype Check',
        question: 'Which attribute retrieves the underlying data type of the elements inside a NumPy array?',
        options: ['.dtype', '.type()', '.schema', '.format'],
        correctAnswer: '.dtype'
      }
    ];
  }

  // 18. NUMPY MATH & OPERATIONS
  if (itemId === 'item-9-2') {
    return [
      {
        type: 'info',
        title: 'Vectorized Arithmetic Operations',
        markdown: `In vanilla Python, calculating mathematically on all items requires a loop. NumPy uses **vectorization**, letting you apply arithmetic operations globally to entire arrays instantly at compiled C speeds.`,
        codeSnippet: `prices = np.array([10, 20, 30])
discounted_prices = prices - 2
print(discounted_prices) # [8, 18, 28]`
      },
      {
        type: 'quiz',
        title: 'Array Addition Quiz',
        question: 'If you execute `np.array([1, 2, 3]) + 10`, what is the resulting array?',
        options: ['[11, 12, 13]', '[11, 2, 3]', '[1, 2, 13]', '[10, 20, 30]'],
        correctAnswer: '[11, 12, 13]'
      },
      {
        type: 'info',
        title: 'Array Slicing and Coordinate Indexing',
        markdown: `Slicing multi-dimensional arrays uses a single set of brackets with comma-separated bounds: \`[row_slice, col_slice]\`. Use a colon (\`:\`) to capture full ranges.`,
        codeSnippet: `matrix = np.array([
    [10, 20, 30],
    [40, 50, 60]
])
# Row 0, Col 1
print(matrix[0, 1])   # 20
# All rows, Col 1 onwards
print(matrix[:, 1:])  # [[20, 30], [50, 60]]`
      },
      {
        type: 'quiz',
        title: 'Matrix Slicing Coordinates',
        question: 'How do you extract the element from the 3rd row (index 2) and 1st column (index 0) of a 2D array named `data_grid`?',
        options: ['data_grid[2, 0]', 'data_grid[3, 1]', 'data_grid[2][0]', 'data_grid(2, 0)'],
        correctAnswer: 'data_grid[2, 0]'
      },
      {
        type: 'info',
        title: 'Built-in Statistical Aggregators',
        markdown: `Need fast aggregations? NumPy comes packed with instant statistical operations executed over all array segments:
- \`np.sum(arr)\`: Calculates elements addition total.
- \`np.mean(arr)\`: Calculates the average value.
- \`np.std(arr)\`: Calculates the standard deviation.`,
        codeSnippet: `values = np.array([2, 4, 6, 8])
print(np.mean(values)) # 5.0`
      },
      {
        type: 'quiz',
        title: 'Aggregator Name Test',
        question: 'Which NumPy method calculates the arithmetic mean/average of elements inside an array?',
        options: ['np.mean()', 'np.average()', 'np.avg()', 'np.std()'],
        correctAnswer: 'np.mean()'
      }
    ];
  }

  // 19. PANDAS SERIES & DATAFRAMES
  if (itemId === 'item-10-1') {
    return [
      {
        type: 'info',
        title: 'Introduction to Pandas',
        markdown: `**Pandas** is Python's premiere high-level library designed for structured data analysis, manipulation, and cleansing. It implements two core data structures built on top of NumPy arrays: **Series** (1D) and **DataFrame** (2D).`,
        codeSnippet: `import pandas as pd
# Standard community alias is 'pd'`
      },
      {
        type: 'quiz',
        title: 'Standard Alias Quiz',
        question: 'What is the universally accepted community alias for importing the Pandas library?',
        options: ['import pandas as pd', 'import pandas as pan', 'import pandas as pds', 'import pandas as df'],
        correctAnswer: 'import pandas as pd'
      },
      {
        type: 'info',
        title: 'Understanding Pandas Series',
        markdown: `A **Series** is a one-dimensional labeled array capable of holding any data type (integers, strings, floating point numbers, Python items). Unlike NumPy arrays, Series elements are mapped to user-defined **labels** called the **index**.`,
        codeSnippet: `sales = [100, 250, 400]
months = ['Jan', 'Feb', 'Mar']
series_sales = pd.Series(sales, index=months)
print(series_sales['Feb']) # Output: 250`
      },
      {
        type: 'quiz',
        title: 'Series Index Quiz',
        question: 'What is the custom coordinate labeling system of a Pandas Series called?',
        options: ['index', 'keys', 'coords', 'columns'],
        correctAnswer: 'index'
      },
      {
        type: 'info',
        title: 'The DataFrame structure',
        markdown: `A **DataFrame** is a two-dimensional tabular data structure with columns that can be of different types. It looks exactly like an Excel spreadsheet or an SQL database table. You can construct one directly from a standard dictionary of lists.`,
        codeSnippet: `student_data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [23, 22, 24],
    'Grade': ['A', 'B', 'A']
}
df = pd.DataFrame(student_data)
print(df)`
      },
      {
        type: 'quiz',
        title: 'DataFrame Concept check',
        question: 'How many dimensions does a standard Pandas DataFrame possess representatively?',
        options: ['Two dimensions (Rows & Columns)', 'One dimension', 'Three dimensions', 'Infinite dimensions'],
        correctAnswer: 'Two dimensions (Rows & Columns)'
      },
      {
        type: 'info',
        title: 'Inspecting DataFrames',
        markdown: `When working with larger datasets, you can quickly preview and inspect them using high-utility helper attributes and methods:
- \`df.head(n)\`: Returns the first n rows of the DataFrame.
- \`df.tail(n)\`: Returns the last n rows.
- \`df.shape\`: Returns a tuple showing the number of (rows, columns).
- \`df.info()\`: Prints a summary of column non-null values and types.`,
        codeSnippet: `# Preview first 5 rows of a massive DataFrame
print(df.head())`
      },
      {
        type: 'quiz',
        title: 'Inspection Utility Quiz',
        question: 'Which Pandas method retrieves and displays the first N rows of a DataFrame?',
        options: ['head()', 'first()', 'preview()', 'show()'],
        correctAnswer: 'head()'
      }
    ];
  }

  // 20. PANDAS DATA ANALYSIS & FILTERS
  if (itemId === 'item-10-2') {
    return [
      {
        type: 'info',
        title: 'Selecting and Slicing Columns',
        markdown: `In a DataFrame, you can extract a single column as a Series using brackets \`df['column_name']\` or extract multiple columns by passing a list of names \`df[['col1', 'col2']]\`.`,
        codeSnippet: `names = df['Name'] # Single column
subset = df[['Name', 'Grade']] # Pair columns`
      },
      {
        type: 'quiz',
        title: 'Multiple Column selection',
        question: 'Which syntax is correct for selecting both "Age" and "Grade" columns simultaneously from a DataFrame named `df`?',
        options: [`df[['Age', 'Grade']]`, `df['Age', 'Grade']`, `df.select('Age', 'Grade')`, `df[('Age', 'Grade')]`],
        correctAnswer: `df[['Age', 'Grade']]`
      },
      {
        type: 'info',
        title: 'Boolean Indexing & Data Filtering',
        markdown: `Pandas enables extremely powerful conditional filtering. By passing a boolean expression in brackets, you can filter the exact subset of rows that return \`True\`.`,
        codeSnippet: `# Select only students older than 22
older_students = df[df['Age'] > 22]
print(older_students)`
      },
      {
        type: 'quiz',
        title: 'Data Filtration Logic',
        question: 'How would you filter a student DataFrame `df` to extract records where the Grade column equals "A"?',
        options: [`df[df['Grade'] == 'A']`, `df['Grade' == 'A']`, `df.filter('Grade' == 'A')`, `df.where('Grade' == 'A')`],
        correctAnswer: `df[df['Grade'] == 'A']`
      },
      {
        type: 'info',
        title: 'Essential Arithmetic Aggregations',
        markdown: `Pandas delivers high-efficiency aggregation statistics calculated across rows or columns:
- \`df['col'].mean()\`: Average of columns.
- \`df['col'].sum()\`: Addition summing total.
- \`df.describe()\`: Generates summary statistics (mean, min, max, std dev) for all numerical columns.`,
        codeSnippet: `# Describe all numerical stats
print(df.describe())`
      },
      {
        type: 'quiz',
        title: 'Descriptive Stats Quiz',
        question: 'Which Pandas DataFrame method outputs a complete statistical summary (mean, min, distribution metrics) for columns?',
        options: ['describe()', 'summary()', 'stats()', 'info()'],
        correctAnswer: 'describe()'
      }
    ];
  }

  // 21. MATPLOTLIB BASICS & PLOTS
  if (itemId === 'item-11-1') {
    return [
      {
        type: 'info',
        title: 'Introduction to Matplotlib',
        markdown: `**Matplotlib** is the most widely-used data visualization and plotting library in Python. It lets you create static, animated, and interactive visualizations such as line charts, bar plots, scatter charts, and histograms.`,
        codeSnippet: `import matplotlib.pyplot as plt
# Pyplot is the main module for plotting operations`
      },
      {
        type: 'quiz',
        title: 'Pyplot Standard Import Quiz',
        question: 'What is the standard, globally recognized community import alias used for plotting with Matplotlib?',
        options: ['import matplotlib.pyplot as plt', 'import matplotlib as plt', 'import pyplot as plt', 'import matplotlib.plot as plt'],
        correctAnswer: 'import matplotlib.pyplot as plt'
      },
      {
        type: 'info',
        title: 'Constructing your First Line Plot',
        markdown: `To construct a basic line chart, pass two coordinate lists (X and Y coordinates) to \`plt.plot()\`, and use \`plt.show()\` to render the figure on screen.`,
        codeSnippet: `x = [1, 2, 3, 4]
y = [10, 20, 25, 30]

plt.plot(x, y)
plt.show() # Renders the plot`
      },
      {
        type: 'quiz',
        title: 'Rendering Method Quiz',
        question: 'Which Matplotlib function is called to display the constructed visualization window on the screen?',
        options: ['plt.show()', 'plt.render()', 'plt.display()', 'plt.draw()'],
        correctAnswer: 'plt.show()'
      },
      {
        type: 'info',
        title: 'Adding Chart Context: Labels & Title',
        markdown: `An unlabelled graph is meaningless! Always annotate charts to make them professional:
- \`plt.title("My Title")\`: Adds a header title.
- \`plt.xlabel("X Label")\`: Adds a horizontal axis label.
- \`plt.ylabel("Y Label")\`: Adds a vertical axis label.`,
        codeSnippet: `plt.plot(x, y)
plt.title("Growth Rate over Time")
plt.xlabel("Days")
plt.ylabel("Height (cm)")
plt.show()`
      },
      {
        type: 'quiz',
        title: 'Axis Labeling Quiz',
        question: 'Which command adds a descriptive text label specifically to the vertical Y-axis of a plot?',
        options: ['plt.ylabel()', 'plt.xlabel()', 'plt.yaxis()', 'plt.title()'],
        correctAnswer: 'plt.ylabel()'
      },
      {
        type: 'info',
        title: 'Diverse Chart Types: Bar & Scatter',
        markdown: `Matplotlib makes drawing diverse graphics simple:
- \`plt.bar(x, y)\`: Renders vertical bars.
- \`plt.scatter(x, y)\`: Plots discrete, unlinked data dots.`,
        codeSnippet: `categories = ['A', 'B', 'C']
values = [15, 24, 9]

plt.bar(categories, values)
plt.show()`
      },
      {
        type: 'quiz',
        title: 'Scatter Plot Identifier',
        question: 'Which Pyplot function creates a scatter plot of coordinates represented by individual dots?',
        options: ['plt.scatter()', 'plt.dotplot()', 'plt.bar()', 'plt.plot_discrete()'],
        correctAnswer: 'plt.scatter()'
      }
    ];
  }

  // 22. MATPLOTLIB CUSTOMIZATIONS & SUBPLOTS
  if (itemId === 'item-11-2') {
    return [
      {
        type: 'info',
        title: 'Customizing Line Styles & Colors',
        markdown: `You can customize line aesthetics by specifying keyword properties such as \`color\` (using standard names or hex strings) and \`linestyle\` (like "dashed", "dotted", or "solid"):`,
        codeSnippet: `plt.plot(x, y, color="red", linestyle="dashed", linewidth=2)`
      },
      {
        type: 'quiz',
        title: 'Line Styling Quiz',
        question: 'Which parameter specifies a dashed visual appearance for a line drawn via plt.plot()?',
        options: ['linestyle="dashed"', 'style="dashed"', 'line="dashed"', 'type="dashed"'],
        correctAnswer: 'linestyle="dashed"'
      },
      {
        type: 'info',
        title: 'Multiple Lines & Chart Legends',
        markdown: `To map multiple data series, call \`plt.plot()\` multiple times. Pass the \`label\` keyword, then trigger \`plt.legend()\` to render a label box on screen.`,
        codeSnippet: `plt.plot(x, y1, label="Store A")
plt.plot(x, y2, label="Store B")
plt.legend() # Automatically displays names
plt.show()`
      },
      {
        type: 'quiz',
        title: 'Legend Box Quiz',
        question: 'Which method displays the descriptive color-coded guide explaining labeled data series on a Matplotlib figure?',
        options: ['plt.legend()', 'plt.guide()', 'plt.labels_box()', 'plt.show_labels()'],
        correctAnswer: 'plt.legend()'
      },
      {
        type: 'info',
        title: 'Gridlines & Saving Graphics',
        markdown: `To read coordinate data points with ease, you can enable helper lines inside the plot using \`plt.grid(True)\`. You can also save figures directly to your disk using \`plt.savefig(filename)\`.`,
        codeSnippet: `plt.plot(x, y)
plt.grid(True)
plt.savefig("growth_chart.png") # Saves to disk`
      },
      {
        type: 'quiz',
        title: 'Saving Plot Figure Quiz',
        question: 'Which Pyplot function saves the current plot as an image file (e.g., PNG or PDF) on your drive?',
        options: ['plt.savefig()', 'plt.save()', 'plt.export()', 'plt.write_image()'],
        correctAnswer: 'plt.savefig()'
      },
      {
        type: 'info',
        title: 'Introduction to Subplots',
        markdown: `To draw multiple grid sheets in a single canvas frame, use \`plt.subplot(rows, columns, active_index)\`. Coordinates start with 1, organizing plots side-by-side or stacked vertically.`,
        codeSnippet: `# Row 1, Col 2, Active Plot 1
plt.subplot(1, 2, 1)
plt.plot(x, y1)

# Row 1, Col 2, Active Plot 2
plt.subplot(1, 2, 2)
plt.plot(x, y2)

plt.show()`
      },
      {
        type: 'quiz',
        title: 'Subplot Parameters Quiz',
        question: 'In the command `plt.subplot(2, 3, 4)`, how many total rows and columns of plots does the grid define?',
        options: ['2 rows, 3 columns', '3 rows, 2 columns', '2 rows, 4 columns', '4 rows, 3 columns'],
        correctAnswer: '2 rows, 3 columns'
      }
    ];
  }

  // 23. JUPYTER BLUEPRINTS & CELLS
  if (itemId === 'item-12-1') {
    return [
      {
        type: 'info',
        title: 'Anatomy of Jupyter Notebooks',
        markdown: `**Jupyter Notebooks** (.ipynb files) provide an interactive sandbox environment combining live Python programming, statistical displays, formatted documentation (Markdown), and graphic illustrations.`,
        codeSnippet: `# A Jupyter Notebook cell can be run as an isolated Python statement!
print("Interactive sandbox active")`
      },
      {
        type: 'quiz',
        title: 'Jupyter Document Extension',
        question: 'What is the standard file extension used for saving Jupyter Notebook documents?',
        options: ['.ipynb', '.py', '.jupyter', '.nb'],
        correctAnswer: '.ipynb'
      },
      {
        type: 'info',
        title: 'Markdown vs Code Cells',
        markdown: `Jupyter documents divide content into discrete rows called **cells**. Each cell possesses a classification archetype:
- **Code cells**: Contain executable Python source code.
- **Markdown cells**: Feature descriptive text, math formulation, images, and HTML links.`,
        codeSnippet: `### Sample Markdown Card
You can document your mathematical operations in **bold** layout formatting!`
      },
      {
        type: 'quiz',
        title: 'Document Cells Quiz',
        question: 'Which type of cell is used inside Jupyter for formatting formatted documentation text and narrative headings?',
        options: ['Markdown cells', 'Code cells', 'Raw cells', 'Input cells'],
        correctAnswer: 'Markdown cells'
      },
      {
        type: 'info',
        title: 'In-Memory Variable Caching',
        markdown: `Unlike full script execution pipelines, Jupyter stores the results of variables and custom functions in-memory. Executing cells out-of-order keeps variables updated even if their definitions appear lower in the visual notebook flow!`,
        codeSnippet: `x = 250
# Running this cell saves value 250 in global memory space`
      },
      {
        type: 'quiz',
        title: 'Global Variables Retention',
        question: 'Why does Jupyter retain variables across separate run requests?',
        options: ['They are kept in the execution engine\'s global memory', 'They are saved to the computer\'s persistent hard drive', 'They cannot be changed once declared', 'The cells are run concurrently'],
        correctAnswer: 'They are kept in the execution engine\'s global memory'
      }
    ];
  }

  // 24. IPYKERNEL LIFECYCLE & STATE
  if (itemId === 'item-12-2') {
    return [
      {
        type: 'info',
        title: 'Introduction to Jupyter Kernels & ipykernel',
        markdown: `A **kernel** is the decoupled computation backend engine associated with a document. For running interactive Python code, the default background component is **ipykernel**, which is responsible for parsing inputs and outputting execution streams.`,
        codeSnippet: `# ipykernel operates as the standard Python driver backstage
import sys
print(sys.executable)`
      },
      {
        type: 'quiz',
        title: 'Backend Execution Driver',
        question: 'Which standard Python module serves as the background execution kernel engine for Jupyter Notebooks?',
        options: ['ipykernel', 'sys', 'venv', 'pip'],
        correctAnswer: 'ipykernel'
      },
      {
        type: 'info',
        title: 'The Out-of-Order Execution Pitfall',
        markdown: `Because cells can be run in any logical sequence, modifying a shared global variable non-sequentially across different cells can result in weird states. 
Consider a variable modified randomly where running cell-2 twice compounds its calculation. This makes state management tricky!`,
        codeSnippet: `# Cell 1:
score = 100

# Cell 2: (Run twice changes score to 110)
score += 5`
      },
      {
        type: 'quiz',
        title: 'Compounding State Pitfall',
        question: 'If you declare score = 100 in Cell A and score += 10 in Cell B, what is the value of score if you run Cell B three times consecutively?',
        options: ['130', '110', '100', '120'],
        correctAnswer: '130'
      },
      {
        type: 'info',
        title: 'Restarting & Clearing State',
        markdown: `To guarantee that your mathematical calculations execute correctly for other developers, it is a standard workflow to execute **\"Restart Kernel & Run All Cells\"** which triggers a sequential run from top to bottom on a clean slate.`,
        codeSnippet: `# Standard best practice: Restart and Run All to clear dirty session variables`
      },
      {
        type: 'quiz',
        title: 'Clean Slate Execution',
        question: 'What action should you take when cell values become too cluttered or out-of-order state bugs emerge?',
        options: ['Restart the kernel and execute all cells sequentially from the top', 'Delete the ipykernel files from your machine', 'Convert all Code cells to Markdown format', 'Rename the notebook files to force cache reloads'],
        correctAnswer: 'Restart the kernel and execute all cells sequentially from the top'
      }
    ];
  }

  // FALLBACK GENERIC GENERATOR if any third party/untracked lesson is loaded
  // It takes the raw markdown content, splits it, and populates 10 steps iteratively.
  const fallbackSteps: LessonStep[] = [];
  const sourceLines = itemContent.split('\n').filter(l => l.trim().length > 0);
  
  for (let i = 0; i < 10; i++) {
    const isQuizStep = i % 2 === 1; // Alternating notes and quiz checkpoints
    const stepNum = i + 1;
    
    if (isQuizStep) {
      fallbackSteps.push({
        type: 'quiz',
        title: `Mini Practice Drill ${stepNum / 2}`,
        question: `Based on Section ${stepNum - 1}, does Python support dynamic execution pathways?`,
        options: ['Yes, Python executes statements dynamically', 'No, Python is strict and single-tasked only', 'Only on Sunday', 'Only inside projects'],
        correctAnswer: 'Yes, Python executes statements dynamically'
      });
    } else {
      const sliceStart = Math.floor((i / 10) * sourceLines.length);
      const sliceEnd = Math.floor(((i + 1.5) / 10) * sourceLines.length);
      const textChunk = sourceLines.slice(sliceStart, sliceEnd).join('\n\n') || "Ensure you understand this chapter module fully.";
      
      fallbackSteps.push({
        type: 'info',
        title: `Section ${stepNum}: Overview Detail`,
        markdown: textChunk,
      });
    }
  }
  
  return fallbackSteps;
}
