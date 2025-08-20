import React, { useState } from 'react';
import { Plus, X, Save, Upload, DollarSign, Users, FileText } from 'lucide-react';
import { SpaceContentService } from '../services/spaceContentService';

interface AddSpaceModalProps {
  language: 'fr' | 'en';
  onClose: () => void;
  onSpaceAdded: (newSpaceKey: string) => void;
}

interface NewSpaceData {
  key: string;
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

const AddSpaceModal: React.FC<AddSpaceModalProps> = ({ language, onClose, onSpaceAdded }) => {
  const [formData, setFormData] = useState<NewSpaceData>({
    key: '',
    title: '',
    description: '',
    features: ['WiFi haut débit', 'Climatisation'],
    maxOccupants: 1
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newFeature, setNewFeature] = useState('');

  const translations = {
    fr: {
      title: 'Ajouter un nouvel espace',
      subtitle: 'Créez une nouvelle publication d\'espace',
      spaceKey: 'Clé de l\'espace (unique)',
      spaceKeyPlaceholder: 'ex: salle-reunion, bureau-luxe',
      titleLabel: 'Titre',
      titlePlaceholder: 'Ex: Salle de Réunion Premium',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Décrivez votre espace...',
      featuresLabel: 'Équipements',
      addFeature: 'Ajouter équipement',
      removeFeature: 'Supprimer',
      pricesLabel: 'Prix',
      dailyPrice: 'Prix journalier ($)',
      monthlyPrice: 'Prix mensuel ($)',
      yearlyPrice: 'Prix annuel ($)',
      hourlyPrice: 'Prix horaire ($)',
      maxOccupants: 'Nombre max d\'occupants',
      imageLabel: 'Image',
      uploadImage: 'Changer l\'image',
      save: 'Créer l\'espace',
      cancel: 'Annuler',
      success: 'Espace créé avec succès !',
      error: 'Erreur lors de la création',
      keyRequired: 'La clé de l\'espace est requise',
      titleRequired: 'Le titre est requis',
      descriptionRequired: 'La description est requise',
      keyExists: 'Cette clé d\'espace existe déjà'
    },
    en: {
      title: 'Add a new space',
      subtitle: 'Create a new space publication',
      spaceKey: 'Space key (unique)',
      spaceKeyPlaceholder: 'ex: meeting-room, luxury-office',
      titleLabel: 'Title',
      titlePlaceholder: 'Ex: Premium Meeting Room',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Describe your space...',
      featuresLabel: 'Features',
      addFeature: 'Add feature',
      removeFeature: 'Remove',
      pricesLabel: 'Prices',
      dailyPrice: 'Daily price ($)',
      monthlyPrice: 'Monthly price ($)',
      yearlyPrice: 'Yearly price ($)',
      hourlyPrice: 'Hourly price ($)',
      maxOccupants: 'Max occupants',
      imageLabel: 'Image',
      uploadImage: 'Change image',
      save: 'Create space',
      cancel: 'Cancel',
      success: 'Space created successfully!',
      error: 'Error creating space',
      keyRequired: 'Space key is required',
      titleRequired: 'Title is required',
      descriptionRequired: 'Description is required',
      keyExists: 'This space key already exists'
    }
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation
    if (!formData.key.trim()) {
      setMessage({ type: 'error', text: t.keyRequired });
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: t.titleRequired });
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setMessage({ type: 'error', text: t.descriptionRequired });
      setLoading(false);
      return;
    }

    // Vérifier si la clé existe déjà
    const existingData = SpaceContentService.getSavedContent();
    if (existingData && existingData[formData.key]) {
      setMessage({ type: 'error', text: t.keyExists });
      setLoading(false);
      return;
    }

    try {
      // Créer le nouvel espace
      const newSpace = {
        title: formData.title,
        description: formData.description,
        features: formData.features,
        dailyPrice: formData.dailyPrice,
        monthlyPrice: formData.monthlyPrice,
        yearlyPrice: formData.yearlyPrice,
        hourlyPrice: formData.hourlyPrice,
        maxOccupants: formData.maxOccupants,
        imageUrl: formData.imageUrl,
        lastModified: new Date().toISOString()
      };

      // Sauvegarder avec les données existantes
      const currentData = existingData || {};
      const updatedData = {
        ...currentData,
        [formData.key]: newSpace
      };

      SpaceContentService.saveContent(updatedData);

      setMessage({ type: 'success', text: t.success });
      
      // Émettre un événement pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('spaceContentUpdated', {
        detail: { updatedData, language }
      }));

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onSpaceAdded(formData.key);
        onClose();
      }, 2000);

    } catch (error) {
      setMessage({ type: 'error', text: t.error });
    } finally {
      setLoading(false);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            imageUrl: event.target.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
              <p className="text-gray-600 mt-1">{t.subtitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Space Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.spaceKey}
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
              placeholder={t.spaceKeyPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Cette clé sera utilisée pour identifier l'espace (ex: salle-reunion, bureau-luxe)
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.titleLabel}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={t.titlePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.descriptionLabel}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={t.descriptionPlaceholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.imageLabel}
            </label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="space-image"
                />
                <label
                  htmlFor="space-image"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {t.uploadImage}
                </label>
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t.featuresLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Nouvel équipement"
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                >
                  <Plus className="w-3 h-3" />
                  {t.addFeature}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    {feature}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Prices */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">{t.pricesLabel}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.dailyPrice}
                </label>
                <input
                  type="number"
                  value={formData.dailyPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyPrice: Number(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.monthlyPrice}
                </label>
                <input
                  type="number"
                  value={formData.monthlyPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: Number(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.yearlyPrice}
                </label>
                <input
                  type="number"
                  value={formData.yearlyPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, yearlyPrice: Number(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.hourlyPrice}
                </label>
                <input
                  type="number"
                  value={formData.hourlyPrice || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourlyPrice: Number(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Max Occupants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.maxOccupants}
            </label>
            <input
              type="number"
              value={formData.maxOccupants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxOccupants: Number(e.target.value) }))}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Création...' : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpaceModal;
