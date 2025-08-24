import React, { useState, useEffect } from 'react';
import { Edit3, CheckCircle, RotateCcw } from 'lucide-react';
import { SpaceContentService } from '../services/spaceContentService';
import { useAuth } from '../hooks/useAuth';

interface SpaceContentIndicatorProps {
  language: 'fr' | 'en';
  onReset?: () => void;
}

const SpaceContentIndicator: React.FC<SpaceContentIndicatorProps> = ({ language, onReset }) => {
  const [hasModifications, setHasModifications] = useState(false);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const checkModifications = () => {
      setHasModifications(SpaceContentService.hasSavedContent());
      setLastModified(SpaceContentService.getLastModified());
    };

    // Vérifier au chargement
    checkModifications();

    // Écouter les événements de mise à jour
    const handleSpaceContentUpdate = () => {
      checkModifications();
    };

    window.addEventListener('spaceContentUpdated', handleSpaceContentUpdate);
    
    return () => {
      window.removeEventListener('spaceContentUpdated', handleSpaceContentUpdate);
    };
  }, []);

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les modifications ? Cette action ne peut pas être annulée.')) {
      SpaceContentService.resetContent();
      setHasModifications(false);
      setLastModified(null);
      onReset?.();
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('spaceContentUpdated'));
    }
  };

  // Ne s'afficher que pour les administrateurs et s'il y a des modifications
  if (!isAdmin() || !hasModifications) {
    return null;
  }

  const translations = {
    fr: {
      modified: 'Contenu modifié',
      lastModified: 'Dernière modification',
      reset: 'Réinitialiser'
    },
    en: {
      modified: 'Content modified',
      lastModified: 'Last modified',
      reset: 'Reset'
    }
  };

  const t = translations[language];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-green-200 p-4 max-w-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {t.modified}
            </p>
            {lastModified && (
              <p className="text-xs text-gray-500">
                {t.lastModified}: {new Date(lastModified).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={handleReset}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              title={t.reset}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceContentIndicator;
