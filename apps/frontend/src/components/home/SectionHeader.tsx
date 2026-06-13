import { ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface SectionHeaderProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}

/** "وصل حديثا … عرض الكل" — section title with an optional view-all link. */
export function SectionHeader({ title, viewAllHref, viewAllLabel }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-24 font-bold text-content-strong">{title}</h2>
      {viewAllHref && viewAllLabel && (
        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1 text-16 text-content-muted transition-colors hover:text-content-strong"
        >
          <span>{viewAllLabel}</span>
          <ArrowLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
        </Link>
      )}
    </div>
  );
}
