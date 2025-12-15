'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { Phone, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

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

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params?.locale as string;

  const { requestPasswordReset } = useAuth();

  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Le numéro de téléphone est requis');
      return;
    }

    if (!validateAlgerianPhone(phone)) {
      setError('Numéro de téléphone invalide');
      return;
    }

    setIsSubmitting(true);

    try {
      const emailIdentifier = phoneToEmail(phone);
      await requestPasswordReset(emailIdentifier);
      setSent(true);
    } catch (err: any) {
      setError(err.message || t('errors.registrationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">Lien envoyé!</h2>
            <p className="text-muted-foreground">
              Si un compte est associé à ce numéro, vous recevrez un SMS avec les instructions.
            </p>
            <p className="text-sm font-medium">+213 {formatPhoneDisplay(phone)}</p>
            <div className="space-y-3 pt-4">
              <Button asChild className="w-full">
                <Link href={`/${locale}/login`}>
                  {t('forgotPassword.backToLogin')}
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setSent(false);
                  setPhone('');
                }}
              >
                {t('verificationPending.resend')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('forgotPassword.title')}
        </CardTitle>
        <CardDescription>
          Entrez votre numéro de téléphone pour réinitialiser votre mot de passe.
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
                {t('forgotPassword.sending')}
              </>
            ) : (
              t('forgotPassword.sendLink')
            )}
          </Button>

          <Button asChild variant="ghost" className="w-full">
            <Link href={`/${locale}/login`} className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('forgotPassword.backToLogin')}
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
