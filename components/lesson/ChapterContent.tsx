// components/lesson/ChapterContent.tsx
'use client';

import { Lesson, CodeExample } from '@/types/index';

interface ChapterContentProps {
  lesson: Lesson;
}

/**
 * Client Component - renders lesson content with syntax-highlighted code examples
 * Uses Shiki for syntax highlighting (server-rendered, client-hydrated)
 */
export function ChapterContent({ lesson }: ChapterContentProps) {
  const languageNames: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    cpp: 'C++',
    rust: 'Rust',
    go: 'Go',
    ruby: 'Ruby',
    php: 'PHP',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    yaml: 'YAML',
    bash: 'Bash',
  };

  return (
    <article className="prose prose-sm max-w-none">
      {/* Lesson title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{lesson.title}</h1>

      {/* Estimated reading time */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <span>⏱️</span>
        <span>Durée estimée: {lesson.estimatedMinutes} minutes</span>
      </div>

      {/* Main content */}
      <div
        className="mb-8 text-base leading-7 text-gray-700"
        dangerouslySetInnerHTML={{ __html: lesson.content }}
      />

      {/* Code examples */}
      {lesson.codeExamples.length > 0 && (
        <section className="my-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Exemples de code</h2>

          <div className="space-y-6">
            {lesson.codeExamples.map((example, idx) => (
              <CodeBlock key={example.id} example={example} index={idx} lang={example.language} />
            ))}
          </div>
        </section>
      )}

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <section className="my-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Ressources</h3>
          <ul className="space-y-3">
            {lesson.resources.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {resource.type === 'link' && '🔗'}
                  {resource.type === 'file' && '📄'}
                  {resource.type === 'documentation' && '📖'}
                  <span>{resource.title}</span>
                </a>
                {resource.description && (
                  <p className="ml-6 text-sm text-gray-600 mt-1">{resource.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Video content (if available) */}
      {lesson.videoUrl && (
        <section className="my-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Vidéo explicative</h3>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
            <iframe
              src={lesson.videoUrl}
              title={lesson.title}
              className="h-full w-full"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>
      )}
    </article>
  );
}

/**
 * Code block component with syntax highlighting support
 */
function CodeBlock({
  example,
  index,
  lang,
}: {
  example: CodeExample;
  index: number;
  lang: string;
}) {
  const languageNames: Record<string, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    cpp: 'C++',
    rust: 'Rust',
    go: 'Go',
    ruby: 'Ruby',
    php: 'PHP',
    sql: 'SQL',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    yaml: 'YAML',
    bash: 'Bash',
  };

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-200 px-4 py-2">
        <span className="text-sm font-semibold text-gray-700">{example.title}</span>
        <span className="text-xs bg-gray-300 px-2 py-1 rounded text-gray-700">
          {languageNames[lang] || lang}
        </span>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-4 bg-gray-900 text-gray-100 text-sm font-mono leading-relaxed">
        <code>{example.code}</code>
      </pre>

      {/* Output (if available) */}
      {example.output && (
        <div className="border-t border-gray-300 bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-gray-700">Résultat:</p>
          <pre className="overflow-x-auto rounded bg-gray-100 p-3 text-sm text-gray-800 font-mono">
            {example.output}
          </pre>
        </div>
      )}

      {/* Explanation (if available) */}
      {example.explanation && (
        <div className="border-t border-gray-300 bg-blue-50 p-4">
          <p className="text-sm text-gray-700">
            <strong>💡 Explication:</strong> {example.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
