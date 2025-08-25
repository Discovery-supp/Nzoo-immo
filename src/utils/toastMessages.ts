import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

export interface ToastMessageConfig {
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

export class ToastMessageManager {
  private static language: 'FR' | 'EN' = 'FR';

  static setLanguage(lang: 'FR' | 'EN') {
    this.language = lang;
  }

  static getLanguage() {
    return this.language;
  }

  // Messages de succès
  static getSuccessMessage(key: keyof typeof SUCCESS_MESSAGES.FR): ToastMessageConfig {
    const messages = SUCCESS_MESSAGES[this.language];
    const message = messages[key] || messages.RESERVATION_CREATED;
    
    return {
      title: this.language === 'FR' ? 'Succès' : 'Success',
      message,
      duration: 4000
    };
  }

  // Messages d'erreur
  static getErrorMessage(key: keyof typeof ERROR_MESSAGES.FR, customMessage?: string): ToastMessageConfig {
    const messages = ERROR_MESSAGES[this.language];
    const message = customMessage || messages[key] || messages.UNKNOWN_ERROR;
    
    return {
      title: this.language === 'FR' ? 'Erreur' : 'Error',
      message,
      duration: 6000
    };
  }

  // Messages personnalisés
  static getCustomMessage(
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string,
    options?: Partial<ToastMessageConfig>
  ): ToastMessageConfig {
    return {
      title,
      message,
      duration: options?.duration || (type === 'error' ? 6000 : 4000),
      persistent: options?.persistent || false
    };
  }

  // Messages de validation
  static getValidationMessage(field: string, errorType: string): ToastMessageConfig {
    const fieldNames: Record<string, string> = {
      email: this.language === 'FR' ? 'Email' : 'Email',
      password: this.language === 'FR' ? 'Mot de passe' : 'Password',
      fullName: this.language === 'FR' ? 'Nom complet' : 'Full name',
      phone: this.language === 'FR' ? 'Téléphone' : 'Phone',
      company: this.language === 'FR' ? 'Entreprise' : 'Company',
      address: this.language === 'FR' ? 'Adresse' : 'Address',
      occupants: this.language === 'FR' ? 'Nombre d\'occupants' : 'Number of occupants',
      dates: this.language === 'FR' ? 'Dates' : 'Dates',
      amount: this.language === 'FR' ? 'Montant' : 'Amount'
    };

    const errorMessages: Record<string, string> = {
      required: this.language === 'FR' ? 'est obligatoire' : 'is required',
      invalid: this.language === 'FR' ? 'est invalide' : 'is invalid',
      tooShort: this.language === 'FR' ? 'est trop court' : 'is too short',
      tooLong: this.language === 'FR' ? 'est trop long' : 'is too long',
      alreadyExists: this.language === 'FR' ? 'existe déjà' : 'already exists',
      notFound: this.language === 'FR' ? 'n\'existe pas' : 'does not exist',
      mismatch: this.language === 'FR' ? 'ne correspond pas' : 'does not match'
    };

    const fieldName = fieldNames[field] || field;
    const errorMessage = errorMessages[errorType] || errorMessages.invalid;

    return {
      title: this.language === 'FR' ? 'Erreur de validation' : 'Validation Error',
      message: `${fieldName} ${errorMessage}`,
      duration: 5000
    };
  }

  // Messages de paiement
  static getPaymentMessage(status: 'success' | 'pending' | 'failed', method?: string): ToastMessageConfig {
    const methodNames: Record<string, string> = {
      orange_money: this.language === 'FR' ? 'Orange Money' : 'Orange Money',
      airtel_money: this.language === 'FR' ? 'Airtel Money' : 'Airtel Money',
      cash: this.language === 'FR' ? 'Espèces' : 'Cash',
      card: this.language === 'FR' ? 'Carte bancaire' : 'Card'
    };

    const methodName = method ? methodNames[method] || method : '';

    switch (status) {
      case 'success':
        return {
          title: this.language === 'FR' ? 'Paiement réussi' : 'Payment Successful',
          message: this.language === 'FR' 
            ? `Paiement par ${methodName} effectué avec succès`
            : `Payment via ${methodName} completed successfully`,
          duration: 5000
        };
      case 'pending':
        return {
          title: this.language === 'FR' ? 'Paiement en cours' : 'Payment Pending',
          message: this.language === 'FR'
            ? `Paiement par ${methodName} en cours de traitement`
            : `Payment via ${methodName} is being processed`,
          duration: 8000
        };
      case 'failed':
        return {
          title: this.language === 'FR' ? 'Échec du paiement' : 'Payment Failed',
          message: this.language === 'FR'
            ? `Le paiement par ${methodName} a échoué. Veuillez réessayer.`
            : `Payment via ${methodName} failed. Please try again.`,
          duration: 8000
        };
      default:
        return {
          title: this.language === 'FR' ? 'Erreur de paiement' : 'Payment Error',
          message: this.language === 'FR' ? 'Une erreur est survenue lors du paiement' : 'An error occurred during payment',
          duration: 6000
        };
    }
  }

  // Messages de réservation
  static getReservationMessage(action: 'created' | 'updated' | 'deleted' | 'cancelled'): ToastMessageConfig {
    const actions: Record<string, string> = {
      created: this.language === 'FR' ? 'créée' : 'created',
      updated: this.language === 'FR' ? 'mise à jour' : 'updated',
      deleted: this.language === 'FR' ? 'supprimée' : 'deleted',
      cancelled: this.language === 'FR' ? 'annulée' : 'cancelled'
    };

    return {
      title: this.language === 'FR' ? 'Réservation' : 'Reservation',
      message: this.language === 'FR'
        ? `Réservation ${actions[action]} avec succès`
        : `Reservation ${actions[action]} successfully`,
      duration: 4000
    };
  }

  // Messages de connexion
  static getAuthMessage(action: 'login' | 'logout' | 'register' | 'passwordReset'): ToastMessageConfig {
    const actions: Record<string, string> = {
      login: this.language === 'FR' ? 'Connexion réussie' : 'Login successful',
      logout: this.language === 'FR' ? 'Déconnexion réussie' : 'Logout successful',
      register: this.language === 'FR' ? 'Inscription réussie' : 'Registration successful',
      passwordReset: this.language === 'FR' ? 'Mot de passe réinitialisé' : 'Password reset'
    };

    return {
      title: this.language === 'FR' ? 'Authentification' : 'Authentication',
      message: actions[action],
      duration: 4000
    };
  }

  // Messages de système
  static getSystemMessage(type: 'maintenance' | 'update' | 'backup' | 'sync'): ToastMessageConfig {
    const messages: Record<string, string> = {
      maintenance: this.language === 'FR' 
        ? 'Le système est en maintenance. Veuillez patienter.'
        : 'The system is under maintenance. Please wait.',
      update: this.language === 'FR'
        ? 'Mise à jour du système en cours...'
        : 'System update in progress...',
      backup: this.language === 'FR'
        ? 'Sauvegarde automatique effectuée'
        : 'Automatic backup completed',
      sync: this.language === 'FR'
        ? 'Synchronisation des données terminée'
        : 'Data synchronization completed'
    };

    return {
      title: this.language === 'FR' ? 'Système' : 'System',
      message: messages[type],
      duration: 5000
    };
  }
}

export default ToastMessageManager;

