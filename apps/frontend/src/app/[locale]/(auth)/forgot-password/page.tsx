'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/i18n/routing';
import { Alert, Button, Card, Field, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const tFields = useTranslations('auth.fields');
  const tPlaceholders = useTranslations('auth.placeholders');
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('sendLink'));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card padding="lg" className="flex flex-col gap-6 text-center">
        <h1 className="text-32 font-bold text-content-strong">{t('success')}</h1>
        <p className="text-14 text-content-muted">{t('checkEmail')}</p>
        <Link href="/login" className="text-14 font-medium text-content-strong hover:underline">
          {t('backToLogin')}
        </Link>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-32 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">{t('description')}</p>
      </header>

      {error && <Alert intent="danger">{error}</Alert>}

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label={tFields('email')} required>
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tPlaceholders('email')}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? t('sending') : t('sendLink')}
        </Button>
      </form>

      <p className="text-center text-14 text-content-muted">
        <Link href="/login" className="font-medium text-content-strong hover:underline">
          {t('backToLogin')}
        </Link>
      </p>
    </Card>
  );
}
