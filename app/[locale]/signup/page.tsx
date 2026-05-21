// app/[locale]/signup/page.tsx
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { AuthForm } from '@/components/auth/AuthForm';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('signUp') };
}

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)] bg-[var(--surface-default)]">
        <Link
          href="/"
          className="text-xl font-bold bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--text-accent)] bg-clip-text text-transparent"
        >
          LearnCraft
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
        >
          {t('signIn')} →
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Decorative gradient blob */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--text-accent)] opacity-10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--text-accent)] to-[var(--color-accent-700)] text-3xl mb-4 shadow-[var(--shadow-md)]">
                🚀
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                Créer un compte
              </h1>
              <p className="text-[var(--text-secondary)]">
                Rejoignez des milliers d&apos;apprenants et commencez votre parcours.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: '🤖', text: 'Mentor IA' },
                { icon: '📚', text: 'Cours illimités' },
                { icon: '🏆', text: 'Badges & XP' },
              ].map((benefit) => (
                <div
                  key={benefit.text}
                  className="flex flex-col items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-3 text-center"
                >
                  <span className="text-xl">{benefit.icon}</span>
                  <span className="text-xs font-medium text-[var(--text-secondary)]">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Card */}
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-default)] p-8 shadow-[var(--shadow-lg)]">
              <AuthForm mode="signup" locale={locale} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
