// app/[locale]/layout.tsx
import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Providers } from '@/lib/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, rtlLocales } from '@/i18n/config';

export const metadata: Metadata = {
  title: {
    default: 'LearnCraft - AI Interactive Learning',
    template: '%s | LearnCraft',
  },
  description: 'Learn programming and technologies with AI mentoring',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for the client provider
  const messages = await getMessages();
  const isRtl = rtlLocales.includes(locale as any);

  // Set the CSS font variables inline
  const fontStyle = `
    :root {
      --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
      --font-arabic: 'Noto Sans Arabic', system-ui, -apple-system, sans-serif;
    }
  `;

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: fontStyle }} />
      </head>
      <body className="antialiased">
        <Providers>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <AuthProvider>
              <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-250">
                {children}
              </div>
            </AuthProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
