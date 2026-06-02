'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const COPY: Record<string, { title: string; body: string; install: string; dismiss: string }> = {
  fr: {
    title: 'Installer OSCAR Najar',
    body: 'Ajoutez la boutique à votre écran d’accueil.',
    install: 'Installer',
    dismiss: 'Plus tard',
  },
  en: {
    title: 'Install OSCAR Najar',
    body: 'Add the shop to your home screen.',
    install: 'Install',
    dismiss: 'Later',
  },
  ar: {
    title: 'تثبيت OSCAR Najar',
    body: 'أضف المتجر إلى شاشتك الرئيسية.',
    install: 'تثبيت',
    dismiss: 'لاحقًا',
  },
};

const DISMISS_KEY = 'oscar-pwa-dismissed';

/** Install banner shown when the browser offers `beforeinstallprompt`. */
export function PWAInstallPrompt() {
  const locale = useLocale();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore storage access errors */
    }
    setHidden(false);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (hidden || !deferred) return null;
  const t = COPY[locale] ?? COPY.fr;

  const install = async () => {
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
  };
  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      role="dialog"
      aria-label={t.title}
      className="fixed bottom-4 left-1/2 z-toast flex w-[min(92vw,30rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-bg-elevated p-4 shadow-overlay"
    >
      <div className="min-w-0 flex-1">
        <div className="text-14 font-bold text-content-strong">{t.title}</div>
        <div className="text-12 text-content-muted">{t.body}</div>
      </div>
      <button
        onClick={dismiss}
        className="text-12 font-medium text-content-muted hover:text-content"
      >
        {t.dismiss}
      </button>
      <button
        onClick={install}
        className="whitespace-nowrap rounded-md bg-accent px-4 py-2 text-14 font-medium text-accent-content hover:bg-accent-hover"
      >
        {t.install}
      </button>
    </div>
  );
}

export default PWAInstallPrompt;
