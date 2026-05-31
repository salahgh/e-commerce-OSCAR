'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

type ToastIntent = 'info' | 'success' | 'danger';

interface ToastItem {
  id: number;
  title?: React.ReactNode;
  description?: React.ReactNode;
  intent: ToastIntent;
  duration: number;
}

interface ToastContextValue {
  show: (input: Omit<ToastItem, 'id' | 'duration'> & { duration?: number }) => void;
  success: (message: string, opts?: { title?: string; duration?: number }) => void;
  error: (message: string, opts?: { title?: string; duration?: number }) => void;
  info: (message: string, opts?: { title?: string; duration?: number }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let nextId = 0;

const intentStyles: Record<ToastIntent, { bg: string; border: string; icon: React.ReactNode }> = {
  info: { bg: 'bg-state-info-bg', border: 'border-state-info-border', icon: <Info className="h-5 w-5 text-state-info-content" /> },
  success: { bg: 'bg-state-success-bg', border: 'border-state-success-border', icon: <CheckCircle2 className="h-5 w-5 text-state-success-content" /> },
  danger: { bg: 'bg-state-danger-bg', border: 'border-state-danger-border', icon: <AlertCircle className="h-5 w-5 text-state-danger-content" /> },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const tCommon = useTranslations('Common');
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback<ToastContextValue['show']>((input) => {
    const id = ++nextId;
    const duration = input.duration ?? 4000;
    setToasts((prev) => [...prev, { ...input, id, duration }]);
    if (duration > 0) {
      window.setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const ctx = React.useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, opts) => show({ intent: 'success', description: message, title: opts?.title, duration: opts?.duration }),
      error: (message, opts) => show({ intent: 'danger', description: message, title: opts?.title, duration: opts?.duration }),
      info: (message, opts) => show({ intent: 'info', description: message, title: opts?.title, duration: opts?.duration }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-4 end-4 z-toast flex max-w-sm flex-col gap-3">
        {toasts.map((t) => {
          const sx = intentStyles[t.intent];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded border bg-bg-elevated p-4 shadow-overlay animate-slide-up',
                sx.bg,
                sx.border,
              )}
            >
              <span className="mt-0.5 shrink-0">{sx.icon}</span>
              <div className="flex flex-1 flex-col gap-1">
                {t.title && <p className="text-14 font-bold text-content-strong">{t.title}</p>}
                {t.description && <p className="text-14 text-content">{t.description}</p>}
              </div>
              <button
                type="button"
                aria-label={tCommon('close')}
                onClick={() => dismiss(t.id)}
                className="-m-1 inline-flex h-6 w-6 items-center justify-center rounded text-content-muted transition hover:bg-bg-muted/40 hover:text-content-strong"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
