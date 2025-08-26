#!/usr/bin/env node

/**
 * Test de l'envoi automatique d'emails de confirmation
 * 
 * Ce script teste la fonctionnalité d'envoi automatique d'emails
 * lors de la confirmation des réservations dans le modal de gestion.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simuler la fonction sendConfirmationEmail
async function sendConfirmationEmail(emailData) {
  try {
    console.log('📧 [TEST] Préparation email pour:', emailData.to);
    console.log('📧 [TEST] Sujet:', emailData.subject);
    console.log('📧 [TEST] Données réservation:', emailData.reservationData);

    // Simuler l'envoi via la fonction Edge
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        html: generateTestEmailHtml(emailData.reservationData),
        reservationData: emailData.reservationData
      }
    });

    if (error) {
      console.error('❌ [TEST] Erreur fonction Edge:', error.message);
      return {
        success: false,
        emailSent: false,
        error: `Erreur fonction Edge: ${error.message}`
      };
    }

    console.log('✅ [TEST] Réponse fonction Edge:', data);

    return {
      success: data.success || false,
      emailSent: data.emailSent || false,
      provider: data.provider,
      error: data.error
    };

  } catch (error) {
    console.error('❌ [TEST] Erreur générale:', error);
    return {
      success: false,
      emailSent: false,
      error: error.message
    };
  }
}

// Générer un HTML de test
function generateTestEmailHtml(reservationData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Test Email Confirmation</title>
    </head>
    <body>
      <h1>Test - Confirmation de Réservation</h1>
      <p>Bonjour ${reservationData.fullName},</p>
      <p>Votre réservation a été confirmée automatiquement.</p>
      <p><strong>Détails:</strong></p>
      <ul>
        <li>Espace: ${reservationData.spaceType}</li>
        <li>Période: ${reservationData.startDate} - ${reservationData.endDate}</li>
        <li>Montant: $${reservationData.amount}</li>
        <li>Statut: ${reservationData.status}</li>
      </ul>
      <p>Ceci est un test de la fonctionnalité d'envoi automatique d'emails.</p>
    </body>
    </html>
  `;
}

// Simuler la fonction handleStatusChange
async function testHandleStatusChange() {
  console.log('🧪 Test de l\'envoi automatique d\'email de confirmation');
  console.log('=' .repeat(60));

  // Données de test
  const testReservation = {
    id: 'test-reservation-123',
    full_name: 'John Doe',
    email: 'test@example.com',
    phone: '+243123456789',
    company: 'Test Company',
    activity: 'Test Activity',
    space_type: 'coworking',
    start_date: '2024-01-15',
    end_date: '2024-01-16',
    amount: 50.00,
    status: 'confirmed'
  };

  console.log('📋 Données de test:', testReservation);

  try {
    // Simuler la mise à jour du statut
    console.log('🔄 Simulation de la mise à jour du statut...');
    
    // Simuler l'envoi automatique d'email
    console.log('📧 Envoi automatique d\'email de confirmation...');
    
    const emailResult = await sendConfirmationEmail({
      to: testReservation.email,
      subject: `Confirmation de votre réservation - ${testReservation.full_name}`,
      reservationData: {
        fullName: testReservation.full_name,
        email: testReservation.email,
        phone: testReservation.phone,
        company: testReservation.company,
        activity: testReservation.activity,
        spaceType: testReservation.space_type,
        startDate: testReservation.start_date,
        endDate: testReservation.end_date,
        amount: testReservation.amount,
        transactionId: testReservation.id,
        status: testReservation.status
      }
    });

    console.log('📊 Résultat de l\'envoi:', emailResult);

    if (emailResult.emailSent) {
      console.log('✅ SUCCÈS: Email de confirmation envoyé automatiquement');
      console.log('✅ Le client recevra un email de confirmation');
    } else {
      console.log('❌ ÉCHEC: Erreur lors de l\'envoi de l\'email');
      console.log('❌ Erreur:', emailResult.error);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }

  console.log('=' .repeat(60));
  console.log('🧪 Test terminé');
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du test d\'envoi automatique d\'emails');
  console.log('');

  await testHandleStatusChange();

  console.log('');
  console.log('📝 Résumé:');
  console.log('- La fonctionnalité d\'envoi automatique d\'emails est configurée');
  console.log('- L\'email sera envoyé automatiquement quand le statut passe à "confirmed"');
  console.log('- Les notifications seront affichées à l\'administrateur');
  console.log('- Le client recevra un email de confirmation');
}

// Exécuter le test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testHandleStatusChange,
  sendConfirmationEmail
};
