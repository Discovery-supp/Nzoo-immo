import React, { useState, useEffect } from 'react';
import { MapPin, Users, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

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

const PublishedSpaces: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  // Charger les espaces publiés
  const fetchPublishedSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('spaces')
        .select('*')
        .eq('is_published', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement:', error);
        return;
      }

      setSpaces(data || []);
    } catch (error) {
      console.error('Erreur inattendue:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublishedSpaces();
  }, []);

  // Filtrer les espaces par type
  const filteredSpaces = selectedType === 'all' 
    ? spaces 
    : spaces.filter(space => space.type === selectedType);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="rounded-full h-12 w-12 border-b-2 border-nzoo-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nos Espaces
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Découvrez nos espaces de coworking, bureaux privés et salles de réunion 
          conçus pour votre productivité et votre confort.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex justify-center">
        <div className="flex space-x-2 bg-white rounded-lg shadow-sm border p-1">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-nzoo-dark text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setSelectedType('coworking')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'coworking'
                ? 'bg-nzoo-dark text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Espace Coworking
          </button>
          <button
            onClick={() => setSelectedType('bureau-prive')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'bureau-prive'
                ? 'bg-nzoo-dark text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Bureaux Privés
          </button>
          <button
            onClick={() => setSelectedType('domiciliation')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'domiciliation'
                ? 'bg-nzoo-dark text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Domiciliation
          </button>
        </div>
      </div>

      {/* Grille des espaces */}
      {filteredSpaces.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Aucun espace disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpaces.map((space) => (
            <div
              key={space.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image */}
              <div className="h-48 bg-gray-200 relative">
                {space.photo_espace ? (
                  <img
                    src={space.photo_espace}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-500">Aucune image</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    space.type === 'coworking' ? 'bg-nzoo-gray/20 text-nzoo-dark' :
                    space.type === 'bureau-prive' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {space.type === 'coworking' ? 'Espace Coworking' :
                     space.type === 'bureau-prive' ? 'Bureau Privé' :
                     'Domiciliation'}
                  </span>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {space.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {space.description}
                </p>

                {/* Informations */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>Jusqu'Ã  {space.nombre_occupants} personnes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Disponible immédiatement</span>
                  </div>
                </div>

                {/* Prix */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Prix journalier</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${space.prix_journalier}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Prix mensuel</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${space.prix_mensuel}
                    </span>
                  </div>
                </div>

                {/* Bouton de réservation */}
                <button className="w-full mt-4 bg-nzoo-dark text-white py-2 px-4 rounded-lg hover:bg-nzoo-dark/80 transition-colors font-medium">
                  Réserver maintenant
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-gray-50 rounded-lg p-8 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-nzoo-dark mb-2">
              {spaces.length}
            </div>
            <div className="text-gray-600">Espaces disponibles</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {spaces.filter(s => s.type === 'coworking').length}
            </div>
            <div className="text-gray-600">Espaces de coworking</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {spaces.filter(s => s.type === 'bureau-prive').length}
            </div>
            <div className="text-gray-600">Bureaux privés</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishedSpaces;

