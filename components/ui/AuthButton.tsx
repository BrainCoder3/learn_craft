// components/ui/AuthButton.tsx
'use client';

import { useAuthContext } from '@/lib/auth-context';
import { Link, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

/**
 * Header auth component — shows Sign In/Up when logged out,
 * user avatar + logout when logged in.
 */
export function AuthButton() {
  const { firebaseUser, user, loading, logout } = useAuthContext();
  const t = useTranslations('auth');
  const tNav = useTranslations('navigation');
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--bg-muted)]" />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          id="nav-sign-in"
          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
        >
          {t('signIn')}
        </Link>
        <Link
          href="/signup"
          id="nav-sign-up"
          className="btn-primary text-sm px-4 py-2"
        >
          {t('signUp')}
        </Link>
      </div>
    );
  }

  const initials = (user?.displayName || firebaseUser.displayName || firebaseUser.email || 'U')
    .charAt(0)
    .toUpperCase();
  const displayName = user?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard"
        id="nav-dashboard"
        className="hidden sm:block text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
      >
        {tNav('myProgress')}
      </Link>

      {/* User avatar + dropdown */}
      <div className="relative group">
        <button
          id="nav-user-avatar"
          className="flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--border-default)] bg-[var(--surface-default)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--interactive-primary)] transition-all duration-200 shadow-[var(--shadow-sm)]"
        >
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[var(--interactive-primary)] to-[var(--color-brand-700)] text-[var(--interactive-primary-text)] text-xs font-bold">
            {initials}
          </span>
          <span className="max-w-[100px] truncate hidden sm:block">{displayName}</span>
          <svg className="h-3 w-3 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        <div className="absolute right-0 top-full mt-2 w-52 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-default)] py-1 shadow-[var(--shadow-lg)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{displayName}</p>
            <p className="text-xs text-[var(--text-muted)] truncate">{firebaseUser.email}</p>
          </div>
          <Link
            href="/dashboard"
            id="dropdown-dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--interactive-primary)] transition-colors"
          >
            📊 Tableau de bord
          </Link>
          <Link
            href="/settings"
            id="dropdown-settings"
            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--interactive-primary)] transition-colors"
          >
            ⚙️ Paramètres
          </Link>
          <button
            id="dropdown-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger-600)] hover:bg-[var(--color-danger-50)] transition-colors"
          >
            🚪 {t('signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
