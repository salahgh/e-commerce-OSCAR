'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will be implemented with AuthContext
    console.log('Login:', { email, password });
  };

  return (
    <div className="w-full max-w-md px-4">
      <Card padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Connexion</h1>
          <p className="text-gray-600">
            Pas encore de compte?{' '}
            <Link href="/register" className="text-primary hover:underline">
              S'inscrire
            </Link>
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

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Mot de passe"
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2 rounded" />
              <span className="text-sm">Se souvenir de moi</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Mot de passe oublié?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Se connecter
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>En continuant, vous acceptez nos</p>
          <Link href="/terms" className="text-primary hover:underline">
            Conditions d'utilisation
          </Link>
        </div>
      </Card>
    </div>
  );
}
