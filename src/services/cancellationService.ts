/**
 * Service de gestion des annulations de réservations
 * Permet d'annuler une réservation et d'envoyer un email de confirmation
 */

import { supabase } from './supabaseClient';
import { sendClientCancellationEmail } from './emailServiceDirect';

// Interface pour les données de réservation
interface Reservation {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  activity?: string;
  space_type: string;
  start_date: string;
  end_date: string;
  amount: number;
  transaction_id: string;
  payment_method: string;
  status: string;
  created_at: string;
}

// Interface pour le résultat d'annulation
interface CancellationResult {
  success: boolean;
  reservation?: Reservation;
  emailSent?: boolean;
  error?: string;
  message?: string;
}

/**
 * Annule une réservation et envoie un email de confirmation
 * @param reservationId - ID de la réservation à annuler
 * @param reason - Raison de l'annulation (optionnel)
 * @returns Promise<CancellationResult>
 */
export const cancelReservation = async (
  reservationId: string, 
  reason?: string
): Promise<CancellationResult> => {
  console.log('🚫 [CANCELLATION] Début annulation réservation:', reservationId);

  try {
    // 1. Récupérer les détails de la réservation
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (fetchError || !reservation) {
      console.error('❌ [CANCELLATION] Erreur récupération réservation:', fetchError);
      return {
        success: false,
        error: 'Réservation non trouvée',
        message: 'Impossible de trouver la réservation à annuler'
      };
    }

    console.log('📋 [CANCELLATION] Réservation trouvée:', reservation);

    // 2. Vérifier que la réservation peut être annulée
    if (reservation.status === 'cancelled') {
      return {
        success: false,
        error: 'Réservation déjà annulée',
        message: 'Cette réservation a déjà été annulée'
      };
    }

    if (reservation.status === 'completed') {
      return {
        success: false,
        error: 'Réservation terminée',
        message: 'Impossible d\'annuler une réservation terminée'
      };
    }

    // 3. Mettre à jour le statut de la réservation
    const { error: updateError } = await supabase
      .from('reservations')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || 'Annulation par le client'
      })
      .eq('id', reservationId);

    if (updateError) {
      console.error('❌ [CANCELLATION] Erreur mise à jour statut:', updateError);
      return {
        success: false,
        error: 'Erreur mise à jour',
        message: 'Impossible de mettre à jour le statut de la réservation'
      };
    }

    console.log('✅ [CANCELLATION] Statut mis à jour: cancelled');

    // 4. Envoyer l'email d'annulation
    let emailResult = null;
    try {
      emailResult = await sendClientCancellationEmail(reservation);
      console.log('📧 [CANCELLATION] Email d\'annulation envoyé:', emailResult);
    } catch (emailError) {
      console.error('❌ [CANCELLATION] Erreur envoi email:', emailError);
      // L'email n'est pas critique, on continue
    }

    // 5. Retourner le résultat
    return {
      success: true,
      reservation: reservation as Reservation,
      emailSent: emailResult?.success || false,
      message: 'Réservation annulée avec succès'
    };

  } catch (error) {
    console.error('❌ [CANCELLATION] Erreur générale:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Une erreur est survenue lors de l\'annulation'
    };
  }
};

/**
 * Récupère toutes les réservations annulées
 * @returns Promise<Reservation[]>
 */
export const getCancelledReservations = async (): Promise<Reservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('status', 'cancelled')
      .order('cancelled_at', { ascending: false });

    if (error) {
      console.error('❌ [CANCELLATION] Erreur récupération réservations annulées:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ [CANCELLATION] Erreur générale récupération:', error);
    return [];
  }
};

/**
 * Vérifie si une réservation peut être annulée
 * @param reservationId - ID de la réservation
 * @returns Promise<boolean>
 */
export const canCancelReservation = async (reservationId: string): Promise<boolean> => {
  try {
    const { data: reservation, error } = await supabase
      .from('reservations')
      .select('status, start_date')
      .eq('id', reservationId)
      .single();

    if (error || !reservation) {
      return false;
    }

    // Vérifier le statut
    if (reservation.status === 'cancelled' || reservation.status === 'completed') {
      return false;
    }

    // Vérifier la date (pas d'annulation si la réservation a déjà commencé)
    const startDate = new Date(reservation.start_date);
    const now = new Date();
    
    if (startDate <= now) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ [CANCELLATION] Erreur vérification annulation:', error);
    return false;
  }
};

/**
 * Récupère les statistiques d'annulation
 * @returns Promise<{total: number, cancelled: number, rate: number}>
 */
export const getCancellationStats = async () => {
  try {
    // Total des réservations
    const { count: total, error: totalError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
      console.error('❌ [CANCELLATION] Erreur comptage total:', totalError);
      return { total: 0, cancelled: 0, rate: 0 };
    }

    // Réservations annulées
    const { count: cancelled, error: cancelledError } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'cancelled');

    if (cancelledError) {
      console.error('❌ [CANCELLATION] Erreur comptage annulées:', cancelledError);
      return { total: total || 0, cancelled: 0, rate: 0 };
    }

    const totalCount = total || 0;
    const cancelledCount = cancelled || 0;
    const rate = totalCount > 0 ? (cancelledCount / totalCount) * 100 : 0;

    return {
      total: totalCount,
      cancelled: cancelledCount,
      rate: Math.round(rate * 100) / 100 // Arrondir à 2 décimales
    };
  } catch (error) {
    console.error('❌ [CANCELLATION] Erreur statistiques:', error);
    return { total: 0, cancelled: 0, rate: 0 };
  }
};
