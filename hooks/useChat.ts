// hooks/useChat.ts
'use client';

import { useCallback, useState, useOptimistic, useRef } from 'react';
import { ChatMessage } from '@/types/index';
import { saveChatMessage } from '@/lib/db';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * Client-side hook for AI chat with streaming support
 * Uses useOptimistic for instant UI feedback
 */
export function useChat(userId: string, courseId: string, chapterId: string, locale: string = 'fr'): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state: ChatMessage[], newMessage: ChatMessage) => [...state, newMessage]
  );
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        userId,
        courseId,
        chapterId,
        role: 'user',
        content,
        timestamp: new Date(),
      };

      // Add user message optimistically
      addOptimisticMessage(userMessage);

      setIsLoading(true);
      setError(null);
      abortControllerRef.current = new AbortController();

      try {
        // Save user message to Firestore
        await saveChatMessage(userMessage);

        // Stream AI response
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            courseId,
            chapterId,
            userId,
            locale,
            previousMessages: messages,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Chat request failed');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response stream');

        let assistantContent = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantContent += chunk;

          // Update UI with streaming content
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            userId,
            courseId,
            chapterId,
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date(),
          };

          addOptimisticMessage(assistantMessage);
        }

        // Save complete assistant message
        const finalMessage: ChatMessage = {
          id: `assistant-final-${Date.now()}`,
          userId,
          courseId,
          chapterId,
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date(),
        };

        await saveChatMessage(finalMessage);
        setMessages((prev) => [...prev, userMessage, finalMessage]);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [userId, courseId, chapterId, messages, addOptimisticMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages: optimisticMessages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
