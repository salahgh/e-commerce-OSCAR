'use client';

import * as React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { useRouter, Link } from '@/i18n/routing';
import { Alert, Button, Card, Field, Input } from '@/components/ui';

export default function RegisterPage() {
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
    setSubmitting(true);
    setError(null);
    try {
      const result = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        emailAddress: form.email,
        password: form.password,
      });
      if (result.requiresVerification) {
        toast.info('Vérifiez votre email pour confirmer votre compte.', { title: 'Inscription réussie' });
        router.push('/verification-pending');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'inscription.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card padding="lg" className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-32 font-bold text-content-strong">Créer un compte</h1>
        <p className="text-14 text-content-muted">Rejoignez OSCAR Najar.</p>
      </header>

      {error && <Alert intent="danger">{error}</Alert>}

      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom" required>
            <Input
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
          </Field>
          <Field label="Nom" required>
            <Input
              required
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </Field>
        </div>
        <Field label="Email" required>
          <Input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="vous@exemple.com"
          />
        </Field>
        <Field label="Mot de passe" required hint="Au moins 8 caractères">
          <Input
            type="password"
            required
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="••••••••"
          />
        </Field>
        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Créer mon compte
        </Button>
      </form>

      <p className="text-center text-14 text-content-muted">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="font-medium text-content-strong hover:underline">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}
