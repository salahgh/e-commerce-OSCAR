import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 py-4">
        <div className="container-custom">
          <Link href="/" className="inline-flex items-center">
            <span className="text-2xl font-bold text-primary">OSCAR</span>
            <span className="text-2xl font-light text-secondary ml-1">Fashion</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        {children}
      </main>
    </div>
  );
}
