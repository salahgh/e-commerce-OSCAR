import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className,
}) => {
  const variantConfig = {
    success: {
      container: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'text-green-800',
      text: 'text-green-700',
    },
    error: {
      container: 'bg-red-50 border-red-200',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
      title: 'text-red-800',
      text: 'text-red-700',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
      title: 'text-yellow-800',
      text: 'text-yellow-700',
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: 'text-blue-800',
      text: 'text-blue-700',
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
