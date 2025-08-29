import { supabase } from './supabaseClient';
import { ReservationData, ReservationResult } from '../types';
import { sendReservationEmails } from './emailServiceDirect';

// Configuration des emails d'administration
const ADMIN_EMAILS = [
  'tricksonmabengi123@gmail.com',
  'contact@nzooimmo.com'
];

// Fonction principale de création de réservation
export const createReservation = async (data: ReservationData): Promise<ReservationResult> => {
  console.log('🔍 [RESERVATION] Début création réservation:', data);
  
  try {
    // Validation des données
    if (!data.fullName || !data.email || !data.phone || !data.activity) {
      throw new Error('Tous les champs obligatoires doivent être remplis');
    }

    if (!data.startDate || !data.endDate) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }

    // Préparer les données pour la base de données
    const reservationData = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      activity: data.activity,
      address: data.address || null,
      space_type: data.spaceType || 'coworking',
      start_date: data.startDate,
      end_date: data.endDate,
      occupants: data.occupants || 1,
      subscription_type: data.subscriptionType || 'daily',
      amount: data.amount || 0,
      payment_method: data.paymentMethod || 'cash',
      transaction_id: data.transactionId || `RES_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('📝 [RESERVATION] Données préparées:', reservationData);

    // Insérer la réservation dans la base de données
    const { data: reservation, error: insertError } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [RESERVATION] Erreur insertion:', insertError);
      throw new Error(`Erreur lors de la création de la réservation: ${insertError.message}`);
    }

    console.log('✅ [RESERVATION] Réservation créée:', reservation);

    // Envoyer les emails de confirmation
    try {
      const emailResult = await sendReservationEmails(reservation);
      console.log('✅ [RESERVATION] Emails traités:', emailResult);
    } catch (emailError) {
      console.error('⚠️ [RESERVATION] Erreur envoi emails:', emailError);
      // Ne pas faire échouer la réservation si les emails échouent
    }

    return {
      success: true,
      reservation,
      error: undefined
    };

  } catch (error) {
    console.error('❌ [RESERVATION] Erreur générale:', error);
    return {
      success: false,
      reservation: undefined,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};