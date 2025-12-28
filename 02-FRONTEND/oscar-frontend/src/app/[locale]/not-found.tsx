import Link from 'next/link';
import { Home, Search, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[200px] font-bold text-gray-100 leading-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 rounded-full p-8">
                <Search className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Page introuvable
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Oups ! La page que vous recherchez semble avoir disparu ou n'existe pas.
          Pas d'inquiétude, notre collection est toujours là pour vous.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" asChild>
            <Link href="/">
              <Home className="h-5 w-5 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Voir nos produits
            </Link>
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="font-semibold text-gray-900 mb-4">Liens utiles</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/products"
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-center"
            >
              <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium text-gray-700">Produits</span>
            </Link>
            <Link
              href="/categories"
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-center"
            >
              <Search className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium text-gray-700">Catégories</span>
            </Link>
            <Link
              href="/contact"
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-center"
            >
              <Home className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium text-gray-700">Contact</span>
            </Link>
            <Link
              href="/about"
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-center"
            >
              <ArrowLeft className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium text-gray-700">À propos</span>
            </Link>
          </div>
        </div>

        {/* Support */}
        <p className="mt-8 text-sm text-gray-500">
          Besoin d'aide ?{' '}
          <Link href="/contact" className="text-primary hover:underline font-medium">
            Contactez notre support
          </Link>
        </p>
      </div>
    </div>
  );
}
