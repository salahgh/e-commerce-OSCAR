'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SortOption {
  value: string;
  label: string;
  sortBy: 'name' | 'price' | 'createdAt';
  sortOrder: 'ASC' | 'DESC';
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Plus recents', sortBy: 'createdAt', sortOrder: 'DESC' },
  { value: 'price-asc', label: 'Prix croissant', sortBy: 'price', sortOrder: 'ASC' },
  { value: 'price-desc', label: 'Prix decroissant', sortBy: 'price', sortOrder: 'DESC' },
  { value: 'name-asc', label: 'Nom (A-Z)', sortBy: 'name', sortOrder: 'ASC' },
  { value: 'name-desc', label: 'Nom (Z-A)', sortBy: 'name', sortOrder: 'DESC' },
];

interface SortDropdownProps {
  currentSortBy: string;
  currentSortOrder: string;
  onSortChange: (sortBy: 'name' | 'price' | 'createdAt', sortOrder: 'ASC' | 'DESC') => void;
  className?: string;
}

export function SortDropdown({
  currentSortBy,
  currentSortOrder,
  onSortChange,
  className,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find current selection
  const currentOption = SORT_OPTIONS.find(
    (opt) => opt.sortBy === currentSortBy && opt.sortOrder === currentSortOrder
  ) || SORT_OPTIONS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (option: SortOption) => {
    onSortChange(option.sortBy, option.sortOrder);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl',
          'text-sm font-medium text-foreground',
          'hover:border-primary/50 transition-colors',
          isOpen && 'border-primary ring-2 ring-primary/20'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <span className="hidden sm:inline">Trier par:</span>
        <span className="font-semibold">{currentOption.label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-2"
          role="listbox"
        >
          {SORT_OPTIONS.map((option) => {
            const isSelected = option.value === currentOption.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2.5 text-sm',
                  'transition-colors',
                  isSelected
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                )}
                role="option"
                aria-selected={isSelected}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
