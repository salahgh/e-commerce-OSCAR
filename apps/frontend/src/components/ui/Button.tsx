import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  // Base — all buttons
  'inline-flex items-center justify-center rounded gap-2 font-medium transition-colors duration-fast ease-standard outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap',
  {
    variants: {
      intent: {
        primary:
          'bg-accent text-accent-content hover:bg-accent-hover active:bg-accent-pressed disabled:bg-accent-disabled disabled:text-content-inverse',
        secondary:
          'bg-bg-base text-content-strong border border-border-strong hover:bg-bg-subtle active:bg-bg-muted disabled:bg-bg-muted',
        ghost:
          'bg-transparent text-content-strong hover:bg-bg-subtle active:bg-bg-muted disabled:text-content-subtle',
        link:
          'bg-transparent text-content-strong underline-offset-4 hover:underline px-0 h-auto',
        danger:
          'bg-state-danger-border text-content-inverse hover:bg-state-danger-content disabled:bg-state-danger-bg disabled:text-state-danger-content',
      },
      size: {
        sm: 'h-8 px-4 py-2 text-12',
        md: 'h-10 px-4 py-2 text-14',
        lg: 'h-12 px-4 py-2 text-18',
        // iconOnly variants — square aspect
        'icon-sm': 'h-8 w-8 p-0',
        'icon-md': 'h-10 w-10 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: { true: 'w-full', false: '' },
    },
    defaultVariants: { intent: 'primary', size: 'md', fullWidth: false },
  },
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, intent, size, fullWidth, asChild = false, loading = false, disabled, leadingIcon, trailingIcon, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;
    // When `asChild` is true, Slot expects exactly one React element child
    // (e.g. a <Link>). The caller is responsible for arranging icons inside it.
    const content = asChild ? (
      children
    ) : (
      <>
        {loading ? <Spinner /> : leadingIcon}
        {children}
        {!loading && trailingIcon}
      </>
    );
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ intent, size, fullWidth }), className)}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export { buttonVariants };
