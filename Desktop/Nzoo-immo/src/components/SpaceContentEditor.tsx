import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Upload, Image, DollarSign, FileText, Eye, Plus, RotateCcw, Loader2 } from 'lucide-react';
import { getAllSpaces, getDefaultSpaces } from '../data/spacesData';
import { SpaceContentService } from '../services/spaceContentService';
import { ImageUploadService } from '../services/imageUploadService';

interface SpaceContentEditorProps {
  language: 'fr' | 'en';
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

interface SpaceContent {
  title: string;
  description: string;
  features: string[];
  dailyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  hourlyPrice?: number;
  maxOccupants: number;
  imageUrl?: string;
}

const SpaceContentEditor: React.FC<SpaceContentEditorProps> = ({ language, onClose, onSave }) => {
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [spaceData, setSpaceData] = useState<Record<string, SpaceContent>>({});
  const [originalData, setOriginalData] = useState<Record<string, SpaceContent>>({});
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasModifications, setHasModifications] = useState(false);

  // Charger les données initiales
  useEffect(() => {
    const spaces = getAllSpaces(language);
    setSpaceData(spaces);
    setOriginalData(spaces);
    setHasModifications(SpaceContentService.hasSavedContent());
  }, [language]);

  const handleEditSpace = (spaceKey: string) => {
    setEditingSpace(spaceKey);
  };

  const handleCancelEdit = () => {
    setEditingSpace(null);
    setSpaceData(originalData); // Restaurer les données originales
  };

  const handleSaveSpace = (spaceKey: string) => {
    setLoading(true);
    try {
      // Sauvegarder dans le localStorage ET silencieusement en base de données
      SpaceContentService.saveContent(spaceData, language);
      
      const updatedData = { ...spaceData };
      setOriginalData(updatedData);
      setEditingSpace(null);
      setHasModifications(true);
      setMessage({ type: 'success', text: 'Espace mis à jour avec succès et sauvegardé' });
      
      // Appeler la fonction de sauvegarde parent
      onSave(updatedData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les modifications ? Cette action ne peut pas être annulée.')) {
      SpaceContentService.resetContent();
      const defaultSpaces = getDefaultSpaces(language);
      setSpaceData(defaultSpaces);
      setOriginalData(defaultSpaces);
      setHasModifications(false);
      setMessage({ type: 'success', text: 'Données réinitialisées aux valeurs par défaut' });
      
      // Appeler la fonction de sauvegarde parent avec les données par défaut
      onSave(defaultSpaces);
    }
  };

  const updateSpaceField = (spaceKey: string, field: keyof SpaceContent, value: any) => {
    setSpaceData(prev => ({
      ...prev,
      [spaceKey]: {
        ...prev[spaceKey],
        [field]: value
      }
    }));
  };

  const addFeature = (spaceKey: string) => {
    const newFeature = prompt('Ajouter un nouvel équipement:');
    if (newFeature && newFeature.trim()) {
      updateSpaceField(spaceKey, 'features', [
        ...spaceData[spaceKey].features,
        newFeature.trim()
      ]);
    }
  };

  const addNewSpace = () => {
    const spaceName = prompt('Nom du nouvel espace (ex: salle-reunion, bureau-individuel):');
    if (!spaceName || !spaceName.trim()) return;

    const spaceKey = spaceName.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Vérifier si l'espace existe déjà
    if (spaceData[spaceKey]) {
      setMessage({ type: 'error', text: 'Un espace avec ce nom existe déjà' });
      return;
    }

    // Créer le nouvel espace
    const newSpace: SpaceContent = {
      title: spaceName.trim(),
      description: 'Description du nouvel espace',
      features: ['Équipement 1', 'Équipement 2'],
      dailyPrice: 50,
      monthlyPrice: 1000,
      yearlyPrice: 10000,
      maxOccupants: 5
    };

    setSpaceData(prev => ({
      ...prev,
      [spaceKey]: newSpace
    }));

    setMessage({ type: 'success', text: `Nouvel espace "${spaceName}" ajouté avec succès` });
  };

  const removeFeature = (spaceKey: string, index: number) => {
    const updatedFeatures = spaceData[spaceKey].features.filter((_, i) => i !== index);
    updateSpaceField(spaceKey, 'features', updatedFeatures);
  };

  const handleImageUpload = async (spaceKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Valider le fichier
    const validation = ImageUploadService.validateImageFile(file);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.error || 'Erreur de validation' });
      return;
    }

    setImageUploading(spaceKey);
    setMessage(null);

    try {
      // Essayer d'uploader vers Supabase Storage
      const imageUrl = await ImageUploadService.uploadImage(file, spaceKey);
      
      if (imageUrl) {
        // Succès : utiliser l'URL de Supabase
        updateSpaceField(spaceKey, 'imageUrl', imageUrl);
        setMessage({ type: 'success', text: 'Image uploadée avec succès vers le serveur' });
      } else {
        // Fallback : utiliser base64
        const base64Url = await ImageUploadService.imageToBase64(file);
        updateSpaceField(spaceKey, 'imageUrl', base64Url);
        setMessage({ type: 'success', text: 'Image sauvegardée localement (upload serveur échoué)' });
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload d\'image:', error);
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload de l\'image' });
    } finally {
      setImageUploading(null);
    }
  };

  const translations = {
    fr: {
      title: 'Éditeur de Contenu des Espaces',
      subtitle: 'Modifiez les images, descriptions et prix des espaces',
      edit: 'Modifier',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      close: 'Fermer',
      titleLabel: 'Titre',
      descriptionLabel: 'Description',
      featuresLabel: 'Équipements',
      pricesLabel: 'Prix',
      imageLabel: 'Image',
      dailyPrice: 'Prix journalier',
      monthlyPrice: 'Prix mensuel',
      yearlyPrice: 'Prix annuel',
      hourlyPrice: 'Prix horaire',
      maxOccupants: 'Nombre max d\'occupants',
      addFeature: 'Ajouter équipement',
      removeFeature: 'Supprimer',
      uploadImage: 'Changer l\'image',
      preview: 'Aperçu',
      resetToDefault: 'Réinitialiser aux valeurs par défaut',
      modificationsSaved: 'Modifications sauvegardées',
      lastModified: 'Dernière modification'
    },
    en: {
      title: 'Space Content Editor',
      subtitle: 'Edit images, descriptions and prices of spaces',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      titleLabel: 'Title',
      descriptionLabel: 'Description',
      featuresLabel: 'Features',
      pricesLabel: 'Prices',
      imageLabel: 'Image',
      dailyPrice: 'Daily price',
      monthlyPrice: 'Monthly price',
      yearlyPrice: 'Yearly price',
      hourlyPrice: 'Hourly price',
      maxOccupants: 'Max occupants',
      addFeature: 'Add feature',
      removeFeature: 'Remove',
      uploadImage: 'Change image',
      preview: 'Preview',
      resetToDefault: 'Reset to default values',
      modificationsSaved: 'Modifications saved',
      lastModified: 'Last modified'
    }
  };

  const t = translations[language];

  const lastModified = SpaceContentService.getLastModified();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
              {hasModifications && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">{t.modificationsSaved}</span>
                  {lastModified && (
                    <span className="text-xs text-gray-500">
                      ({t.lastModified}: {new Date(lastModified).toLocaleDateString()})
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={addNewSpace}
                className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                title="Ajouter un nouvel espace"
              >
                <Plus className="w-4 h-4" />
                Ajouter un espace
              </button>
              {hasModifications && (
                <button
                  onClick={handleResetToDefault}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                  title={t.resetToDefault}
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.resetToDefault}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
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
        <div className="p-6 space-y-6">
          {Object.entries(spaceData).map(([spaceKey, space]) => (
            <div key={spaceKey} className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 capitalize">
                  {spaceKey.replace('-', ' ')}
                </h3>
                {editingSpace === spaceKey ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveSpace(spaceKey)}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {t.save}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditSpace(spaceKey)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    {t.edit}
                  </button>
                )}
              </div>

              {editingSpace === spaceKey ? (
                <div className="space-y-6">
                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.imageLabel}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={space.imageUrl || `/${spaceKey.replace('-', '_')}.jpg`}
                          alt={space.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
                          }}
                        />
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(spaceKey, e)}
                          className="hidden"
                          id={`image-${spaceKey}`}
                        />
                        <label
                          htmlFor={`image-${spaceKey}`}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                            imageUploading === spaceKey
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {imageUploading === spaceKey ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {imageUploading === spaceKey ? 'Upload en cours...' : t.uploadImage}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.titleLabel}
                    </label>
                    <input
                      type="text"
                      value={space.title}
                      onChange={(e) => updateSpaceField(spaceKey, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.descriptionLabel}
                    </label>
                    <textarea
                      value={space.description}
                      onChange={(e) => updateSpaceField(spaceKey, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {t.featuresLabel}
                      </label>
                      <button
                        onClick={() => addFeature(spaceKey)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <Plus className="w-3 h-3" />
                        {t.addFeature}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {space.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => {
                              const updatedFeatures = [...space.features];
                              updatedFeatures[index] = e.target.value;
                              updateSpaceField(spaceKey, 'features', updatedFeatures);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => removeFeature(spaceKey, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.dailyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.dailyPrice || ''}
                        onChange={(e) => updateSpaceField(spaceKey, 'dailyPrice', Number(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.monthlyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.monthlyPrice || ''}
                        onChange={(e) => updateSpaceField(spaceKey, 'monthlyPrice', Number(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.yearlyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.yearlyPrice || ''}
                        onChange={(e) => updateSpaceField(spaceKey, 'yearlyPrice', Number(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.hourlyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.hourlyPrice || ''}
                        onChange={(e) => updateSpaceField(spaceKey, 'hourlyPrice', Number(e.target.value) || undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Max Occupants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.maxOccupants}
                    </label>
                    <input
                      type="number"
                      value={space.maxOccupants}
                      onChange={(e) => updateSpaceField(spaceKey, 'maxOccupants', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">{t.preview}</h4>
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={space.imageUrl || `/${spaceKey.replace('-', '_')}.jpg`}
                        alt={space.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop';
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold mt-3">{space.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{space.description}</p>
                  </div>

                  {/* Current Data */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t.pricesLabel}</h4>
                      <div className="space-y-1 text-sm">
                        {space.dailyPrice && <p>Jour: ${space.dailyPrice}</p>}
                        {space.monthlyPrice && <p>Mois: ${space.monthlyPrice}</p>}
                        {space.yearlyPrice && <p>Année: ${space.yearlyPrice}</p>}
                        {space.hourlyPrice && <p>Heure: ${space.hourlyPrice}</p>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{t.featuresLabel}</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {space.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                        {space.features.length > 3 && (
                          <li className="text-gray-500">... et {space.features.length - 3} autres</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpaceContentEditor;
