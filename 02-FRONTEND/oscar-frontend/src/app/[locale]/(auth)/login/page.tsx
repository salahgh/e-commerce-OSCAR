'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

// Convert phone number to email format for Vendure auth
function phoneToEmail(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/\D/g, '');
  return `+213${cleaned}@phone.dz`;
}

// Format phone number for display (XXX XX XX XX)
function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\s/g, '').replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  if (cleaned.length <= 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
}

// Validate Algerian phone number (without the +213 prefix)
function validateAlgerianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '').replace(/\D/g, '');
  return /^[567]\d{8}$/.test(cleaned);
}

export default function LoginPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = params?.locale as string;
  const returnUrl = searchParams?.get('returnUrl') || `/${locale}`;

  const { login, loading: authLoading } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate phone number
    if (!validateAlgerianPhone(phone)) {
      setError('Numéro de téléphone invalide');
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert phone to email format for Vendure
      const emailIdentifier = phoneToEmail(phone);
      await login(emailIdentifier, password, rememberMe);
      router.push(returnUrl);
    } catch (err: any) {
      setError(err.message || t('errors.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('login.title')}
        </CardTitle>
        <CardDescription>
          {t('login.noAccount')}{' '}
          <Link
            href={`/${locale}/register`}
            className="text-primary hover:underline font-medium"
          >
            {t('login.signUp')}
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Numéro de téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <div className="absolute left-10 top-1/2 -translate-y-1/2 text-muted-foreground font-medium border-r pr-2">
                +213
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="5XX XX XX XX"
                className="pl-[5.5rem]"
                value={formatPhoneDisplay(phone)}
                onChange={handlePhoneChange}
                required
                autoComplete="tel"
                maxLength={12}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Entrez votre numéro sans le 0 (ex: 551234567)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('fields.password')}</Label>
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
                autoComplete="current-password"
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

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                {t('login.rememberMe')}
              </Label>
            </div>
            <Link
              href={`/${locale}/forgot-password`}
              className="text-sm text-primary hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || authLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('login.signingIn')}
              </>
            ) : (
              t('login.signIn')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>{t('login.termsNotice')}</p>
          <Link
            href={`/${locale}/terms`}
            className="text-primary hover:underline"
          >
            {t('login.termsLink')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
