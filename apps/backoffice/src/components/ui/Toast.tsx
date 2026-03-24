import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { removeToast } from '../../store/slices/uiSlice';

const ToastIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <XCircle className="h-5 w-5 text-destructive" />,
    warning: <AlertCircle className="h-5 w-5 text-warning" />,
    info: <Info className="h-5 w-5 text-primary" />,
  };
  return icons[type as keyof typeof icons] || icons.info;
};

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const typeClasses = {
    success: 'bg-card border-success',
    error: 'bg-card border-destructive',
    warning: 'bg-card border-warning',
    info: 'bg-card border-primary',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 max-w-sm w-full border border-border',
        typeClasses[type]
      )}
    >
      <div className="flex-shrink-0">
        <ToastIcon type={type} />
      </div>
      <div className="flex-1 text-sm text-foreground">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => dispatch(removeToast(toast.id))}
        />
      ))}
    </div>,
    document.body
  );
};
