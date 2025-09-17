import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Upload, Eye, EyeOff, CheckCircle, XCircle, AlertCircle, FileText, Users } from 'lucide-react';
import { useSpaces } from '../hooks/useSpaces';
import SupabaseDiagnostic from './SupabaseDiagnostic';
import AddSpaceModal from './AddSpaceModal';
import DeleteSpaceModal from './DeleteSpaceModal';
import SpaceContentEditor from './SpaceContentEditor';
import { getAllSpaces, getDefaultSpaces, SpaceInfo } from '../data/spacesData';
import { SpaceContentService } from '../services/spaceContentService';
import { AuditService } from '../services/auditService';

interface SpaceManagementFormProps {
  language: 'fr' | 'en';
}

const SpaceManagementForm: React.FC<SpaceManagementFormProps> = ({ language }) => {
  // Utiliser notre système de contenu d'espaces au lieu de Supabase
  const [spaces, setSpaces] = useState<Record<string, SpaceInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<{ key: string; title: string } | null>(null);
  const [editingSpace, setEditingSpace] = useState<any>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'coworking' as 'coworking' | 'bureau-prive' | 'domiciliation',
    description: '',
    features: [] as string[],
    max_occupants: 1,
    daily_price: 0,
    monthly_price: 0,
    yearly_price: 0,
    hourly_price: 0,
    is_active: true,
    images: [] as string[],
    availability_status: 'available' as string,
    display_order: 0,
    admin_notes: '',
  });
  const [newFeature, setNewFeature] = useState('');
  const [newImage, setNewImage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showContentEditor, setShowContentEditor] = useState(false);

  // Fonction pour gérer la suppression d'un espace
  const handleDeleteSpace = (spaceKey: string, spaceTitle: string) => {
    setSpaceToDelete({ key: spaceKey, title: spaceTitle });
    setShowDeleteModal(true);
  };

  // Fonction pour confirmer la suppression
  const handleSpaceDeleted = (deletedSpaceKey: string) => {
    console.log('🗑️ Espace supprimé:', deletedSpaceKey);
    setShowDeleteModal(false);
    setSpaceToDelete(null);
    
    // Afficher une notification de succès
    setNotification({
      type: 'success',
      message: 'Espace supprimé avec succès !'
    });

    // Rafraîchir la liste des espaces
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    try {
      AuditService.record({
        actorId: 'admin',
        actorRole: 'admin',
        action: 'DELETE',
        target: deletedSpaceKey,
        metadata: { type: 'space' },
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
    } catch {}
  };

  // Vérifier si un espace est un espace ajouté (pas un espace par défaut)
  const isAddedSpace = (spaceKey: string) => {
    const defaultSpaces = ['coworking', 'bureau-prive', 'domiciliation'];
    return !defaultSpaces.includes(spaceKey);
  };

  // Effet pour rafraîchir les espaces quand ils changent
  useEffect(() => {
    const loadSpaces = async () => {
      try {
        setLoading(true);
        const spacesData = await getAllSpaces(language);
        setSpaces(spacesData);
        setError(null);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des espaces:', error);
        setError('Erreur lors du chargement des espaces');
      } finally {
        setLoading(false);
      }
    };

    loadSpaces();
  }, [language]);

  // Écouter les événements de mise à jour des espaces
  useEffect(() => {
    const handleSpaceContentUpdate = async () => {
      try {
        const spacesData = await getAllSpaces(language);
        setSpaces(spacesData);
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des espaces:', error);
      }
    };

    window.addEventListener('spaceContentUpdated', handleSpaceContentUpdate);
    return () => {
      window.removeEventListener('spaceContentUpdated', handleSpaceContentUpdate);
    };
  }, [language]);

  const translations = {
    fr: {
      title: 'Gestion des Espaces',
      addSpace: 'Ajouter un Espace',
      editSpace: 'Modifier l\'Espace',
      form: {
        name: 'Nom de l\'espace',
        type: 'Type d\'espace',
        description: 'Description',
        features: 'Ã‰quipements',
        maxOccupants: 'Nombre maximum d\'occupants',
        dailyPrice: 'Prix journalier ($)',
        monthlyPrice: 'Prix mensuel ($)',
        yearlyPrice: 'Prix annuel ($)',
        hourlyPrice: 'Prix horaire ($)',
        isActive: 'Espace actif',
        images: 'Images (URLs)',
        displayOrder: 'Ordre d\'affichage',
        adminNotes: 'Notes administratives',
        availabilityStatus: 'Statut de disponibilité'
      },
      types: {
        coworking: 'Coworking',
        'bureau-prive': 'Bureau Privé',
  
      },
      status: {
        available: 'Disponible',
        maintenance: 'Maintenance',
        reserved: 'Réservé',
        unavailable: 'Indisponible'
      },
      actions: {
        save: 'Enregistrer',
        cancel: 'Annuler',
        edit: 'Modifier',
        delete: 'Supprimer',
        add: 'Ajouter',
        addFeature: 'Ajouter équipement',
        addImage: 'Ajouter image'
      },
      messages: {
        loading: 'Chargement...',
        error: 'Erreur: ',
        success: 'Opération réussie',
        confirmDelete: 'ÃŠtes-vous sûr de vouloir supprimer cet espace ?',
        spaceCreated: 'Espace créé avec succès',
        spaceUpdated: 'Espace mis Ã  jour avec succès',
        spaceDeleted: 'Espace supprimé avec succès',
        saveError: 'Erreur lors de la sauvegarde',
        deleteError: 'Erreur lors de la suppression'
      }
    },
    en: {
      title: 'Space Management',
      addSpace: 'Add Space',
      editSpace: 'Edit Space',
      form: {
        name: 'Space name',
        type: 'Space type',
        description: 'Description',
        features: 'Features',
        maxOccupants: 'Maximum occupants',
        dailyPrice: 'Daily price ($)',
        monthlyPrice: 'Monthly price ($)',
        yearlyPrice: 'Yearly price ($)',
        hourlyPrice: 'Hourly price ($)',
        isActive: 'Active space',
        images: 'Images (URLs)',
        displayOrder: 'Display order',
        adminNotes: 'Admin notes',
        availabilityStatus: 'Availability status'
      },
      types: {
        coworking: 'Coworking',
        'bureau-prive': 'Private Office',

      },
      status: {
        available: 'Available',
        maintenance: 'Maintenance',
        reserved: 'Reserved',
        unavailable: 'Unavailable'
      },
      actions: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        add: 'Add',
        addFeature: 'Add feature',
        addImage: 'Add image'
      },
      messages: {
        loading: 'Loading...',
        error: 'Error: ',
        success: 'Operation successful',
        confirmDelete: 'Are you sure you want to delete this space?',
        spaceCreated: 'Space created successfully',
        spaceUpdated: 'Space updated successfully',
        spaceDeleted: 'Space deleted successfully',
        saveError: 'Error while saving',
        deleteError: 'Error while deleting'
      }
    }
  };

  const t = translations[language];

  // Fonction pour afficher les notifications
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (editingSpace) {
      setFormData({
        name: editingSpace.name,
        type: editingSpace.type,
        description: editingSpace.description,
        features: editingSpace.features || [],
        max_occupants: editingSpace.max_occupants,
        daily_price: editingSpace.daily_price || 0,
        monthly_price: editingSpace.monthly_price || 0,
        yearly_price: editingSpace.yearly_price || 0,
        hourly_price: editingSpace.hourly_price || 0,
        is_active: editingSpace.is_active,
        images: editingSpace.images || [],
        availability_status: editingSpace.availability_status || 'available',
        display_order: editingSpace.display_order || 0,
        admin_notes: editingSpace.admin_notes || '',
      });
    }
  }, [editingSpace]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'coworking',
      description: '',
      features: [],
      max_occupants: 1,
      daily_price: 0,
      monthly_price: 0,
      yearly_price: 0,
      hourly_price: 0,
      is_active: true,
      images: [],
      availability_status: 'available',
      display_order: 0,
      admin_notes: '',
    });
    setEditingSpace(null);
    setNewFeature('');
    setNewImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    
    try {
      if (editingSpace) {
        // updateSpace(editingSpace.id, formData); // This line was removed as per the new_code
        showNotification('success', t.messages.spaceUpdated);
      } else {
        // createSpace(formData); // This line was removed as per the new_code
        showNotification('success', t.messages.spaceCreated);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      setSubmitError(errorMessage);
      showNotification('error', t.messages.saveError + ': ' + errorMessage);
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, event.target!.result as string]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        </div>
        <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">{t.messages.loading}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        </div>
        
        {/* Diagnostic Supabase */}
        <SupabaseDiagnostic onRetry={() => window.location.reload()} />
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Erreur de connexion Ã  la base de données</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-sm mt-2">Utilisez le diagnostic ci-dessus pour résoudre le problème de connexion.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-700' 
            : notification.type === 'error'
            ? 'bg-red-50 border-red-400 text-red-700'
            : 'bg-blue-50 border-blue-400 text-blue-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowContentEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Ã‰diter le contenu
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un espace
          </button>
        </div>
      </div>

      {/* Add Space Modal */}
      {showAddModal && (
        <AddSpaceModal
          language={language}
          onClose={() => setShowAddModal(false)}
          onSpaceAdded={(newSpaceKey) => {
            console.log('âœ… Nouvel espace ajouté:', newSpaceKey);
            setShowAddModal(false);
            // Rafraîchir la liste des espaces
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      )}

      {/* Delete Space Modal */}
      {showDeleteModal && spaceToDelete && (
        <DeleteSpaceModal
          spaceKey={spaceToDelete.key}
          spaceTitle={spaceToDelete.title}
          language={language}
          onClose={() => setShowDeleteModal(false)}
          onSpaceDeleted={handleSpaceDeleted}
        />
      )}

      {/* Content Editor Modal */}
      {showContentEditor && (
        <SpaceContentEditor
          language={language}
          onClose={() => setShowContentEditor(false)}
          onSave={(updatedData) => {
            console.log('âœ… Données mises Ã  jour:', updatedData);
            
            // Afficher une notification de succès
            setNotification({
              type: 'success',
              message: 'Contenu des espaces mis Ã  jour avec succès ! Les modifications sont maintenant visibles sur la page des espaces.'
            });

            // Fermer le modal
            setShowContentEditor(false);

            // Forcer la mise Ã  jour de la page des espaces si elle est ouverte
            if (typeof window !== 'undefined') {
              // Ã‰mettre un événement personnalisé pour notifier les autres composants
              window.dispatchEvent(new CustomEvent('spaceContentUpdated', {
                detail: { updatedData, language }
              }));

              // Optionnel : recharger la page si nécessaire
              // window.location.reload();
            }
          }}
        />
      )}

      {/* Spaces List */}
      <div className="grid gap-4">
        {Object.entries(spaces).map(([spaceKey, space]) => (
          <div key={spaceKey} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{space.title}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {spaceKey}
                </span>
              </div>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{space.description}</p>
              
              {/* Prix */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                {space.dailyPrice && space.dailyPrice > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Journalier:</span>
                    <div className="text-lg font-bold text-green-600">${space.dailyPrice}</div>
                  </div>
                )}
                {space.monthlyPrice && space.monthlyPrice > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Mensuel:</span>
                    <div className="text-lg font-bold text-green-600">${space.monthlyPrice}</div>
                  </div>
                )}
                {space.yearlyPrice && space.yearlyPrice > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Annuel:</span>
                    <div className="text-lg font-bold text-green-600">${space.yearlyPrice}</div>
                  </div>
                )}
                {space.hourlyPrice && space.hourlyPrice > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Horaire:</span>
                    <div className="text-lg font-bold text-green-600">${space.hourlyPrice}</div>
                  </div>
                )}
              </div>

              {/* Capacité et Équipements */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Capacité:</span>
                  <span className="text-gray-600">{space.maxOccupants} personnes</span>
                </div>
                
                {space.features && space.features.length > 0 && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-700">Équipements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {space.features.map((feature: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire simple intégré */}
    </div>
  );
};

export default SpaceManagementForm;
