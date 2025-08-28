import { useState, useCallback, useRef } from 'react';
import { ToastMessage } from '../components/Toast';

interface UseToastOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
  defaultDuration?: number;
}

interface ToastOptions {
  title?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = (options: UseToastOptions = {}) => {
  const {
    position = 'top-right',
    maxToasts = 5,
    defaultDuration = 5000
  } = options;

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${++toastIdRef.current}`;
  }, []);

  const addToast = useCallback((
    type: ToastMessage['type'],
    message: string,
    toastOptions: ToastOptions = {}
  ) => {
    const {
      title,
      duration = defaultDuration,
      persistent = false,
      action
    } = toastOptions;

    const newToast: ToastMessage = {
      id: generateId(),
      type,
      title: title || getDefaultTitle(type),
      message,
      duration: persistent ? undefined : duration,
      persistent,
      action,
      position
    };

    setToasts(prev => {
      const newToasts = [newToast, ...prev];
      // Limiter le nombre de toasts
      return newToasts.slice(0, maxToasts);
    });

    return newToast.id;
  }, [position, maxToasts, defaultDuration, generateId]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => {
    return addToast('success', message, options);
  }, [addToast]);

  const error = useCallback((message: string, options?: ToastOptions) => {
    return addToast('error', message, options);
  }, [addToast]);

  const warning = useCallback((message: string, options?: ToastOptions) => {
    return addToast('warning', message, options);
  }, [addToast]);

  const info = useCallback((message: string, options?: ToastOptions) => {
    return addToast('info', message, options);
  }, [addToast]);

  const getDefaultTitle = (type: ToastMessage['type']): string => {
    switch (type) {
      case 'success':
        return 'Succès';
      case 'error':
        return 'Erreur';
      case 'warning':
        return 'Attention';
      case 'info':
        return 'Information';
      default:
        return 'Notification';
    }
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
    position
  };
};

export default useToast;

