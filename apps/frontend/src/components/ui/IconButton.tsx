import * as React from 'react';
import { Button, type ButtonProps } from './Button';

type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'leadingIcon' | 'trailingIcon'> {
  /** Required for screen readers since there is no visible label. */
  'aria-label': string;
  size?: IconButtonSize;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', children, ...props }, ref) => (
    <Button ref={ref} size={`icon-${size}` as const} {...props}>
      {children}
    </Button>
  ),
);
IconButton.displayName = 'IconButton';
