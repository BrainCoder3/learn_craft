// app/[locale]/page.tsx
import { Suspense } from 'react';
import { getCourses } from '@/lib/db';
import { CourseCard } from '@/components/ui/CourseCard';
import { Link } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tNav = await getTranslations({ locale, namespace: 'navigation' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tCourses = await getTranslations({ locale, namespace: 'courses' });

  const courses = await getCourses(12);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--surface-default)]/80 border-b border-[var(--border-default)] transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[var(--interactive-primary)] to-[var(--text-accent)] bg-clip-text text-transparent hover:opacity-90">
              LearnCraft
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors">
                {tNav('home')}
              </Link>
              <Link href="/settings" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors">
                {tNav('settings')}
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--interactive-primary)] via-[var(--color-brand-600)] to-[var(--color-brand-800)] px-4 py-20 sm:px-6 lg:px-8 text-[var(--interactive-primary-text)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,255,212,0.15),transparent_50%)]" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid gap-12 md:grid-cols-2 items-center">
              {/* Left Content */}
              <div className="flex flex-col items-start text-start">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-6 animate-slide-in-up">
                  {t('hero.title')}
                </h1>
                <p className="text-lg text-[var(--color-brand-100)] mb-8 leading-relaxed max-w-xl animate-slide-in-up">
                  {t('hero.subtitle')}
                </p>
                <div className="flex gap-4 animate-slide-in-up">
                  <Link
                    href="/"
                    className="btn-primary bg-[var(--bg-base)] !text-[var(--interactive-primary)] hover:!bg-[var(--bg-subtle)] border-none shadow-[var(--shadow-md)]"
                  >
                    {t('hero.cta')}
                  </Link>
                  <Link
                    href="/settings"
                    className="btn-secondary border-[var(--interactive-primary-text)] !text-[var(--interactive-primary-text)] bg-transparent hover:bg-white/10"
                  >
                    {tCommon('learnMore')}
                  </Link>
                </div>
              </div>

              {/* Right Visual */}
              <div className="hidden md:flex items-center justify-center animate-fade-in">
                <div className="text-9xl filter drop-shadow-[0_10px_20px_rgba(31,255,212,0.3)] animate-bounce duration-1000">🚀</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 bg-[var(--bg-subtle)] transition-colors duration-250">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-16 text-[var(--text-primary)]">
              {tNav('courses')} &amp; AI
            </h2>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: '🤖',
                  title: t('features.aiMentor.title'),
                  desc: t('features.aiMentor.desc'),
                },
                {
                  icon: '🛣️',
                  title: t('features.roadmap.title'),
                  desc: t('features.roadmap.desc'),
                },
                {
                  icon: '✅',
                  title: t('features.quiz.title'),
                  desc: t('features.quiz.desc'),
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] p-8 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:border-[var(--interactive-primary)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8 bg-[var(--bg-base)] transition-colors duration-250">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-start">
              <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-4">
                {tCourses('title')}
              </h2>
              <p className="text-lg text-[var(--text-secondary)]">
                {tCourses('subtitle')}
              </p>
            </div>

            {courses.length > 0 ? (
              <>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <Suspense fallback={<div className="text-center text-[var(--text-secondary)]">{tCommon('loading')}</div>}>
                    {courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </Suspense>
                </div>

                <div className="mt-16 text-center">
                  <Link href="/" className="btn-primary">
                    {tCommon('learnMore')} →
                  </Link>
                </div>
              </>
            ) : (
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-12 text-center">
                <p className="text-lg text-[var(--text-secondary)]">
                  Aucun cours disponible pour le moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] bg-[var(--bg-subtle)] px-4 py-10 sm:px-6 lg:px-8 text-center text-sm text-[var(--text-secondary)] transition-colors duration-250">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} LearnCraft. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-[var(--interactive-primary)]">{tNav('home')}</Link>
            <Link href="/settings" className="hover:text-[var(--interactive-primary)]">{tNav('settings')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
