'use client';

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-32 text-center">
      <p className="text-12 uppercase tracking-wide text-state-danger-content">Erreur</p>
      <h1 className="mt-4 text-36 font-bold text-content-strong">Une erreur est survenue</h1>
      <p className="mt-4 text-16 text-content-muted">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-10 items-center rounded-md bg-accent px-4 text-14 font-medium text-accent-content transition hover:bg-accent-hover"
      >
        Réessayer
      </button>
    </main>
  );
}
