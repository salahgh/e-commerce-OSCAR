'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
      });
      toast.success('Compte créé avec succès!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-2xl px-4">
      <Card padding="lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Créer un compte</h1>
          <p className="text-gray-600">
            Vous avez déjà un compte?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              label="Prénom"
              placeholder="Votre prénom"
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              required
            />

            <Input
              type="text"
              label="Nom"
              placeholder="Votre nom"
              leftIcon={<User className="h-5 w-5 text-gray-400" />}
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            type="email"
            label="Email"
            placeholder="votre@email.com"
            leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
          />

          <Input
            type="tel"
            label="Téléphone (optionnel)"
            placeholder="0X XX XX XX XX"
            leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            helperText="Format: 0X XX XX XX XX"
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
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            helperText="Au moins 6 caractères"
            required
          />

          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            label="Confirmer le mot de passe"
            placeholder="••••••••"
            leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            }
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <div>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleChange('acceptTerms', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                J'accepte les{' '}
                <Link href="/terms" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-sm text-error mt-1">{errors.acceptTerms}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Créer mon compte
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>En créant un compte, vous acceptez de recevoir nos offres par email</p>
        </div>
      </Card>
    </div>
  );
}
