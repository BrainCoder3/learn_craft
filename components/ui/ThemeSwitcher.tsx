// components/ui/ThemeSwitcher.tsx
'use client';

import { useTheme } from 'next-themes';
import { Sun, Monitor, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import clsx from 'clsx';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations('settings');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by returning a placeholder layout of the exact same size
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-28 bg-[var(--bg-muted)] animate-pulse rounded-[var(--radius-full)]" />
      </div>
    );
  }

  const themes = [
    { id: 'light', icon: Sun, label: t('themeLight') },
    { id: 'system', icon: Monitor, label: t('themeSystem') },
    { id: 'dark', icon: Moon, label: t('themeDark') },
  ];

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[1];

  return (
    <div className="flex items-center gap-3">
      {/* Active Theme Label */}
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hidden sm:inline-block">
        {currentThemeObj.label}
      </span>

      {/* Pill Toggle */}
      <div className="relative flex items-center p-1 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[var(--radius-full)] shadow-[var(--shadow-sm)]">
        {/* Animated Slide Background */}
        <div
          className={clsx(
            "absolute top-1 bottom-1 left-1 rounded-[var(--radius-full)] bg-[var(--interactive-primary)] transition-all duration-300 ease-out shadow-[var(--shadow-sm)]",
            theme === 'light' && "w-[30px] translate-x-0 rtl:translate-x-[60px]",
            theme === 'system' && "w-[30px] translate-x-[34px] rtl:translate-x-[34px]",
            theme === 'dark' && "w-[30px] translate-x-[68px] rtl:translate-x-0"
          )}
          style={{ width: '30px' }}
        />

        {themes.map((item) => {
          const Icon = item.icon;
          const isActive = theme === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={clsx(
                "relative z-10 p-1.5 rounded-[var(--radius-full)] transition-colors duration-250 cursor-pointer outline-none",
                isActive ? "text-[var(--interactive-primary-text)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              title={item.label}
              aria-label={item.label}
            >
              <Icon size={16} className="transition-transform duration-300 hover:scale-110" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
