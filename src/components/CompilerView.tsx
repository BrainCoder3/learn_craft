import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Play, RefreshCw, Trash2, Check, Sparkles, Code, Info, HelpCircle } from 'lucide-react';
import { Course } from '../types';

interface CompilerViewProps {
  activeCourseId: string;
  coursesList: Course[];
}

interface KeywordSuggestion {
  word: string;
  description: string;
  template: string;
}

export default function CompilerView({ activeCourseId, coursesList }: CompilerViewProps) {
  const currentCourse = coursesList.find(c => c.id === activeCourseId);
  const isPython = activeCourseId.includes('python') || currentCourse?.title.toLowerCase().includes('python');

  // Load appropriate starter template
  const getStarterCode = (courseId: string): string => {
    if (isPython) {
      return `# Welcome to your Python 3.x Developer Sandbox!\n# This environment executes pure Python in WebAssembly (via Pyodide).\n\ndef greet_coder(name, role):\n    print(f"⚡ Booting compiler for {name} ({role})")\n    print("🐍 Python 3 WEB SANDBOX READY")\n    \n    # Try list comprehensions or lambda functions:\n    squares = [x**2 for x in range(1, 6)]\n    print(f"Calculated Squares 1 to 5: {squares}")\n    \n    return "Ready to code!"\n\nstatus = greet_coder("Guest Elite", "Fullstack Engineer")\nprint(f"Status: {status}")\n`;
    } else {
      return `// Welcome to your JS/TS Developer Sandbox!\n// This environment executes Javascript natively inside your sandbox.\n\nfunction processStats(data) {\n  console.log("⚡ Executing JS analytics...");\n  const total = data.reduce((sum, num) => sum + num, 0);\n  const mean = total / data.length;\n  \n  return {\n    count: data.length,\n    sum: total,\n    average: mean\n  };\n}\n\nconst report = processStats([15, 24, 88, 42, 90]);\nconsole.log("Compiled analysis report:", JSON.stringify(report, null, 2));\n`;
    }
  };

  const getKeywords = (): KeywordSuggestion[] => {
    if (isPython) {
      return [
        { word: 'print()', description: 'Outputs message to console stdout', template: 'print("Hello World")' },
        { word: 'def', description: 'Defines reusable modular function block', template: 'def function_name(param):\n    return param' },
        { word: 'for x in range()', description: 'Iterates sequence through specified range', template: 'for i in range(5):\n    print(i)' },
        { word: 'if/elif/else', description: 'Conditional branch evaluation checks', template: 'if x > 10:\n    print("greater")\nelif x == 10:\n    print("equal")\nelse:\n    print("less")' },
        { word: 'list_comprehension', description: 'Shorthand layout to generate new lists', template: '[x for x in range(10) if x % 2 == 0]' },
        { word: 'import math', description: 'Import mathematics calculations library', template: 'import math\nprint(math.sqrt(16))' },
        { word: 'while', description: 'Loops indefinitely while predicate evaluates true', template: 'count = 0\nwhile count < 3:\n    print(count)\n    count += 1' },
        { word: 'lambda', description: 'Define quick inline anonymous function', template: 'square = lambda x: x ** 2\nprint(square(5))' },
        { word: 'try/except', description: 'Gracefully catch exceptions and display errors', template: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError as e:\n    print("Caught error:", e)' },
      ];
    } else {
      return [
        { word: 'console.log()', description: 'Logs standard diagnostic output line', template: 'console.log("Value:", value);' },
        { word: 'const/let', description: 'Block-scoped immutable or mutable variable', template: 'const pi = 3.14159;\nlet counter = 0;' },
        { word: 'function', description: 'Declares custom typescript function block', template: 'function name(args) {\n  return args;\n}' },
        { word: 'arrow_fn', description: 'Shorthand anonymous mathematical arrow function', template: 'const square = x => x * x;' },
        { word: 'if/else', description: 'Checks local predicate logic branches', template: 'if (value > 5) {\n  console.log("More");\n} else {\n  console.log("Less");\n}' },
        { word: 'for/of', description: 'Iterates over elements of lists or arrays', template: 'for (const item of dataset) {\n  console.log(item);\n}' },
        { word: 'Promise.all', description: 'Runs multiple concurrent tasks to resolve all', template: 'Promise.all([p1, p2]).then(results => {});' },
      ];
    }
  };

  // State
  const [code, setCode] = useState(() => {
    const saved = localStorage.getItem(`sandbox_code_${activeCourseId}`);
    if (saved && (saved.includes('font-bold">') || saved.includes('<span class='))) {
      return getStarterCode(activeCourseId);
    }
    return saved || getStarterCode(activeCourseId);
  });
  const [terminalLogs, setTerminalLogs] = useState<string[]>(['[Compilateur] En attente. Écrivez un script, puis cliquez sur "Exécuter le code ⚡".']);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const [autoCompletePrefix, setAutoCompletePrefix] = useState('');
  const [selectedWordIndex, setSelectedWordIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const pyodideRef = useRef<any>(null);
  const capturedStdoutRef = useRef<string[]>([]);

  // Sync starter code and reset on course change
  useEffect(() => {
    const saved = localStorage.getItem(`sandbox_code_${activeCourseId}`);
    if (saved && (saved.includes('font-bold">') || saved.includes('<span class='))) {
      setCode(getStarterCode(activeCourseId));
    } else {
      setCode(saved || getStarterCode(activeCourseId));
    }
    setTerminalLogs([`[Compilateur] Bac à sable initialisé. Cours actif : ${currentCourse?.title || 'Basic Python'}. Cliquez sur Exécuter pour commencer.`]);
  }, [activeCourseId]);

  useEffect(() => {
    const ctx = {
      tab: 'compiler',
      courseId: activeCourseId,
      courseTitle: currentCourse?.title,
      language: isPython ? 'python' : 'javascript',
      currentCode: code,
      terminalLogs
    };
    window.dispatchEvent(new CustomEvent('learncraft-context-change', { detail: ctx }));
  }, [activeCourseId, currentCourse, isPython, code, terminalLogs]);

  // Persist code on edit
  const handleChangeCode = (value: string) => {
    setCode(value);
    localStorage.setItem(`sandbox_code_${activeCourseId}`, value);
    syncScroll();

    // Contextual autocompletion trigger
    const caretPos = textareaRef.current?.selectionStart || 0;
    const textBeforeCaret = value.substring(0, caretPos);
    const words = textBeforeCaret.split(/[\s,()\[\]{}:.="']/);
    const currentWord = words[words.length - 1] || '';

    if (currentWord.trim().length > 0) {
      setAutoCompletePrefix(currentWord.toLowerCase());
    } else {
      setAutoCompletePrefix('');
    }
    setSelectedWordIndex(0);
  };

  // Sync scroll between textarea and overlaid highlighted code
  const syncScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Reset starter draft
  const handleResetStarter = () => {
    if (window.confirm('Réinitialiser les brouillons locaux du bac à sable au script de démarrage d\'origine ?')) {
      const freshStr = getStarterCode(activeCourseId);
      setCode(freshStr);
      localStorage.setItem(`sandbox_code_${activeCourseId}`, freshStr);
      setTerminalLogs(prev => [...prev, '[Info] Brouillon du code restauré au modèle de départ.']);
    }
  };

  // Handle keyboard events (Tab supports, Arrows/Enter for autocompletes if active)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const matched = getKeywords().filter(kw => kw.word.toLowerCase().startsWith(autoCompletePrefix));
    
    // If autocompleting, handle special navigation
    if (autoCompletePrefix && matched.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedWordIndex(prev => (prev + 1) % matched.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedWordIndex(prev => (prev - 1 + matched.length) % matched.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(matched[selectedWordIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setAutoCompletePrefix('');
        return;
      }
    }

    // Default Tab behaviour
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newValue);
      
      // Post-mount reset cursor
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Insert autocompleted text
  const insertSuggestion = (suggestion: KeywordSuggestion) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const prefixLen = autoCompletePrefix.length;
    
    // Replace word before selection
    const textBefore = code.substring(0, start - prefixLen);
    const textAfter = code.substring(start);
    
    const insertionStr = suggestion.template || suggestion.word;
    const newCode = textBefore + insertionStr + textAfter;
    
    setCode(newCode);
    localStorage.setItem(`sandbox_code_${activeCourseId}`, newCode);
    setAutoCompletePrefix('');
    
    // Refocus with delay
    setTimeout(() => {
      ta.focus();
      const newCursorPos = start - prefixLen + insertionStr.length;
      ta.selectionStart = ta.selectionEnd = newCursorPos;
    }, 50);
  };

  // Run Pyodide compiler script
  const executePythonCode = async (scriptText: string) => {
    // Inject browser prompt hook for Python's input()
    (window as any).pyodidePrompt = (msg: string) => {
      try {
        const res = window.prompt(msg);
        return res;
      } catch (e) {
        console.warn("Prompt blocked by browser sandbox limits:", e);
        return "__BLOCKED__";
      }
    };

    setTerminalLogs(prev => [...prev, `⏳ [Moteur d'exécution] Pré-compilation des paquets de scripts...`]);
    try {
      // Load script if not loaded
      if (!pyodideRef.current) {
        if (!(window as any).loadPyodide) {
          setTerminalLogs(prev => [...prev, `⚙️ [Système] Téléchargement du binaire de compilation standard WebAssembly Python...`]);
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = (err) => reject(err);
            document.body.appendChild(script);
          });
        }
        
        setTerminalLogs(prev => [...prev, `⚙️ [Système] Création d'un environnement sandbox Python isolé...`]);
        const pyodide = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/'
        });

        // Initialize redirect streams only once upon loading the runtime
        pyodide.setStdout({
          batched: (text: string) => {
            capturedStdoutRef.current.push(text);
          }
        });
        pyodide.setStderr({
          batched: (text: string) => {
            capturedStdoutRef.current.push(text);
          }
        });

        pyodideRef.current = pyodide;
        setPyodideLoaded(true);
      }

      const pyInstance = pyodideRef.current;
      capturedStdoutRef.current = [];

      // Clear non-special user variables in globals safely to prevent bleeding between runs, without tearing down the main module wrapper or stdout/stderr channels
      await pyInstance.runPythonAsync(`
for _name in list(globals().keys()):
    if not _name.startswith('__'):
        try:
            del globals()[_name]
        except KeyError:
            pass
`);

      // Mock Pyodide input() with custom JS window prompt binding before execution
      await pyInstance.runPythonAsync(`
import builtins
import js

def custom_input(prompt_msg=""):
    if prompt_msg:
        print(prompt_msg, end="", flush=True)
    try:
        val = js.window.pyodidePrompt(str(prompt_msg))
        if val == "__BLOCKED__":
            print("\\n⚠️ [Sandbox-Warning] Browser window.prompt is restricted inside the iframe sandbox. Please click the 'Open in New Tab' icon at the top right of your preview window to use interactive input() successfully!")
            return ""
        return str(val) if val is not None else ""
    except Exception:
        return ""

builtins.input = custom_input
`);

      // Execute program
      await pyInstance.runPythonAsync(scriptText);

      // Render outputs
      if (capturedStdoutRef.current.length === 0) {
        setTerminalLogs(prev => [...prev, `[Succès] Le programme s'est exécuté avec succès sans valeurs de retour / sortie stdout.`]);
      } else {
        setTerminalLogs(prev => [...prev, ...capturedStdoutRef.current]);
      }

    } catch (err: any) {
      console.error(err);
      const errStr = err.message || String(err);
      setTerminalLogs(prev => [...prev, `❌ [CompileError] ${errStr}`]);
    }
  };

  // JS Sandbox Run Function
  const executeJSCode = (scriptText: string) => {
    setTerminalLogs(prev => [...prev, `⏳ [Moteur d'exécution] Exécution dans le moteur standard...`]);
    const capturedLogs: string[] = [];
    
    // Mock local console overrides
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      capturedLogs.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
      originalConsoleLog.apply(console, args);
    };

    try {
      const evaluated = new Function(scriptText);
      evaluated();

      console.log = originalConsoleLog; // reset early
      
      if (capturedLogs.length === 0) {
        setTerminalLogs(prev => [...prev, `[Succès] Le script a été évalué sans sortie console.`]);
      } else {
        setTerminalLogs(prev => [...prev, ...capturedLogs]);
      }
    } catch (err: any) {
      console.log = originalConsoleLog; // reset
      setTerminalLogs(prev => [...prev, `❌ [RuntimeError] ${err.message || String(err)}`]);
    }
  };

  // Main run handle
  const handleExecute = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalLogs(prev => [...prev, `----------------------------------------`, `🚀 [EXEC] ${new Date().toLocaleTimeString()} - Lancement de l'exécution du bac à sable...`]);

    try {
      if (isPython) {
        await executePythonCode(code);
      } else {
        executeJSCode(code);
      }
    } catch (e: any) {
      setTerminalLogs(prev => [...prev, `❌ [Execution interrupted] ${e.message || String(e)}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearLogs = () => {
    setTerminalLogs([`🧹 [Terminal] Console de sortie purgée.`]);
  };

  const handleGlobalKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Execute shortcut (Ctrl+Enter or Cmd+Enter)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      handleExecute();
      return;
    }
    // Clear logs (Ctrl+L or Cmd+L)
    if (e.key.toLowerCase() === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      handleClearLogs();
      return;
    }
    // Prevent browser save and give feedback (Ctrl+S or Cmd+S)
    if (e.key.toLowerCase() === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      setTerminalLogs(prev => [...prev, `💾 [Système] Code sauvegardé automatiquement dans le navigateur.`]);
      return;
    }
  };

  // Dynamic light weight syntax renderer overlay
  const highlightCode = (rawText: string) => {
    // Safe escape HTML first
    const escaped = rawText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    if (isPython) {
      // Single-pass combined token scanner regex to avoid nested HTML highlight corruption
      const tokenRegex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(def|class|import|from|as|return|if|elif|else|for|while|in|is|and|or|not|try|except|finally|assert|lambda|pass|break|continue|global|nonlocal|with|yield)\b|\b(print|range|len|type|int|float|str|bool|list|dict|set|tuple|input|sum|max|min|abs)\b|\b([a-zA-Z_]\w*)(?=\()|\b(\d+(?:\.\d+)?)\b/g;

      const html = escaped.replace(tokenRegex, (match, comment, str, keyword, builtin, fn, num) => {
        if (comment !== undefined) {
          return `<span class="text-slate-500 font-semibold">${comment}</span>`;
        }
        if (str !== undefined) {
          return `<span class="text-emerald-400 font-medium">${str}</span>`;
        }
        if (keyword !== undefined) {
          return `<span class="text-pink-400 font-bold">${keyword}</span>`;
        }
        if (builtin !== undefined) {
          return `<span class="text-sky-400 font-semibold">${builtin}</span>`;
        }
        if (fn !== undefined) {
          return `<span class="text-yellow-300">${fn}</span>`;
        }
        if (num !== undefined) {
          return `<span class="text-amber-300">${num}</span>`;
        }
        return match;
      });

      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    } else {
      // Single-pass combined token scanner regex for JS/TS
      const tokenRegex = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|class|import|export|from|extends|super|new|this|async|await)\b|\b(console|log|warn|error|Math|JSON|Promise|Map|Set|Array|Object)\b|\b([a-zA-Z_]\w*)(?=\()|\b(\d+(?:\.\d+)?)\b/g;

      const html = escaped.replace(tokenRegex, (match, comment, str, keyword, builtin, fn, num) => {
        if (comment !== undefined) {
          return `<span class="text-slate-500 font-semibold">${comment}</span>`;
        }
        if (str !== undefined) {
          return `<span class="text-emerald-400 font-medium">${str}</span>`;
        }
        if (keyword !== undefined) {
          return `<span class="text-pink-400 font-bold">${keyword}</span>`;
        }
        if (builtin !== undefined) {
          return `<span class="text-sky-400 font-semibold">${builtin}</span>`;
        }
        if (fn !== undefined) {
          return `<span class="text-yellow-300">${fn}</span>`;
        }
        if (num !== undefined) {
          return `<span class="text-amber-300">${num}</span>`;
        }
        return match;
      });

      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    }
  };

  // Generate left side line numbers based on lines list
  const linesCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: linesCount }, (_, i) => i + 1);

  // Suggestions search vector
  const matchedSuggestions = autoCompletePrefix 
    ? getKeywords().filter(kw => kw.word.toLowerCase().startsWith(autoCompletePrefix))
    : [];

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#0F172A] text-[#F1F5F9] focus:outline-none"
      onKeyDown={handleGlobalKeyDown}
      tabIndex={-1}
    >
      {/* Console title line header */}
      <div className="bg-sidebar-panel border-b border-slate-800 px-6 py-4 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-[#58CC02]/10 border border-[#58CC02]/20 flex items-center justify-center text-[#58CC02]">
            <TerminalIcon className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Compilateur Bac à sable Interactif</h2>
            <p className="text-[10px] font-mono text-[#58CC02] font-semibold tracking-wider uppercase">
              {currentCourse?.title || 'Basic Python'} workspace • environnement de compilation client
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="playground-reset-btn"
            onClick={handleResetStarter}
            className="px-3.5 py-1.5 hover:bg-[#334155]/60 active:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer flex items-center gap-2 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>

          <button
            id="playground-run-btn"
            disabled={isRunning}
            onClick={handleExecute}
            title="Exécuter le code (Ctrl + Entrée ou Cmd + Entrée)"
            className="px-5 py-2 bg-[#58CC02] hover:bg-[#46A302] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2.5 shadow-md shadow-[#58CC02]/15 hover:shadow-lg hover:-translate-y-px active:translate-y-0"
          >
            {isRunning ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current stroke-[3]" />
            )}
            <div className="flex flex-col items-start leading-none gap-0.5">
              <span>Exécuter</span>
              <span className="text-[9px] font-medium text-white/80 tracking-wide font-mono">Ctrl+Enter</span>
            </div>
          </button>
        </div>
      </div>

      {/* Main Workspace split panel grids container */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden h-full">
        {/* LEFT COMPILER EDITOR COLUMN */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden relative border-r border-slate-800 bg-[#1D2432] h-[60%] lg:h-auto">
          
          {/* Editor sub header tool info panel */}
          <div className="bg-sidebar-panel/70 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
            <span className="font-mono flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-pink-400" />
              <span>sandbox.{isPython ? 'py' : 'js'}</span>
            </span>

            <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded border border-slate-700 font-mono flex items-center gap-1 text-slate-300">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-ping" />
              <span>IntelliSense ACTIF ({isPython ? 'Python 3' : 'JS ES6'})</span>
            </span>
          </div>

          <div className="flex-1 flex overflow-hidden relative">
            {/* Line numbers column */}
            <div className="w-12 bg-[#171D29]/60 border-r border-slate-800 py-4 flex flex-col shrink-0 items-end pr-3 font-mono text-xs text-slate-600 select-none leading-relaxed">
              {lineNumbers.map(line => (
                <div key={line} className="h-6 flex items-center justify-end w-full">
                  {line}
                </div>
              ))}
            </div>

            {/* Code write area container */}
            <div className="flex-1 relative overflow-hidden font-mono text-xs leading-relaxed bg-[#141A24]">
              
              {/* Overlay Backdrop panel where syntax highlighted text lives */}
              <div
                ref={backdropRef}
                className="absolute inset-0 p-4 h-full w-full pointer-events-none overflow-auto whitespace-pre font-mono text-xs leading-relaxed text-slate-300"
                style={{ scrollbarWidth: 'none' }}
              >
                {highlightCode(code)}
              </div>

              {/* Editable user transparent input textarea */}
              <textarea
                id="sandbox-interactive-textarea"
                ref={textareaRef}
                value={code}
                onChange={(e) => handleChangeCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={syncScroll}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="absolute inset-0 p-4 h-full w-full bg-transparent text-transparent caret-[#58CC02] focus:outline-none resize-none overflow-auto whitespace-pre font-mono text-xs leading-relaxed"
                style={{
                  fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, Monaco, monospace',
                  WebkitTextFillColor: 'transparent',
                }}
              />

              {/* Contextual floating suggestions list popup */}
              {matchedSuggestions.length > 0 && (
                <div 
                  id="sandbox-autocomplete-popover"
                  className="absolute bottom-6 left-6 max-w-xs w-72 bg-sidebar-panel border-2 border-[#58CC02]/40 rounded-xl shadow-2xl overflow-hidden z-20 flex flex-col font-sans select-none"
                >
                  <div className="bg-sidebar px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#58CC02] animate-pulse" />
                      <span>Suggestions IntelliSense</span>
                    </span>
                    <span>Entrée ↵ / Tab ⇥</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-800">
                    {matchedSuggestions.map((kw, i) => (
                      <button
                        id={`autocomplete-suggestion-${i}`}
                        key={kw.word}
                        onClick={() => insertSuggestion(kw)}
                        onMouseEnter={() => setSelectedWordIndex(i)}
                        className={`w-full text-left px-3.5 py-2.5 font-mono text-xs flex flex-col transition-colors cursor-pointer ${
                          selectedWordIndex === i ? 'bg-[#58CC02]/20 text-white' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-bold text-[#58CC02]">{kw.word}</span>
                        <span className="text-[10px] text-slate-400 font-sans mt-0.5">{kw.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT TERMINAL / OUTPUT COLUMNS */}
        <div className="lg:col-span-4 flex flex-col h-[40%] lg:h-auto bg-[#0B0F19] overflow-hidden">
          
          {/* Tab label */}
          <div className="px-5 py-3 border-b border-slate-800 bg-sidebar flex items-center justify-between select-none shrink-0">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </span>
              <span>Terminal d'Exécution</span>
            </span>

            <button
              id="clear-logs-btn"
              onClick={handleClearLogs}
              title="Purger les journaux de bord (Ctrl+L)"
              className="p-1.5 hover:bg-slate-800 hover:text-white text-slate-400 rounded transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Core Logs stack */}
          <div className="flex-1 overflow-y-auto p-5 font-mono text-xs leading-relaxed space-y-2 select-text selection:bg-[#58CC02]/30 bg-[#05070C]">
            {terminalLogs.map((log, idx) => {
              let colorClass = 'text-slate-300';
              if (log.startsWith('❌')) colorClass = 'text-red-400 font-bold';
              else if (log.startsWith('🚀') || log.includes('[EXEC]')) colorClass = 'text-[#58CC02] font-semibold';
              else if (log.startsWith('⏳') || log.startsWith('⚙️')) colorClass = 'text-teal-400';
              else if (log.includes('[Success]')) colorClass = 'text-emerald-400 font-medium';
              else if (log.includes('[Info]')) colorClass = 'text-amber-400';

              return (
                <div key={idx} className={`${colorClass} whitespace-pre-wrap break-all`}>
                  {log}
                </div>
              );
            })}
          </div>

          {/* Mini snippets list panel at bottom */}
          <div className="bg-sidebar p-4.5 border-t border-slate-800 shrink-0">
            <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Suggestions de syntaxe de base</span>
            </h4>
            
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {getKeywords().map((kw) => (
                <button
                  key={kw.word}
                  onClick={() => {
                    const ta = textareaRef.current;
                    if (!ta) return;
                    const start = ta.selectionStart;
                    const val = code.substring(0, start) + (kw.template || kw.word) + code.substring(start);
                    setCode(val);
                    localStorage.setItem(`sandbox_code_${activeCourseId}`, val);
                    setTimeout(() => {
                      ta.focus();
                      ta.selectionStart = ta.selectionEnd = start + (kw.template || kw.word).length;
                    }, 50);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-[#58CC02] border border-slate-700 text-[10px] px-2 py-1 rounded-md text-slate-300 font-mono transition-colors cursor-pointer"
                >
                  {kw.word}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
