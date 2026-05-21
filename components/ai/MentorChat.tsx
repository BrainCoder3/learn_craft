// components/ai/MentorChat.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/types/index';
import { useChat } from '@/hooks/useChat';
import { useLocale } from 'next-intl';

interface MentorChatProps {
  userId: string;
  courseId: string;
  chapterId: string;
  chapterTitle: string;
}

/**
 * Client Component - AI mentor chat panel with streaming support.
 * Uses design tokens and passes the user locale to the API.
 */
export function MentorChat({ userId, courseId, chapterId, chapterTitle }: MentorChatProps) {
  const locale = useLocale();
  const { messages, isLoading, error, sendMessage } = useChat(userId, courseId, chapterId, locale);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    'Explique-moi ce concept',
    'Donne-moi un exemple',
    'Aide-moi à déboguer',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 sm:bottom-8 sm:right-8">
      {/* Chat panel */}
      {isOpen && (
        <div
          id="mentor-chat-panel"
          className="flex w-96 max-w-[calc(100vw-2rem)] flex-col rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-default)] shadow-[var(--shadow-lg)] overflow-hidden animate-slide-in-up"
          style={{ maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--color-brand-700)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-lg">
                🤖
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Mentor IA</h3>
                <p className="text-[10px] text-[var(--color-brand-200)] truncate max-w-[180px]">
                  {chapterTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Online indicator */}
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[var(--text-accent)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--text-accent)]"></span>
              </span>
              <button
                id="mentor-chat-close"
                onClick={() => setIsOpen(false)}
                className="ml-2 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Fermer le chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ minHeight: '200px', maxHeight: '340px' }}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-6">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  Bonjour ! Je suis votre mentor IA.
                </p>
                <p className="text-xs text-[var(--text-muted)] mb-4">
                  Posez-moi des questions sur ce chapitre.
                </p>
                {/* Quick prompts */}
                <div className="flex flex-col gap-2 w-full">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => { setInputValue(prompt); inputRef.current?.focus(); }}
                      className="text-xs text-left rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-2 text-[var(--text-secondary)] hover:border-[var(--interactive-primary)] hover:text-[var(--interactive-primary)] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-[var(--interactive-primary)] text-sm">
                  🤖
                </div>
                <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] border border-[var(--border-default)] px-4 py-2.5">
                  <div className="flex gap-1 items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--interactive-primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--interactive-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-[var(--interactive-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-[var(--radius-md)] bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] px-3 py-2 text-xs text-[var(--color-danger-700)]">
                ⚠️ {error.message}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border-default)] bg-[var(--bg-subtle)] p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                id="mentor-chat-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question... (Entrée pour envoyer)"
                rows={2}
                className="flex-1 resize-none rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--interactive-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-all"
              />
              <button
                id="mentor-chat-send"
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[var(--interactive-primary)] text-[var(--interactive-primary-text)] transition-all hover:bg-[var(--interactive-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Envoyer"
              >
                ↑
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--text-muted)] text-center">
              Maj+Entrée pour une nouvelle ligne
            </p>
          </div>
        </div>
      )}

      {/* FAB toggle */}
      <button
        id="mentor-chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[var(--interactive-primary)] to-[var(--color-brand-700)] text-white shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-lg)] transition-all duration-200 hover:scale-110"
        aria-label="Mentor IA"
      >
        <span className="text-2xl">{isOpen ? '✕' : '🤖'}</span>
        {/* Unread badge */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--text-accent)] text-[10px] font-bold text-[var(--color-neutral-950)]">
            {messages.filter((m) => m.role === 'assistant').length}
          </span>
        )}
      </button>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${
          isUser
            ? 'bg-[var(--interactive-primary)] text-[var(--interactive-primary-text)]'
            : 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
        }`}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-[var(--radius-lg)] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-[var(--interactive-primary)] text-[var(--interactive-primary-text)] rounded-tr-sm'
            : 'bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-tl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}
