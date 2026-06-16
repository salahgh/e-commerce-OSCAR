'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/i18n/routing';
import { Alert, Button, Card } from '@/components/ui';

export default function VerificationPendingPage() {
  return (
    <React.Suspense fallback={null}>
      <VerificationPendingPageContent />
    </React.Suspense>
  );
}

function VerificationPendingPageContent() {
  const t = useTranslations('auth.verificationPending');
  const tLogin = useTranslations('auth.login');

  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const { resendVerification } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const [resent, setResent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onResend() {
    if (!email) {
      setError(t('description'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await resendVerification(email);
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('resend'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-6 text-center">
      <header className="flex flex-col gap-2">
        <h1 className="text-32 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">
          {t('description')} {email && <strong className="text-content-strong">{email}</strong>}
        </p>
      </header>

      {error && <Alert intent="danger">{error}</Alert>}
      {resent && <Alert intent="success">{t('resent')}</Alert>}

      <p className="text-12 text-content-subtle">{t('checkSpam')}</p>

      <Button
        type="button"
        intent="secondary"
        fullWidth
        onClick={onResend}
        loading={submitting}
        disabled={resent}
      >
        {submitting ? t('resending') : t('resend')}
      </Button>

      <Link href="/login" className="text-14 font-medium text-content-strong hover:underline">
        {tLogin('signIn')}
      </Link>
    </Card>
  );
}
