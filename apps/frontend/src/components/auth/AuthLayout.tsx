'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  const params = useParams();
  const locale = params?.locale as string;
  const isRTL = locale === 'ar';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card py-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-1">
            <span className="text-2xl font-bold text-primary">OSCAR</span>
            <span className="text-2xl font-light text-muted-foreground">Fashion</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className={cn('w-full max-w-md', className)}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OSCAR Fashion.{' '}
            {isRTL ? 'جميع الحقوق محفوظة' : 'Tous droits réservés'}
          </p>
        </div>
      </footer>
    </div>
  );
}
