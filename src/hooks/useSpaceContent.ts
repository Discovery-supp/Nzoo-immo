import { useState, useEffect } from 'react';
import { getAllSpaces, getDefaultSpaces } from '../data/spacesData';
import { SpaceContentService } from '../services/spaceContentService';

export const useSpaceContent = (language: 'fr' | 'en') => {
  const [spaces, setSpaces] = useState<Record<string, SpaceInfo>>({});
  const [hasModifications, setHasModifications] = useState(false);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSpaces = async () => {
    try {
      setLoading(true);
      const updatedSpaces = await getAllSpaces(language);
      setSpaces(updatedSpaces);
      setHasModifications(SpaceContentService.hasSavedContent());
      setLastModified(SpaceContentService.getLastModified());
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement des espaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = async () => {
    try {
      SpaceContentService.resetContent();
      await refreshSpaces();
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
    }
  };

  useEffect(() => {
    refreshSpaces();
  }, [language]);

  useEffect(() => {
    const handleSpaceContentUpdate = async () => {
      await refreshSpaces();
    };

    window.addEventListener('spaceContentUpdated', handleSpaceContentUpdate);
    
    return () => {
      window.removeEventListener('spaceContentUpdated', handleSpaceContentUpdate);
    };
  }, [language]);

  return {
    spaces,
    hasModifications,
    lastModified,
    loading,
    refreshSpaces,
    resetToDefault
  };
};
