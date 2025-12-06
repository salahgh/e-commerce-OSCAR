import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { removeToast } from '../../store/slices/uiSlice';

const ToastIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
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
    success: 'bg-gray-800 border-green-500',
    error: 'bg-gray-800 border-red-500',
    warning: 'bg-gray-800 border-yellow-500',
    info: 'bg-gray-800 border-blue-500',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 max-w-sm w-full border border-gray-700',
        typeClasses[type]
      )}
    >
      <div className="flex-shrink-0">
        <ToastIcon type={type} />
      </div>
      <div className="flex-1 text-sm text-gray-100">{message}</div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
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
