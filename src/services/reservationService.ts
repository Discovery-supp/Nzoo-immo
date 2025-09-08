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

    // Étape 1: Créer ou récupérer le compte client
    console.log('👤 [RESERVATION] Création/récupération du compte client...');
    const { data: clientResult, error: clientError } = await supabase
      .rpc('get_or_create_client', {
        client_email: data.email,
        client_full_name: data.fullName,
        client_phone: data.phone,
        client_company: data.company || null,
        client_activity: data.activity,
        client_address: data.address || null
      });

    if (clientError) {
      console.error('❌ [RESERVATION] Erreur création compte client:', clientError);
      throw new Error(`Erreur lors de la création du compte client: ${clientError.message}`);
    }

    const clientId = clientResult;
    console.log('✅ [RESERVATION] Compte client géré:', clientId);

    // Étape 2: Préparer les données pour la base de données
    // Déterminer et normaliser le type d'espace selon l'activité (offres spéciales)
    let normalizedSpaceType = data.spaceType || 'coworking';
    if (data.activity) {
      const a = data.activity.toLowerCase();
      if (a.includes('pack') && a.includes('bienvenu') && a.includes('kin')) {
      normalizedSpaceType = 'accompagnement_jeunes_entrepreneuriat';
      console.log('🎯 [RESERVATION] Offre "Bienvenu à Kin" détectée → space_type normalisé:', normalizedSpaceType);
      }
    }

    const reservationData = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      activity: data.activity,
      address: data.address || null,
      space_type: normalizedSpaceType,
      start_date: data.startDate,
      end_date: data.endDate,
      occupants: data.occupants || 1,
      subscription_type: data.subscriptionType || 'daily',
      amount: data.amount || 0,
      payment_method: data.paymentMethod || 'cash',
      transaction_id: data.transactionId || `RES_${Date.now()}`,
      status: 'pending',
      client_id: clientId, // Lier la réservation au compte client
      created_at: new Date().toISOString()
    };

    console.log('📝 [RESERVATION] Données préparées avec client_id:', reservationData);

    // Étape 3: Insérer la réservation dans la base de données
    const { data: reservation, error: insertError } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [RESERVATION] Erreur insertion:', insertError);
      throw new Error(`Erreur lors de la création de la réservation: ${insertError.message}`);
    }

    console.log('✅ [RESERVATION] Réservation créée avec succès:', reservation);

    // Étape 4: Mettre à jour les statistiques du client
    try {
      await supabase.rpc('update_client_stats', { client_uuid: clientId });
      console.log('✅ [RESERVATION] Statistiques client mises à jour');
    } catch (statsError) {
      console.warn('⚠️ [RESERVATION] Erreur mise à jour statistiques:', statsError);
      // Ne pas faire échouer la réservation si les stats échouent
    }

    // Étape 5: Envoyer les emails de confirmation
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