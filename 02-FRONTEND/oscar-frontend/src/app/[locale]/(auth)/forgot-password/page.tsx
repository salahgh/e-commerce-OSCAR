'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement GraphQL mutation
      // await apolloClient.mutate({
      //   mutation: RequestPasswordResetDocument,
      //   variables: { email },
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSent(true);
      toast.success('Email de réinitialisation envoyé!');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md px-4">
        <Card padding="lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Email envoyé!</h1>
            <p className="text-gray-600 mb-6">
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>.
              Veuillez vérifier votre boîte de réception.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">Retour à la connexion</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
              >
                Renvoyer l'email
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md px-4">
      <Card padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Mot de passe oublié?</h1>
          <p className="text-gray-600">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="votre@email.com"
            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Envoyer le lien de réinitialisation
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </form>
      </Card>
    </div>
  );
}
