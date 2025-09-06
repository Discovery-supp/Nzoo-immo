import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Upload, Image, DollarSign, FileText, Eye, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { getAllSpaces, getDefaultSpaces } from '../data/spacesData';
import { SpaceContentService } from '../services/spaceContentService';
import { ImageUploadService } from '../services/imageUploadService';
import { useToastContext } from './ToastProvider';
import EnhancedTextInput from './EnhancedTextInput';

interface SpaceContentEditorProps {
  language: 'fr' | 'en';
  onClose: () => void;
  onSave: (updatedData: any) => void;
}

interface SpaceContent {
  title: string;
  description: string;
  features: string[];
  dailyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  hourlyPrice: number;
  maxOccupants: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

const SpaceContentEditor: React.FC<SpaceContentEditorProps> = ({ language, onClose, onSave }) => {
  const [editingSpace, setEditingSpace] = useState<string | null>(null);
  const [spaceData, setSpaceData] = useState<Record<string, SpaceContent>>({});
  const [originalData, setOriginalData] = useState<Record<string, SpaceContent>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasModifications, setHasModifications] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const { success, error: showError } = useToastContext();

  // Charger les données initiales
  useEffect(() => {
    const loadData = async () => {
      try {
        const spaces = await SpaceContentService.mergeWithDefault(getDefaultSpaces(language), language);
        setSpaceData(spaces);
        setOriginalData(spaces);
        setHasModifications(SpaceContentService.hasSavedContent());
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        // Fallback vers les données par défaut
        const defaultSpaces = getDefaultSpaces(language);
        setSpaceData(defaultSpaces);
        setOriginalData(defaultSpaces);
        setHasModifications(false);
      }
    };

    loadData();
  }, [language]);

  const handleEditSpace = (spaceKey: string) => {
    setEditingSpace(spaceKey);
  };

  const handleCancelEdit = () => {
    setEditingSpace(null);
    setSpaceData(originalData); // Restaurer les données originales
  };

  const handleSaveSpace = async (spaceKey: string) => {
    setLoading(true);
    try {
      await SpaceContentService.saveContent(spaceData, language);
      setOriginalData(spaceData);
      setHasModifications(false);
      setEditingSpace(null);
      setMessage({ type: 'success', text: 'Espace sauvegardé avec succès' });
      success('Espace sauvegardé avec succès !');
      
      // Appeler la fonction de sauvegarde parent
      onSave(spaceData);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
      showError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (spaceKey: string) => {
    console.log('🚨 === DÉBUT SUPPRESSION ESPACE ===');
    console.log('🚨 CLIC SUR SUPPRIMER DÉTECTÉ');
    console.log('🚨 spaceKey:', spaceKey);
    console.log('🚨 spaceData:', spaceData);
    console.log('🚨 spaceData[spaceKey]:', spaceData[spaceKey]);
    
    const spaceName = spaceData[spaceKey]?.title || spaceKey;
    console.log('🚨 Nom de l\'espace pour confirmation:', spaceName);
    
    console.log('🚨 AVANT CONFIRMATION');
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${spaceName}" ? Cette action ne peut pas être annulée.`)) {
      console.log('🚨 CONFIRMATION ACCEPTÉE');
      console.log('✅ Confirmation acceptée, début de la suppression...');
      
      try {
        // Supprimer l'image si elle existe
        if (spaceData[spaceKey]?.imageUrl) {
          console.log('🗑️ Suppression de l\'image:', spaceData[spaceKey].imageUrl);
          const deleteResult = await ImageUploadService.deleteImage(spaceData[spaceKey].imageUrl);
          if (!deleteResult.success) {
            console.warn('⚠️ Erreur lors de la suppression de l\'image:', deleteResult.error);
            // On continue même si la suppression d'image échoue
          } else {
            console.log('✅ Image supprimée avec succès');
          }
        } else {
          console.log('ℹ️ Aucune image à supprimer pour cet espace');
        }

        // Supprimer l'espace via le service
        console.log('🗑️ Suppression de l\'espace via le service...');
        await SpaceContentService.deleteSpace(spaceKey, language);
        console.log('✅ Service de suppression terminé');

        // Mettre à jour l'état local
        console.log('🔄 Mise à jour de l\'état local...');
        const updatedData = { ...spaceData };
        delete updatedData[spaceKey];
        console.log('📊 Données mises à jour:', Object.keys(updatedData));
        
        setSpaceData(updatedData);
        setOriginalData(updatedData);
        setHasModifications(true);
        
        console.log('✅ Suppression terminée avec succès');
        success('Espace supprimé avec succès !');
        setMessage({ type: 'success', text: 'Espace supprimé avec succès' });
        
        // Appeler la fonction de sauvegarde parent
        console.log('🔄 Appel de onSave avec les données mises à jour...');
        onSave(updatedData);
        console.log('✅ onSave appelé avec succès');
        
      } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        console.error('❌ Stack trace:', error.stack);
        showError('Erreur lors de la suppression de l\'espace');
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
      }
    } else {
      console.log('🚨 CONFIRMATION ANNULÉE');
    }
    
    console.log('🚨 === FIN SUPPRESSION ESPACE ===');
  };

  const handleResetToDefault = async () => {
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
    const newFeature = prompt(language === 'fr' ? 'Ajouter un nouvel équipement:' : 'Add new equipment:');
    if (newFeature && newFeature.trim()) {
      updateSpaceField(spaceKey, 'features', [
        ...spaceData[spaceKey].features,
        newFeature.trim()
      ]);
    }
  };

  const removeFeature = (spaceKey: string, index: number) => {
    const updatedFeatures = spaceData[spaceKey].features.filter((_, i) => i !== index);
    updateSpaceField(spaceKey, 'features', updatedFeatures);
  };

  const handleImageUpload = async (spaceKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(spaceKey);

    try {
      // Valider le fichier
      const validation = ImageUploadService.validateImage(file);
      if (!validation.valid) {
        showError(validation.error || 'Fichier invalide');
        return;
      }

      // Upload vers Supabase Storage
      const result = await ImageUploadService.uploadImage(file);
      
      if (result.success && result.url) {
        // Mettre à jour l'espace avec la nouvelle image
        updateSpaceField(spaceKey, 'imageUrl', result.url);
        
        success('Image uploadée avec succès !');
        console.log('✅ Image sauvegardée:', result.url);
      } else {
        throw new Error(result.error || 'Erreur lors de l\'upload');
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      showError('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleDeleteImage = async (spaceKey: string) => {
    try {
      const currentImageUrl = spaceData[spaceKey]?.imageUrl;
      if (currentImageUrl) {
        console.log('🗑️ Suppression de l\'image:', currentImageUrl);
        const deleteResult = await ImageUploadService.deleteImage(currentImageUrl);
        
        if (!deleteResult.success) {
          console.warn('⚠️ Erreur lors de la suppression de l\'image:', deleteResult.error);
          // On continue même si la suppression échoue
        } else {
          console.log('✅ Image supprimée avec succès');
        }
      }
      
      // Supprimer l'URL de l'espace (toujours faire cette étape)
      updateSpaceField(spaceKey, 'imageUrl', '');
      
      success('Image supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      showError('Erreur lors de la suppression de l\'image');
      
      // Même en cas d'erreur, on supprime l'URL localement
      updateSpaceField(spaceKey, 'imageUrl', '');
    }
  };

  const translations = {
    fr: {
      title: 'Éditer le Contenu des Espaces',
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
      lastModified: 'Dernière modification',
      deleteSpace: 'Supprimer espace',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer cet espace ?',
      spaceDeleted: 'Espace supprimé avec succès !',
      deleteImage: 'Supprimer l\'image',
      imageDeleted: 'Image supprimée avec succès !'
    },
    en: {
      title: 'Space Content Editor',
      subtitle: 'Modify images, descriptions and prices of spaces',
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
      lastModified: 'Last modified',
      deleteSpace: 'Delete space',
      confirmDelete: 'Are you sure you want to delete this space?',
      spaceDeleted: 'Space deleted successfully!',
      deleteImage: 'Delete image',
      imageDeleted: 'Image deleted successfully!'
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
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {space.title || spaceKey.replace('-', ' ')}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    space.isAvailable !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {space.isAvailable !== false 
                      ? (language === 'fr' ? 'Disponible' : 'Available')
                      : (language === 'fr' ? 'Indisponible' : 'Unavailable')
                    }
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Clé: {spaceKey}
                </div>
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditSpace(spaceKey)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteSpace(spaceKey)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title={t.deleteSpace}
                    >
                      <Trash2 className="w-4 h-4" />
                      {t.deleteSpace}
                    </button>
                  </div>
                )}
              </div>

              {editingSpace === spaceKey ? (
                <div className="space-y-8">
                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t.imageLabel}
                    </label>
                    <div className="flex items-center gap-6">
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
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          {t.uploadImage}
                        </label>
                        {uploadingImage === spaceKey && (
                          <p className="text-sm text-blue-600 mt-2">Uploading...</p>
                        )}
                        {space.imageUrl && (
                          <button
                            onClick={() => handleDeleteImage(spaceKey)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm mt-2"
                            title={t.deleteImage}
                          >
                            <Trash2 className="w-4 h-4" />
                            {t.deleteImage}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <EnhancedTextInput
                      value={space.title}
                      onChange={(value) => updateSpaceField(spaceKey, 'title', value)}
                      label={t.titleLabel}
                      language={language}
                      showSpecialChars={true}
                      multiline={false}
                      className="w-full"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <EnhancedTextInput
                      value={space.description}
                      onChange={(value) => updateSpaceField(spaceKey, 'description', value)}
                      label={t.descriptionLabel}
                      language={language}
                      showSpecialChars={true}
                      multiline={true}
                      rows={4}
                      className="w-full"
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-700">
                        {t.featuresLabel}
                      </label>
                      <button
                        onClick={() => addFeature(spaceKey)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        {t.addFeature}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {space.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1">
                            <EnhancedTextInput
                              value={feature}
                              onChange={(value) => {
                                const updatedFeatures = [...space.features];
                                updatedFeatures[index] = value;
                                updateSpaceField(spaceKey, 'features', updatedFeatures);
                              }}
                              language={language}
                              showSpecialChars={true}
                              multiline={false}
                              className="w-full"
                            />
                          </div>
                          <button
                            onClick={() => removeFeature(spaceKey, index)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t.dailyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.dailyPrice}
                        onChange={(e) => updateSpaceField(spaceKey, 'dailyPrice', Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t.monthlyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.monthlyPrice}
                        onChange={(e) => updateSpaceField(spaceKey, 'monthlyPrice', Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t.yearlyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.yearlyPrice}
                        onChange={(e) => updateSpaceField(spaceKey, 'yearlyPrice', Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {t.hourlyPrice} ($)
                      </label>
                      <input
                        type="number"
                        value={space.hourlyPrice}
                        onChange={(e) => updateSpaceField(spaceKey, 'hourlyPrice', Number(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                      />
                    </div>
                  </div>

                  {/* Max Occupants */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {t.maxOccupants}
                    </label>
                    <input
                      type="number"
                      value={space.maxOccupants}
                      onChange={(e) => updateSpaceField(spaceKey, 'maxOccupants', Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      {language === 'fr' ? 'Disponibilité' : 'Availability'}
                    </label>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={space.isAvailable !== false}
                          onChange={(e) => updateSpaceField(spaceKey, 'isAvailable', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {space.isAvailable !== false 
                            ? (language === 'fr' ? 'Disponible' : 'Available')
                            : (language === 'fr' ? 'Indisponible' : 'Unavailable')
                          }
                        </span>
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {language === 'fr' 
                        ? 'Activez cette option pour rendre l\'espace disponible à la réservation'
                        : 'Enable this option to make the space available for booking'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 text-lg">{t.preview}</h4>
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
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
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{space.title}</h3>
                    <p className="text-gray-600 text-base leading-relaxed">{space.description}</p>
                  </div>

                  {/* Current Data */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4 text-lg">{t.pricesLabel}</h4>
                      <div className="space-y-3 text-base">
                        <p className="text-gray-700"><span className="font-medium">Jour:</span> ${space.dailyPrice}</p>
                        <p className="text-gray-700"><span className="font-medium">Mois:</span> ${space.monthlyPrice}</p>
                        <p className="text-gray-700"><span className="font-medium">Année:</span> ${space.yearlyPrice}</p>
                        <p className="text-gray-700"><span className="font-medium">Heure:</span> ${space.hourlyPrice}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4 text-lg">{t.featuresLabel}</h4>
                      <ul className="text-base text-gray-700 space-y-2">
                        {space.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-primary-600 mr-2 mt-1">•</span>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                        {space.features.length > 3 && (
                          <li className="text-gray-500 italic">
                            ... et {space.features.length - 3} autres équipements
                          </li>
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
