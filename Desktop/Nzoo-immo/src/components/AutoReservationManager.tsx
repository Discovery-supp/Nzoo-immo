import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Play,
  Pause,
  Settings,
  BarChart3
} from 'lucide-react';
import { 
  autoUpdateReservationStatuses, 
  getReservationSummary,
  runAutoUpdateWithCustomCriteria 
} from '../services/reservationAutoManagement';
import { getRulesSummary } from '../utils/reservationRules';

interface AutoReservationManagerProps {
  language: 'fr' | 'en';
}

const AutoReservationManager: React.FC<AutoReservationManagerProps> = ({ language }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [results, setResults] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const t = {
    fr: {
      title: 'Gestion Automatique des Réservations',
      subtitle: 'Système d\'annulation et completion automatique',
      startAuto: 'Démarrer Mode Auto',
      stopAuto: 'Arrêter Mode Auto',
      runManual: 'Exécuter Maintenant',
      lastRun: 'Dernière exécution',
      never: 'Jamais',
      autoMode: 'Mode Automatique',
      manualMode: 'Mode Manuel',
      rules: 'Règles Actives',
      results: 'Résultats',
      summary: 'Résumé',
      loading: 'Exécution en cours...',
      noResults: 'Aucun résultat disponible',
      error: 'Erreur lors de l\'exécution'
    },
    en: {
      title: 'Automatic Reservation Management',
      subtitle: 'Automatic cancellation and completion system',
      startAuto: 'Start Auto Mode',
      stopAuto: 'Stop Auto Mode',
      runManual: 'Run Now',
      lastRun: 'Last run',
      never: 'Never',
      autoMode: 'Auto Mode',
      manualMode: 'Manual Mode',
      rules: 'Active Rules',
      results: 'Results',
      summary: 'Summary',
      loading: 'Running...',
      noResults: 'No results available',
      error: 'Error during execution'
    }
  };

  const translations = t[language];
  const rulesSummary = getRulesSummary(language);

  // Fonction pour exécuter la vérification automatique
  const runAutoUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Démarrage de la vérification automatique...');
      
      const result = await autoUpdateReservationStatuses();
      setResults(result);
      setLastRun(new Date());
      
      // Mettre à jour le résumé
      await updateSummary();
      
      console.log('✅ Vérification automatique terminée:', result);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      console.error('❌ Erreur lors de la vérification automatique:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour le résumé
  const updateSummary = async () => {
    try {
      const summaryData = await getReservationSummary();
      setSummary(summaryData);
    } catch (err) {
      console.error('Erreur lors de la récupération du résumé:', err);
    }
  };

  // Fonction pour démarrer le mode automatique
  const startAutoMode = () => {
    setAutoMode(true);
    const interval = setInterval(runAutoUpdate, 5 * 60 * 1000); // Toutes les 5 minutes
    setIntervalId(interval);
    console.log('🔄 Mode automatique démarré (vérification toutes les 5 minutes)');
  };

  // Fonction pour arrêter le mode automatique
  const stopAutoMode = () => {
    setAutoMode(false);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    console.log('⏹️ Mode automatique arrêté');
  };

  // Charger le résumé au montage du composant
  useEffect(() => {
    updateSummary();
  }, []);

  // Nettoyer l'intervalle au démontage
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{translations.title}</h2>
            <p className="text-gray-600 mt-1">{translations.subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            {autoMode ? (
              <button
                onClick={stopAutoMode}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Pause className="w-4 h-4 mr-2" />
                {translations.stopAuto}
              </button>
            ) : (
              <button
                onClick={startAutoMode}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                {translations.startAuto}
              </button>
            )}
            <button
              onClick={runAutoUpdate}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? translations.loading : translations.runManual}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${autoMode ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">
              {autoMode ? translations.autoMode : translations.manualMode}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {translations.lastRun}: {lastRun ? lastRun.toLocaleString() : translations.never}
          </div>
        </div>
      </div>

      {/* Règles */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          {translations.rules}
        </h3>
        <div className="space-y-3">
          {rulesSummary.rules.map((rule, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">{index + 1}</span>
              </div>
              <span className="text-sm text-gray-700">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Résumé */}
      {summary && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            {translations.summary}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
              <div className="text-sm text-yellow-700">En attente</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.confirmed}</div>
              <div className="text-sm text-green-700">Confirmées</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{summary.completed}</div>
              <div className="text-sm text-blue-700">Terminées</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.cancelled}</div>
              <div className="text-sm text-red-700">Annulées</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{summary.total}</div>
              <div className="text-sm text-gray-700">Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Résultats */}
      {results && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{translations.results}</h3>
          
          {results.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{results.updatedCount}</div>
                  <div className="text-sm text-blue-700">Mises à jour</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.cancelledCount}</div>
                  <div className="text-sm text-red-700">Annulées</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.completedCount}</div>
                  <div className="text-sm text-green-700">Terminées</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Erreurs ({results.errors.length})</h4>
                  <div className="space-y-1">
                    {results.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm text-red-700">{error}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{translations.error}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoReservationManager;
