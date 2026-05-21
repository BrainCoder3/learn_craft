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
 * Client Component - interactive quiz with scoring and feedback
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

  const handleAnswerSelect = useCallback((questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [isLastQuestion]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const calculateScore = useCallback((): number => {
    let totalScore = 0;
    let earnedScore = 0;

    quiz.questions.forEach((q) => {
      totalScore += q.points;
      const userAnswer = answers[q.id];

      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        if (userAnswer === q.correctAnswer) {
          earnedScore += q.points;
        }
      } else if (q.type === 'short-answer') {
        // Simple string matching (case-insensitive)
        if (
          userAnswer &&
          typeof userAnswer === 'string' &&
          userAnswer.toLowerCase().trim() ===
            (typeof q.correctAnswer === 'string' ? q.correctAnswer.toLowerCase() : '')
        ) {
          earnedScore += q.points;
        }
      }
    });

    return earnedScore;
  }, [answers, quiz.questions]);

  const handleSubmit = useCallback(async () => {
    const earnedScore = calculateScore();
    setScore(earnedScore);
    setShowResults(true);

    // Save score to database
    setIsSubmitting(true);
    try {
      await saveQuizScore(userProgressId, quiz.id, earnedScore, quiz.passingScore);
      onComplete?.(earnedScore, quiz.passingScore);
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

  // Results view
  if (showResults) {
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / totalPoints) * 100);
    const passed = percentage >= (quiz.passingScore || 70);

    return (
      <div className="rounded-lg border border-gray-300 bg-white p-6">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Résultats du quiz</h2>

          {/* Score display */}
          <div className="mb-8 inline-block rounded-full border-4 border-primary-500 bg-primary-50 p-8">
            <div className="text-5xl font-bold text-primary-600">{percentage}%</div>
            <div className="mt-2 text-lg font-medium text-gray-700">
              {score} / {totalPoints} points
            </div>
          </div>

          {/* Pass/Fail message */}
          <div
            className={`mb-6 rounded-lg p-4 font-semibold ${
              passed ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
            }`}
          >
            {passed ? '✅ Vous avez réussi!' : "❌ Vous n'avez pas atteint le score de passage"}
          </div>

          {/* Question review */}
          <div className="mb-8 space-y-6 text-left">
            {quiz.questions.map((q, idx) => {
              const userAnswer = answers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`rounded-lg border-l-4 p-4 ${
                    isCorrect
                      ? 'border-l-success-500 bg-success-50'
                      : 'border-l-danger-500 bg-danger-50'
                  }`}
                >
                  <p className="mb-2 font-semibold text-gray-900">
                    {idx + 1}. {q.question}
                  </p>
                  <p className="mb-1 text-sm">
                    <span className="font-medium text-gray-700">Votre réponse:</span>{' '}
                    <span className={isCorrect ? 'text-success-700' : 'text-danger-700'}>
                      {userAnswer || 'Non répondu'}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Réponse correcte:</span>{' '}
                      <span className="text-success-700">{q.correctAnswer}</span>
                    </p>
                  )}
                  <p className="mt-2 text-sm italic text-gray-700">{q.explanation}</p>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <button
            onClick={handleRestart}
            disabled={isSubmitting}
            className="rounded-lg bg-primary-600 px-6 py-2 font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            Recommencer le quiz
          </button>
        </div>
      </div>
    );
  }

  // Question view
  return (
    <div className="rounded-lg border border-gray-300 bg-white p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} / {totalQuestions}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question title */}
      <h3 className="mb-6 text-xl font-semibold text-gray-900">{currentQuestion.question}</h3>

      {/* Answer options */}
      {currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false' ? (
        <div className="mb-6 space-y-3">
          {(currentQuestion.options || []).map((option) => (
            <label key={option} className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                className="mt-1 h-4 w-4 cursor-pointer accent-primary-600"
              />
              <span className="flex-1 text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <input
            type="text"
            value={(answers[currentQuestion.id] as string) || ''}
            onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
            placeholder="Entrez votre réponse..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-success-600 px-6 py-2 font-medium text-white transition-colors hover:bg-success-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Soumission...' : 'Soumettre'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
          >
            Suivant →
          </button>
        )}
      </div>
    </div>
  );
}
