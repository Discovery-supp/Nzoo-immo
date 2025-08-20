import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Eye, EyeOff, Plus, Search, Filter } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SimpleSpaceForm from './SimpleSpaceForm';
import SpaceEditForm from './SpaceEditForm';

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

const SpaceManagement: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Charger les espaces
  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des espaces' });
        return;
      }

      setSpaces(data || []);
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setMessage({ type: 'error', text: 'Erreur inattendue' });
    } finally {
      setLoading(false);
    }
  };

  // Publier/Dépublier un espace
  const togglePublish = async (space: Space) => {
    try {
      const { error } = await supabase
        .from('spaces')
        .update({ is_published: !space.is_published })
        .eq('id', space.id);

      if (error) {
        console.error('Erreur lors de la publication:', error);
        setMessage({ type: 'error', text: 'Erreur lors de la publication' });
        return;
      }

      setMessage({ 
        type: 'success', 
        text: space.is_published ? 'Espace dépublié' : 'Espace publié avec succès' 
      });
      
      // Rafraîchir la liste
      fetchSpaces();
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setMessage({ type: 'error', text: 'Erreur inattendue' });
    }
  };

  // Supprimer un espace
  const deleteSpace = async (space: Space) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${space.name}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('spaces')
        .delete()
        .eq('id', space.id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        return;
      }

      setMessage({ type: 'success', text: 'Espace supprimé avec succès' });
      fetchSpaces();
    } catch (error) {
      console.error('Erreur inattendue:', error);
      setMessage({ type: 'error', text: 'Erreur inattendue' });
    }
  };

  // Modifier un espace
  const editSpace = (space: Space) => {
    setEditingSpace(space);
    setShowEditModal(true);
  };

  // Filtrer les espaces
  const filteredSpaces = spaces.filter(space => {
    const matchesSearch = space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         space.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || space.type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && space.is_active) ||
                         (filterStatus === 'inactive' && !space.is_active) ||
                         (filterStatus === 'published' && space.is_published) ||
                         (filterStatus === 'unpublished' && !space.is_published);

    return matchesSearch && matchesType && matchesStatus;
  });

  useEffect(() => {
    fetchSpaces();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Espaces</h2>
        <SimpleSpaceForm onSpaceAdded={fetchSpaces} />
      </div>

      {/* Message de feedback */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <span className="font-medium">{message.text}</span>
          <button 
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un espace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtre par type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="coworking">Coworking</option>
            <option value="bureau-prive">Bureau Privé</option>
            <option value="salle-reunion">Salle de Réunion</option>
          </select>

          {/* Filtre par statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="published">Publiés</option>
            <option value="unpublished">Non publiés</option>
          </select>

          {/* Statistiques */}
          <div className="text-sm text-gray-600 flex items-center justify-center">
            {filteredSpaces.length} espace(s) trouvé(s)
          </div>
        </div>
      </div>

      {/* Liste des espaces */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Espace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSpaces.map((space) => (
                <tr key={space.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {space.photo_espace ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={space.photo_espace}
                            alt={space.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {space.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {space.description.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      space.type === 'coworking' ? 'bg-blue-100 text-blue-800' :
                      space.type === 'bureau-prive' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {space.type === 'coworking' ? 'Coworking' :
                       space.type === 'bureau-prive' ? 'Bureau Privé' :
                       'Salle de Réunion'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>Jour: ${space.prix_journalier}</div>
                      <div>Mois: ${space.prix_mensuel}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        space.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {space.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        space.is_published ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {space.is_published ? 'Publié' : 'Non publié'}
                      </span>
                    </div>
                  </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                     <div className="flex space-x-2">
                       <button
                         onClick={() => editSpace(space)}
                         className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                         title="Voir plus / Modifier"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button
                         onClick={() => togglePublish(space)}
                         className={`p-2 rounded-lg transition-colors ${
                           space.is_published 
                             ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50' 
                             : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                         }`}
                         title={space.is_published ? 'Dépublier' : 'Publier'}
                       >
                         {space.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                       </button>
                       <button
                         onClick={() => deleteSpace(space)}
                         className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                         title="Supprimer"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSpaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun espace trouvé</p>
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {showEditModal && editingSpace && (
        <SpaceEditForm
          space={editingSpace}
          onClose={() => {
            setShowEditModal(false);
            setEditingSpace(null);
          }}
          onSpaceUpdated={fetchSpaces}
        />
      )}
    </div>
  );
};

export default SpaceManagement;
