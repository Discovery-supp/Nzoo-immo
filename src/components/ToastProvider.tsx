import React, { createContext, useContext, ReactNode } from 'react';
import useToast from '../hooks/useToast';
import ToastContainer from './ToastContainer';
import { ToastMessage } from './Toast';

interface ToastContextType {
  success: (message: string, options?: any) => string;
  error: (message: string, options?: any) => string;
  warning: (message: string, options?: any) => string;
  info: (message: string, options?: any) => string;
  addToast: (type: ToastMessage['type'], message: string, options?: any) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  toasts: ToastMessage[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
  defaultDuration = 5000
}) => {
  const toast = useToast({
    position,
    maxToasts,
    defaultDuration
  });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer
        toasts={toast.toasts}
        onClose={toast.removeToast}
        position={toast.position}
        maxToasts={maxToasts}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;

