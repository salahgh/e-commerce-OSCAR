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
      container: 'bg-green-900/30 border-green-500/30',
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      title: 'text-green-300',
      text: 'text-green-400',
    },
    error: {
      container: 'bg-red-900/30 border-red-500/30',
      icon: <XCircle className="h-5 w-5 text-red-400" />,
      title: 'text-red-300',
      text: 'text-red-400',
    },
    warning: {
      container: 'bg-yellow-900/30 border-yellow-500/30',
      icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
      title: 'text-yellow-300',
      text: 'text-yellow-400',
    },
    info: {
      container: 'bg-blue-900/30 border-blue-500/30',
      icon: <Info className="h-5 w-5 text-blue-400" />,
      title: 'text-blue-300',
      text: 'text-blue-400',
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
