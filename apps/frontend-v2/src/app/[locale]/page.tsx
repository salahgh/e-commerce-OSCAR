import { setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-5xl px-6 py-24">
      <div className="flex flex-col gap-6 text-center">
        <p className="text-12 uppercase tracking-wide text-content-muted">OSCAR Najar · v2 scaffold</p>
        <h1 className="text-36 font-bold text-content-strong">
          الواجهة الجديدة تعمل
        </h1>
        <p className="text-18 text-content-muted">
          The frontend-v2 wiring is live. Apollo, i18n ({locale}), Auth, and Cart providers
          are mounted. Design system primitives land next in Phase 2.
        </p>
        <div className="mx-auto flex flex-wrap gap-3 pt-6">
          <span className="rounded bg-state-info-bg px-3 py-2 text-12 font-medium text-state-info-content">
            Apollo
          </span>
          <span className="rounded bg-state-success-bg px-3 py-2 text-12 font-medium text-state-success-content">
            i18n
          </span>
          <span className="rounded bg-state-warning-bg px-3 py-2 text-12 font-medium text-state-warning-content">
            Auth
          </span>
          <span className="rounded bg-state-danger-bg px-3 py-2 text-12 font-medium text-state-danger-content">
            Cart
          </span>
        </div>
      </div>
    </main>
  );
}
