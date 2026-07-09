// app/[locale]/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useTheme } from 'next-themes';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useAuthContext } from '@/lib/auth-context';
import {
  User as UserIcon,
  Bell,
  Globe,
  Palette,
  RotateCcw,
  ArrowLeft,
  Mail,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const { setTheme } = useTheme();
  const { user } = useAuthContext();

  // Local state for settings
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState('Alex Johnson');
  const [email, setEmail] = useState('alex@learncraft.io');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // If a real user is logged in, sync their details
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleReset = () => {
    const confirmReset = window.confirm(t('resetConfirm'));
    if (confirmReset) {
      setTheme('system');
      setNotifications(true);
      setToastMessage(t('resetSuccess'));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-250">
      {/* Toast Alert Banner */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 bg-[var(--color-success-600)] text-white rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] animate-fade-in">
          <CheckCircle size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 clay-glow bg-[var(--surface-default)]/80 border-b border-[var(--border-default)] transition-colors duration-250">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
            id="settings-back-link"
          >
            <ArrowLeft size={16} />
            <span>{tCommon('back')}</span>
          </Link>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Settings Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Page Intro */}
          <div className="text-start">
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">{t('title')}</h2>
            <p className="mt-2 text-[var(--text-secondary)] text-sm">
              Manage your personal preferences, interface themes, language settings, and notifications.
            </p>
          </div>

          {/* Account Profile Card */}
          <section className="bg-[var(--surface-default)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-6 sm:p-8 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-default)]">
              <UserIcon className="text-[var(--interactive-primary)]" size={20} />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('account')}</h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Profile Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-[var(--radius-full)] bg-gradient-to-tr from-[var(--interactive-primary)] to-[var(--text-accent)] flex items-center justify-center text-white text-3xl font-bold shadow-[var(--shadow-md)]">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-[var(--color-success-500)] ring-2 ring-white" />
              </div>

              {/* Profile Inputs */}
              <div className="flex-1 w-full grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 text-start">
                  <label htmlFor="settings-name-input" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Name
                  </label>
                  <input
                    type="text"
                    id="settings-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base focus:ring-2 focus:ring-[var(--interactive-primary)] bg-[var(--bg-base)] text-[var(--text-primary)] border-[var(--border-default)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-start">
                  <label htmlFor="settings-email-input" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {tCommon('search')} (Email)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      id="settings-email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-base pl-10 focus:ring-2 focus:ring-[var(--interactive-primary)] bg-[var(--bg-base)] text-[var(--text-primary)] border-[var(--border-default)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Language & Theme Configuration */}
            <section className="bg-[var(--surface-default)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-default)]">
                  <Palette className="text-[var(--interactive-primary)]" size={20} />
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">Interface Customization</h3>
                </div>

                <div className="space-y-6">
                  {/* Language Setting Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-start">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{t('language')}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Select your preferred system language.</p>
                    </div>
                    <LanguageSwitcher />
                  </div>

                  {/* Theme Setting Row */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-start">
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">{t('theme')}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Switch between light, dark, or system mode.</p>
                    </div>
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </section>

            {/* Notifications Panel */}
            <section className="bg-[var(--surface-default)] rounded-[var(--radius-lg)] border border-[var(--border-default)] p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-default)]">
                  <Bell className="text-[var(--interactive-primary)]" size={20} />
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{t('notifications')}</h3>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="text-start flex-1">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">{t('notificationsLabel')}</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                      {t('notificationsDesc')}
                    </p>
                  </div>

                  {/* Styled Switch Toggle */}
                  <button
                    type="button"
                    id="settings-notifications-switch"
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--interactive-primary)] focus:ring-offset-2 ${
                      notifications ? 'bg-[var(--interactive-primary)]' : 'bg-[var(--border-default)]'
                    }`}
                    role="switch"
                    aria-checked={notifications}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications
                          ? 'translate-x-5 rtl:-translate-x-5'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Danger Zone Panel */}
          <section className="bg-[var(--surface-default)] rounded-[var(--radius-lg)] border border-[var(--color-danger-200)] dark:border-[var(--color-danger-900)] p-6 sm:p-8 shadow-[var(--shadow-sm)] bg-gradient-to-br from-[var(--surface-default)] to-[var(--color-danger-50)]/10">
            <div className="flex items-center gap-3 mb-4 text-[var(--color-danger-700)] dark:text-[var(--color-danger-400)]">
              <AlertTriangle size={20} />
              <h3 className="text-lg font-bold">{t('dangerZone')}</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] max-w-xl text-start mb-6">
              Revert all customization settings, notification overrides, and appearance styles to system defaults. This action will reset the UI layout theme to system mode.
            </p>
            <div className="flex justify-start">
              <button
                type="button"
                id="settings-reset-button"
                onClick={handleReset}
                className="btn-secondary !text-[var(--color-danger-700)] dark:!text-[var(--color-danger-400)] hover:!bg-[var(--color-danger-50)] dark:hover:!bg-[var(--color-danger-950)]/30 border-[var(--color-danger-300)] dark:border-[var(--color-danger-800)] flex items-center gap-2 cursor-pointer outline-none"
              >
                <RotateCcw size={16} />
                <span>{t('resetButton')}</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
