// components/lesson/QuizBlock.tsx
'use client';

import { useState, useCallback } from 'react';
import { Quiz, QuizQuestion as QuizQuestionType } from '@/types/index';
import { saveQuizScore } from '@/lib/db';

interface QuizBlockProps {
  quiz: Quiz;
  userProgressId: string;
  onComplete?: (score: number, maxScore: number) => void;
}

/**
 * Client Component - interactive quiz with scoring and feedback.
 * Fully using CSS design tokens.
 */
export function QuizBlock({ quiz, userProgressId, onComplete }: QuizBlockProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerSelect = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleNext = useCallback(() => {
    if (!isLastQuestion) setCurrentQuestionIndex((prev) => prev + 1);
  }, [isLastQuestion]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  }, [currentQuestionIndex]);

  const calculateScore = useCallback((): number => {
    let earned = 0;
    quiz.questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        if (userAnswer === q.correctAnswer) earned += q.points;
      } else if (q.type === 'short-answer') {
        if (
          userAnswer &&
          typeof userAnswer === 'string' &&
          userAnswer.toLowerCase().trim() ===
            (typeof q.correctAnswer === 'string' ? q.correctAnswer.toLowerCase() : '')
        ) {
          earned += q.points;
        }
      }
    });
    return earned;
  }, [answers, quiz.questions]);

  const handleSubmit = useCallback(async () => {
    const earned = calculateScore();
    setScore(earned);
    setShowResults(true);
    setIsSubmitting(true);
    try {
      await saveQuizScore(userProgressId, quiz.id, earned, quiz.passingScore);
      onComplete?.(earned, quiz.passingScore);
    } catch (error) {
      console.error('Error saving quiz score:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [calculateScore, quiz.id, quiz.passingScore, userProgressId, onComplete]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  }, []);

  // ── Results view ───────────────────────────────────────────────────────────
  if (showResults) {
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= (quiz.passingScore || 70);

    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-6">
        <div className="text-center">
          <h2 className="mb-6 text-2xl font-bold text-[var(--text-primary)]">Résultats du quiz</h2>

          {/* Score circle */}
          <div
            className={`mb-6 inline-flex flex-col items-center justify-center w-36 h-36 rounded-full border-4 ${
              passed
                ? 'border-[var(--color-success-500)] bg-[var(--color-success-50)]'
                : 'border-[var(--color-danger-400)] bg-[var(--color-danger-50)]'
            }`}
          >
            <span
              className={`text-4xl font-bold ${
                passed ? 'text-[var(--color-success-700)]' : 'text-[var(--color-danger-700)]'
              }`}
            >
              {percentage}%
            </span>
            <span className="text-sm text-[var(--text-muted)] mt-1">
              {score}/{totalPoints} pts
            </span>
          </div>

          {/* Pass / fail banner */}
          <div
            className={`mb-8 rounded-[var(--radius-md)] px-5 py-3 text-sm font-semibold ${
              passed
                ? 'bg-[var(--color-success-100)] text-[var(--color-success-800)]'
                : 'bg-[var(--color-danger-100)] text-[var(--color-danger-800)]'
            }`}
          >
            {passed ? '🎉 Félicitations, vous avez réussi !' : '❌ Score insuffisant — réessayez !'}
          </div>

          {/* Question review */}
          <div className="mb-8 space-y-4 text-left">
            {quiz.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <div
                  key={q.id}
                  className={`rounded-[var(--radius-md)] border-l-4 p-4 ${
                    isCorrect
                      ? 'border-l-[var(--color-success-500)] bg-[var(--color-success-50)]'
                      : 'border-l-[var(--color-danger-400)] bg-[var(--color-danger-50)]'
                  }`}
                >
                  <p className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                    {idx + 1}. {q.question}
                  </p>
                  <p className="text-sm mb-1">
                    <span className="font-medium text-[var(--text-secondary)]">Votre réponse : </span>
                    <span
                      className={
                        isCorrect
                          ? 'text-[var(--color-success-700)] font-medium'
                          : 'text-[var(--color-danger-700)] line-through'
                      }
                    >
                      {String(userAnswer) || 'Non répondu'}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm">
                      <span className="font-medium text-[var(--text-secondary)]">Bonne réponse : </span>
                      <span className="text-[var(--color-success-700)] font-medium">{String(q.correctAnswer)}</span>
                    </p>
                  )}
                  {q.explanation && (
                    <p className="mt-2 text-xs italic text-[var(--text-muted)] leading-relaxed">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            id="quiz-restart-btn"
            onClick={handleRestart}
            disabled={isSubmitting}
            className="btn-primary px-8 py-2.5"
          >
            🔄 Recommencer le quiz
          </button>
        </div>
      </div>
    );
  }

  // ── Question view ──────────────────────────────────────────────────────────
  const hasAnswer = !!answers[currentQuestion?.id];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] overflow-hidden">
      {/* Quiz header */}
      <div className="bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--color-brand-700)] px-6 py-4">
        <div className="flex items-center justify-between text-white/80 text-sm mb-2">
          <span className="font-medium text-white">{quiz.title}</span>
          <span>
            {currentQuestionIndex + 1} / {totalQuestions}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <h3 className="mb-6 text-lg font-semibold text-[var(--text-primary)] leading-relaxed">
          {currentQuestion?.question}
        </h3>

        {/* Answer options */}
        {(currentQuestion?.type === 'multiple-choice' || currentQuestion?.type === 'true-false') ? (
          <div className="space-y-3 mb-6">
            {(currentQuestion.options || []).map((option) => {
              const isSelected = answers[currentQuestion.id] === option;
              return (
                <label
                  key={option}
                  id={`quiz-option-${option.replace(/\s+/g, '-').toLowerCase()}`}
                  className={`flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border p-4 transition-all duration-150 ${
                    isSelected
                      ? 'border-[var(--interactive-primary)] bg-[var(--surface-overlay)] shadow-[var(--shadow-sm)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-base)] hover:border-[var(--interactive-primary)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                    className="sr-only"
                  />
                  {/* Custom radio */}
                  <span
                    className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                      isSelected
                        ? 'border-[var(--interactive-primary)] bg-[var(--interactive-primary)]'
                        : 'border-[var(--border-strong)] bg-transparent'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <span className={`flex-1 text-sm leading-relaxed ${isSelected ? 'text-[var(--interactive-primary)] font-medium' : 'text-[var(--text-secondary)]'}`}>
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              id={`quiz-short-answer-${currentQuestion?.id}`}
              value={(answers[currentQuestion?.id] as string) || ''}
              onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
              placeholder="Entrez votre réponse..."
              className="input-base w-full"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            id="quiz-prev-btn"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Précédent
          </button>

          {isLastQuestion ? (
            <button
              id="quiz-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !hasAnswer}
              className="rounded-[var(--radius-md)] bg-[var(--color-success-600)] px-6 py-2 font-medium text-white transition-colors hover:bg-[var(--color-success-700)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Envoi...' : '✅ Soumettre'}
            </button>
          ) : (
            <button
              id="quiz-next-btn"
              onClick={handleNext}
              disabled={!hasAnswer}
              className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Suivant →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
