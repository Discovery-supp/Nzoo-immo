import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface SessionManagerProps {
  showExpirationWarning?: boolean;
  className?: string;
}

const SessionManager: React.FC<SessionManagerProps> = ({ 
  showExpirationWarning = true, 
  className = '' 
}) => {
  const { 
    user, 
    isAuthenticated, 
    extendSession, 
    getTimeUntilExpiration, 
    isSessionExpiringSoon,
    sessionExpiresAt,
    sessionConfig 
  } = useAuth();
  
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showWarning, setShowWarning] = useState<boolean>(false);

  // Mettre à jour le temps restant toutes les minutes
  useEffect(() => {
    if (!isAuthenticated || !sessionExpiresAt) {
      setTimeLeft(0);
      return;
    }

    const updateTimeLeft = () => {
      const remaining = getTimeUntilExpiration();
      setTimeLeft(remaining);
      
      // Afficher l'avertissement si la session expire bientôt
      if (showExpirationWarning && isSessionExpiringSoon()) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Mise à jour toutes les minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionExpiresAt, getTimeUntilExpiration, isSessionExpiringSoon, showExpirationWarning]);

  // Formater le temps restant en format lisible
  const formatTimeLeft = (milliseconds: number): string => {
    if (milliseconds <= 0) return 'Expirée';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return 'Moins d\'1m';
    }
  };

  // Calculer le pourcentage de temps restant
  const getSessionProgress = (): number => {
    if (!sessionExpiresAt || !isAuthenticated) return 0;
    
    const totalDuration = sessionConfig.DURATION;
    const remaining = getTimeUntilExpiration();
    const elapsed = totalDuration - remaining;
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  const handleExtendSession = () => {
    extendSession();
    setShowWarning(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={`session-manager ${className}`}>
      {/* Barre de progression de la session */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Session active</span>
          <span>{formatTimeLeft(timeLeft)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              timeLeft < 30 * 60 * 1000 ? 'bg-red-500' : 
              timeLeft < 60 * 60 * 1000 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${100 - getSessionProgress()}%` }}
          />
        </div>
      </div>

      {/* Avertissement d'expiration */}
      {showWarning && showExpirationWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Session expirant bientôt
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Votre session expire dans {formatTimeLeft(timeLeft)}. 
                  Voulez-vous la renouveler ?
                </p>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleExtendSession}
                  className="bg-yellow-600 text-white px-3 py-1.5 text-xs font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Renouveler
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="bg-yellow-100 text-yellow-800 px-3 py-1.5 text-xs font-medium rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations de session (optionnel) */}
      <div className="text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Utilisateur:</span>
          <span className="font-medium">{user.username}</span>
        </div>
        <div className="flex justify-between">
          <span>Rôle:</span>
          <span className="font-medium capitalize">{user.role}</span>
        </div>
        {sessionExpiresAt && (
          <div className="flex justify-between">
            <span>Expire le:</span>
            <span className="font-medium">
              {new Date(sessionExpiresAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionManager;
