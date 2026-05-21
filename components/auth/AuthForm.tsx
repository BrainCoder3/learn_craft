// components/auth/AuthForm.tsx
'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { upsertUser, isMockMode } from '@/lib/db';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface AuthFormProps {
  mode: 'login' | 'signup';
  locale: string;
}

export function AuthForm({ mode, locale }: AuthFormProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isMockMode()) {
        // Mock sign‑up / sign‑in using localStorage
        const mockUser = {
          uid: 'mock-user-id',
          email,
          displayName: displayName || email.split('@')[0],
          role: 'student',
          level: 'beginner',
          preferences: { theme: 'light', language: locale as 'fr' | 'en', notificationsEnabled: true },
          badges: [],
          totalXp: 0,
          updatedAt: new Date(),
        };
        window.localStorage.setItem('learncraft-mock-auth-user', JSON.stringify(mockUser));
        const event = new Event('learncraft-mock-auth-change');
        window.dispatchEvent(event);
        router.push('/dashboard');
        return;
      }
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await upsertUser(cred.user.uid, {
          email: cred.user.email || email,
          displayName: displayName || email.split('@')[0],
          role: 'student',
          level: 'beginner',
          preferences: {
            theme: 'light',
            language: locale as 'fr' | 'en',
            notificationsEnabled: true,
          },
          badges: [],
          totalXp: 0,
          updatedAt: new Date(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      const codes: Record<string, string> = {
        'auth/email-already-in-use': "Cette adresse e-mail est déjà utilisée.",
        'auth/invalid-email': "Adresse e-mail invalide.",
        'auth/weak-password': "Le mot de passe doit contenir au moins 6 caractères.",
        'auth/user-not-found': "Aucun compte trouvé avec cet e-mail.",
        'auth/wrong-password': "Mot de passe incorrect.",
        'auth/invalid-credential': "Email ou mot de passe incorrect.",
        'auth/too-many-requests': "Trop de tentatives. Veuillez réessayer plus tard.",
      };
      setError(codes[firebaseError.code || ''] || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      if (isMockMode()) {
        // Mock Google sign‑in: reuse same mock user structure
        const mockUser = {
          uid: 'mock-user-id',
          email: email || 'mock@example.com',
          displayName: displayName || 'Mock User',
          role: 'student',
          level: 'beginner',
          preferences: { theme: 'light', language: locale as 'fr' | 'en', notificationsEnabled: true },
          badges: [],
          totalXp: 0,
          updatedAt: new Date(),
        };
        window.localStorage.setItem('learncraft-mock-auth-user', JSON.stringify(mockUser));
        const event = new Event('learncraft-mock-auth-change');
        window.dispatchEvent(event);
        router.push('/dashboard');
        return;
      }
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      if (mode === 'signup') {
        await upsertUser(cred.user.uid, {
          email: cred.user.email || '',
          displayName: cred.user.displayName || cred.user.email?.split('@')[0] || 'Utilisateur',
          role: 'student',
          level: 'beginner',
          preferences: {
            theme: 'light',
            language: locale as 'fr' | 'en',
            notificationsEnabled: true,
          },
          badges: [],
          totalXp: 0,
          updatedAt: new Date(),
        });
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        setError("La connexion avec Google a échoué. Veuillez réessayer.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Google Sign In */}
      <button
        id="google-auth-btn"
        onClick={handleGoogleAuth}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-default)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {googleLoading ? (
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {t('continueWithGoogle')}
      </button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border-default)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[var(--bg-base)] px-4 text-[var(--text-muted)]">ou</span>
        </div>
      </div>

      {/* Email Form */}
      <form id="auth-email-form" onSubmit={handleEmailAuth} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-display-name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Nom d&apos;affichage
            </label>
            <input
              id="auth-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Votre nom"
              className="input-base w-full"
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            {t('email')}
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            required
            className="input-base w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="auth-password" className="block text-sm font-medium text-[var(--text-secondary)]">
              {t('password')}
            </label>
            {mode === 'login' && (
              <Link href="/" className="text-xs text-[var(--interactive-primary)] hover:opacity-80">
                {t('forgotPassword')}
              </Link>
            )}
          </div>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="input-base w-full"
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            id="auth-error-msg"
            className="rounded-[var(--radius-md)] bg-[var(--color-danger-50)] border border-[var(--color-danger-200)] px-4 py-3 text-sm text-[var(--color-danger-700)]"
          >
            {error}
          </div>
        )}

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={loading || googleLoading}
          className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {tCommon('loading')}
            </span>
          ) : (
            mode === 'login' ? t('signIn') : t('signUp')
          )}
        </button>
      </form>

      {/* Toggle link */}
      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        {mode === 'login' ? (
          <>
            {t('noAccount')}{' '}
            <Link href="/signup" className="font-semibold text-[var(--interactive-primary)] hover:opacity-80">
              {t('signUp')}
            </Link>
          </>
        ) : (
          <>
            {t('alreadyAccount')}{' '}
            <Link href="/login" className="font-semibold text-[var(--interactive-primary)] hover:opacity-80">
              {t('signIn')}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
