import { supabase } from './supabaseClient';
import { type Reservation } from '../hooks/useReservations';

// Interface pour les résultats de mise à jour
interface AutoUpdateResult {
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

// Interface pour les critères de mise à jour
interface UpdateCriteria {
  pendingCreationDays: number; // 4 jours pour les réservations en attente
  confirmedCompletionHours: number; // 12 heures pour les réservations confirmées
  pendingExpirationHours: number; // 12 heures pour les réservations en attente
}

// Configuration par défaut
const DEFAULT_CRITERIA: UpdateCriteria = {
  pendingCreationDays: 4,        // 4 jours pour le timeout de paiement
  confirmedCompletionHours: 12,  // 12 heures pour la completion
  pendingExpirationHours: 12     // 12 heures pour l'expiration
};

/**
 * Fonction principale pour gérer l'annulation automatique des réservations
 * Applique les règles suivantes :
 * 1. Réservations en attente créées il y a plus de 4 jours → annulées
 * 2. Réservations confirmées dont la date de fin <= aujourd'hui + 12h → terminées
 * 3. Réservations en attente dont la date de fin <= aujourd'hui + 12h → annulées
 */
export const autoUpdateReservationStatuses = async (
  criteria: UpdateCriteria = DEFAULT_CRITERIA
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
    console.log('🔄 Début de la mise à jour automatique des statuts de réservation...');
    
    // Récupérer toutes les réservations
    const { data: reservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .in('status', ['pending', 'confirmed']);

    if (fetchError) {
      throw new Error(`Erreur lors de la récupération des réservations: ${fetchError.message}`);
    }

    if (!reservations || reservations.length === 0) {
      console.log('ℹ️ Aucune réservation à traiter');
      return result;
    }

    console.log(`📊 ${reservations.length} réservations à traiter`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculer les dates de référence
    const pendingCreationDate = new Date(today);
    pendingCreationDate.setDate(pendingCreationDate.getDate() - criteria.pendingCreationDays);

    const confirmedCompletionDate = new Date(today);
    confirmedCompletionDate.setHours(confirmedCompletionDate.getHours() + criteria.confirmedCompletionHours);

    const pendingExpirationDate = new Date(today);
    pendingExpirationDate.setHours(pendingExpirationDate.getHours() + criteria.pendingExpirationHours);

    console.log('📅 Dates de référence calculées:', {
      today: today.toISOString(),
      pendingCreationDate: pendingCreationDate.toISOString(),
      confirmedCompletionDate: confirmedCompletionDate.toISOString(),
      pendingExpirationDate: pendingExpirationDate.toISOString()
    });

    // Traiter chaque réservation
    for (const reservation of reservations) {
      try {
        const updateResult = await processReservation(
          reservation,
          today,
          pendingCreationDate,
          confirmedCompletionDate,
          pendingExpirationDate,
          criteria
        );

        if (updateResult.updated) {
          result.updatedCount++;
          
          if (updateResult.newStatus === 'cancelled') {
            result.cancelledCount++;
            if (updateResult.reason === 'timeout') {
              result.details.pendingCancelled.push(reservation.id);
            } else {
              result.details.pendingExpired.push(reservation.id);
            }
          } else if (updateResult.newStatus === 'completed') {
            result.completedCount++;
            result.details.confirmedCompleted.push(reservation.id);
          }
        }
      } catch (error) {
        const errorMsg = `Erreur lors du traitement de la réservation ${reservation.id}: ${error instanceof Error ? error.message : String(error)}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log('✅ Mise à jour automatique terminée:', {
      totalUpdated: result.updatedCount,
      cancelled: result.cancelledCount,
      completed: result.completedCount,
      errors: result.errors.length
    });

  } catch (error) {
    const errorMsg = `Erreur générale lors de la mise à jour automatique: ${error instanceof Error ? error.message : String(error)}`;
    result.errors.push(errorMsg);
    result.success = false;
    console.error(errorMsg);
  }

  return result;
};

/**
 * Traite une réservation individuelle selon les règles définies
 */
const processReservation = async (
  reservation: Reservation,
  today: Date,
  pendingCreationDate: Date,
  confirmedCompletionDate: Date,
  pendingExpirationDate: Date,
  criteria: UpdateCriteria
): Promise<{ updated: boolean; newStatus?: string; reason?: string }> => {
  
  const startDate = new Date(reservation.start_date);
  const endDate = new Date(reservation.end_date);
  const createdDate = new Date(reservation.created_at);

  // Règle 1: Réservations en attente créées il y a plus de 4 jours → annulées
  if (reservation.status === 'pending') {
    if (createdDate < pendingCreationDate) {
      console.log(`🚫 Réservation ${reservation.id} annulée: créée le ${createdDate.toISOString()} < ${pendingCreationDate.toISOString()}`);
      
      await updateReservationStatus(reservation.id, 'cancelled', 'Réservation annulée automatiquement: créée il y a plus de 4 jours');
      
      return {
        updated: true,
        newStatus: 'cancelled',
        reason: 'timeout'
      };
    }
  }

  // Règle 2: Réservations confirmées dont la date de fin <= aujourd'hui + 12h → terminées
  if (reservation.status === 'confirmed') {
    if (endDate <= confirmedCompletionDate) {
      console.log(`✅ Réservation ${reservation.id} terminée: date de fin (${endDate.toISOString()}) <= ${confirmedCompletionDate.toISOString()}`);
      
      await updateReservationStatus(reservation.id, 'completed', 'Réservation terminée automatiquement: période de réservation écoulée (12h)');
      
      return {
        updated: true,
        newStatus: 'completed',
        reason: 'completed'
      };
    }
  }

  // Règle 3: Réservations en attente dont la date de fin <= aujourd'hui + 12h → annulées
  if (reservation.status === 'pending') {
    if (endDate <= pendingExpirationDate) {
      console.log(`🚫 Réservation ${reservation.id} annulée: date de fin (${endDate.toISOString()}) <= ${pendingExpirationDate.toISOString()}`);
      
      await updateReservationStatus(reservation.id, 'cancelled', 'Réservation annulée automatiquement: dépassement de la date limite de 12h');
      
      return {
        updated: true,
        newStatus: 'cancelled',
        reason: 'expired'
      };
    }
  }

  return { updated: false };
};

/**
 * Met à jour le statut d'une réservation dans la base de données
 */
const updateReservationStatus = async (
  reservationId: string,
  newStatus: Reservation['status'],
  reason: string
): Promise<void> => {
  const { error } = await supabase
    .from('reservations')
    .update({
      status: newStatus,
      admin_notes: `[AUTO] ${reason} - ${new Date().toISOString()}`,
      updated_at: new Date().toISOString()
    })
    .eq('id', reservationId);

  if (error) {
    throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
  }

  console.log(`📝 Statut de la réservation ${reservationId} mis à jour vers: ${newStatus}`);
};

/**
 * Fonction pour exécuter la mise à jour automatique avec des critères personnalisés
 */
export const runAutoUpdateWithCustomCriteria = async (
  pendingCreationDays?: number,
  confirmedCompletionHours?: number,
  pendingExpirationHours?: number
): Promise<AutoUpdateResult> => {
  const criteria: UpdateCriteria = {
    pendingCreationDays: pendingCreationDays ?? DEFAULT_CRITERIA.pendingCreationDays,
    confirmedCompletionHours: confirmedCompletionHours ?? DEFAULT_CRITERIA.confirmedCompletionHours,
    pendingExpirationHours: pendingExpirationHours ?? DEFAULT_CRITERIA.pendingExpirationHours
  };

  console.log('⚙️ Exécution avec critères personnalisés:', criteria);
  return autoUpdateReservationStatuses(criteria);
};

/**
 * Fonction pour obtenir un résumé des réservations selon leur statut
 */
export const getReservationSummary = async (): Promise<{
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  total: number;
}> => {
  const { data, error } = await supabase
    .from('reservations')
    .select('status');

  if (error) {
    throw new Error(`Erreur lors de la récupération du résumé: ${error.message}`);
  }

  const summary = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
    total: 0
  };

  data?.forEach(reservation => {
    summary[reservation.status as keyof typeof summary]++;
    summary.total++;
  });

  return summary;
};

/**
 * Fonction de test pour valider la logique
 */
export const testAutoUpdateLogic = (): void => {
  console.log('🧪 Test de la logique de mise à jour automatique...');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const testCases = [
    {
      name: 'Réservation en attente - créée il y a 5 jours (doit être annulée)',
      reservation: {
        status: 'pending' as const,
        start_date: today.toISOString(),
        end_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'cancelled'
    },
    {
      name: 'Réservation confirmée - date de fin dans 11h (doit être terminée)',
      reservation: {
        status: 'confirmed' as const,
        start_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'completed'
    },
    {
      name: 'Réservation en attente - date de fin dans 11h (doit être annulée)',
      reservation: {
        status: 'pending' as const,
        start_date: today.toISOString(),
        end_date: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'cancelled'
    }
  ];

  testCases.forEach(testCase => {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Statut attendu: ${testCase.expectedAction}`);
    console.log(`   Réservation:`, testCase.reservation);
  });

  console.log('\n✅ Tests de logique terminés');
};

