import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, children, className }) => {
  const variantConfig = {
    success: {
      container: 'bg-success/10 border-success/30',
      icon: <CheckCircle className="h-5 w-5 text-success" />,
      title: 'text-success',
      text: 'text-success/80',
    },
    error: {
      container: 'bg-destructive/10 border-destructive/30',
      icon: <XCircle className="h-5 w-5 text-destructive" />,
      title: 'text-destructive',
      text: 'text-destructive/80',
    },
    warning: {
      container: 'bg-warning/10 border-warning/30',
      icon: <AlertCircle className="h-5 w-5 text-warning" />,
      title: 'text-warning',
      text: 'text-warning/80',
    },
    info: {
      container: 'bg-primary/10 border-primary/30',
      icon: <Info className="h-5 w-5 text-primary" />,
      title: 'text-primary',
      text: 'text-primary/80',
    },
  };

  const config = variantConfig[variant];

  return (
    <div className={cn('border rounded-lg p-4', config.container, className)}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="flex-1">
          {title && <h3 className={cn('font-medium mb-1', config.title)}>{title}</h3>}
          <div className={cn('text-sm', config.text)}>{children}</div>
        </div>
      </div>
    </div>
  );
};
