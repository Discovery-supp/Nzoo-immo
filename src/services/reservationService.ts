import { supabase } from './supabaseClient';
import { ReservationData, ReservationResult } from '../types';

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
      await sendReservationEmails(reservation);
      console.log('✅ [RESERVATION] Emails envoyés avec succès');
    } catch (emailError) {
      console.error('⚠️ [RESERVATION] Erreur envoi emails:', emailError);
      // Ne pas faire échouer la réservation si les emails échouent
    }

    return {
      success: true,
      reservation,
      message: 'Réservation créée avec succès'
    };

  } catch (error) {
    console.error('❌ [RESERVATION] Erreur générale:', error);
    return {
      success: false,
      reservation: null,
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};

// Fonction pour envoyer les emails de réservation
const sendReservationEmails = async (reservation: any) => {
  console.log('📧 [EMAIL] Début envoi emails pour réservation:', reservation.id);

  try {
    // Email de confirmation client
    await sendClientConfirmationEmail(reservation);
    
    // Email de notification admin
    await sendAdminNotificationEmail(reservation);
    
    console.log('✅ [EMAIL] Tous les emails envoyés avec succès');
  } catch (error) {
    console.error('❌ [EMAIL] Erreur envoi emails:', error);
    throw error;
  }
};

// Email de confirmation client
const sendClientConfirmationEmail = async (reservation: any) => {
  console.log('📧 [EMAIL] Envoi confirmation client:', reservation.email);

  const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
    body: {
      to: reservation.email,
      subject: `Réservation confirmée - ${reservation.transaction_id}`,
      html: `
        <h1>Réservation confirmée</h1>
        <p>Bonjour ${reservation.full_name},</p>
        <p>Votre réservation a été confirmée avec succès.</p>
        <p><strong>Référence:</strong> ${reservation.transaction_id}</p>
        <p><strong>Espace:</strong> ${reservation.space_type}</p>
        <p><strong>Dates:</strong> ${reservation.start_date} à ${reservation.end_date}</p>
        <p><strong>Montant:</strong> ${reservation.amount} FC</p>
        <p>Merci de votre confiance !</p>
      `,
      reservationData: reservation
    }
  });

  if (error) {
    console.error('❌ [EMAIL] Erreur email client:', error);
    throw new Error(`Erreur envoi email client: ${error.message}`);
  }

  console.log('✅ [EMAIL] Email client envoyé:', data);
};

// Email de notification admin
const sendAdminNotificationEmail = async (reservation: any) => {
  console.log('📧 [EMAIL] Envoi notification admin');

  for (const adminEmail of ADMIN_EMAILS) {
    try {
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: adminEmail,
          subject: `Nouvelle réservation - ${reservation.transaction_id}`,
          html: `
            <h1>Nouvelle réservation</h1>
            <p>Une nouvelle réservation a été créée.</p>
            <p><strong>Client:</strong> ${reservation.full_name}</p>
            <p><strong>Email:</strong> ${reservation.email}</p>
            <p><strong>Téléphone:</strong> ${reservation.phone}</p>
            <p><strong>Espace:</strong> ${reservation.space_type}</p>
            <p><strong>Dates:</strong> ${reservation.start_date} à ${reservation.end_date}</p>
            <p><strong>Montant:</strong> ${reservation.amount} FC</p>
            <p><strong>Référence:</strong> ${reservation.transaction_id}</p>
          `,
          reservationData: reservation
        }
      });

      if (error) {
        console.error(`❌ [EMAIL] Erreur email admin ${adminEmail}:`, error);
      } else {
        console.log(`✅ [EMAIL] Email admin envoyé à ${adminEmail}:`, data);
      }
    } catch (error) {
      console.error(`❌ [EMAIL] Erreur générale email admin ${adminEmail}:`, error);
    }
  }
};