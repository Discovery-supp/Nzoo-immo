// Utilitaires pour la gestion des dates et calculs

import { logger } from './logger';

/**
 * Calcule le nombre de jours entre deux dates (inclusives)
 * @param startDate Date de début
 * @param endDate Date de fin
 * @returns Nombre de jours (inclusif)
 */
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  // Validation des dates
  if (!startDate || !endDate) {
    logger.error('Dates invalides pour le calcul', { startDate, endDate });
    return 0;
  }

  // S'assurer que les dates sont des objets Date
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validation que les dates sont valides
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    logger.error('Format de date invalide', { startDate, endDate });
    return 0;
  }

  // Calcul de la différence en millisecondes
  const timeDifference = end.getTime() - start.getTime();
  
  // Conversion en jours et ajout de 1 pour inclure les deux dates
  // Utilisation de Math.floor pour éviter l'arrondi vers le haut
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;

  logger.debug('Calcul des jours', {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    timeDifference,
    days
  });

  return days;
};

/**
 * Formate une date pour l'affichage en français
 * @param date Date à formater
 * @returns Date formatée (dd/mm/yyyy)
 */
export const formatDateFR = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR');
  } catch (error) {
    logger.error('Erreur de formatage de date', { date, error });
    return 'Date invalide';
  }
};

/**
 * Formate une date pour l'affichage en anglais
 * @param date Date à formater
 * @returns Date formatée (mm/dd/yyyy)
 */
export const formatDateEN = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US');
  } catch (error) {
    logger.error('Erreur de formatage de date', { date, error });
    return 'Invalid date';
  }
};

/**
 * Valide et formate les dates pour les factures
 * @param startDate Date de début de réservation
 * @param endDate Date de fin de réservation
 * @param createdDate Date de création de la réservation
 * @returns Objet avec les dates formatées
 */
export const validateAndFormatInvoiceDates = (
  startDate: string,
  endDate: string,
  createdDate?: string
) => {
  try {
    // Conversion en objets Date
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const createdDateObj = createdDate ? new Date(createdDate) : new Date();

    // Validation des dates
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error('Format de date invalide');
    }

    // Vérification de la cohérence
    if (startDateObj >= endDateObj) {
      logger.warn('Dates de réservation incohérentes', { startDate, endDate });
      // Corriger automatiquement en ajoutant un jour à la date de fin
      endDateObj.setDate(endDateObj.getDate() + 1);
    }

    if (startDateObj < new Date()) {
      logger.warn('Date de début dans le passé', { startDate });
    }

    // S'assurer que la date de création est valide
    if (isNaN(createdDateObj.getTime())) {
      createdDateObj.setTime(Date.now());
    }

    return {
      startDate: formatDateFR(startDateObj),
      endDate: formatDateFR(endDateObj),
      createdDate: formatDateFR(createdDateObj),
      days: calculateDaysBetween(startDateObj, endDateObj)
    };
  } catch (error) {
    logger.error('Erreur lors de la validation des dates', { 
      startDate, 
      endDate, 
      createdDate, 
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Fallback avec des dates par défaut
    const now = new Date();
    const defaultEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 jours
    
    return {
      startDate: formatDateFR(now),
      endDate: formatDateFR(defaultEndDate),
      createdDate: formatDateFR(now),
      days: 30
    };
  }
};

/**
 * Calcule le prix total basé sur le type d'abonnement
 * @param days Nombre de jours
 * @param subscriptionType Type d'abonnement
 * @param prices Prix par type
 * @returns Prix total
 */
export const calculateTotalPrice = (
  days: number,
  subscriptionType: string,
  prices: {
    daily?: number;
    monthly?: number;
    yearly?: number;
  }
): number => {
  if (days <= 0) {
    logger.warn('Nombre de jours invalide pour le calcul du prix', { days });
    return 0;
  }

  let total = 0;

  switch (subscriptionType) {
    case 'daily':
      total = (prices.daily || 0) * days;
      break;
    case 'monthly':
      const months = Math.ceil(days / 30);
      total = (prices.monthly || 0) * months;
      break;
    case 'yearly':
      const years = Math.ceil(days / 365);
      total = (prices.yearly || 0) * years;
      break;
    default:
      logger.warn('Type d\'abonnement non reconnu', { subscriptionType });
      total = 0;
  }

  logger.debug('Calcul du prix total', {
    days,
    subscriptionType,
    prices,
    total
  });

  return total;
};

/**
 * Vérifie si une période de dates est valide
 * @param startDate Date de début
 * @param endDate Date de fin
 * @returns true si la période est valide
 */
export const isValidDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    return start < end;
  } catch (error) {
    logger.error('Erreur lors de la validation de la période', { startDate, endDate, error });
    return false;
  }
};

/**
 * Génère un numéro de facture unique
 * @param reservationId ID de la réservation
 * @returns Numéro de facture
 */
export const generateInvoiceNumber = (reservationId: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const shortId = reservationId.slice(0, 8).toUpperCase();
  return `INV-${shortId}-${timestamp}`;
};

/**
 * Calcule la date d'échéance d'une facture
 * @param createdDate Date de création
 * @param daysToAdd Nombre de jours à ajouter (défaut: 3)
 * @returns Date d'échéance
 */
export const calculateDueDate = (createdDate: Date | string, daysToAdd: number = 3): Date => {
  const created = new Date(createdDate);
  const dueDate = new Date(created.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return dueDate;
};
