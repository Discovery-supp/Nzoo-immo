// Constantes centralisées pour l'application N'zoo Immo

// Constantes d'application
export const APP_CONSTANTS = {
  NAME: 'N\'zoo Immo',
  VERSION: '2.0.0',
  DESCRIPTION: 'Plateforme de Gestion Immobilière Intelligente',
  DEFAULT_LANGUAGE: 'fr' as const,
  SUPPORTED_LANGUAGES: ['fr', 'en'] as const,
} as const;

// Constantes de session
export const SESSION_KEYS = {
  ADMIN: 'currentUser',
  CLIENT: 'currentClient',
  LANGUAGE: 'app_language',
  THEME: 'app_theme',
} as const;

// Constantes de routes
export const ROUTES = {
  HOME: '/',
  SPACES: '/spaces',
  RESERVATION: '/reservation',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  CLIENT_LOGIN: '/client/login',
  CLIENT_SIGNUP: '/client/signup',
} as const;

// Constantes de types d'espaces
export const SPACE_TYPES = {
  COWORKING: 'coworking',
  BUREAU_PRIVE: 'bureau_prive',
  DOMICILIATION: 'domiciliation',
} as const;

// Types d'offres avec gestion de dates
export const OFFERS_WITH_DATES = [
  'coworking',
  'bureau-prive',
  'bureau_prive'
] as const;

// Types d'offres sans gestion de dates (avec contrats)
export const OFFERS_WITHOUT_DATES = [
  'domiciliation',
  'service-juridique',
  'service-comptable'
] as const;

// Constantes de méthodes de paiement
export const PAYMENT_METHODS = {
  CASH: 'cash',
  ORANGE_MONEY: 'orange_money',
  AIRTEL_MONEY: 'airtel_money',
  VISA: 'visa',
} as const;

// Constantes de statuts de réservation
export const RESERVATION_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Constantes de types d'abonnement
export const SUBSCRIPTION_TYPES = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

// Constantes de rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  CLIENTS: 'clients',
} as const;

// Constantes de permissions
export const PERMISSIONS = {
  VIEW_USERS: 'view_users',
  MANAGE_USERS: 'manage_users',
  VIEW_SPACES: 'view_spacess',
  MANAGE_SPACES: 'manage_spaces',
  VIEW_RESERVATIONS: 'view_reservations',
  MANAGE_RESERVATIONS: 'manage_reservations',
  VIEW_REVENUE: 'view_revenue',
  VIEW_STATISTICS: 'view_statistics',
} as const;

// Constantes d'emails
export const EMAIL_CONSTANTS = {
  ADMIN_EMAILS: [
    'admin@nzoo-immo.com',
    'contact@nzoo-immo.com',
  ],
  TEMPLATES: {
    CLIENT_CONFIRMATION: 'client-confirmation',
    ADMIN_ACKNOWLEDGMENT: 'admin-acknowledgment',
  },
} as const;

// Constantes de validation
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+33|0)[1-9](\d{8})$/,
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_PHONE_LENGTH: 20,
  MAX_COMPANY_LENGTH: 100,
  MAX_ACTIVITY_LENGTH: 200,
  MAX_ADDRESS_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
  MIN_OCCUPANTS: 1,
  MAX_OCCUPANTS: 20,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 100000,
} as const;

// Constantes de pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Constantes de cache
export const CACHE = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_SIZE: 100,
  ENABLE_LOGGING: false,
} as const;

// Constantes de cron
export const CRON = {
  DEFAULT_INTERVAL: 5 * 60 * 1000, // 5 minutes
  PENDING_TO_CANCELLED: 3 * 24 * 60 * 60 * 1000, // 3 jours
  CONFIRMED_TO_COMPLETED: 24 * 60 * 60 * 1000, // 1 jour
} as const;

// Constantes de thème
export const THEME = {
  COLORS: {
    PRIMARY: '#1e40af',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const;

// Constantes de formatage
export const FORMATTING = {
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  CURRENCY: 'EUR',
  CURRENCY_SYMBOL: '€',
  DECIMAL_SEPARATOR: ',',
  THOUSANDS_SEPARATOR: ' ',
} as const;

// Constantes de messages d'erreur
export const ERROR_MESSAGES = {
  FR: {
    REQUIRED_FIELD: 'Ce champ est obligatoire',
    INVALID_EMAIL: 'Adresse email invalide',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    INVALID_DATE: 'Date invalide',
    INVALID_AMOUNT: 'Montant invalide',
    INVALID_OCCUPANTS: 'Nombre d\'occupants invalide',
    CONNECTION_ERROR: 'Erreur de connexion',
    AUTHENTICATION_ERROR: 'Erreur d\'authentification',
    AUTHORIZATION_ERROR: 'Accès non autorisé',
    VALIDATION_ERROR: 'Erreur de validation',
    SERVER_ERROR: 'Erreur serveur',
    UNKNOWN_ERROR: 'Erreur inconnue',
  },
  EN: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Invalid email address',
    INVALID_PHONE: 'Invalid phone number',
    INVALID_DATE: 'Invalid date',
    INVALID_AMOUNT: 'Invalid amount',
    INVALID_OCCUPANTS: 'Invalid number of occupants',
    CONNECTION_ERROR: 'Connection error',
    AUTHENTICATION_ERROR: 'Authentication error',
    AUTHORIZATION_ERROR: 'Unauthorized access',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Server error',
    UNKNOWN_ERROR: 'Unknown error',
  },
} as const;

// Constantes de messages de succès
export const SUCCESS_MESSAGES = {
  FR: {
    RESERVATION_CREATED: 'Réservation créée avec succès',
    RESERVATION_UPDATED: 'Réservation mise à jour avec succès',
    RESERVATION_DELETED: 'Réservation supprimée avec succès',
    EMAIL_SENT: 'Email envoyé avec succès',
    INVOICE_GENERATED: 'Facture générée avec succès',
    LOGIN_SUCCESS: 'Connexion réussie',
    LOGOUT_SUCCESS: 'Déconnexion réussie',
    SAVE_SUCCESS: 'Sauvegarde réussie',
  },
  EN: {
    RESERVATION_CREATED: 'Reservation created successfully',
    RESERVATION_UPDATED: 'Reservation updated successfully',
    RESERVATION_DELETED: 'Reservation deleted successfully',
    EMAIL_SENT: 'Email sent successfully',
    INVOICE_GENERATED: 'Invoice generated successfully',
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    SAVE_SUCCESS: 'Save successful',
  },
} as const;

// Constantes de localisation
export const LOCALE = {
  FR: 'fr-FR',
  EN: 'en-US',
} as const;

// Constantes de développement
export const DEVELOPMENT = {
  DEBUG: false,
  LOG_LEVEL: 'info' as const,
  ENABLE_MOCK_DATA: false,
  ENABLE_LOGGING: true,
} as const;

// Constantes de sécurité
export const SECURITY = {
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    UPPERCASE: true,
    LOWERCASE: true,
    NUMBERS: true,
    SPECIAL_CHARS: true,
  },
} as const;

// Constantes de performance
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  LAZY_LOAD_OFFSET: 100,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// Constantes d'export
export const EXPORT = {
  FORMATS: {
    CSV: 'csv',
    PDF: 'pdf',
    EXCEL: 'excel',
  },
  MAX_RECORDS: 10000,
  CHUNK_SIZE: 1000,
} as const;

// Constantes de notification
export const NOTIFICATION = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  POSITION: {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
  },
} as const;

// Constantes de fichiers
export const FILE = {
  MAX_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

// Constantes de validation des dates
export const DATE_VALIDATION = {
  MIN_DATE: new Date('2020-01-01'),
  MAX_DATE: new Date('2030-12-31'),
  MIN_RESERVATION_DURATION: 1, // 1 jour
  MAX_RESERVATION_DURATION: 365, // 1 an
} as const;

// Constantes de prix par défaut
export const DEFAULT_PRICES = {
  COWORKING: {
    DAILY: 25,
    MONTHLY: 500,
    YEARLY: 5000,
  },
  BUREAU_PRIVE: {
    DAILY: 50,
    MONTHLY: 1000,
    YEARLY: 10000,
  },
  DOMICILIATION: {
    DAILY: 0,
    MONTHLY: 150,
    YEARLY: 1600,
  },

} as const;

// Constantes de capacité par défaut
export const DEFAULT_CAPACITIES = {
  COWORKING: 4,
  BUREAU_PRIVE: 3,
  DOMICILIATION: 1,

} as const;
