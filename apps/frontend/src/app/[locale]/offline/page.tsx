import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-muted rounded-full animate-ping opacity-20" />
            <div className="relative bg-muted rounded-full p-6">
              <WifiOff className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Vous etes hors ligne
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          Impossible de charger cette page. Verifiez votre connexion internet et reessayez.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Reessayer
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
          >
            <Home className="h-5 w-5" />
            Accueil
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-12 text-left bg-muted/50 rounded-lg p-4">
          <h2 className="font-medium text-foreground mb-2">Conseils:</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>- Verifiez que le mode avion est desactive</li>
            <li>- Essayez de vous reconnecter au Wi-Fi</li>
            <li>- Verifiez vos donnees mobiles</li>
            <li>- Rapprochez-vous de votre routeur</li>
          </ul>
        </div>

        {/* Brand */}
        <p className="mt-8 text-sm text-muted-foreground">
          OSCAR Fashion - Mode en ligne
        </p>
      </div>
    </div>
  );
}
