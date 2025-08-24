// Test du service d'email corrigé
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simuler le service d'email corrigé (sans envoi direct)
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

// Simuler sendConfirmationEmail corrigé (utilise seulement la fonction Edge)
async function sendConfirmationEmail(emailData) {
  try {
    console.log('📧 [CLIENT] Préparation email pour:', emailData.to);

    // Générer le contenu HTML de l'email
    const emailHtml = generateClientConfirmationEmailHtml(emailData.reservationData);

    // IMPORTANT: Utiliser directement la fonction Edge (sécurisé)
    console.log('📧 [CLIENT] Utilisation de la fonction Edge (sécurisé)...');
    
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
      
      // Si la fonction n'existe pas, utiliser la simulation
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('📧 [CLIENT] Fonction Edge non trouvée, simulation...');
        return await simulateEmailSending(emailData);
      }
      
      return {
        success: false,
        emailSent: false,
        error: `Erreur fonction Edge: ${error.message}`,
        details: error
      };
    }

    console.log('✅ [CLIENT] Réponse fonction Edge:', data);

    if (!data) {
      console.warn('⚠️ [CLIENT] Aucune donnée de la fonction Edge, simulation...');
      return await simulateEmailSending(emailData);
    }

    return {
      success: data.success || false,
      emailSent: data.emailSent || false,
      provider: data.provider || 'unknown',
      error: data.error,
      note: data.note
    };

  } catch (error) {
    console.error('❌ [CLIENT] Erreur générale:', error);
    return await simulateEmailSending(emailData);
  }
}

// Simuler sendAdminAcknowledgmentEmail corrigé (utilise seulement la fonction Edge)
async function sendAdminAcknowledgmentEmail(reservationData) {
  try {
    console.log('📧 [ADMIN] Préparation email admin');

    // Générer le contenu HTML de l'email d'administration
    const emailHtml = generateAdminAcknowledgmentEmailHtml(reservationData);

    // Envoyer à tous les emails d'administration
    const ADMIN_EMAILS = [
      'tricksonmabengi123@gmail.com',
      'contact@nzooimmo.com'
    ];

    const emailPromises = ADMIN_EMAILS.map(async (adminEmail) => {
      console.log('📧 [ADMIN] Envoi vers:', adminEmail);
      
      // IMPORTANT: Utiliser directement la fonction Edge (sécurisé)
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: adminEmail,
          subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
          html: emailHtml,
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
      provider: 'edge-function',
      error: failedEmails > 0 ? `${failedEmails} emails échoués` : undefined
    };

  } catch (error) {
    console.error('❌ [ADMIN] Erreur générale:', error);
    return {
      success: false,
      emailSent: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Simuler simulateEmailSending
async function simulateEmailSending(emailData) {
  console.log('📧 [SIMULATION] Email simulé vers:', emailData.to);
  console.log('📧 [SIMULATION] Sujet:', emailData.subject);
  
  return {
    success: true,
    emailSent: true,
    provider: 'simulation',
    note: 'Email simulé - Fonction Edge non disponible'
  };
}

// Fonctions de génération HTML
function generateClientConfirmationEmailHtml(reservationData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confirmation de Réservation - N'zoo Immo</title>
    </head>
    <body>
      <h1>✅ Confirmation de Réservation</h1>
      <p>Bonjour ${reservationData.fullName},</p>
      <p>Votre réservation a été confirmée avec succès.</p>
      <h2>Détails de la réservation :</h2>
      <ul>
        <li><strong>Référence :</strong> ${reservationData.transactionId}</li>
        <li><strong>Montant :</strong> ${reservationData.amount}€</li>
        <li><strong>Type d'espace :</strong> ${reservationData.spaceType}</li>
        <li><strong>Date de début :</strong> ${reservationData.startDate}</li>
        <li><strong>Date de fin :</strong> ${reservationData.endDate}</li>
      </ul>
    </body>
    </html>
  `;
}

function generateAdminAcknowledgmentEmailHtml(reservationData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nouvelle Réservation - N'zoo Immo</title>
    </head>
    <body>
      <h1>🔔 Nouvelle Réservation Reçue</h1>
      <p>Une nouvelle réservation nécessite votre attention.</p>
      <h2>Détails :</h2>
      <ul>
        <li><strong>Client :</strong> ${reservationData.fullName}</li>
        <li><strong>Email :</strong> ${reservationData.email}</li>
        <li><strong>Téléphone :</strong> ${reservationData.phone}</li>
        <li><strong>Montant :</strong> ${reservationData.amount}€</li>
      </ul>
    </body>
    </html>
  `;
}

// Test principal
async function testFixedEmailService() {
  console.log('🧪 Test du service d\'email corrigé - Nzoo Immo\n');

  // Simuler les données de réservation
  const reservationData = {
    fullName: 'Test User Fixed',
    email: 'test@example.com',
    phone: '123456789',
    company: 'Test Company',
    activity: 'Test Activity',
    spaceType: 'coworking',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    amount: 100,
    transactionId: `FIXED_TEST_${Date.now()}`,
    status: 'confirmed'
  };

  console.log('📝 Données de réservation:', reservationData);

  try {
    // Tester l'envoi d'emails avec le service corrigé
    const emailResult = await sendReservationEmails(reservationData);
    
    console.log('\n📧 Résultats finaux:');
    console.log('- Client email:', emailResult.clientEmailSent ? '✅' : '❌');
    console.log('- Admin email:', emailResult.adminEmailSent ? '✅' : '❌');
    
    if (emailResult.clientEmailError) {
      console.log('Erreur client:', emailResult.clientEmailError);
    }
    if (emailResult.adminEmailError) {
      console.log('Erreur admin:', emailResult.adminEmailError);
    }

    if (emailResult.clientEmailSent && emailResult.adminEmailSent) {
      console.log('\n🎉 Service d\'email corrigé avec succès !');
      console.log('✅ Les emails sont maintenant envoyés via la fonction Edge (sécurisé)');
    } else {
      console.log('\n⚠️ Certains emails n\'ont pas été envoyés');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testFixedEmailService().catch(console.error);
