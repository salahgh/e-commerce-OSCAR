'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter, Link } from '@/i18n/routing';
import { Alert, Button, Card, Checkbox, Field, Input } from '@/components/ui';

export default function LoginPage() {
  const tFields = useTranslations('auth.fields');
  const tPlaceholders = useTranslations('auth.placeholders');
  const tLogin = useTranslations('auth.login');
  const { login } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password, remember);
      toast.success(tLogin('welcomeToast'));
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : tLogin('failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-32 font-bold text-content-strong">{tLogin('title')}</h1>
        <p className="text-14 text-content-muted">{tLogin('subtitle')}</p>
      </header>

      {error && <Alert intent="danger">{error}</Alert>}

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label={tFields('email')} required>
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={tPlaceholders('email')}
          />
        </Field>
        <Field
          label={tFields('password')}
          required
          hint={
            <Link href="/forgot-password" className="text-content-strong hover:underline">
              {tLogin('forgotPassword')}
            </Link>
          }
        >
          <Input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tPlaceholders('password')}
          />
        </Field>
        <Checkbox
          label={tLogin('rememberMe')}
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {tLogin('signIn')}
        </Button>
      </form>

      <p className="text-center text-14 text-content-muted">
        {tLogin('noAccount')}{' '}
        <Link href="/register" className="font-medium text-content-strong hover:underline">
          {tLogin('signUp')}
        </Link>
      </p>
    </Card>
  );
}
