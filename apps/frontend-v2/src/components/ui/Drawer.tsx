'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const sideMap = {
  right: 'inset-y-0 end-0 max-w-md w-full data-[state=open]:animate-slide-in-right',
  left: 'inset-y-0 start-0 max-w-md w-full data-[state=open]:animate-slide-in-left',
  bottom: 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-md data-[state=open]:animate-slide-up',
} as const;

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: keyof typeof sideMap;
    hideClose?: boolean;
  }
>(({ className, side = 'right', children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-bg-overlay backdrop-blur-sm data-[state=open]:animate-fade-in" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-modal flex flex-col gap-4 bg-bg-elevated p-6 shadow-overlay focus:outline-none',
        sideMap[side],
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
));
DrawerContent.displayName = 'DrawerContent';

export const DrawerTitle = DialogPrimitive.Title;
export const DrawerDescription = DialogPrimitive.Description;
