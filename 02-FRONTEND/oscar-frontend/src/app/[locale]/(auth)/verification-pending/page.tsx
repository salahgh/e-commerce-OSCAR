'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerificationPendingPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const email = searchParams?.get('email') || '';

  const { resendVerification } = useAuth();

  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setError(null);
    setResent(false);

    try {
      await resendVerification(email);
      setResent(true);
    } catch (err: any) {
      setError(err.message || t('errors.registrationFailed'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">
          {t('verificationPending.title')}
        </CardTitle>
        <CardDescription className="text-base">
          {t('verificationPending.description')}
          {email && (
            <span className="block mt-1 font-medium text-foreground">
              {email}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resent && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{t('verificationPending.resent')}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>{t('verificationPending.checkSpam')}</p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleResend}
            variant="outline"
            className="w-full"
            disabled={isResending || !email}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('verificationPending.resending')}
              </>
            ) : (
              t('verificationPending.resend')
            )}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/login`}>
              {t('forgotPassword.backToLogin')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
