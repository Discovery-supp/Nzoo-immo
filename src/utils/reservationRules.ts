// Utilitaires pour la gestion automatique des réservations

import { logger } from './logger';

export interface ReservationRule {
  id: string;
  name: string;
  description: string;
  condition: (reservation: any, today: Date) => boolean;
  action: string;
  reason: string;
}

export interface AutoUpdateResult {
  success: boolean;
  updatedCount: number;
  cancelledCount: number;
  completedCount: number;
  errors: string[];
  details: {
    pendingCancelled: string[];
    confirmedCompleted: string[];
    pendingExpired: string[];
  };
}

/**
 * Règles d'annulation automatique des réservations
 * Basées sur les nouvelles spécifications
 */
export const RESERVATION_RULES: ReservationRule[] = [
  {
    id: 'pending_creation_timeout',
    name: 'Timeout de création des réservations en attente',
    description: 'Réservations en attente créées il y a plus de 4 jours',
    condition: (reservation, today) => {
      if (reservation.status !== 'pending') return false;
      
      const createdDate = new Date(reservation.created_at);
      const timeoutDate = new Date(today);
      timeoutDate.setDate(timeoutDate.getDate() - 4); // -4 jours
      
      return createdDate < timeoutDate;
    },
    action: 'cancelled',
    reason: 'Réservation annulée automatiquement: créée il y a plus de 4 jours'
  },
  {
    id: 'confirmed_completion',
    name: 'Completion des réservations confirmées',
    description: 'Réservations confirmées dont la date de fin <= aujourd\'hui + 12h',
    condition: (reservation, today) => {
      if (reservation.status !== 'confirmed') return false;
      
      const endDate = new Date(reservation.end_date);
      const completionDate = new Date(today);
      completionDate.setHours(completionDate.getHours() + 12); // +12 heures
      
      return endDate <= completionDate;
    },
    action: 'completed',
    reason: 'Réservation terminée automatiquement: période de réservation écoulée (12h)'
  },
  {
    id: 'pending_expiration',
    name: 'Expiration des réservations en attente',
    description: 'Réservations en attente dont la date de fin <= aujourd\'hui + 12h',
    condition: (reservation, today) => {
      if (reservation.status !== 'pending') return false;
      
      const endDate = new Date(reservation.end_date);
      const expirationDate = new Date(today);
      expirationDate.setHours(expirationDate.getHours() + 12); // +12 heures
      
      return endDate <= expirationDate;
    },
    action: 'cancelled',
    reason: 'Réservation annulée automatiquement: dépassement de la date limite de 12h'
  }
];

/**
 * Vérifie et applique les règles d'annulation automatique
 * @param reservations Liste des réservations à vérifier
 * @param updateReservationStatus Fonction pour mettre à jour le statut
 * @returns Résultat de la mise à jour automatique
 */
export const checkAndApplyReservationRules = async (
  reservations: any[],
  updateReservationStatus: (id: string, status: string) => Promise<void>
): Promise<AutoUpdateResult> => {
  const result: AutoUpdateResult = {
    success: true,
    updatedCount: 0,
    cancelledCount: 0,
    completedCount: 0,
    errors: [],
    details: {
      pendingCancelled: [],
      confirmedCompleted: [],
      pendingExpired: []
    }
  };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    logger.debug('Vérification des règles d\'annulation automatique', {
      totalReservations: reservations.length,
      today: today.toISOString()
    });

    for (const reservation of reservations) {
      let appliedRule: ReservationRule | null = null;

      // Vérifier chaque règle
      for (const rule of RESERVATION_RULES) {
        if (rule.condition(reservation, today)) {
          appliedRule = rule;
          break; // Appliquer seulement la première règle qui correspond
        }
      }

      // Appliquer la règle si trouvée
      if (appliedRule && appliedRule.action !== reservation.status) {
        try {
          await updateReservationStatus(reservation.id, appliedRule.action);
          
          result.updatedCount++;
          
          if (appliedRule.action === 'cancelled') {
            result.cancelledCount++;
            if (appliedRule.id === 'pending_creation_timeout') {
              result.details.pendingCancelled.push(reservation.id);
            } else {
              result.details.pendingExpired.push(reservation.id);
            }
          } else if (appliedRule.action === 'completed') {
            result.completedCount++;
            result.details.confirmedCompleted.push(reservation.id);
          }

          logger.info(`Règle appliquée: ${appliedRule.name}`, {
            reservationId: reservation.id,
            oldStatus: reservation.status,
            newStatus: appliedRule.action,
            reason: appliedRule.reason
          });

        } catch (error) {
          const errorMsg = `Erreur lors de la mise à jour de la réservation ${reservation.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          result.errors.push(errorMsg);
          logger.error(errorMsg, { reservationId: reservation.id, rule: appliedRule.id });
        }
      }
    }

    logger.info('Vérification des règles terminée', {
      updatedCount: result.updatedCount,
      cancelledCount: result.cancelledCount,
      completedCount: result.completedCount,
      errorsCount: result.errors.length
    });

  } catch (error) {
    const errorMsg = `Erreur lors de la vérification des règles: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    result.errors.push(errorMsg);
    result.success = false;
    logger.error(errorMsg);
  }

  return result;
};

/**
 * Calcule la durée d'une réservation en jours
 * @param startDate Date de début
 * @param endDate Date de fin
 * @returns Nombre de jours (inclusif)
 */
export const calculateReservationDuration = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.floor(timeDifference / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Vérifie si une réservation est éligible pour l'annulation automatique
 * @param reservation Réservation à vérifier
 * @returns true si la réservation peut être annulée automatiquement
 */
export const isEligibleForAutoCancellation = (reservation: any): boolean => {
  // Ne pas annuler les réservations déjà annulées ou terminées
  if (reservation.status === 'cancelled' || reservation.status === 'completed') {
    return false;
  }

  // Vérifier que les dates sont valides
  try {
    new Date(reservation.start_date);
    new Date(reservation.end_date);
    new Date(reservation.created_at);
  } catch {
    return false;
  }

  return true;
};

/**
 * Obtient un résumé des règles d'annulation
 * @param language Langue pour l'affichage
 * @returns Résumé des règles
 */
export const getRulesSummary = (language: 'fr' | 'en') => {
  const summaries = {
    fr: {
      title: 'Règles d\'annulation automatique',
      rules: [
        'Réservations en attente créées il y a plus de 4 jours → Annulées',
        'Réservations confirmées avec date de fin <= aujourd\'hui + 12h → Terminées',
        'Réservations en attente avec date de fin <= aujourd\'hui + 12h → Annulées'
      ]
    },
    en: {
      title: 'Automatic cancellation rules',
      rules: [
        'Pending reservations created more than 4 days ago → Cancelled',
        'Confirmed reservations with end date <= today + 12h → Completed',
        'Pending reservations with end date <= today + 12h → Cancelled'
      ]
    }
  };

  return summaries[language];
};
