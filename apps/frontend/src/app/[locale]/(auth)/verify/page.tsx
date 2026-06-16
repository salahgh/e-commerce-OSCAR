'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, Link } from '@/i18n/routing';
import { Alert, Card, Spinner } from '@/components/ui';

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailPageContent />
    </React.Suspense>
  );
}

function VerifyEmailPageContent() {
  const t = useTranslations('auth.verifyEmail');
  const tErrors = useTranslations('auth.errors');
  const tLogin = useTranslations('auth.login');

  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { verifyEmail } = useAuth();

  const [state, setState] = React.useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = React.useState<string | null>(null);
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setState('error');
      setError(tErrors('invalidToken'));
      return;
    }
    (async () => {
      try {
        await verifyEmail(token);
        setState('success');
        setTimeout(() => router.push('/'), 1500);
      } catch (err) {
        setState('error');
        setError(err instanceof Error ? err.message : tErrors('invalidToken'));
      }
    })();
  }, [token, verifyEmail, router, tErrors]);

  if (state === 'verifying') {
    return (
      <Card padding="lg" className="flex flex-col items-center gap-4 text-center">
        <Spinner />
        <h1 className="text-24 font-bold text-content-strong">{t('title')}</h1>
        <p className="text-14 text-content-muted">{t('verifying')}</p>
      </Card>
    );
  }

  if (state === 'success') {
    return (
      <Card padding="lg" className="flex flex-col gap-4 text-center">
        <h1 className="text-32 font-bold text-content-strong">{t('success')}</h1>
        <p className="text-14 text-content-muted">{t('redirecting')}</p>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="flex flex-col gap-6 text-center">
      <Alert intent="danger">{error}</Alert>
      <Link href="/login" className="text-14 font-medium text-content-strong hover:underline">
        {tLogin('signIn')}
      </Link>
    </Card>
  );
}
