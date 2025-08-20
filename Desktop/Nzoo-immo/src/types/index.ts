// Types centralisés pour l'application N'zoo Immo

// Types de base
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Types d'authentification
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  full_name: string;
  phone?: string;
  company?: string;
  created_at: string;
  is_active: boolean;
}

export interface SessionData {
  user: AuthUser;
  type: 'admin' | 'client';
}

// Types de réservation
export interface Reservation extends BaseEntity {
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  activity: string;
  address: string | null;
  space_type: string;
  start_date: string;
  end_date: string;
  occupants: number;
  subscription_type: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: string;
  notes: string | null;
  admin_notes: string | null;
}

export interface ReservationData {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  activity: string;
  address?: string;
  spaceType: string;
  startDate: string;
  endDate: string;
  occupants: number;
  subscriptionType: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
}

export interface ReservationResult {
  success: boolean;
  reservation?: Reservation;
  error?: string;
  emailSent?: boolean; // Pour compatibilité avec l'interface existante
  clientEmailSent?: boolean;
  adminEmailSent?: boolean;
  clientEmailError?: string;
  adminEmailError?: string;
}

// Types d'espace
export interface Space extends BaseEntity {
  name: string;
  type: string;
  description: string;
  daily_price: number;
  monthly_price: number;
  yearly_price: number;
  max_occupants: number;
  is_published: boolean;
  content?: string;
  images?: string[];
}

export interface SpaceData {
  name: string;
  type: string;
  description: string;
  dailyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  maxOccupants: number;
  isPublished: boolean;
  content?: string;
  images?: string[];
}

// Types d'email
export interface EmailData {
  to: string;
  subject: string;
  html: string;
  reservationData: {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    activity: string;
    spaceType: string;
    startDate: string;
    endDate: string;
    amount: number;
    transactionId: string;
    status: string;
  };
}

export interface EmailResult {
  success: boolean;
  error?: string;
}

export interface ReservationEmailResult {
  clientEmailSent: boolean;
  adminEmailSent: boolean;
  clientEmailError?: string;
  adminEmailError?: string;
}

// Types de disponibilité
export interface DateAvailability {
  date: string;
  available: boolean;
  conflictingReservations: number;
  maxCapacity: number;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  message?: string;
  suggestedDates?: { start: string; end: string }[];
  conflicts?: any[];
}

// Types de permissions
export interface Permission {
  id: string;
  name: string;
  description: string;
  requiredRole: 'admin' | 'user' | 'both';
}

// Types de notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Types de facture
export interface InvoiceData {
  reservation: Reservation;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Types de statistiques
export interface RevenueStats {
  total: number;
  monthly: number;
  daily: number;
  byPaymentMethod: Record<string, number>;
  bySpaceType: Record<string, number>;
}

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  byStatus: Record<string, number>;
  bySpaceType: Record<string, number>;
}

// Types de configuration
export interface CronConfig {
  enabled: boolean;
  interval: number;
  rules: {
    pendingToCancelled: number;
    confirmedToCompleted: number;
  };
}

export interface CronStatus {
  isRunning: boolean;
  lastRun: string | null;
  nextRun: string | null;
  totalRuns: number;
  errors: string[];
}

// Types d'interface utilisateur
export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  activity: string;
  address: string;
  occupants: number;
  subscriptionType: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// Types d'événements
export interface AuthStateChangeEvent {
  user: AuthUser | null;
  type: 'login' | 'logout' | 'update';
}

// Types utilitaires
export type Language = 'fr' | 'en';
export type PaymentMethod = 'cash' | 'orange_money' | 'airtel_money' | 'visa';
export type SubscriptionType = 'daily' | 'monthly' | 'yearly';
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type UserRole = 'admin' | 'user' | 'clients';
export type SpaceType = 'coworking' | 'bureau_prive' | 'domiciliation' | 'salle_reunion';

// Types de validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Types de recherche et filtrage
export interface SearchFilters {
  status?: ReservationStatus;
  spaceType?: SpaceType;
  paymentMethod?: PaymentMethod;
  dateRange?: DateRange;
  searchTerm?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationParams;
}

// Types d'export
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel';
  filters?: SearchFilters;
  fields?: string[];
}

// Types de logs
export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

// Types de cache
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableLogging: boolean;
}
