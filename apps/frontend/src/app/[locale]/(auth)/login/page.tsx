'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const isRTL = locale === 'ar';
  const returnUrl = searchParams?.get('returnUrl') || `/${locale}`;

  const { login, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push(returnUrl);
    } catch (err: any) {
      setError(err.message || t('errors.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[28px] font-bold leading-tight text-dark-text">
          {t('login.title')}
        </h1>
        <p className="text-base text-dark-text-5">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        {error && (
          <div className="rounded-lg bg-error-1 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* Email field */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-text-3">{t('labels.optional')}</span>
            <span className="font-medium text-dark-text">{t('labels.emailOrPhone')}</span>
          </div>
          <Input
            id="email"
            type="email"
            placeholder={t('placeholders.email')}
            className="h-10 rounded-lg border-gray-5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-text-3">{t('labels.optional')}</span>
            <span className="font-medium text-dark-text">{t('fields.password')}</span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('placeholders.password')}
              className="h-10 rounded-lg border-gray-5 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-dark-text-3 hover:text-dark-text"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit + Forgot Password */}
        <div className="mt-12 flex flex-col items-center gap-5">
          <Button
            type="submit"
            className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary-5"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t('login.signingIn')}
              </>
            ) : (
              t('login.signIn')
            )}
          </Button>

          <Link
            href="/forgot-password"
            className="text-base font-medium text-[#183DE5] hover:underline"
          >
            {t('login.forgotPassword')}
          </Link>
        </div>
      </form>

      {/* Bottom register link */}
      <div className="text-center text-base">
        <span className="text-dark-text">{t('login.noAccount')} </span>
        <Link
          href="/register"
          className="font-medium text-[#183DE5]"
        >
          {t('login.signUp')}
        </Link>
      </div>
    </div>
  );
}
