import React, { useState } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { SpaceContentService } from '../services/spaceContentService';

interface DeleteSpaceModalProps {
  spaceKey: string;
  spaceTitle: string;
  language: 'fr' | 'en';
  onClose: () => void;
  onSpaceDeleted: (deletedSpaceKey: string) => void;
}

const DeleteSpaceModal: React.FC<DeleteSpaceModalProps> = ({ 
  spaceKey, 
  spaceTitle, 
  language, 
  onClose, 
  onSpaceDeleted 
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const translations = {
    fr: {
      title: 'Supprimer l\'espace',
      subtitle: 'Êtes-vous sûr de vouloir supprimer cet espace ?',
      warning: 'Cette action ne peut pas être annulée.',
      delete: 'Supprimer définitivement',
      cancel: 'Annuler',
      success: 'Espace supprimé avec succès !',
      error: 'Erreur lors de la suppression'
    },
    en: {
      title: 'Delete space',
      subtitle: 'Are you sure you want to delete this space?',
      warning: 'This action cannot be undone.',
      delete: 'Delete permanently',
      cancel: 'Cancel',
      success: 'Space deleted successfully!',
      error: 'Error deleting space'
    }
  };

  const t = translations[language];

  const handleDelete = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Récupérer les données actuelles
      const currentData = await SpaceContentService.getSavedContent(language);
      
      if (!currentData) {
        setMessage({ type: 'error', text: t.error });
        return;
      }

      // Supprimer l'espace
      const { [spaceKey]: deletedSpace, ...remainingData } = currentData;
      
      // Sauvegarder les données mises à jour
      await SpaceContentService.saveContent(remainingData, language);

      setMessage({ type: 'success', text: t.success });
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('spaceContentUpdated', {
        detail: { updatedData: remainingData, language }
      }));

      // Appeler la fonction de mise à jour parent immédiatement
      onSpaceDeleted(spaceKey);

    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
                <p className="text-gray-600 text-sm">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-1">
                  Espace à supprimer : {spaceTitle}
                </h3>
                <p className="text-red-700 text-sm">
                  {t.warning}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              {t.cancel}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Suppression...' : t.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSpaceModal;
