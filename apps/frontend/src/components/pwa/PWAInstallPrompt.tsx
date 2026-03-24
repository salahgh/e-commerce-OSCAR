'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  className?: string;
}

export function PWAInstallPrompt({ className }: PWAInstallPromptProps) {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if user has dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

    // Show again after 7 days
    if (daysSinceDismissed > 7) {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, []);

  // Delay showing the prompt
  useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [isInstallable, isInstalled, isDismissed]);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm',
        'bg-card border border-border rounded-xl shadow-lg p-4',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        'z-50',
        className
      )}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        aria-label="Fermer"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">
            Installer OSCAR Fashion
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ajoutez notre app pour une experience optimale et un acces hors ligne.
          </p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Offline indicator banner
export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else {
      // Hide after a short delay when coming back online
      const timer = setTimeout(() => setShowBanner(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium',
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-yellow-500 text-yellow-900'
      )}
    >
      {isOnline
        ? 'Connexion retablie'
        : 'Vous etes hors ligne - Certaines fonctionnalites peuvent etre limitees'}
    </div>
  );
}

// Update available banner
export function UpdateAvailableBanner() {
  const { isUpdateAvailable, updateServiceWorker } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isUpdateAvailable || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-primary text-primary-foreground rounded-xl shadow-lg p-4 z-50">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm">
          Une nouvelle version est disponible!
        </p>
        <div className="flex gap-2">
          <button
            onClick={updateServiceWorker}
            className="px-3 py-1.5 bg-white text-primary rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
          >
            Mettre a jour
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
