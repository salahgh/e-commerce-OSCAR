'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-lg w-full text-center">
            {/* Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            {/* Content */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Erreur critique
            </h1>
            <p className="text-gray-600 mb-8">
              Une erreur inattendue s'est produite. Nous sommes désolés pour ce désagrément.
              Veuillez réessayer ou revenir à l'accueil.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Réessayer
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
                Accueil
              </a>
            </div>

            {/* Error digest for debugging */}
            {error.digest && (
              <p className="mt-8 text-xs text-gray-400">
                Code erreur: {error.digest}
              </p>
            )}
          </div>
        </div>

        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-red-100 { background-color: #fee2e2; }
          .bg-primary { background-color: #4f46e5; }
          .bg-primary-dark { background-color: #4338ca; }
          .text-gray-900 { color: #111827; }
          .text-gray-700 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-gray-400 { color: #9ca3af; }
          .text-red-500 { color: #ef4444; }
          .text-white { color: #ffffff; }
          .rounded-full { border-radius: 9999px; }
          .rounded-lg { border-radius: 0.5rem; }
          .border { border-width: 1px; }
          .border-gray-300 { border-color: #d1d5db; }
        `}</style>
      </body>
    </html>
  );
}
