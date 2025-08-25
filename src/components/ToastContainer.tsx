import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast, { ToastMessage } from './Toast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ 
  toasts, 
  onClose, 
  position = 'top-right',
  maxToasts = 5 
}) => {
  // Limiter le nombre de toasts affichés
  const visibleToasts = toasts.slice(0, maxToasts);

  const getContainerStyles = () => {
    const baseStyles = "fixed z-50 flex flex-col gap-3 pointer-events-none";
    
    switch (position) {
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'top-center':
        return `${baseStyles} top-4 left-1/2 transform -translate-x-1/2`;
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      case 'bottom-center':
        return `${baseStyles} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  return (
    <div className={getContainerStyles()}>
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((toast, index) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, scale: 0.8 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              delay: index * 0.1 
            }}
            style={{ 
              zIndex: 50 - index,
              pointerEvents: 'auto'
            }}
          >
            <Toast
              message={toast}
              onClose={onClose}
              position={position}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

