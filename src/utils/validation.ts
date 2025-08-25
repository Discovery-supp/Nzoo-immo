// Utilitaires de validation et conversion de types

import { Reservation } from '../types';

/**
 * Valide et nettoie les données d'une réservation
 */
export const validateReservationData = (data: any): Partial<Reservation> => {
  return {
    id: data.id || '',
    full_name: data.full_name || data.fullname || '',
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    activity: data.activity || '',
    space_type: data.space_type || data.spacetype || 'coworking',
    start_date: data.start_date || data.startdate || '',
    end_date: data.end_date || data.enddate || '',
    occupants: Number(data.occupants) || 1,
    amount: Number(data.amount) || 0,
    payment_method: data.payment_method || 'cash',
    status: data.status || 'pending',
    notes: data.notes || '',
    admin_notes: data.admin_notes || '',
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
};

/**
 * Convertit une chaîne en nombre avec validation
 */
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Convertit une valeur en chaîne avec gestion des valeurs null/undefined
 */
export const safeString = (value: any, defaultValue: string = ''): string => {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
};

/**
 * Valide une adresse email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  return phoneRegex.test(phone);
};

/**
 * Valide une date
 */
export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (date: string | Date, locale: string = 'fr-FR'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  } catch {
    return 'Date invalide';
  }
};

/**
 * Calcule la différence en jours entre deux dates
 */
export const calculateDaysDifference = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDifference / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Valide les données de formulaire de réservation
 */
export const validateReservationForm = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.full_name?.trim()) {
    errors.push('Le nom complet est requis');
  }

  if (!data.email?.trim()) {
    errors.push('L\'email est requis');
  } else if (!isValidEmail(data.email)) {
    errors.push('L\'email n\'est pas valide');
  }

  if (!data.phone?.trim()) {
    errors.push('Le téléphone est requis');
  } else if (!isValidPhone(data.phone)) {
    errors.push('Le numéro de téléphone n\'est pas valide');
  }

  if (!data.activity?.trim()) {
    errors.push('L\'activité est requise');
  }

  if (!data.start_date) {
    errors.push('La date de début est requise');
  } else if (!isValidDate(data.start_date)) {
    errors.push('La date de début n\'est pas valide');
  }

  if (!data.end_date) {
    errors.push('La date de fin est requise');
  } else if (!isValidDate(data.end_date)) {
    errors.push('La date de fin n\'est pas valide');
  }

  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (start >= end) {
      errors.push('La date de fin doit être postérieure à la date de début');
    }
  }

  if (!data.occupants || data.occupants < 1) {
    errors.push('Le nombre d\'occupants doit être au moins 1');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Le montant doit être supérieur à 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Nettoie les données avant l'envoi à l'API
 */
export const sanitizeReservationData = (data: any): any => {
  return {
    ...data,
    full_name: safeString(data.full_name).trim(),
    email: safeString(data.email).trim().toLowerCase(),
    phone: safeString(data.phone).trim(),
    company: safeString(data.company).trim(),
    activity: safeString(data.activity).trim(),
    space_type: safeString(data.space_type),
    start_date: safeString(data.start_date),
    end_date: safeString(data.end_date),
    occupants: safeNumber(data.occupants, 1),
    amount: safeNumber(data.amount, 0),
    payment_method: safeString(data.payment_method, 'cash'),
    status: safeString(data.status, 'pending'),
    notes: safeString(data.notes).trim(),
    admin_notes: safeString(data.admin_notes).trim(),
  };
};
