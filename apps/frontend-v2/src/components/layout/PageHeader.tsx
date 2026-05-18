import * as React from 'react';
import { Breadcrumb } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: Array<{ label: React.ReactNode; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 border-b border-border bg-bg-elevated px-6 py-8', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-36 font-bold text-content-strong">{title}</h1>
          {description && <p className="text-16 text-content-muted">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
