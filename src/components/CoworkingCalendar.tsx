import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Building, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { checkSpaceAvailability } from '../services/availabilityService';
import { supabase } from '../services/supabaseClient';

interface CoworkingCalendarProps {
  language: 'fr' | 'en';
  userRole?: 'admin' | 'client';
}

interface DayAvailability {
  date: string;
  isAvailable: boolean;
  occupiedSpaces: number;
  availableSpaces: number;
  reservations: any[];
  isToday: boolean;
  isPast: boolean;
}

interface Reservation {
  id: string;
  start_date: string;
  end_date: string;
  full_name: string;
  status: string;
  space_type: string;
}

const CoworkingCalendar: React.FC<CoworkingCalendarProps> = ({ language, userRole = 'client' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayAvailability, setDayAvailability] = useState<DayAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<DayAvailability[]>([]);

  const COWORKING_MAX_CAPACITY = 4;

  const translations = {
    fr: {
      title: 'Calendrier Coworking',
      subtitle: 'Consultez la disponibilité des 4 espaces coworking',
      refresh: 'Actualiser',
      available: 'Disponible',
      unavailable: 'Complet',
      partiallyAvailable: 'Partiellement disponible',
      spaces: 'espaces',
      occupied: 'occupés',
      free: 'libres',
      loading: 'Chargement...',
      error: 'Erreur lors du chargement',
      noData: 'Aucune donnée disponible',
      reservations: 'Réservations',
      noReservations: 'Aucune réservation',
      status: 'Statut',
      client: 'Client',
      period: 'Période',
      today: 'Aujourd\'hui',
      selectDate: 'Sélectionner une date',
      previousMonth: 'Mois précédent',
      nextMonth: 'Mois suivant',
      legend: {
        available: 'Disponible (0-3 espaces occupés)',
        partiallyAvailable: 'Partiellement disponible (4 espaces occupés)',
        unavailable: 'Complet (4 espaces occupés)',
        past: 'Date passée'
      }
    },
    en: {
      title: 'Coworking Calendar',
      subtitle: 'Check availability of the 4 coworking spaces',
      refresh: 'Refresh',
      available: 'Available',
      unavailable: 'Full',
      partiallyAvailable: 'Partially available',
      spaces: 'spaces',
      occupied: 'occupied',
      free: 'free',
      loading: 'Loading...',
      error: 'Error loading data',
      noData: 'No data available',
      reservations: 'Reservations',
      noReservations: 'No reservations',
      status: 'Status',
      client: 'Client',
      period: 'Period',
      today: 'Today',
      selectDate: 'Select a date',
      previousMonth: 'Previous month',
      nextMonth: 'Next month',
      legend: {
        available: 'Available (0-3 spaces occupied)',
        partiallyAvailable: 'Partially available (4 spaces occupied)',
        unavailable: 'Full (4 spaces occupied)',
        past: 'Past date'
      }
    }
  };

  const t = translations[language];

  // Générer les données du mois
  const generateMonthData = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay()); // Commencer du dimanche
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // Finir le samedi

      const monthData: DayAvailability[] = [];
      const currentDate = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = currentDate.getTime() === today.getTime();
        const isPast = currentDate < today;

        // Récupérer les réservations pour cette date
        const { data: reservations, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('space_type', 'coworking')
          .in('status', ['confirmed', 'pending'])
          .or(`and(start_date.lte.${dateStr},end_date.gte.${dateStr})`);

        if (error) {
          console.error('Error fetching reservations:', error);
        }

        const occupiedSpaces = reservations?.length || 0;
        const availableSpaces = Math.max(0, COWORKING_MAX_CAPACITY - occupiedSpaces);
        const isAvailable = availableSpaces > 0;

        monthData.push({
          date: dateStr,
          isAvailable: isAvailable && !isPast,
          occupiedSpaces,
          availableSpaces,
          reservations: reservations || [],
          isToday,
          isPast
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setMonthData(monthData);
    } catch (err) {
      console.error('Error generating month data:', err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données du mois au montage et quand la date change
  useEffect(() => {
    generateMonthData(currentDate);
  }, [currentDate]);

  // Gestion de la sélection de date
  const handleDateClick = async (dayData: DayAvailability) => {
    if (dayData.isPast) return;

    setSelectedDate(dayData.date);
    setDayAvailability(dayData);
  };

  // Navigation du calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Obtenir la classe CSS pour un jour
  const getDayClass = (dayData: DayAvailability) => {
    const baseClass = "w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium";
    
    if (dayData.isPast) {
      return `${baseClass} bg-gray-100 text-gray-400 cursor-not-allowed`;
    }
    
    if (dayData.isToday) {
      return `${baseClass} bg-nzoo-dark text-white font-bold`;
    }
    
    if (!dayData.isAvailable) {
      return `${baseClass} bg-red-100 text-red-600 hover:bg-red-200`;
    }
    
    if (dayData.availableSpaces === COWORKING_MAX_CAPACITY) {
      return `${baseClass} bg-green-100 text-green-600 hover:bg-green-200`;
    }
    
    if (dayData.availableSpaces > 0) {
      return `${baseClass} bg-yellow-100 text-yellow-600 hover:bg-yellow-200`;
    }
    
    return `${baseClass} bg-gray-100 text-gray-600 hover:bg-gray-200`;
  };

  // Obtenir l'icône pour un jour
  const getDayIcon = (dayData: DayAvailability) => {
    if (dayData.isPast) return null;
    if (!dayData.isAvailable) return <XCircle className="w-3 h-3" />;
    if (dayData.availableSpaces === COWORKING_MAX_CAPACITY) return <CheckCircle className="w-3 h-3" />;
    if (dayData.availableSpaces > 0) return <AlertCircle className="w-3 h-3" />;
    return null;
  };

  // Obtenir le statut textuel
  const getDayStatus = (dayData: DayAvailability) => {
    if (dayData.isPast) return t.legend.past;
    if (!dayData.isAvailable) return t.unavailable;
    if (dayData.availableSpaces === COWORKING_MAX_CAPACITY) return t.available;
    return t.partiallyAvailable;
  };

  const monthNames = language === 'fr' 
    ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = language === 'fr'
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
          onClick={() => generateMonthData(currentDate)}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {t.refresh}
        </button>
      </div>

      {/* Navigation du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
            title={t.previousMonth}
          >
            <ChevronLeft className="w-5 h-5 text-primary-600" />
          </button>
          <h4 className="text-xl font-semibold text-nzoo-dark font-heading">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h4>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
            title={t.nextMonth}
          >
            <ChevronRight className="w-5 h-5 text-primary-600" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 bg-nzoo-dark text-white rounded-xl hover:bg-nzoo-dark-light transition-colors font-body"
        >
          {t.today}
        </button>
      </div>

      {/* Légende */}
      <div className="mb-6 p-4 bg-primary-50 rounded-xl">
        <h5 className="font-semibold text-nzoo-dark mb-3 font-body">Légende :</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-green-600" />
            </div>
            <span className="text-primary-700 font-body">{t.legend.available}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-yellow-600" />
            </div>
            <span className="text-primary-700 font-body">{t.legend.partiallyAvailable}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
              <XCircle className="w-3 h-3 text-red-600" />
            </div>
            <span className="text-primary-700 font-body">{t.legend.unavailable}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs text-gray-400">-</span>
            </div>
            <span className="text-primary-700 font-body">{t.legend.past}</span>
          </div>
        </div>
      </div>

      {/* Calendrier */}
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
            onClick={() => generateMonthData(currentDate)}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-body"
          >
            {t.refresh}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grille du calendrier */}
          <div className="bg-white rounded-xl border border-primary-200 overflow-hidden">
            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 bg-primary-50">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-primary-700 font-body">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Jours du mois */}
            <div className="grid grid-cols-7">
              {monthData.map((dayData, index) => {
                const date = new Date(dayData.date);
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                
                return (
                  <div
                    key={index}
                    className={`p-2 min-h-[60px] border-r border-b border-primary-100 ${
                      !isCurrentMonth ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <button
                        onClick={() => handleDateClick(dayData)}
                        className={getDayClass(dayData)}
                        disabled={dayData.isPast}
                        title={`${date.getDate()} - ${getDayStatus(dayData)}`}
                      >
                        {date.getDate()}
                        {getDayIcon(dayData)}
                      </button>
                      
                      {isCurrentMonth && !dayData.isPast && (
                        <div className="text-xs text-center">
                          <div className="text-primary-600 font-body">
                            {dayData.availableSpaces}/{COWORKING_MAX_CAPACITY}
                          </div>
                          <div className="text-xs text-primary-500 font-body">
                            {t.free}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Détails de la date sélectionnée */}
          {selectedDate && dayAvailability && (
            <div className="bg-primary-50 rounded-xl p-6">
              <h5 className="text-lg font-semibold text-nzoo-dark mb-4 font-heading">
                {t.selectDate}: {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h6 className="font-semibold text-nzoo-dark mb-3 font-body">Disponibilité</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-body">Statut:</span>
                      <span className={`font-semibold ${
                        dayAvailability.isAvailable ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getDayStatus(dayAvailability)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-body">Espaces libres:</span>
                      <span className="font-semibold text-nzoo-dark">
                        {dayAvailability.availableSpaces}/{COWORKING_MAX_CAPACITY}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primary-600 font-body">Espaces occupés:</span>
                      <span className="font-semibold text-nzoo-dark">
                        {dayAvailability.occupiedSpaces}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h6 className="font-semibold text-nzoo-dark mb-3 font-body">{t.reservations}</h6>
                  {dayAvailability.reservations.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {dayAvailability.reservations.map((reservation) => (
                        <div key={reservation.id} className="p-2 bg-white rounded-lg border border-primary-200">
                          <div className="text-sm">
                            <div className="font-medium text-nzoo-dark font-body">
                              {reservation.full_name}
                            </div>
                            <div className="text-primary-600 text-xs font-body">
                              {new Date(reservation.start_date).toLocaleDateString('fr-FR')} - {new Date(reservation.end_date).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-primary-500 font-body">
                              {t.status}: {reservation.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-primary-600 text-sm font-body">{t.noReservations}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoworkingCalendar;



