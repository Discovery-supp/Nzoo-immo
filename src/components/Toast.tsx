import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Bell,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
  position?: string;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, position = 'top-right' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (message.persistent) return;

    const duration = message.duration || 5000;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;
      setProgress(newProgress);

      if (remaining <= 0) {
        setIsVisible(false);
        setTimeout(() => onClose(message.id), 300);
      } else {
        requestAnimationFrame(updateProgress);
      }
    };

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(message.id), 300);
    }, duration);

    requestAnimationFrame(updateProgress);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "relative overflow-hidden rounded-xl shadow-lg border-l-4 backdrop-blur-sm";
    
    switch (message.type) {
      case 'success':
        return `${baseStyles} bg-green-50/95 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50/95 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/95 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseStyles} bg-blue-50/95 border-blue-500 text-blue-800`;
      default:
        return `${baseStyles} bg-gray-50/95 border-gray-500 text-gray-800`;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed z-50 max-w-sm w-full ${getPositionStyles()}`}
        >
          <div className={getStyles()}>
            {/* Progress bar */}
            {!message.persistent && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                <motion.div
                  className="h-full bg-current opacity-30"
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm leading-5 mb-1">
                        {message.title}
                      </h4>
                      <p className="text-sm leading-5 opacity-90">
                        {message.message}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsVisible(false);
                        setTimeout(() => onClose(message.id), 300);
                      }}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Action button */}
                  {message.action && (
                    <div className="mt-3">
                      <button
                        onClick={message.action.onClick}
                        className="text-sm font-medium underline hover:no-underline transition-all"
                      >
                        {message.action.label}
                      </button>
                    </div>
                  )}

                  {/* Duration indicator */}
                  {!message.persistent && (
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-60">
                      <Clock className="w-3 h-3" />
                      <span>Auto-fermeture dans {Math.ceil(progress / 20)}s</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

