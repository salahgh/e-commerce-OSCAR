'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

type ResetStatus = 'form' | 'success' | 'error' | 'no-token';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = params?.locale as string;
  const token = searchParams?.get('token');

  const { resetPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<ResetStatus>(token ? 'form' : 'no-token');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password) {
      setError(t('validation.passwordRequired'));
      return;
    }
    if (password.length < 8) {
      setError(t('validation.passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(token!, password);
      setStatus('success');
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 3000);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || t('errors.invalidToken'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // No token provided
  if (status === 'no-token') {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">{t('resetPassword.title')}</h2>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t('errors.invalidToken')}</AlertDescription>
            </Alert>
            <Button asChild className="w-full mt-4">
              <Link href={`/${locale}/forgot-password`}>
                {t('forgotPassword.sendLink')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-600">
              {t('resetPassword.success')}
            </h2>
            <p className="text-muted-foreground">
              {t('resetPassword.redirecting')}
            </p>
            <Button asChild className="w-full mt-4">
              <Link href={`/${locale}/login`}>
                {t('login.signIn')}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state (after form submission failed)
  if (status === 'error') {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">{t('resetPassword.title')}</h2>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-3 pt-4">
              <Button asChild className="w-full">
                <Link href={`/${locale}/forgot-password`}>
                  {t('forgotPassword.sendLink')}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href={`/${locale}/login`}>
                  {t('forgotPassword.backToLogin')}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form state
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('resetPassword.title')}
        </CardTitle>
        <CardDescription>
          {t('resetPassword.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && status === 'form' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">{t('profile.newPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('placeholders.password')}
                className="pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('profile.confirmNewPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('placeholders.confirmPassword')}
                className="pl-10 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('resetPassword.resetting')}
              </>
            ) : (
              t('resetPassword.reset')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
