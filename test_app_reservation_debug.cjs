#!/usr/bin/env node

/**
 * Test de debug de la réservation depuis l'application
 * Simule exactement ce que fait l'application pour identifier le problème
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (même que l'application)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Vérifier la connexion Supabase
async function testSupabaseConnection() {
  console.log('🔍 Test 1: Vérification de la connexion Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Erreur connexion Supabase:', error.message);
      return false;
    }

    console.log('✅ Connexion Supabase - OK');
    return true;
  } catch (error) {
    console.log('❌ Erreur connexion Supabase:', error.message);
    return false;
  }
}

// Test 2: Vérifier l'accessibilité de la fonction Edge
async function testEdgeFunction() {
  console.log('\n🔍 Test 2: Vérification de la fonction Edge...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Edge Function',
        html: '<p>Test email</p>',
        reservationData: { test: true }
      }
    });

    if (error) {
      console.log('❌ Erreur fonction Edge:', error.message);
      return false;
    }

    console.log('✅ Fonction Edge - OK');
    console.log('📧 Réponse:', data);
    return true;
  } catch (error) {
    console.log('❌ Erreur fonction Edge:', error.message);
    return false;
  }
}

// Test 3: Simuler exactement la logique de l'application
async function testAppLogic() {
  console.log('\n🔍 Test 3: Simulation de la logique de l\'application...');
  
  // Données exactes comme dans l'application
  const formData = {
    fullName: 'Test Application Debug',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243 123 456 789',
    company: 'Test Company',
    activity: 'Test Activity',
    address: 'Test Address',
    occupants: 1,
    subscriptionType: 'daily'
  };

  const selectedSpace = 'coworking';
  const selectedDates = [new Date('2024-01-30'), new Date('2024-01-30')];
  const selectedPaymentMethod = 'CASH';

  console.log('📝 Données de test:', {
    formData,
    selectedSpace,
    selectedDates: selectedDates.map(d => d.toISOString().split('T')[0]),
    selectedPaymentMethod
  });

  try {
    // Mapper le type d'espace comme dans l'application
    const mapSpaceType = (type) => {
      const spaceTypeMap = {
        'coworking': 'coworking',
        'bureau-prive': 'bureau_prive',
        'domiciliation': 'domiciliation',
      };
      return spaceTypeMap[type] || type;
    };

    const mappedSpaceType = mapSpaceType(selectedSpace);
    const startDateFormatted = selectedDates[0].toISOString().split('T')[0];
    const endDateFormatted = selectedDates[1].toISOString().split('T')[0];

    // Données de réservation exactes comme dans l'application
    const reservationData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      activity: formData.activity,
      address: formData.address,
      spaceType: mappedSpaceType,
      startDate: startDateFormatted,
      endDate: endDateFormatted,
      occupants: formData.occupants,
      subscriptionType: formData.subscriptionType,
      amount: 50000, // Montant fixe pour le test
      paymentMethod: selectedPaymentMethod,
      transactionId: `APP_TEST_${Date.now()}`,
    };

    console.log('📝 Données de réservation préparées:', reservationData);

    // Appeler la fonction de réservation
    const result = await createReservation(reservationData);
    
    console.log('📊 Résultat de la réservation:', result);
    return result;

  } catch (error) {
    console.error('❌ Erreur simulation application:', error);
    return { success: false, error: error.message };
  }
}

// Fonction de réservation (copie exacte du service)
async function createReservation(data) {
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
      transaction_id: data.transactionId || `TXN_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('📝 [RESERVATION] Données préparées:', reservationData);

    // Insérer la réservation en base
    const { data: reservation, error: insertError } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [RESERVATION] Erreur insertion:', insertError);
      throw new Error(`Erreur lors de la création de la réservation: ${insertError.message}`);
    }

    console.log('✅ [RESERVATION] Réservation créée:', reservation.id);

    // Envoyer les emails de confirmation
    let emailResults = { clientEmailSent: false, adminEmailSent: false };

    try {
      emailResults = await sendReservationEmails(reservation);
      console.log('📧 [RESERVATION] Résultats emails:', emailResults);
    } catch (emailError) {
      console.error('⚠️ [RESERVATION] Erreur envoi emails:', emailError);
      // On continue même si les emails échouent
    }

    const result = {
      success: true,
      reservation,
      emailSent: emailResults.clientEmailSent,
      clientEmailSent: emailResults.clientEmailSent,
      adminEmailSent: emailResults.adminEmailSent,
      clientEmailError: emailResults.clientEmailSent ? undefined : 'Erreur envoi email client',
      adminEmailError: emailResults.adminEmailSent ? undefined : 'Erreur envoi email admin'
    };

    console.log('✅ [RESERVATION] Réservation terminée avec succès');
    return result;

  } catch (error) {
    console.error('❌ [RESERVATION] Erreur générale:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Fonction pour envoyer les emails de réservation
async function sendReservationEmails(reservation) {
  console.log('📧 [EMAIL] Début envoi emails pour:', reservation.email);
  
  const results = {
    clientEmailSent: false,
    adminEmailSent: false
  };

  try {
    // 1. Email de confirmation au client
    console.log('📧 [EMAIL] Envoi email client...');
    const clientEmailResult = await sendClientConfirmationEmail(reservation);
    results.clientEmailSent = clientEmailResult.success;
    
    if (clientEmailResult.success) {
      console.log('✅ [EMAIL] Email client envoyé avec succès');
    } else {
      console.error('❌ [EMAIL] Échec email client:', clientEmailResult.error);
    }

    // 2. Email d'information à l'administration
    console.log('📧 [EMAIL] Envoi email admin...');
    const adminEmailResult = await sendAdminNotificationEmail(reservation);
    results.adminEmailSent = adminEmailResult.success;
    
    if (adminEmailResult.success) {
      console.log('✅ [EMAIL] Email admin envoyé avec succès');
    } else {
      console.error('❌ [EMAIL] Échec email admin:', adminEmailResult.error);
    }

  } catch (error) {
    console.error('❌ [EMAIL] Erreur générale envoi emails:', error);
  }

  return results;
}

// Fonction pour envoyer l'email de confirmation au client
async function sendClientConfirmationEmail(reservation) {
  try {
    console.log('📧 [CLIENT] Préparation email client pour:', reservation.email);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Confirmation de Réservation - N'zoo Immo</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5aa0; text-align: center;">✅ Confirmation de Réservation</h1>
          
          <p>Bonjour <strong>${reservation.full_name}</strong>,</p>
          
          <p>Nous avons le plaisir de confirmer votre réservation d'espace de travail chez N'zoo Immo.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2c5aa0; margin-top: 0;">📋 Détails de votre réservation :</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Nom :</strong> ${reservation.full_name}</li>
              <li><strong>Email :</strong> ${reservation.email}</li>
              <li><strong>Téléphone :</strong> ${reservation.phone}</li>
              <li><strong>Type d'espace :</strong> ${reservation.space_type}</li>
              <li><strong>Date de début :</strong> ${reservation.start_date}</li>
              <li><strong>Date de fin :</strong> ${reservation.end_date}</li>
              <li><strong>Référence :</strong> ${reservation.transaction_id}</li>
              <li><strong>Montant :</strong> ${reservation.amount}€</li>
            </ul>
          </div>
          
          <p>Votre réservation a été enregistrée avec succès. Nous vous contacterons bientôt pour finaliser les détails.</p>
          
          <p>Pour toute question, n'hésitez pas à nous contacter :</p>
          <ul>
            <li>Email : contact@nzooimmo.com</li>
            <li>Téléphone : +243 XXX XXX XXX</li>
          </ul>
          
          <p>Cordialement,<br>
          <strong>L'équipe N'zoo Immo</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
          </p>
        </div>
      </body>
      </html>
    `;

    // Envoyer via la fonction Edge Supabase
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: reservation.email,
        subject: `Confirmation de réservation - ${reservation.full_name}`,
        html: emailHtml,
        reservationData: reservation
      }
    });

    if (error) {
      console.error('❌ [CLIENT] Erreur fonction Edge:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [CLIENT] Réponse fonction Edge:', data);
    return { success: data?.success || false, error: data?.error };

  } catch (error) {
    console.error('❌ [CLIENT] Erreur générale:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Fonction pour envoyer l'email de notification à l'administration
async function sendAdminNotificationEmail(reservation) {
  try {
    console.log('📧 [ADMIN] Préparation email admin');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Nouvelle Réservation - N'zoo Immo</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5aa0; text-align: center;">🔔 Nouvelle Réservation Reçue</h1>
          
          <p>Une nouvelle réservation nécessite votre attention.</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h2 style="color: #856404; margin-top: 0;">📋 Détails de la réservation :</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Client :</strong> ${reservation.full_name}</li>
              <li><strong>Email :</strong> ${reservation.email}</li>
              <li><strong>Téléphone :</strong> ${reservation.phone}</li>
              <li><strong>Entreprise :</strong> ${reservation.company || 'Non spécifiée'}</li>
              <li><strong>Activité :</strong> ${reservation.activity}</li>
              <li><strong>Type d'espace :</strong> ${reservation.space_type}</li>
              <li><strong>Date de début :</strong> ${reservation.start_date}</li>
              <li><strong>Date de fin :</strong> ${reservation.end_date}</li>
              <li><strong>Référence :</strong> ${reservation.transaction_id}</li>
              <li><strong>Montant :</strong> ${reservation.amount}€</li>
              <li><strong>Méthode de paiement :</strong> ${reservation.payment_method}</li>
            </ul>
          </div>
          
          <p><strong>Action requise :</strong> Veuillez contacter le client pour finaliser la réservation.</p>
          
          <p>Référence de réservation : <strong>${reservation.transaction_id}</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement par le système de réservation.
          </p>
        </div>
      </body>
      </html>
    `;

    // Envoyer à l'email d'administration
    const adminEmail = 'tricksonmabengi123@gmail.com';
    console.log('📧 [ADMIN] Envoi vers:', adminEmail);
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: adminEmail,
        subject: `Nouvelle réservation reçue - ${reservation.full_name}`,
        html: emailHtml,
        reservationData: reservation
      }
    });

    if (error) {
      console.error('❌ [ADMIN] Erreur pour', adminEmail, ':', error);
      return { success: false, error: error.message };
    }

    return { success: data?.success || false, error: data?.error };

  } catch (error) {
    console.error('❌ [ADMIN] Erreur générale:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// Test principal
async function testAppReservationDebug() {
  console.log('🔍 TEST DE DEBUG DE LA RÉSERVATION DEPUIS L\'APPLICATION');
  console.log('========================================================');
  
  try {
    // Test 1: Connexion Supabase
    const connectionOk = await testSupabaseConnection();
    if (!connectionOk) {
      console.log('❌ Impossible de continuer sans connexion Supabase');
      return;
    }

    // Test 2: Fonction Edge
    const edgeOk = await testEdgeFunction();
    if (!edgeOk) {
      console.log('❌ Problème avec la fonction Edge');
      return;
    }

    // Test 3: Logique de l'application
    console.log('\n🔍 Test 3: Simulation de la logique de l\'application...');
    const result = await testAppLogic();
    
    console.log('\n📊 RÉSULTATS FINAUX');
    console.log('===================');
    console.log(`✅ Succès: ${result.success}`);
    
    if (result.success) {
      console.log(`📧 Email client: ${result.clientEmailSent ? '✅' : '❌'}`);
      console.log(`📧 Email admin: ${result.adminEmailSent ? '✅' : '❌'}`);
      console.log(`🆔 ID réservation: ${result.reservation.id}`);
      console.log(`📝 Référence: ${result.reservation.transaction_id}`);
      
      if (result.clientEmailError) {
        console.log(`⚠️ Erreur email client: ${result.clientEmailError}`);
      }
      if (result.adminEmailError) {
        console.log(`⚠️ Erreur email admin: ${result.adminEmailError}`);
      }
    } else {
      console.log(`❌ Erreur: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error('❌ Erreur test:', error);
    return { success: false, error: error.message };
  }
}

testAppReservationDebug().catch(console.error);
