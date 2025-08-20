import { useState, useEffect } from 'react';
import { getAllSpaces, getDefaultSpaces } from '../data/spacesData';
import { SpaceContentService } from '../services/spaceContentService';

export const useSpaceContent = (language: 'fr' | 'en') => {
  const [spaces, setSpaces] = useState(getAllSpaces(language));
  const [hasModifications, setHasModifications] = useState(false);
  const [lastModified, setLastModified] = useState<string | null>(null);

  const refreshSpaces = () => {
    const updatedSpaces = getAllSpaces(language);
    setSpaces(updatedSpaces);
    setHasModifications(SpaceContentService.hasSavedContent());
    setLastModified(SpaceContentService.getLastModified());
  };

  const resetToDefault = () => {
    SpaceContentService.resetContent();
    refreshSpaces();
  };

  useEffect(() => {
    refreshSpaces();
  }, [language]);

  useEffect(() => {
    const handleSpaceContentUpdate = () => {
      refreshSpaces();
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
    refreshSpaces,
    resetToDefault
  };
};
