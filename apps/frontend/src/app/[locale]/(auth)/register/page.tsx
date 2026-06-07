'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter, Link } from '@/i18n/routing';
import { Alert, Button, Card, Field, Input } from '@/components/ui';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const tFields = useTranslations('auth.fields');
  const tPlaceholders = useTranslations('auth.placeholders');
  const tRegister = useTranslations('auth.register');
  const tValidation = useTranslations('auth.validation');
  const { register } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      setError(tValidation('passwordMin'));
      return;
    }
    setSubmitting(true);
    try {
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        emailAddress: form.email,
        password: form.password,
      });
      if (result.requiresVerification) {
        toast.info(tRegister('verifyToastBody'), { title: tRegister('verifyToastTitle') });
        router.push(`/verification-pending?email=${encodeURIComponent(form.email)}`);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tRegister('failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-32 font-bold text-content-strong">{tRegister('title')}</h1>
        <p className="text-14 text-content-muted">{tRegister('subtitle')}</p>
      </header>

      {error && <Alert intent="danger">{error}</Alert>}

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label={tFields('firstName')} required>
            <Input
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </Field>
          <Field label={tFields('lastName')} required>
            <Input
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </Field>
        </div>
        <Field label={tFields('email')} required>
          <Input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder={tPlaceholders('email')}
          />
        </Field>
        <Field label={tFields('password')} required hint={tRegister('passwordHint')}>
          <Input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder={tPlaceholders('password')}
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {tRegister('createAccount')}
        </Button>
      </form>

      <p className="text-center text-14 text-content-muted">
        {tRegister('hasAccount')}{' '}
        <Link href="/login" className="font-medium text-content-strong hover:underline">
          {tRegister('signIn')}
        </Link>
      </p>
    </Card>
  );
}
