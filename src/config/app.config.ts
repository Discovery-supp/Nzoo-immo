// Configuration centralisée de l'application N'zoo Immo

export const APP_CONFIG = {
  // Configuration générale
  app: {
    name: 'N\'zoo Immo',
    version: '2.0.0',
    description: 'Plateforme de Gestion Immobilière Intelligente',
    defaultLanguage: 'fr' as const,
    supportedLanguages: ['fr', 'en'] as const,
  },

  // Configuration des espaces
  spaces: {
    types: {
      coworking: {
        id: 'coworking',
        name: 'Espace Coworking',
        maxCapacity: 4,
        supportsDaily: true,
        supportsMonthly: true,
        supportsYearly: true,
      },
      bureau_prive: {
        id: 'bureau_prive',
        name: 'Bureau Privé',
        maxCapacity: 3,
        supportsDaily: false,
        supportsMonthly: true,
        supportsYearly: true,
      },
      domiciliation: {
        id: 'domiciliation',
        name: 'Domiciliation',
        maxCapacity: 1,
        supportsDaily: false,
        supportsMonthly: true,
        supportsYearly: true,
      },
      salle_reunion: {
        id: 'salle_reunion',
        name: 'Salle de Réunion',
        maxCapacity: 10,
        supportsDaily: true,
        supportsMonthly: false,
        supportsYearly: false,
      },
    },
  },

  // Configuration des paiements
  payments: {
    methods: {
      cash: {
        id: 'cash',
        name: 'Espèces',
        autoGenerateInvoice: false,
        defaultStatus: 'pending',
      },
      orange_money: {
        id: 'orange_money',
        name: 'Orange Money',
        autoGenerateInvoice: true,
        defaultStatus: 'confirmed',
      },
      airtel_money: {
        id: 'airtel_money',
        name: 'Airtel Money',
        autoGenerateInvoice: true,
        defaultStatus: 'confirmed',
      },
      visa: {
        id: 'visa',
        name: 'Carte VISA',
        autoGenerateInvoice: false,
        defaultStatus: 'pending',
      },
    },
    // Activer/désactiver l'affichage et la génération de QR code
    qrEnabled: false,
    // Configuration Mobile Money
    mobileMoney: {
      // Numéros par défaut (peuvent être pré-remplis pour le client ou utilisés comme références internes)
      defaultNumbers: {
        ORANGE: '+243840975949',
        AIRTEL: '+243998187951'
      },
    },
  },

  // Configuration des emails
  emails: {
    admin: [
      'admin@nzoo-immo.com',
      'contact@nzoo-immo.com',
    ],
    templates: {
      clientConfirmation: {
        subject: 'Confirmation de réservation - {fullName}',
        template: 'client-confirmation',
      },
      adminAcknowledgment: {
        subject: 'Nouvelle réservation reçue - {fullName}',
        template: 'admin-acknowledgment',
      },
    },
  },

  // Configuration des réservations
  reservations: {
    statuses: {
      pending: {
        id: 'pending',
        name: 'En attente',
        color: 'yellow',
        canEdit: true,
        canDelete: true,
      },
      confirmed: {
        id: 'confirmed',
        name: 'Confirmée',
        color: 'green',
        canEdit: true,
        canDelete: true,
      },
      completed: {
        id: 'completed',
        name: 'Terminée',
        color: 'blue',
        canEdit: false,
        canDelete: false,
      },
      cancelled: {
        id: 'cancelled',
        name: 'Annulée',
        color: 'red',
        canEdit: false,
        canDelete: true,
      },
    },
    autoManagement: {
      enabled: true,
      checkInterval: 5 * 60 * 1000, // 5 minutes
      rules: {
        pendingToCancelled: 3 * 24 * 60 * 60 * 1000, // 3 jours
        confirmedToCompleted: 24 * 60 * 60 * 1000, // 1 jour
      },
    },
  },

  // Configuration des permissions
  permissions: {
    roles: {
      admin: {
        id: 'admin',
        name: 'Administrateur',
        permissions: ['*'], // Toutes les permissions
      },
      user: {
        id: 'user',
        name: 'Utilisateur',
        permissions: [
          'view_spaces',
          'manage_spaces',
          'view_reservations',
          'manage_reservations',
          'view_revenue',
          'view_statistics',
        ],
      },
    },
  },

  // Configuration de l'interface
  ui: {
    theme: {
      primary: '#1e40af', // nzoo-dark
      secondary: '#64748b', // nzoo-gray
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
    },
  },

  // Configuration de développement
  development: {
    debug: false,
    logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
    enableMockData: false,
  },
  
  // Assistant IA (chatbot)
  aiAssistant: {
    enabled: true,
    language: 'fr' as 'fr' | 'en',
    endpointUrl: 'http://localhost:3001/ai-chat',
    typingDelayMs: 400,
    welcomeMessage: "Bonjour 👋 Je suis votre assistant. Comment puis-je vous aider ?",
    quickSuggestions: [
      'Aide pour réserver un espace',
      'Tarifs et moyens de paiement',
      'Modifier/annuler une réservation',
    ],
  },
};

// Types utilitaires
export type AppLanguage = typeof APP_CONFIG.app.supportedLanguages[number];
export type SpaceType = keyof typeof APP_CONFIG.spaces.types;
export type PaymentMethod = keyof typeof APP_CONFIG.payments.methods;
export type ReservationStatus = keyof typeof APP_CONFIG.reservations.statuses;
export type UserRole = keyof typeof APP_CONFIG.permissions.roles;

// Fonctions utilitaires
export const getSpaceConfig = (type: SpaceType) => APP_CONFIG.spaces.types[type];
export const getPaymentConfig = (method: PaymentMethod) => APP_CONFIG.payments.methods[method];
export const getReservationStatusConfig = (status: ReservationStatus) => APP_CONFIG.reservations.statuses[status];
export const getUserRoleConfig = (role: UserRole) => APP_CONFIG.permissions.roles[role];

// Validation des configurations
export const validateConfig = () => {
  const errors: string[] = [];

  // Vérifier que tous les types d'espaces ont des configurations valides
  Object.entries(APP_CONFIG.spaces.types).forEach(([key, config]) => {
    if (!config.id || !config.name || config.maxCapacity <= 0) {
      errors.push(`Configuration invalide pour l'espace: ${key}`);
    }
  });

  // Vérifier que tous les méthodes de paiement ont des configurations valides
  Object.entries(APP_CONFIG.payments.methods).forEach(([key, config]) => {
    if (!config.id || !config.name) {
      errors.push(`Configuration invalide pour le paiement: ${key}`);
    }
  });

  if (errors.length > 0) {
    console.error('❌ Erreurs de configuration détectées:', errors);
    return false;
  }

  return true;
};

// Initialisation de la configuration
if (typeof window !== 'undefined') {
  // Validation côté client
  validateConfig();
}
