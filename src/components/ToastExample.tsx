import React from 'react';
import { useToastContext } from './ToastProvider';
import ToastMessageManager from '../utils/toastMessages';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Bell,
  CreditCard,
  User,
  Settings,
  Database
} from 'lucide-react';

interface ToastExampleProps {
  language: 'fr' | 'en';
}

const ToastExample: React.FC<ToastExampleProps> = ({ language }) => {
  const { success, error, warning, info, addToast } = useToastContext();

  // Configurer la langue
  React.useEffect(() => {
    ToastMessageManager.setLanguage(language === 'fr' ? 'FR' : 'EN');
  }, [language]);

  const handleBasicToasts = () => {
    success('Opération réussie !');
    error('Une erreur est survenue');
    warning('Attention, action requise');
    info('Information importante');
  };

  const handleCustomToasts = () => {
    addToast('success', 'Action personnalisée réussie', {
      title: 'Succès Personnalisé',
      duration: 8000,
      action: {
        label: 'Voir les détails',
        onClick: () => console.log('Détails affichés')
      }
    });

    addToast('error', 'Erreur critique détectée', {
      title: 'Erreur Critique',
      persistent: true,
      action: {
        label: 'Réessayer',
        onClick: () => console.log('Tentative de réessai')
      }
    });
  };

  const handlePaymentMessages = () => {
    const paymentSuccess = ToastMessageManager.getPaymentMessage('success', 'visa');
    success(paymentSuccess.message, { title: paymentSuccess.title });

    const paymentPending = ToastMessageManager.getPaymentMessage('pending', 'cash');
    warning(paymentPending.message, { title: paymentPending.title });

    const paymentFailed = ToastMessageManager.getPaymentMessage('failed', 'card');
    error(paymentFailed.message, { title: paymentFailed.title });
  };

  const handleReservationMessages = () => {
    const created = ToastMessageManager.getReservationMessage('created');
    success(created.message, { title: created.title });

    const updated = ToastMessageManager.getReservationMessage('updated');
    info(updated.message, { title: updated.title });

    const cancelled = ToastMessageManager.getReservationMessage('cancelled');
    warning(cancelled.message, { title: cancelled.title });
  };

  const handleValidationMessages = () => {
    const emailError = ToastMessageManager.getValidationMessage('email', 'invalid');
    error(emailError.message, { title: emailError.title });

    const passwordError = ToastMessageManager.getValidationMessage('password', 'tooShort');
    error(passwordError.message, { title: passwordError.title });

    const requiredError = ToastMessageManager.getValidationMessage('fullName', 'required');
    error(requiredError.message, { title: requiredError.title });
  };

  const handleSystemMessages = () => {
    const maintenance = ToastMessageManager.getSystemMessage('maintenance');
    warning(maintenance.message, { title: maintenance.title });

    const backup = ToastMessageManager.getSystemMessage('backup');
    success(backup.message, { title: backup.title });

    const sync = ToastMessageManager.getSystemMessage('sync');
    info(sync.message, { title: sync.title });
  };

  const handleAuthMessages = () => {
    const login = ToastMessageManager.getAuthMessage('login');
    success(login.message, { title: login.title });

    const logout = ToastMessageManager.getAuthMessage('logout');
    info(logout.message, { title: logout.title });

    const register = ToastMessageManager.getAuthMessage('register');
    success(register.message, { title: register.title });
  };

  const handleMultipleToasts = () => {
    // Afficher plusieurs toasts rapidement
    setTimeout(() => success('Premier message'), 0);
    setTimeout(() => info('Deuxième message'), 500);
    setTimeout(() => warning('Troisième message'), 1000);
    setTimeout(() => error('Quatrième message'), 1500);
    setTimeout(() => success('Cinquième message'), 2000);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Démonstration du Système de Toast
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Toasts de base */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Toasts de Base
          </h3>
          <button
            onClick={handleBasicToasts}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Afficher les toasts de base
          </button>
        </div>

        {/* Toasts personnalisés */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Toasts Personnalisés
          </h3>
          <button
            onClick={handleCustomToasts}
            className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Toasts avec actions
          </button>
        </div>

        {/* Messages de paiement */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Messages de Paiement
          </h3>
          <button
            onClick={handlePaymentMessages}
            className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Simuler des paiements
          </button>
        </div>

        {/* Messages de réservation */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            Messages de Réservation
          </h3>
          <button
            onClick={handleReservationMessages}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Actions de réservation
          </button>
        </div>

        {/* Messages de validation */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Messages de Validation
          </h3>
          <button
            onClick={handleValidationMessages}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Erreurs de validation
          </button>
        </div>

        {/* Messages système */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Messages Système
          </h3>
          <button
            onClick={handleSystemMessages}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Messages système
          </button>
        </div>

        {/* Messages d'authentification */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            Messages d'Auth
          </h3>
          <button
            onClick={handleAuthMessages}
            className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Actions d'authentification
          </button>
        </div>

        {/* Multiple toasts */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Toasts Multiples
          </h3>
          <button
            onClick={handleMultipleToasts}
            className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Afficher plusieurs toasts
          </button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Fonctionnalités du système :</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Animations fluides avec Framer Motion</li>
          <li>• Barre de progression automatique</li>
          <li>• Actions personnalisables</li>
          <li>• Messages persistants ou temporaires</li>
          <li>• Gestion de la file d'attente</li>
          <li>• Support multilingue</li>
          <li>• Design responsive et moderne</li>
          <li>• Fermeture manuelle ou automatique</li>
        </ul>
      </div>
    </div>
  );
};

export default ToastExample;

