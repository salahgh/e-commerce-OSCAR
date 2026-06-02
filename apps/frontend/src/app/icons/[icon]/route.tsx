import { brandIcon } from '@/lib/pwa/icon';

/**
 * Dynamically-rendered PWA / favicon icons. Served at dotted URLs
 * (e.g. /icons/icon-192.png) so the next-intl middleware leaves them alone.
 */
const MAP: Record<string, { size: number; maskable?: boolean }> = {
  'favicon.png': { size: 64 },
  'apple-touch-icon.png': { size: 180 },
  'icon-192.png': { size: 192 },
  'icon-512.png': { size: 512 },
  'maskable-512.png': { size: 512, maskable: true },
};

export async function GET(_req: Request, { params }: { params: Promise<{ icon: string }> }) {
  const { icon } = await params;
  const cfg = MAP[icon];
  if (!cfg) return new Response('Not found', { status: 404 });
  return brandIcon(cfg.size, { maskable: cfg.maskable });
}
