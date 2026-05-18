'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type DivProps = React.ComponentPropsWithoutRef<'div'>;
type RadixContentProps = React.ComponentProps<typeof DialogPrimitive.Content>;
type RadixOverlayProps = React.ComponentProps<typeof DialogPrimitive.Overlay>;
type RadixTitleProps = React.ComponentProps<typeof DialogPrimitive.Title>;
type RadixDescriptionProps = React.ComponentProps<typeof DialogPrimitive.Description>;

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

export function DialogOverlay({
  className,
  ...props
}: RadixOverlayProps & { className?: string }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-overlay bg-bg-overlay backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export function DialogContent({
  className,
  children,
  hideClose,
  ...props
}: RadixContentProps & DivProps & { hideClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-modal w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded border border-border bg-bg-elevated p-6 shadow-overlay data-[state=open]:animate-slide-up focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="Fermer"
            className="absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded text-content-muted transition-colors hover:bg-bg-muted hover:text-content-strong"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  className,
  ...props
}: RadixTitleProps & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-24 font-bold text-content-strong', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: RadixDescriptionProps & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-14 text-content-muted', className)}
      {...props}
    />
  );
}
