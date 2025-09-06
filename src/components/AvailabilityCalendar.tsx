import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Building, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { checkAllSpacesAvailability, checkSpaceAvailability } from '../services/availabilityService';
import { GeneralAvailability } from '../services/availabilityService';

interface AvailabilityCalendarProps {
  language: 'fr' | 'en';
  userRole?: 'admin' | 'client';
}

interface SpaceAvailability {
  spaceType: string;
  isAvailable: boolean;
  currentOccupancy: number;
  maxCapacity: number;
  availableSlots: number;
  message: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ language, userRole = 'client' }) => {
  const [availabilityData, setAvailabilityData] = useState<SpaceAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpaceType, setSelectedSpaceType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedEndDate, setSelectedEndDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [dateAvailability, setDateAvailability] = useState<any>(null);
  const [checkingDateAvailability, setCheckingDateAvailability] = useState(false);

  const translations = {
    fr: {
      title: 'Calendrier de Disponibilité',
      subtitle: 'Consultez les espaces disponibles et réservez vos créneaux',
      refresh: 'Actualiser',
      spaceType: 'Type d\'espace',
      allSpaces: 'Tous les espaces',
      coworking: 'Coworking',
      bureauPrive: 'Bureau privé',
      domiciliation: 'Domiciliation',
      salleReunion: 'Salle de réunion',
      checkAvailability: 'Vérifier la disponibilité',
      startDate: 'Date de début',
      endDate: 'Date de fin',
      available: 'Disponible',
      unavailable: 'Indisponible',
      partiallyAvailable: 'Partiellement disponible',
      slots: 'places',
      occupied: 'occupées',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement',
      noConflicts: 'Aucun conflit détecté',
      conflicts: 'conflits détectés',
      maxCapacity: 'Capacité maximale',
      currentOccupancy: 'Occupation actuelle',
      availableSlots: 'Places disponibles',
      suggestedDates: 'Dates suggérées',
      selectDate: 'Sélectionner cette date',
      generalAvailability: 'Disponibilité générale',
      specificDateAvailability: 'Disponibilité pour une période spécifique'
    },
    en: {
      title: 'Availability Calendar',
      subtitle: 'Check available spaces and book your slots',
      refresh: 'Refresh',
      spaceType: 'Space type',
      allSpaces: 'All spaces',
      coworking: 'Coworking',
      bureauPrive: 'Private office',
      domiciliation: 'Domiciliation',
      salleReunion: 'Meeting room',
      checkAvailability: 'Check availability',
      startDate: 'Start date',
      endDate: 'End date',
      available: 'Available',
      unavailable: 'Unavailable',
      partiallyAvailable: 'Partially available',
      slots: 'slots',
      occupied: 'occupied',
      loading: 'Loading...',
      error: 'Error loading data',
      noConflicts: 'No conflicts detected',
      conflicts: 'conflicts detected',
      maxCapacity: 'Max capacity',
      currentOccupancy: 'Current occupancy',
      availableSlots: 'Available slots',
      suggestedDates: 'Suggested dates',
      selectDate: 'Select this date',
      generalAvailability: 'General availability',
      specificDateAvailability: 'Specific date availability'
    }
  };

  const t = translations[language];

  // Types d'espaces disponibles
  const spaceTypes = [
    { key: 'coworking', label: t.coworking, maxCapacity: 4 },
    { key: 'bureau_prive', label: t.bureauPrive, maxCapacity: 3 },
    { key: 'bureau-prive', label: t.bureauPrive, maxCapacity: 3 },
    { key: 'domiciliation', label: t.domiciliation, maxCapacity: 1 },
    { key: 'salle_reunion', label: t.salleReunion, maxCapacity: 1 }
  ];

  // Charger la disponibilité générale
  const loadGeneralAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await checkAllSpacesAvailability();
      // Convertir l'objet en tableau
      const availabilityArray = Object.values(data).map(item => ({
        spaceType: item.spaceType,
        isAvailable: item.isAvailable,
        currentOccupancy: item.currentOccupancy,
        maxCapacity: item.maxCapacity,
        availableSlots: item.availableSlots,
        message: item.message
      }));
      setAvailabilityData(availabilityArray);
    } catch (err) {
      console.error('Error loading availability:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier la disponibilité pour une période spécifique
  const checkSpecificDateAvailability = async () => {
    if (!selectedSpaceType || selectedSpaceType === 'all') {
      setDateAvailability(null);
      return;
    }

    try {
      setCheckingDateAvailability(true);
      setError(null);

      const result = await checkSpaceAvailability(selectedSpaceType, selectedDate, selectedEndDate);
      setDateAvailability(result);
    } catch (err) {
      console.error('Error checking date availability:', err);
      setError(t.error);
    } finally {
      setCheckingDateAvailability(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await loadGeneralAvailability();
      } catch (error) {
        if (isMounted) {
          console.error('Error in useEffect:', error);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Vérifier la disponibilité quand les paramètres changent
  useEffect(() => {
    if (selectedSpaceType && selectedSpaceType !== 'all') {
      checkSpecificDateAvailability();
    }
  }, [selectedSpaceType, selectedDate, selectedEndDate]);

  const getAvailabilityIcon = (isAvailable: boolean, availableSlots: number, maxCapacity: number) => {
    if (isAvailable && availableSlots === maxCapacity) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (isAvailable && availableSlots > 0) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getAvailabilityStatus = (isAvailable: boolean, availableSlots: number, maxCapacity: number) => {
    if (isAvailable && availableSlots === maxCapacity) {
      return { status: t.available, color: 'text-green-600 bg-green-50' };
    } else if (isAvailable && availableSlots > 0) {
      return { status: t.partiallyAvailable, color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { status: t.unavailable, color: 'text-red-600 bg-red-50' };
    }
  };

  const filteredData = selectedSpaceType === 'all' 
    ? availabilityData 
    : availabilityData.filter(space => space.spaceType === selectedSpaceType);

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-primary-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-nzoo-dark mb-2 font-heading">
            {t.title}
          </h3>
          <p className="text-primary-600 font-body">
            {t.subtitle}
          </p>
        </div>
        <button
          onClick={loadGeneralAvailability}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t.refresh}
        </button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-nzoo-dark mb-2 font-body">
            {t.spaceType}
          </label>
          <select
            value={selectedSpaceType}
            onChange={(e) => setSelectedSpaceType(e.target.value)}
            className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 font-body"
          >
            <option value="all">{t.allSpaces}</option>
            {spaceTypes.map(space => (
              <option key={space.key} value={space.key}>
                {space.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-nzoo-dark mb-2 font-body">
            {t.startDate}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 font-body"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-nzoo-dark mb-2 font-body">
            {t.endDate}
          </label>
          <input
            type="date"
            value={selectedEndDate}
            onChange={(e) => setSelectedEndDate(e.target.value)}
            min={selectedDate}
            className="w-full px-4 py-3 border-2 border-primary-200 rounded-xl focus:border-nzoo-dark focus:ring-2 focus:ring-nzoo-dark/20 transition-all duration-300 font-body"
          />
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-primary-600 font-body">{t.loading}</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-body">{error}</p>
          <button
            onClick={loadGeneralAvailability}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-body"
          >
            {t.refresh}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Disponibilité générale */}
          <div>
            <h4 className="text-lg font-semibold text-nzoo-dark mb-4 font-heading flex items-center">
              <Building className="w-5 h-5 mr-2 text-primary-500" />
              {t.generalAvailability}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((space) => {
                const status = getAvailabilityStatus(space.isAvailable, space.availableSlots, space.maxCapacity);
                return (
                  <div
                    key={space.spaceType}
                    className="p-4 rounded-xl border-2 border-primary-200 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-nzoo-dark font-body">
                        {spaceTypes.find(s => s.key === space.spaceType)?.label || space.spaceType}
                      </h5>
                      {getAvailabilityIcon(space.isAvailable, space.availableSlots, space.maxCapacity)}
                    </div>
                    
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${status.color}`}>
                      {status.status}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-600 font-body">{t.currentOccupancy}:</span>
                        <span className="font-semibold text-nzoo-dark">{space.currentOccupancy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600 font-body">{t.maxCapacity}:</span>
                        <span className="font-semibold text-nzoo-dark">{space.maxCapacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600 font-body">{t.availableSlots}:</span>
                        <span className="font-semibold text-nzoo-dark">{space.availableSlots}</span>
                      </div>
                    </div>

                    <p className="text-xs text-primary-600 mt-3 font-body">
                      {space.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disponibilité pour une période spécifique */}
          {selectedSpaceType !== 'all' && dateAvailability && (
            <div>
              <h4 className="text-lg font-semibold text-nzoo-dark mb-4 font-heading flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-500" />
                {t.specificDateAvailability}
              </h4>
              <div className="p-4 rounded-xl border-2 border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="font-semibold text-nzoo-dark font-body">
                      {spaceTypes.find(s => s.key === selectedSpaceType)?.label || selectedSpaceType}
                    </h5>
                    <p className="text-sm text-primary-600 font-body">
                      {selectedDate} - {selectedEndDate}
                    </p>
                  </div>
                  {getAvailabilityIcon(dateAvailability.isAvailable, dateAvailability.availableSlots || 0, dateAvailability.maxCapacity)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-body">Statut:</span>
                      <span className={`font-semibold ${dateAvailability.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {dateAvailability.isAvailable ? t.available : t.unavailable}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-body">{t.conflicts}:</span>
                      <span className="font-semibold text-nzoo-dark">
                        {dateAvailability.conflictingReservations || 0}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-body">{t.maxCapacity}:</span>
                      <span className="font-semibold text-nzoo-dark">{dateAvailability.maxCapacity}</span>
                    </div>
                    {dateAvailability.message && (
                      <p className="text-sm text-primary-600 font-body">
                        {dateAvailability.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dates suggérées */}
                {dateAvailability.suggestedDates && dateAvailability.suggestedDates.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <h6 className="font-semibold text-nzoo-dark mb-3 font-body">
                      {t.suggestedDates}:
                    </h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dateAvailability.suggestedDates.map((suggestion: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedDate(suggestion.start);
                            setSelectedEndDate(suggestion.end);
                          }}
                          className="p-2 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors text-sm font-body"
                        >
                          <div className="font-medium text-nzoo-dark">
                            {new Date(suggestion.start).toLocaleDateString('fr-FR')} - {new Date(suggestion.end).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-primary-600 text-xs">
                            {t.selectDate}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message si aucune donnée */}
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <p className="text-primary-600 font-body">
                {selectedSpaceType === 'all' 
                  ? 'Aucune donnée de disponibilité disponible'
                  : `Aucune donnée disponible pour ${spaceTypes.find(s => s.key === selectedSpaceType)?.label}`
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
