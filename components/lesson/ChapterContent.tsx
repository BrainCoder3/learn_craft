// components/lesson/ChapterContent.tsx
'use client';

import { useState } from 'react';
import { Lesson, CodeExample } from '@/types/index';

interface ChapterContentProps {
  lesson: Lesson;
}

/**
 * Client Component - renders lesson content with styled code examples.
 * Uses CSS design tokens for dark mode compatibility.
 */
export function ChapterContent({ lesson }: ChapterContentProps) {
  return (
    <article>
      {/* Lesson header */}
      <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">{lesson.title}</h1>
        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            ⏱️ {lesson.estimatedMinutes} minutes
          </span>
          {lesson.codeExamples.length > 0 && (
            <span className="flex items-center gap-1.5">
              💻 {lesson.codeExamples.length} exemple{lesson.codeExamples.length > 1 ? 's' : ''} de code
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        className="prose prose-sm max-w-none mb-8 text-[var(--text-primary)] leading-relaxed [&_h2]:text-[var(--text-primary)] [&_h3]:text-[var(--text-primary)] [&_p]:text-[var(--text-secondary)] [&_li]:text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)] [&_a]:text-[var(--interactive-primary)]"
        dangerouslySetInnerHTML={{ __html: lesson.content }}
      />

      {/* Code examples */}
      {lesson.codeExamples.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5 flex items-center gap-2">
            <span>💻</span> Exemples de code
          </h2>
          <div className="space-y-5">
            {lesson.codeExamples.map((example, idx) => (
              <CodeBlock key={example.id} example={example} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <section className="mb-8 rounded-[var(--radius-lg)] border border-[var(--color-info-200)] bg-[var(--color-info-50)] p-5">
          <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            📎 Ressources complémentaires
          </h3>
          <ul className="space-y-3">
            {lesson.resources.map((resource) => (
              <li key={resource.id}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--interactive-primary)] hover:opacity-80 font-medium transition-opacity text-sm"
                >
                  <span>
                    {resource.type === 'link' && '🔗'}
                    {resource.type === 'file' && '📄'}
                    {resource.type === 'documentation' && '📖'}
                  </span>
                  <span>{resource.title}</span>
                  <span className="text-[var(--text-muted)] text-xs">↗</span>
                </a>
                {resource.description && (
                  <p className="ml-6 mt-1 text-xs text-[var(--text-muted)]">{resource.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Video */}
      {lesson.videoUrl && (
        <section className="mb-8">
          <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">🎥 Vidéo explicative</h3>
          <div className="relative aspect-video overflow-hidden rounded-[var(--radius-lg)] bg-black border border-[var(--border-default)] shadow-[var(--shadow-md)]">
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
 * Code block with copy-to-clipboard and styled header
 */
function CodeBlock({ example, index }: { example: CodeExample; index: number }) {
  const [copied, setCopied] = useState(false);

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
    shell: 'Shell',
  };

  const languageColors: Record<string, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    python: '#3776ab',
    java: '#ed8b00',
    html: '#e34c26',
    css: '#264de4',
    rust: '#ce412b',
    go: '#00add8',
    bash: '#4eaa25',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(example.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const dotColor = languageColors[example.language] || '#6c4ff8';

  return (
    <div
      id={`code-block-${index}`}
      className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] shadow-[var(--shadow-sm)]"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between bg-[var(--color-neutral-900)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[var(--color-danger-500)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--color-warning-400)]" />
            <span className="w-3 h-3 rounded-full bg-[var(--color-success-500)]" />
          </div>
          <span className="text-sm font-semibold text-[var(--color-neutral-200)]">{example.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 text-xs font-mono font-medium px-2 py-0.5 rounded"
            style={{ color: dotColor, background: `${dotColor}18` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
            {languageNames[example.language] || example.language}
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-[var(--color-neutral-400)] hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/10"
          >
            {copied ? '✅ Copié' : '📋 Copier'}
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="overflow-x-auto p-5 bg-[var(--color-neutral-950)] text-[var(--color-neutral-100)] text-sm font-mono leading-relaxed m-0">
        <code>{example.code}</code>
      </pre>

      {/* Output */}
      {example.output && (
        <div className="border-t border-[var(--color-neutral-800)] bg-[var(--color-neutral-900)] p-4">
          <p className="mb-2 text-xs font-semibold text-[var(--color-neutral-400)] uppercase tracking-wide">
            Résultat
          </p>
          <pre className="overflow-x-auto rounded-[var(--radius-md)] bg-black/40 p-3 text-sm text-[var(--color-success-400)] font-mono">
            {example.output}
          </pre>
        </div>
      )}

      {/* Explanation */}
      {example.explanation && (
        <div className="border-t border-[var(--border-default)] bg-[var(--bg-subtle)] p-4">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--interactive-primary)]">💡 Explication : </span>
            {example.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
