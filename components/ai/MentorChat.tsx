// components/ai/MentorChat.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '@/types/index';
import { useChat } from '@/hooks/useChat';
import { UI_TEXT } from '@/constants/index';

interface MentorChatProps {
  userId: string;
  courseId: string;
  chapterId: string;
  chapterTitle: string;
}

/**
 * Client Component - AI mentor chat sidebar with streaming support
 */
export function MentorChat({ userId, courseId, chapterId, chapterTitle }: MentorChatProps) {
  const { messages, isLoading, error, sendMessage } = useChat(userId, courseId, chapterId);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 sm:bottom-8 sm:right-8">
      {/* Chat container */}
      {isOpen && (
        <div className="flex w-96 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-gray-300 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-primary-600 to-primary-700 p-4 rounded-t-lg">
            <div>
              <h3 className="text-lg font-semibold text-white">{UI_TEXT.CHAT.MENTOR}</h3>
              <p className="text-xs text-primary-100">{chapterTitle}</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary-700 rounded p-1 transition-colors"
              aria-label="Fermer le chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 max-h-96">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                <div>
                  <p className="text-2xl mb-2">🤖</p>
                  <p className="text-sm">
                    Bonjour! Je suis votre mentor IA. Posez-moi des questions sur ce chapitre.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-lg ${
                      msg.role === 'user'
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {msg.role === 'user' ? '👤' : '🤖'}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-lg">
                  🤖
                </div>
                <div className="max-w-xs rounded-lg bg-gray-100 px-4 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-100" />
                    <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-danger-100 p-3 text-sm text-danger-700">
                <p className="font-semibold">Erreur</p>
                <p>{error.message}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 rounded-b-lg bg-gray-50">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={UI_TEXT.CHAT.ASK_QUESTION}
                rows={2}
                className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="flex-shrink-0 rounded-lg bg-primary-600 px-3 py-2 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={UI_TEXT.CHAT.SEND}
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl transition-shadow hover:scale-110 transform duration-200"
        aria-label={UI_TEXT.CHAT.MENTOR}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
}
