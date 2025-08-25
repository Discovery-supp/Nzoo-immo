import React, { useState, useEffect } from 'react';
import { 
  startAutoReservationCron, 
  stopAutoReservationCron, 
  updateCronConfig, 
  getCronConfig, 
  getCronStatus,
  runManualUpdate
} from '../services/autoReservationCron';
import { useAuth } from '../hooks/useAuth';

interface CronJobConfigProps {
  language?: 'fr' | 'en';
}

const CronJobConfig: React.FC<CronJobConfigProps> = ({ language = 'fr' }) => {
  const { isAdmin, userProfile } = useAuth();
  const [config, setConfig] = useState(getCronConfig());
  const [status, setStatus] = useState(getCronStatus());
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const translations = {
    fr: {
      title: 'Configuration du Cron Job',
      subtitle: 'Gestion automatique des réservations en arrière-plan',
      enabled: 'Activé',
      disabled: 'Désactivé',
      intervalMinutes: 'Intervalle (minutes)',
      startCron: 'Démarrer le Cron',
      stopCron: 'Arrêter le Cron',
      runNow: 'Exécuter maintenant',
      status: 'Statut',
      running: 'En cours d\'exécution',
      stopped: 'Arrêté',
      lastRun: 'Dernière exécution',
      nextRun: 'Prochaine exécution',
      totalRuns: 'Total des exécutions',
      never: 'Jamais',
      notScheduled: 'Non programmé',
      saveConfig: 'Sauvegarder la configuration',
      configSaved: 'Configuration sauvegardée',
      cronStarted: 'Cron démarré',
      cronStopped: 'Cron arrêté',
      manualRunSuccess: 'Exécution manuelle réussie',
      adminOnly: 'Accès réservé aux administrateurs',
      settings: 'Paramètres',
      notifications: 'Notifications',
      enableNotifications: 'Activer les notifications',
      notificationPermission: 'Permission de notification',
      requestPermission: 'Demander la permission',
      permissionGranted: 'Permission accordée',
      permissionDenied: 'Permission refusée',
      permissionDefault: 'Permission par défaut',
      lastResult: 'Dernier résultat',
      noLastResult: 'Aucun résultat disponible'
    },
    en: {
      title: 'Cron Job Configuration',
      subtitle: 'Automatic reservation management in background',
      enabled: 'Enabled',
      disabled: 'Disabled',
      intervalMinutes: 'Interval (minutes)',
      startCron: 'Start Cron',
      stopCron: 'Stop Cron',
      runNow: 'Run Now',
      status: 'Status',
      running: 'Running',
      stopped: 'Stopped',
      lastRun: 'Last Run',
      nextRun: 'Next Run',
      totalRuns: 'Total Runs',
      never: 'Never',
      notScheduled: 'Not Scheduled',
      saveConfig: 'Save Configuration',
      configSaved: 'Configuration saved',
      cronStarted: 'Cron started',
      cronStopped: 'Cron stopped',
      manualRunSuccess: 'Manual run successful',
      adminOnly: 'Admin access only',
      settings: 'Settings',
      notifications: 'Notifications',
      enableNotifications: 'Enable notifications',
      notificationPermission: 'Notification permission',
      requestPermission: 'Request permission',
      permissionGranted: 'Permission granted',
      permissionDenied: 'Permission denied',
      permissionDefault: 'Permission default',
      lastResult: 'Last result',
      noLastResult: 'No result available'
    }
  };

  const t = translations[language];

  // Vérifier les permissions d'administrateur
  if (!isAdmin || userProfile?.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 font-semibold text-lg mb-2">🔒 {t.adminOnly}</div>
        <p className="text-red-500">Vous devez être administrateur pour accéder à cette fonctionnalité.</p>
      </div>
    );
  }

  // Mettre à jour le statut périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getCronStatus());
    }, 5000); // Mise à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = (field: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = () => {
    updateCronConfig(config);
    setStatus(getCronStatus());
  };

  const handleStartCron = () => {
    startAutoReservationCron();
    setStatus(getCronStatus());
  };

  const handleStopCron = () => {
    stopAutoReservationCron();
    setStatus(getCronStatus());
  };

  const handleRunNow = async () => {
    setIsLoading(true);
    try {
      const result = await runManualUpdate();
      setLastResult(result);
    } catch (error) {
      console.error('Erreur lors de l\'exécution manuelle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Permission de notification:', permission);
    }
  };

  const getNotificationPermissionStatus = () => {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  };

  const formatDate = (date?: Date) => {
    if (!date) return t.never;
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.settings}</h3>
        
        <div className="space-y-4">
          {/* Activation */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">
                {config.enabled ? t.enabled : t.disabled}
              </span>
            </label>
          </div>

          {/* Intervalle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.intervalMinutes}
            </label>
            <input
              type="number"
              value={config.intervalMinutes}
              onChange={(e) => handleConfigChange('intervalMinutes', parseInt(e.target.value) || 60)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="15"
              max="1440"
            />
            <p className="text-xs text-gray-500 mt-1">
              Min: 15 minutes, Max: 24 heures (1440 minutes)
            </p>
          </div>

          {/* Sauvegarder */}
          <button
            onClick={handleSaveConfig}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            💾 {t.saveConfig}
          </button>
        </div>
      </div>

      {/* Statut */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.status}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Statut:</span>
              <span className={`text-sm font-medium ${
                status.isRunning ? 'text-green-600' : 'text-red-600'
              }`}>
                {status.isRunning ? '🟢 ' + t.running : '🔴 ' + t.stopped}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">{t.lastRun}:</span>
              <span className="text-sm text-gray-900">{formatDate(status.lastRun)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">{t.nextRun}:</span>
              <span className="text-sm text-gray-900">
                {status.nextRun ? formatDate(status.nextRun) : t.notScheduled}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">{t.totalRuns}:</span>
              <span className="text-sm font-medium text-gray-900">{status.totalRuns}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleStartCron}
              disabled={status.isEnabled}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🚀 {t.startCron}
            </button>
            
            <button
              onClick={handleStopCron}
              disabled={!status.isEnabled}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ⏹️ {t.stopCron}
            </button>
            
            <button
              onClick={handleRunNow}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳' : '🔧'} {t.runNow}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.notifications}</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t.notificationPermission}:</span>
            <span className={`text-sm font-medium ${
              getNotificationPermissionStatus() === 'granted' ? 'text-green-600' : 'text-red-600'
            }`}>
              {getNotificationPermissionStatus() === 'granted' ? '✅ ' + t.permissionGranted :
               getNotificationPermissionStatus() === 'denied' ? '❌ ' + t.permissionDenied :
               '❓ ' + t.permissionDefault}
            </span>
          </div>
          
          {getNotificationPermissionStatus() !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              🔔 {t.requestPermission}
            </button>
          )}
        </div>
      </div>

      {/* Dernier résultat */}
      {lastResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.lastResult}</h3>
          
          <div className={`p-4 rounded-lg ${
            lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <span className={`text-lg ${lastResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {lastResult.success ? '✅' : '❌'}
              </span>
              <span className={`ml-2 font-semibold ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {lastResult.success ? 'Succès' : 'Erreur'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{lastResult.updatedCount || 0}</div>
                <div className="text-gray-600">Mises à jour</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{lastResult.cancelledCount || 0}</div>
                <div className="text-gray-600">Annulées</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{lastResult.completedCount || 0}</div>
                <div className="text-gray-600">Terminées</div>
              </div>
            </div>
            
            {lastResult.errors && lastResult.errors.length > 0 && (
              <div className="mt-4">
                <div className="font-medium text-red-800 mb-2">Erreurs:</div>
                <ul className="text-sm text-red-700 space-y-1">
                  {lastResult.errors.map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CronJobConfig;
