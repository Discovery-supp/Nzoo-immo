import React, { useState } from 'react';
import { Plus, Save, X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import ImageUpload from './ImageUpload';

interface SimpleSpaceFormProps {
  onSpaceAdded: () => void;
}

const SimpleSpaceForm: React.FC<SimpleSpaceFormProps> = ({ onSpaceAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prix_journalier: 0,
    prix_mensuel: 0,
    prix_annuel: 0,
    nombre_occupants: 1,
    photo_espace: '',
    is_active: true,
    is_published: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      console.log('🚀 Enregistrement de l\'espace:', formData);

      // Insérer avec tous les champs demandés
      const { data, error } = await supabase
        .from('spaces')
        .insert({
          name: formData.name,
          description: formData.description,
          prix_journalier: formData.prix_journalier,
          prix_mensuel: formData.prix_mensuel,
          prix_annuel: formData.prix_annuel,
          nombre_occupants: formData.nombre_occupants,
          photo_espace: formData.photo_espace || null,
          is_active: formData.is_active,
          is_published: formData.is_published,
          type: 'coworking' // Valeur par défaut
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de l\'enregistrement:', error);
        setMessage({ type: 'error', text: `Erreur: ${error.message}` });
        return;
      }

      console.log('✅ Espace enregistré avec succès:', data);
      setMessage({ type: 'success', text: 'Espace ajouté avec succès et sauvegardé en base de données !' });
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        description: '',
        prix_journalier: 0,
        prix_mensuel: 0,
        prix_annuel: 0,
        nombre_occupants: 1,
        photo_espace: '',
        is_active: true,
        is_published: false
      });

      // Appeler la fonction de mise à jour parent immédiatement
      onSpaceAdded();

    } catch (error) {
      console.error('❌ Erreur inattendue:', error);
      setMessage({ type: 'error', text: 'Erreur inattendue lors de l\'enregistrement' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      prix_journalier: 0,
      prix_mensuel: 0,
      prix_annuel: 0,
      nombre_occupants: 1,
      photo_espace: '',
      is_active: true,
      is_published: false
    });
    setMessage(null);
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, photo_espace: imageUrl }));
  };

  return (
    <>
      {/* Bouton pour ouvrir le modal */}
      <button
        onClick={() => {
          resetForm();
          setIsOpen(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Ajouter un Espace
      </button>

      {/* Modal simple */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Ajouter un nouvel espace
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
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

                                         {/* Statut actif */}
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
                         Photo de l'espace (optionnel)
                       </label>
                       <ImageUpload 
                         onImageUploaded={handleImageUploaded}
                         currentImageUrl={formData.photo_espace}
                       />
                     </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.name.trim() || !formData.description.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleSpaceForm;
