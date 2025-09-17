import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Settings, RefreshCw, Trash2, ExternalLink, Check, X } from 'lucide-react';
import { 
  getUserCalendarIntegrations,
  authenticateGoogleCalendar,
  authenticateOutlookCalendar,
  addICalCalendar,
  syncCalendarEvents,
  CalendarIntegration as CalendarIntegrationType,
  CALENDAR_PROVIDERS
} from '../services/calendarIntegrationService';

interface CalendarIntegrationProps {
  language?: 'fr' | 'en';
  className?: string;
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({ 
  language = 'fr',
  className = ''
}) => {
  const [integrations, setIntegrations] = useState<CalendarIntegrationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'outlook' | 'ical' | null>(null);
  const [icalUrl, setIcalUrl] = useState('');
  const [icalName, setIcalName] = useState('');
  const [syncing, setSyncing] = useState<string | null>(null);

  const translations = {
    fr: {
      title: 'Intégration Calendrier',
      subtitle: 'Connectez vos calendriers externes',
      addCalendar: 'Ajouter un calendrier',
      noIntegrations: 'Aucun calendrier connecté',
      connect: 'Connecter',
      disconnect: 'Déconnecter',
      sync: 'Synchroniser',
      syncing: 'Synchronisation...',
      lastSync: 'Dernière sync',
      never: 'Jamais',
      enabled: 'Activé',
      disabled: 'Désactivé',
      oneWay: 'Lecture seule',
      twoWay: 'Bidirectionnel',
      addICal: 'Ajouter un calendrier iCal',
      icalUrl: 'URL du calendrier',
      icalName: 'Nom du calendrier',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      googleCalendar: 'Google Calendar',
      outlookCalendar: 'Outlook Calendar',
      iCalCalendar: 'Calendrier iCal'
    },
    en: {
      title: 'Calendar Integration',
      subtitle: 'Connect your external calendars',
      addCalendar: 'Add Calendar',
      noIntegrations: 'No connected calendars',
      connect: 'Connect',
      disconnect: 'Disconnect',
      sync: 'Sync',
      syncing: 'Syncing...',
      lastSync: 'Last sync',
      never: 'Never',
      enabled: 'Enabled',
      disabled: 'Disabled',
      oneWay: 'Read only',
      twoWay: 'Two way',
      addICal: 'Add iCal Calendar',
      icalUrl: 'Calendar URL',
      icalName: 'Calendar name',
      cancel: 'Cancel',
      save: 'Save',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      googleCalendar: 'Google Calendar',
      outlookCalendar: 'Outlook Calendar',
      iCalCalendar: 'iCal Calendar'
    }
  };

  const t = translations[language];

  // Charger les intégrations
  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await import('../services/supabaseClient').then(m => m.supabase.auth.getUser());
      
      if (user) {
        const userIntegrations = await getUserCalendarIntegrations(user.id);
        setIntegrations(userIntegrations);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des intégrations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Connecter Google Calendar
  const handleConnectGoogle = async () => {
    try {
      const success = await authenticateGoogleCalendar();
      if (success) {
        await loadIntegrations();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Google Calendar:', error);
    }
  };

  // Connecter Outlook Calendar
  const handleConnectOutlook = async () => {
    try {
      const success = await authenticateOutlookCalendar();
      if (success) {
        await loadIntegrations();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Outlook Calendar:', error);
    }
  };

  // Ajouter un calendrier iCal
  const handleAddICal = async () => {
    if (!icalUrl || !icalName) return;
    
    try {
      const success = await addICalCalendar(icalUrl, icalName);
      if (success) {
        await loadIntegrations();
        setShowAddModal(false);
        setIcalUrl('');
        setIcalName('');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du calendrier iCal:', error);
    }
  };

  // Synchroniser un calendrier
  const handleSync = async (integrationId: string) => {
    setSyncing(integrationId);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3); // 3 mois à venir
      
      const result = await syncCalendarEvents(integrationId, startDate, endDate);
      
      if (result.success) {
        console.log(`Synchronisation réussie: ${result.events_added} ajoutés, ${result.events_updated} mis à jour`);
      } else {
        console.error('Erreur lors de la synchronisation:', result.errors);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    } finally {
      setSyncing(null);
    }
  };

  // Formater la date de dernière synchronisation
  const formatLastSync = (lastSync: string | null): string => {
    if (!lastSync) return t.never;
    
    const date = new Date(lastSync);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t.never;
    if (minutes < 60) return `${minutes}m ${t.ago}`;
    if (hours < 24) return `${hours}h ${t.ago}`;
    if (days < 7) return `${days}d ${t.ago}`;
    
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  // Charger les intégrations au montage
  useEffect(() => {
    loadIntegrations();
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addCalendar}</span>
        </button>
      </div>

      {/* Liste des intégrations */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-500">{t.loading}</p>
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noIntegrations}</h3>
          <p className="text-gray-500 mb-4">Connectez vos calendriers pour synchroniser vos événements</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.addCalendar}
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {integrations.map((integration) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Icône du fournisseur */}
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: integration.color }}
                  >
                    {CALENDAR_PROVIDERS[integration.type.toUpperCase() as keyof typeof CALENDAR_PROVIDERS]?.icon || '📅'}
                  </div>

                  {/* Informations */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        integration.enabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {integration.enabled ? t.enabled : t.disabled}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {integration.sync_direction === 'one_way' ? t.oneWay : t.twoWay}
                      </span>
                      <span className="flex items-center space-x-1">
                        <RefreshCw className="w-3 h-3" />
                        <span>{t.lastSync}: {formatLastSync(integration.last_sync)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSync(integration.id)}
                    disabled={syncing === integration.id}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {syncing === integration.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                        <span>{t.syncing}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>{t.sync}</span>
                      </>
                    )}
                  </button>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  <button className="p-2 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t.addCalendar}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Google Calendar */}
              <button
                onClick={() => setSelectedProvider('google')}
                className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  {CALENDAR_PROVIDERS.GOOGLE.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{t.googleCalendar}</div>
                  <div className="text-sm text-gray-500">Synchronisation bidirectionnelle</div>
                </div>
              </button>

              {/* Outlook Calendar */}
              <button
                onClick={() => setSelectedProvider('outlook')}
                className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  {CALENDAR_PROVIDERS.OUTLOOK.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{t.outlookCalendar}</div>
                  <div className="text-sm text-gray-500">Synchronisation bidirectionnelle</div>
                </div>
              </button>

              {/* iCal */}
              <button
                onClick={() => setSelectedProvider('ical')}
                className="w-full flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                  {CALENDAR_PROVIDERS.ICAL.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">{t.iCalCalendar}</div>
                  <div className="text-sm text-gray-500">Lecture seule</div>
                </div>
              </button>

              {/* Formulaire iCal */}
              {selectedProvider === 'ical' && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.icalName}
                    </label>
                    <input
                      type="text"
                      value={icalName}
                      onChange={(e) => setIcalName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mon calendrier"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t.icalUrl}
                    </label>
                    <input
                      type="url"
                      value={icalUrl}
                      onChange={(e) => setIcalUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/calendar.ics"
                    />
                  </div>
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setSelectedProvider(null)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={handleAddICal}
                      disabled={!icalUrl || !icalName}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {t.save}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions pour Google/Outlook */}
              {selectedProvider && selectedProvider !== 'ical' && (
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedProvider(null)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={selectedProvider === 'google' ? handleConnectGoogle : handleConnectOutlook}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t.connect}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CalendarIntegration;
