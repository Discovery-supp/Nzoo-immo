import React from 'react';
import { useToastContext } from './ToastProvider';
import ToastMessageManager from '../utils/toastMessages';
import ToastExample from './ToastExample';

interface ToastDemoProps {
  language: 'fr' | 'en';
}

const ToastDemo: React.FC<ToastDemoProps> = ({ language }) => {
  const { success, error, warning, info, addToast, clearToasts } = useToastContext();

  // Configurer la langue
  React.useEffect(() => {
    ToastMessageManager.setLanguage(language === 'fr' ? 'FR' : 'EN');
  }, [language]);

  const handleQuickTest = () => {
    success('Test rapide - Succès !');
    setTimeout(() => error('Test rapide - Erreur !'), 1000);
    setTimeout(() => warning('Test rapide - Avertissement !'), 2000);
    setTimeout(() => info('Test rapide - Information !'), 3000);
  };

  const handlePersistentToast = () => {
    addToast('warning', 'Ce message ne se fermera pas automatiquement. Vous devez le fermer manuellement.', {
      title: 'Message Persistant',
      persistent: true,
      action: {
        label: 'Fermer',
        onClick: () => clearToasts()
      }
    });
  };

  const handleActionToast = () => {
    addToast('info', 'Voulez-vous voir plus de détails sur cette opération ?', {
      title: 'Action Requise',
      duration: 10000,
      action: {
        label: 'Voir détails',
        onClick: () => {
          success('Détails affichés avec succès !');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-28 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Démonstration du Système de Toast
          </h1>
          <p className="text-lg text-gray-600">
            Testez toutes les fonctionnalités du nouveau système de notification unifié
          </p>
        </div>

        {/* Tests rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleQuickTest}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Test Rapide
          </button>
          
          <button
            onClick={handlePersistentToast}
            className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Toast Persistant
          </button>
          
          <button
            onClick={handleActionToast}
            className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Toast avec Action
          </button>
          
          <button
            onClick={clearToasts}
            className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Effacer Tout
          </button>
        </div>

        {/* Démonstration complète */}
        <ToastExample language={language} />

        {/* Informations sur le système */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            À propos du système
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Fonctionnalités principales
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Design moderne avec animations fluides</li>
                <li>• Support multilingue (FR/EN)</li>
                <li>• Barre de progression automatique</li>
                <li>• Actions personnalisables</li>
                <li>• Messages persistants ou temporaires</li>
                <li>• Gestion de file d'attente intelligente</li>
                <li>• Positions multiples configurables</li>
                <li>• Design responsive</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Types de messages
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Success - Opérations réussies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Error - Erreurs et problèmes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">Warning - Avertissements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Info - Informations générales</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              Code d'exemple
            </h4>
            <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`// Utilisation simple
const { success, error, warning, info } = useToastContext();

success('Opération réussie !');
error('Une erreur est survenue');

// Utilisation avancée
addToast('success', 'Message personnalisé', {
  title: 'Titre personnalisé',
  duration: 8000,
  action: {
    label: 'Voir détails',
    onClick: () => console.log('Action cliquée')
  }
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;

