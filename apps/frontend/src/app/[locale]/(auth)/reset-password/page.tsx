'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/i18n/routing';
import { Alert, Button, Card, Field, Input } from '@/components/ui';

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordPageContent />
    </React.Suspense>
  );
}

function ResetPasswordPageContent() {
  const t = useTranslations('auth.resetPassword');
  const tFields = useTranslations('auth.fields');
  const tErrors = useTranslations('auth.errors');
  const tValidation = useTranslations('auth.validation');
  const tLogin = useTranslations('auth.login');

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError(tErrors('invalidToken'));
      return;
    }
    if (password !== confirm) {
      setError(tErrors('passwordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(tValidation('passwordMin'));
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : tErrors('invalidToken'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <Card padding="lg" className="flex flex-col gap-6 text-center">
        <Alert intent="danger">{tErrors('invalidToken')}</Alert>
        <Link href="/login" className="text-14 font-medium text-content-strong hover:underline">
          {tLogin('signIn')}
        </Link>
      </Card>
    );
  }

  if (done) {
    return (
      <Card padding="lg" className="flex flex-col gap-6 text-center">
        <h1 className="text-32 font-bold text-content-strong">{t('success')}</h1>
        <p className="text-14 text-content-muted">{t('redirecting')}</p>
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
        <Field label={tFields('password')} required>
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label={tFields('confirmPassword')} required>
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? t('resetting') : t('reset')}
        </Button>
      </form>
    </Card>
  );
}
