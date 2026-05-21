// components/ui/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
  ] as const;

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (code: 'en' | 'fr' | 'ar') => {
    setIsOpen(false);
    router.replace(pathname, { locale: code });
  };

  return (
    <div className="relative inline-block text-start" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-default)] hover:bg-[var(--bg-subtle)] text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-sm)] transition-all duration-250 cursor-pointer outline-none focus:ring-2 focus:ring-[var(--interactive-primary)]"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe size={16} className="text-[var(--text-muted)]" />
        <span className="hidden sm:inline-block">{currentLanguage.name}</span>
        <ChevronDown size={14} className={clsx("text-[var(--text-muted)] transition-transform duration-250", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-40 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-default)] shadow-[var(--shadow-lg)] z-50 overflow-hidden transform origin-top transition-all animate-fade-in">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((lang) => {
              const isActive = lang.code === currentLocale;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={clsx(
                    "w-full flex items-center justify-between px-4 py-2 text-sm text-start transition-colors duration-150 cursor-pointer outline-none",
                    isActive
                      ? "bg-[var(--interactive-primary-subtle)] text-[var(--interactive-primary)] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                  )}
                  role="menuitem"
                >
                  <span>{lang.name}</span>
                  {isActive && <Check size={14} className="text-[var(--interactive-primary)]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
