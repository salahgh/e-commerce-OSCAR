'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

type VerificationStatus = 'verifying' | 'success' | 'error' | 'no-token';

export default function VerifyEmailPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const token = searchParams?.get('token');

  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState<VerificationStatus>(token ? 'verifying' : 'no-token');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verify = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setError(err.message || t('errors.invalidToken'));
      }
    };

    verify();
  }, [token, verifyEmail, router, locale, t]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t('verifyEmail.title')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('verifyEmail.verifying')}
            </p>
          </>
        );

      case 'success':
        return (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {t('verifyEmail.success')}
            </CardTitle>
            <p className="text-muted-foreground">
              {t('verifyEmail.redirecting')}
            </p>
            <Button asChild className="mt-4">
              <Link href={`/${locale}/login`}>
                {t('login.signIn')}
              </Link>
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t('verifyEmail.title')}
            </CardTitle>
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-2 mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}/register`}>
                  {t('register.createAccount')}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href={`/${locale}/login`}>
                  {t('forgotPassword.backToLogin')}
                </Link>
              </Button>
            </div>
          </>
        );

      case 'no-token':
        return (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t('verifyEmail.title')}
            </CardTitle>
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t('errors.invalidToken')}</AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href={`/${locale}/login`}>
                {t('forgotPassword.backToLogin')}
              </Link>
            </Button>
          </>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        {/* Header content is part of renderContent */}
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
