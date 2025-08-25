import React, { useState, useEffect } from 'react';
import { Save, X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import ImageUpload from './ImageUpload';

interface Space {
  id: string;
  name: string;
  type: string;
  description: string;
  prix_journalier: number;
  prix_mensuel: number;
  prix_annuel: number;
  nombre_occupants: number;
  photo_espace?: string;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface SpaceEditFormProps {
  space: Space;
  onClose: () => void;
  onSpaceUpdated: () => void;
}

const SpaceEditForm: React.FC<SpaceEditFormProps> = ({ space, onClose, onSpaceUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: space.name,
    type: space.type,
    description: space.description,
    prix_journalier: space.prix_journalier,
    prix_mensuel: space.prix_mensuel,
    prix_annuel: space.prix_annuel,
    nombre_occupants: space.nombre_occupants,
    photo_espace: space.photo_espace || '',
    is_active: space.is_active,
    is_published: space.is_published
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      console.log('🚀 Mise à jour de l\'espace:', formData);

      const { data, error } = await supabase
        .from('spaces')
        .update({
          name: formData.name,
          type: formData.type,
          description: formData.description,
          prix_journalier: formData.prix_journalier,
          prix_mensuel: formData.prix_mensuel,
          prix_annuel: formData.prix_annuel,
          nombre_occupants: formData.nombre_occupants,
          photo_espace: formData.photo_espace || null,
          is_active: formData.is_active,
          is_published: formData.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', space.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        setMessage({ type: 'error', text: `Erreur: ${error.message}` });
        return;
      }

      console.log('✅ Espace mis à jour avec succès:', data);
      setMessage({ type: 'success', text: 'Espace mis à jour avec succès et sauvegardé en base de données !' });
      
      // Appeler la fonction de mise à jour parent immédiatement
      onSpaceUpdated();

    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
      setMessage({ type: 'error', text: 'Erreur inattendue lors de la mise à jour' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, photo_espace: imageUrl }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Modifier l'espace: {space.name}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Message de succès/erreur */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne gauche - Informations de base */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Informations de base
                </h4>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'espace *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Ex: Espace Coworking Principal"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'espace
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="coworking">Coworking</option>
                    <option value="bureau-prive">Bureau Privé</option>
        
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="Description détaillée de l'espace..."
                  />
                </div>

                {/* Nombre d'occupants */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre d'occupants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.nombre_occupants}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre_occupants: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>

                {/* Statuts */}
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Espace actif</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_published}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Publié sur le site</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Colonne droite - Prix et Image */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Tarification et Image
                </h4>

                {/* Prix */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix journalier ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prix_journalier}
                      onChange={(e) => setFormData(prev => ({ ...prev, prix_journalier: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix mensuel ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prix_mensuel}
                      onChange={(e) => setFormData(prev => ({ ...prev, prix_mensuel: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix annuel ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.prix_annuel}
                      onChange={(e) => setFormData(prev => ({ ...prev, prix_annuel: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                                 {/* Photo de l'espace */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Photo de l'espace
                   </label>
                   <div className="space-y-4">
                     {/* Upload d'image */}
                     <ImageUpload 
                       onImageUploaded={handleImageUploaded}
                       currentImageUrl={formData.photo_espace}
                     />
                     
                     {/* Ou saisie manuelle du chemin */}
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Ou saisissez le chemin manuellement
                       </label>
                       <input
                         type="text"
                         placeholder="/images/spaces/nom-image.jpg"
                         value={formData.photo_espace}
                         onChange={(e) => setFormData(prev => ({ ...prev, photo_espace: e.target.value }))}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       />
                       <p className="text-xs text-gray-500 mt-1">
                         Chemin vers l'image dans le dossier public
                       </p>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.description.trim()}
                className="px-4 py-2 bg-nzoo-dark text-white rounded-lg hover:bg-nzoo-dark/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SpaceEditForm;
