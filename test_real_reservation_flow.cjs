#!/usr/bin/env node

/**
 * Test du flux de réservation réel de l'application
 * Simule exactement ce qui se passe quand un utilisateur fait une réservation
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Données de réservation (comme dans l'application)
const reservationData = {
  fullName: 'Jean Test Application',
  email: 'trickson.mabengi@gmail.com',
  phone: '+243 123 456 789',
  company: 'Entreprise Test App',
  activity: 'Réunion d\'équipe',
  spaceType: 'Bureau',
  startDate: '2024-01-25',
  endDate: '2024-01-25',
  amount: 85000,
  transactionId: 'APP_FLOW_' + Date.now(),
  status: 'pending'
};

// Simuler exactement le service de réservation de l'application
async function createReservation(data) {
  console.log('📝 [APP] Création réservation avec données:', data);

  try {
    // Validation des données (comme dans l'app)
    if (!data.startDate || !data.endDate) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }
    
    if (!data.fullName || !data.email || !data.phone) {
      throw new Error('Le nom, email et téléphone sont obligatoires');
    }

    if (!data.activity || data.activity.trim() === '') {
      throw new Error('L\'activité professionnelle est obligatoire');
    }

    console.log('✅ [APP] Validation des données réussie');

    // Préparer les données pour la base (comme dans l'app)
    const reservationData = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      activity: data.activity,
      address: null,
      space_type: data.spaceType || 'coworking',
      start_date: data.startDate,
      end_date: data.endDate,
      occupants: 1,
      subscription_type: 'daily',
      amount: data.amount,
      payment_method: 'cash',
      transaction_id: data.transactionId,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('📝 [APP] Données mappées pour la base:', reservationData);
    
    // Insérer dans la base (comme dans l'app)
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('❌ [APP] Erreur insertion:', error);
      throw new Error(`Erreur d'insertion: ${error.message}`);
    }

    console.log('✅ [APP] Réservation créée en base:', reservation.id);

    // Envoyer les emails (comme dans l'app)
    let clientEmailSent = false;
    let adminEmailSent = false;
    let clientEmailError = undefined;
    let adminEmailError = undefined;

    try {
      console.log('📧 [APP] Envoi des emails...');
      
      // Simuler l'appel à sendReservationEmails
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
        console.log('✅ [APP] Email client envoyé avec succès');
      } else {
        console.warn('⚠️ [APP] Échec email client:', clientEmailError);
      }
      
      if (adminEmailSent) {
        console.log('✅ [APP] Email admin envoyé avec succès');
      } else {
        console.warn('⚠️ [APP] Échec email admin:', adminEmailError);
      }
      
    } catch (emailError) {
      console.warn('⚠️ [APP] Erreur envoi emails:', emailError);
      clientEmailSent = false;
      adminEmailSent = false;
      clientEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
      adminEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
    }

    const result = {
      success: true,
      reservation,
      emailSent: clientEmailSent,
      clientEmailSent,
      adminEmailSent,
      clientEmailError,
      adminEmailError
    };
    
    console.log('🔍 [APP] Résultat final createReservation:', result);
    return result;

  } catch (error) {
    console.error('❌ [APP] Erreur dans createReservation:', error);
    return {
      success: false,
      error: error.message,
      emailSent: false
    };
  }
}

// Simuler exactement le service d'email de l'application
async function sendReservationEmails(reservationData) {
  console.log('📧 [EMAIL] Début envoi emails pour:', reservationData.email);
  
  const result = {
    clientEmailSent: false,
    adminEmailSent: false
  };

  try {
    // 1. Envoyer l'email de confirmation au client
    console.log('📧 [EMAIL] Envoi email client...');
    const clientEmailResult = await sendConfirmationEmail({
      to: reservationData.email,
      subject: `Confirmation de réservation - ${reservationData.fullName}`,
      reservationData
    });
    
    result.clientEmailSent = clientEmailResult.emailSent;
    if (!clientEmailResult.emailSent) {
      result.clientEmailError = clientEmailResult.error;
      console.log('❌ [EMAIL] Échec email client:', clientEmailResult.error);
    } else {
      console.log('✅ [EMAIL] Email client envoyé avec succès');
    }

    // 2. Envoyer l'email d'accusé de réception à l'administration
    console.log('📧 [EMAIL] Envoi email admin...');
    const adminEmailResult = await sendAdminAcknowledgmentEmail(reservationData);
    
    result.adminEmailSent = adminEmailResult.emailSent;
    if (!adminEmailResult.emailSent) {
      result.adminEmailError = adminEmailResult.error;
      console.log('❌ [EMAIL] Échec email admin:', adminEmailResult.error);
    } else {
      console.log('✅ [EMAIL] Email admin envoyé avec succès');
    }

    console.log('📧 [EMAIL] Résultats finaux:', {
      clientEmailSent: result.clientEmailSent,
      adminEmailSent: result.adminEmailSent,
      clientError: result.clientEmailError,
      adminError: result.adminEmailError
    });

  } catch (error) {
    console.error('❌ [EMAIL] Erreur générale:', error);
    result.clientEmailError = error instanceof Error ? error.message : 'Erreur inconnue';
  }

  return result;
}

// Simuler sendConfirmationEmail
async function sendConfirmationEmail(emailData) {
  try {
    console.log('📧 [CLIENT] Préparation email pour:', emailData.to);

    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>🎉 Confirmation de Réservation</h1>
          <p>Bonjour ${emailData.reservationData.fullName},</p>
          <p>Votre réservation a été confirmée avec succès !</p>
          <p><strong>Transaction ID:</strong> ${emailData.reservationData.transactionId}</p>
        </body>
      </html>
    `;

    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        html: emailHtml,
        reservationData: emailData.reservationData
      }
    });

    if (error) {
      console.error('❌ [CLIENT] Erreur fonction Edge:', error.message);
      return {
        success: false,
        emailSent: false,
        error: `Erreur fonction Edge: ${error.message}`
      };
    }

    return {
      success: data.success || false,
      emailSent: data.emailSent || false,
      provider: data.provider,
      error: data.error
    };

  } catch (error) {
    console.error('❌ [CLIENT] Erreur générale:', error);
    return {
      success: false,
      emailSent: false,
      error: error.message
    };
  }
}

// Simuler sendAdminAcknowledgmentEmail
async function sendAdminAcknowledgmentEmail(reservationData) {
  try {
    console.log('📧 [ADMIN] Préparation email admin');

    const adminEmailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>🚨 Nouvelle Réservation Reçue</h1>
          <p>Nouvelle réservation de ${reservationData.fullName}</p>
          <p><strong>Transaction ID:</strong> ${reservationData.transactionId}</p>
        </body>
      </html>
    `;

    const ADMIN_EMAILS = [
      'tricksonmabengi123@gmail.com',
      'contact@nzooimmo.com',
      'esther.kilolo@celluleinfra.org',
      'myv.nsuanda2012@gmail.com'
    ];

    const emailPromises = ADMIN_EMAILS.map(async (adminEmail) => {
      console.log('📧 [ADMIN] Envoi vers:', adminEmail);
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: adminEmail,
          subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
          html: adminEmailHtml,
          reservationData
        }
      });

      if (error) {
        console.error('❌ [ADMIN] Erreur pour', adminEmail, ':', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    });

    const results = await Promise.all(emailPromises);
    const successfulEmails = results.filter(r => r.success).length;
    const failedEmails = results.filter(r => !r.success).length;

    console.log(`📧 [ADMIN] Résultats: ${successfulEmails}/${ADMIN_EMAILS.length} succès`);

    return {
      success: successfulEmails > 0,
      emailSent: successfulEmails > 0,
      error: failedEmails > 0 ? `${failedEmails} email(s) échoué(s)` : undefined
    };

  } catch (error) {
    console.error('❌ [ADMIN] Erreur générale:', error);
    return {
      success: false,
      emailSent: false,
      error: error.message
    };
  }
}

// Test principal
async function testRealReservationFlow() {
  console.log('🧪 Test du flux de réservation réel de l\'application');
  console.log('=====================================================');
  console.log(`📋 Données de test:`);
  console.log(`   - Client: ${reservationData.fullName}`);
  console.log(`   - Email: ${reservationData.email}`);
  console.log(`   - Espace: ${reservationData.spaceType}`);
  console.log(`   - Montant: ${reservationData.amount.toLocaleString('fr-FR')} FC`);
  console.log('');

  const result = await createReservation(reservationData);

  console.log('\n📊 Résultats du flux complet');
  console.log('============================');
  console.log(`✅ Réservation créée: ${result.success ? 'Oui' : 'Non'}`);
  console.log(`📧 Email client: ${result.clientEmailSent ? '✅' : '❌'}`);
  console.log(`📧 Email admin: ${result.adminEmailSent ? '✅' : '❌'}`);

  if (result.clientEmailError) {
    console.log(`❌ Erreur email client: ${result.clientEmailError}`);
  }
  if (result.adminEmailError) {
    console.log(`❌ Erreur email admin: ${result.adminEmailError}`);
  }

  if (result.success && result.clientEmailSent && result.adminEmailSent) {
    console.log('\n🎉 Flux de réservation complet réussi !');
    console.log('✅ La réservation a été créée en base');
    console.log('✅ Les emails ont été envoyés');
    console.log('✅ Votre application devrait fonctionner correctement');
  } else {
    console.log('\n⚠️  Problème détecté dans le flux');
    console.log('💡 Vérifiez les erreurs ci-dessus');
  }

  return result;
}

testRealReservationFlow().catch(console.error);
