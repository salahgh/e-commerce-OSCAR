'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[200px] font-bold text-gray-100 leading-none">500</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-100 rounded-full p-8">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Une erreur est survenue
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Nous sommes désolés, quelque chose s'est mal passé de notre côté.
          Nos équipes ont été notifiées et travaillent à résoudre le problème.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" onClick={reset}>
            <RefreshCw className="h-5 w-5 mr-2" />
            Réessayer
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>

        {/* Error Details (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Détails de l'erreur (dev)</h3>
            <pre className="text-sm text-red-600 overflow-x-auto whitespace-pre-wrap">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-sm text-red-500 mt-2">Digest: {error.digest}</p>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="font-semibold text-gray-900 mb-4">Que pouvez-vous faire ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg bg-gray-50">
              <RefreshCw className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Rafraîchir la page</h3>
              <p className="text-sm text-gray-600">
                Parfois, un simple rafraîchissement suffit à résoudre le problème.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <Home className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Retour à l'accueil</h3>
              <p className="text-sm text-gray-600">
                Revenez à la page d'accueil et naviguez à nouveau.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <MessageCircle className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Contactez-nous</h3>
              <p className="text-sm text-gray-600">
                Si le problème persiste, notre équipe est là pour vous aider.
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <p className="mt-8 text-sm text-gray-500">
          Le problème persiste ?{' '}
          <Link href="/contact" className="text-primary hover:underline font-medium">
            Contactez notre support
          </Link>
        </p>
      </div>
    </div>
  );
}
