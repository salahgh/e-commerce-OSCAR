'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import { Lock, Eye, EyeOff, User, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

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

export default function RegisterPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale as string;

  const { register, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.firstNameRequired');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.lastNameRequired');
    }
    // Phone number is required
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!validateAlgerianPhone(formData.phone)) {
      newErrors.phone = 'Numéro invalide. Format: 5XX XX XX XX, 6XX XX XX XX ou 7XX XX XX XX';
    }
    if (!formData.password) {
      newErrors.password = t('validation.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('validation.passwordMin');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMismatch');
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = t('validation.termsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 9);
    handleChange('phone', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert phone to email format for Vendure
      const fullPhoneNumber = `+213${formData.phone}`;
      const emailAddress = phoneToEmail(formData.phone);

      const result = await register({
        emailAddress: emailAddress,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: fullPhoneNumber,
        password: formData.password,
      });

      if (result.requiresVerification) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/login`);
        }, 2000);
      } else {
        router.push(`/${locale}`);
      }
    } catch (err: any) {
      setError(err.message || t('errors.registrationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (success) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">{t('register.success')}</h2>
            <p className="text-muted-foreground">{t('register.checkEmail')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          {t('register.title')}
        </CardTitle>
        <CardDescription>
          {t('register.hasAccount')}{' '}
          <Link
            href={`/${locale}/login`}
            className="text-primary hover:underline font-medium"
          >
            {t('register.signIn')}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('fields.firstName')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t('placeholders.firstName')}
                  className="pl-10"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  required
                />
              </div>
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">{t('fields.lastName')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t('placeholders.lastName')}
                  className="pl-10"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  required
                />
              </div>
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>

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
                value={formatPhoneDisplay(formData.phone)}
                onChange={handlePhoneChange}
                required
                autoComplete="tel"
                maxLength={12}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Entrez votre numéro sans le 0 (ex: 551234567)
            </p>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
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
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
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
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('fields.confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('placeholders.confirmPassword')}
                className="pl-10 pr-10"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleChange('acceptTerms', checked)}
              />
              <Label htmlFor="acceptTerms" className="text-sm font-normal leading-relaxed cursor-pointer">
                {t('register.termsNotice')}{' '}
                <Link href={`/${locale}/terms`} className="text-primary hover:underline">
                  {t('register.termsLink')}
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-sm text-destructive">{errors.acceptTerms}</p>
            )}
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
                {t('register.creating')}
              </>
            ) : (
              t('register.createAccount')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
