import { supabase } from './supabaseClient';
import { sendReservationEmails } from './emailService';
import { ReservationData, ReservationResult } from '../types';
import { logger } from '../utils/logger';

export const createReservation = async (data: ReservationData): Promise<ReservationResult> => {
  try {
    logger.reservation('Creating reservation with original data:', data);

    // Validation des données avant envoi
    if (!data.startDate || !data.endDate) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }
    
    if (!data.fullName || !data.email || !data.phone) {
      throw new Error('Le nom, email et téléphone sont obligatoires');
    }

    // Vérification du format des dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Format de date invalide');
    }

    console.log('📅 Date validation passed:', {
      startDate: data.startDate,
      endDate: data.endDate,
      startDateParsed: startDate.toISOString(),
      endDateParsed: endDate.toISOString()
    });
    
    // Préparer les données pour la fonction RPC
    // Mapper correctement les propriétés JavaScript vers les noms de colonnes de la base de données
    const reservationData = {
      full_name: data.fullName || '',  // Mapper fullName -> full_name
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      activity: data.activity,
      address: data.address || null,
      space_type: data.spaceType || 'coworking',  // Mapper spaceType -> space_type
      start_date: data.startDate || new Date().toISOString().split('T')[0],  // Mapper startDate -> start_date
      end_date: data.endDate || new Date().toISOString().split('T')[0],      // Mapper endDate -> end_date
      occupants: data.occupants,
      subscription_type: data.subscriptionType || 'daily',  // Mapper subscriptionType -> subscription_type
      amount: data.amount,
      payment_method: data.paymentMethod || 'cash',  // Mapper paymentMethod -> payment_method
      transaction_id: data.transactionId || `TXN-${Date.now()}`,  // Mapper transactionId -> transaction_id
      status: data.paymentMethod === 'cash' ? 'pending' : 'confirmed',
      created_at: new Date().toISOString()  // Mapper createdAt -> created_at
    };

    console.log('📝 Original form data:', JSON.stringify(data, null, 2));
    console.log('📝 Mapped reservation data for RPC:', JSON.stringify(reservationData, null, 2));
    
    // Validation critique des champs obligatoires
    if (!reservationData.start_date || !reservationData.end_date) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }
    
    if (!reservationData.full_name || !reservationData.email || !reservationData.phone) {
      throw new Error('Le nom complet, email et téléphone sont obligatoires');
    }

    // Tester d'abord la connexion Supabase
    const { data: testData, error: testError } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection test failed:', testError);
      
      // Check if it's a connection error due to missing environment variables
      if (testError.message.includes('Invalid API key') || testError.message.includes('fetch')) {
        throw new Error('Connexion Supabase non configurée. Veuillez cliquer sur "Connect to Supabase" en haut à droite pour configurer la base de données.');
      }
      
      throw new Error(`Erreur de connexion Supabase: ${testError.message}`);
    }
    
    console.log('✅ Supabase connection test passed');
    
    // Insérer directement dans la table reservations
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      throw new Error(`Erreur d'insertion: ${error.message}`);
    }

    if (!reservation) {
      throw new Error('Aucune donnée de réservation retournée par l\'insertion');
    }

    console.log('✅ Reservation created via direct insert:', reservation.id);

    // Envoyer l'email de confirmation
    let emailSent = false;
    let clientEmailSent = false;
    let adminEmailSent = false;
    let clientEmailError: string | undefined;
    let adminEmailError: string | undefined;

    try {
      console.log('📧 Sending reservation emails...');
      
      const emailResult = await sendReservationEmails({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        activity: data.activity,
        spaceType: data.spaceType,
        startDate: data.startDate,
        endDate: data.endDate,
        amount: data.amount,
        transactionId: data.transactionId,
        status: reservation.status || 'pending'
      });
      
      // emailSent calculé à partir des résultats
      clientEmailSent = emailResult.clientEmailSent;
      adminEmailSent = emailResult.adminEmailSent;
      clientEmailError = emailResult.clientEmailError;
      adminEmailError = emailResult.adminEmailError;
      
      if (clientEmailSent) {
        console.log('✅ Client confirmation email sent successfully');
      } else {
        console.warn('⚠️ Client email sending failed:', clientEmailError);
      }
      
      if (adminEmailSent) {
        console.log('✅ Admin acknowledgment email sent successfully');
      } else {
        console.warn('⚠️ Admin email sending failed:', adminEmailError);
      }
      
    } catch (emailError) {
      console.warn('⚠️ Email sending failed:', emailError);
      clientEmailSent = false;
      adminEmailSent = false;
      clientEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
      adminEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
    }

    return {
      success: true,
      reservation,
      emailSent: clientEmailSent, // Pour compatibilité avec l'interface existante
      clientEmailSent,
      adminEmailSent,
      clientEmailError,
      adminEmailError
    };

  } catch (error) {
    console.error('❌ Error in createReservation:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      emailSent: false,
      clientEmailSent: false,
      adminEmailSent: false,
      clientEmailError: undefined,
      adminEmailError: undefined
    };
  }
};

// Alternative function using service role client for bypassing RLS
export const createReservationServiceRole = async (data: ReservationData): Promise<ReservationResult> => {
  try {
    logger.reservation('Creating reservation with correct column mapping:', data);

    // Mapper les propriétés JavaScript vers les noms de colonnes de la base de données
    const reservationData = {
      full_name: data.fullName || '',  // Map fullName -> full_name
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      activity: data.activity,
      address: data.address || null,
      space_type: data.spaceType || 'coworking',  // Map spaceType -> space_type
      start_date: data.startDate || new Date().toISOString().split('T')[0],  // Map startDate -> start_date
      end_date: data.endDate || new Date().toISOString().split('T')[0],      // Map endDate -> end_date
      occupants: data.occupants,
      subscription_type: data.subscriptionType || 'daily',  // Map subscriptionType -> subscription_type
      amount: data.amount,
      payment_method: data.paymentMethod || 'cash',  // Map paymentMethod -> payment_method
      transaction_id: data.transactionId || `TXN-${Date.now()}`,  // Map transactionId -> transaction_id
      status: data.paymentMethod === 'cash' ? 'pending' : 'confirmed',
      created_at: new Date().toISOString()  // Map createdAt -> created_at
    };

    logger.debug('Original form data (ServiceRole):', data);
    logger.debug('Mapped reservation data (ServiceRole):', reservationData);
    
    // Validation critique des champs obligatoires
    if (!reservationData.start_date || !reservationData.end_date) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }
    
    if (!reservationData.full_name || !reservationData.email || !reservationData.phone) {
      throw new Error('Le nom complet, email et téléphone sont obligatoires');
    }

    // Insérer directement dans la table reservations
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error:', error);
      throw new Error(`Erreur d'insertion: ${error.message}`);
    }

    logger.reservation('Reservation created via direct insert:', { id: reservation.id });

    // Envoyer l'email de confirmation
    let clientEmailSent = false;
    let adminEmailSent = false;
    let clientEmailError: string | undefined;
    let adminEmailError: string | undefined;

    try {
      logger.email('Sending reservation emails...');
      
      const emailResult = await sendReservationEmails({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        activity: data.activity,
        spaceType: data.spaceType,
        startDate: data.startDate,
        endDate: data.endDate,
        amount: data.amount,
        transactionId: data.transactionId,
        status: reservation.status || 'pending'
      });
      
      clientEmailSent = emailResult.clientEmailSent;
      adminEmailSent = emailResult.adminEmailSent;
      clientEmailError = emailResult.clientEmailError;
      adminEmailError = emailResult.adminEmailError;
      
      if (clientEmailSent) {
        console.log('✅ Client confirmation email sent successfully');
      } else {
        console.warn('⚠️ Client email sending failed:', clientEmailError);
      }
      
      if (adminEmailSent) {
        console.log('✅ Admin acknowledgment email sent successfully');
      } else {
        console.warn('⚠️ Admin email sending failed:', adminEmailError);
      }
      
    } catch (emailError) {
      console.warn('⚠️ Email sending failed:', emailError);
      clientEmailSent = false;
      adminEmailSent = false;
      clientEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
      adminEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
    }

    return {
      success: true,
      reservation,
      emailSent: clientEmailSent, // Pour compatibilité avec l'interface existante
      clientEmailSent,
      adminEmailSent,
      clientEmailError,
      adminEmailError
    };

  } catch (error) {
    console.error('❌ Error in createReservationServiceRole:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      emailSent: false,
      clientEmailSent: false,
      adminEmailSent: false,
      clientEmailError: undefined,
      adminEmailError: undefined
    };
  }
};