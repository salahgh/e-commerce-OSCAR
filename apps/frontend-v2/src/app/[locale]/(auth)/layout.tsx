import { Logo } from '@/components/layout';
import { Link } from '@/i18n/routing';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Logo size="md" />
          <Link href="/" className="text-14 text-content-muted hover:text-content-strong">
            Retour à la boutique
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center bg-bg-subtle px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
