'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  detectFacetType,
  type FacetGroup,
  type FacetDisplayType,
} from '@oscar/shared';
import { Checkbox, ColorSwatch, SizeButton } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface FacetFiltersProps {
  groups: FacetGroup[];
  selected: Set<string>;
  onToggle: (valueId: string) => void;
  className?: string;
}

export function FacetFilters({ groups, selected, onToggle, className }: FacetFiltersProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {groups.map((group) => (
        <FacetGroupPanel
          key={group.id}
          group={group}
          selected={selected}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function FacetGroupPanel({
  group,
  selected,
  onToggle,
}: {
  group: FacetGroup;
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(true);
  const type: FacetDisplayType = group.displayType ?? detectFacetType(group.code);

  return (
    <div className="border-b border-border pb-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-start"
      >
        <span className="text-14 font-medium text-content-strong">{group.name}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-content-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="pt-1">
          {type === 'color-swatch' ? (
            <div className="flex flex-wrap gap-2">
              {group.values.map((v) => (
                <ColorSwatch
                  key={v.id}
                  hex={v.colorHex ?? (v.code.match(/^#/) ? v.code : '#999999')}
                  selected={selected.has(v.id)}
                  onClick={() => onToggle(v.id)}
                  title={`${v.name} (${v.count})`}
                  aria-label={`${v.name} (${v.count})`}
                />
              ))}
            </div>
          ) : type === 'size-button' ? (
            <div className="flex flex-wrap gap-2">
              {group.values.map((v) => (
                <SizeButton
                  key={v.id}
                  selected={selected.has(v.id)}
                  onClick={() => onToggle(v.id)}
                  title={`${v.count}`}
                >
                  {v.name}
                </SizeButton>
              ))}
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {group.values.map((v) => (
                <li key={v.id} className="flex items-center justify-between">
                  <Checkbox
                    label={v.name}
                    checked={selected.has(v.id)}
                    onChange={() => onToggle(v.id)}
                  />
                  <span className="text-12 text-content-muted">{v.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
