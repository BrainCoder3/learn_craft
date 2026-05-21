// app/[locale]/login/page.tsx
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
  return { title: t('signIn') };
}

export default async function LoginPage({ params }: Props) {
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
          href="/signup"
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
        >
          {t('signUp')} →
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Decorative gradient blob */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--interactive-primary)] opacity-10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--interactive-primary)] to-[var(--color-brand-700)] text-3xl mb-4 shadow-[var(--shadow-md)]">
                🔐
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                {t('signIn')}
              </h1>
              <p className="text-[var(--text-secondary)]">
                Bienvenue ! Connectez-vous pour continuer votre apprentissage.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-default)] p-8 shadow-[var(--shadow-lg)]">
              <AuthForm mode="login" locale={locale} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
