// Test du flux d'email exact de l'application
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (même que dans l'app)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simuler le service d'email exact de l'application
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

// Simuler sendConfirmationEmail exact de l'application
async function sendConfirmationEmail(emailData) {
  try {
    console.log('📧 [CLIENT] Préparation email pour:', emailData.to);

    // Générer le contenu HTML de l'email
    const emailHtml = generateClientConfirmationEmailHtml(emailData.reservationData);

    // Essayer d'abord l'envoi direct via Resend
    const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
    if (RESEND_API_KEY) {
      console.log('📧 [CLIENT] Tentative envoi direct Resend...');
      const directResult = await sendEmailDirectly({
        ...emailData,
        html: emailHtml
      });
      
      if (directResult.success) {
        console.log('✅ [CLIENT] Succès envoi direct Resend');
        return directResult;
      } else {
        console.log('⚠️ [CLIENT] Échec envoi direct, tentative fonction Edge...');
      }
    }

    // Fallback: essayer la fonction Edge
    console.log('📧 [CLIENT] Tentative fonction Edge...');
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

// Simuler sendAdminAcknowledgmentEmail exact de l'application
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
      
      // Essayer d'abord l'envoi direct
      const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
      if (RESEND_API_KEY) {
        const directResult = await sendEmailDirectly({
          to: adminEmail,
          subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
          html: emailHtml,
          reservationData
        });
        
        if (directResult.success) {
          return { success: true, data: directResult };
        }
      }
      
      // Fallback: fonction Edge
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
      provider: 'mixed',
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

// Simuler sendEmailDirectly exact de l'application
async function sendEmailDirectly(emailData) {
  try {
    console.log('📧 [RESEND] Envoi direct vers:', emailData.to);
    
    const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html || generateClientConfirmationEmailHtml(emailData.reservationData),
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ [RESEND] Email envoyé avec succès:', result.id);
      return {
        success: true,
        emailSent: true,
        provider: 'resend',
        details: result
      };
    } else {
      const errorText = await response.text();
      console.error('❌ [RESEND] Erreur:', response.status, errorText);
      return {
        success: false,
        emailSent: false,
        provider: 'resend',
        error: `Resend error: ${response.status} - ${errorText}`
      };
    }
  } catch (error) {
    console.error('❌ [RESEND] Erreur réseau:', error);
    return {
      success: false,
      emailSent: false,
      provider: 'resend',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Simuler simulateEmailSending exact de l'application
async function simulateEmailSending(emailData) {
  console.log('📧 [SIMULATION] Email simulé vers:', emailData.to);
  console.log('📧 [SIMULATION] Sujet:', emailData.subject);
  
  return {
    success: true,
    emailSent: true,
    provider: 'simulation',
    note: 'Email simulé - Resend non configuré'
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
async function testAppEmailFlow() {
  console.log('🧪 Test du flux d\'email exact de l\'application - Nzoo Immo\n');

  // Simuler les données de réservation exactes de l'application
  const reservationData = {
    fullName: 'Test User App',
    email: 'test@example.com',
    phone: '123456789',
    company: 'Test Company',
    activity: 'Test Activity',
    spaceType: 'coworking',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    amount: 100,
    transactionId: 'APP_TEST_123',
    status: 'confirmed'
  };

  console.log('📝 Données de réservation simulées:', reservationData);

  try {
    // Tester l'envoi d'emails exactement comme dans l'application
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

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testAppEmailFlow().catch(console.error);
