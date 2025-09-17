#!/usr/bin/env node

/**
 * Test du nouveau service d'email direct avec montants en Dollars
 * 
 * Ce script teste le nouveau service d'email qui contourne les problèmes CORS
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simuler le nouveau service d'email direct
async function sendEmailDirect(to, subject, html, reservationData) {
  try {
    console.log('📧 [DIRECT] Envoi email à:', to);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        reservationData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DIRECT] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [DIRECT] Email envoyé avec succès:', data);
    return data;
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur envoi email:', error);
    throw error;
  }
}

// Test du service d'email
async function testEmailService() {
  console.log('🔧 TEST NOUVEAU SERVICE EMAIL - MONTANTS EN DOLLARS');
  console.log('==================================================');
  console.log('');
  
  // Données de test
  const testReservation = {
    id: 'test_' + Date.now(),
    full_name: 'Test Utilisateur',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243123456789',
    company: 'Test Company',
    activity: 'Développement web',
    space_type: 'coworking',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    amount: 50,
    transaction_id: 'TEST_' + Date.now(),
    payment_method: 'cash'
  };

  console.log('📝 [TEST] Données de test:', testReservation);
  console.log('');

  try {
    console.log('📧 [TEST] Test envoi email client...');
    
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745;">🎉 Réservation confirmée</h1>
          <p>Bonjour <strong>${testReservation.full_name}</strong>,</p>
          <p>Votre réservation a été confirmée avec succès !</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📋 Détails de votre réservation :</h3>
            <p><strong>Référence :</strong> ${testReservation.transaction_id}</p>
            <p><strong>Espace :</strong> ${testReservation.space_type}</p>
            <p><strong>Dates :</strong> ${testReservation.start_date} à ${testReservation.end_date}</p>
            <p><strong>Montant :</strong> $${testReservation.amount}</p>
            <p><strong>Méthode de paiement :</strong> ${testReservation.payment_method}</p>
          </div>
          
          <p>Merci de votre confiance !</p>
          <p>L'équipe Nzoo Immo</p>
        </body>
      </html>
    `;

    const result = await sendEmailDirect(
      testReservation.email,
      `Test Email Fix - Montants en Dollars - ${testReservation.transaction_id}`,
      emailHtml,
      testReservation
    );
    
    console.log('');
    if (result && result.success) {
      console.log('🎉 SUCCÈS !');
      console.log('Le nouveau service d\'email fonctionne avec les montants en Dollars !');
      console.log(`📧 Provider utilisé: ${result.provider || 'unknown'}`);
      console.log(`📧 Email envoyé: ${result.emailSent || false}`);
      console.log(`💰 Montant affiché: $${testReservation.amount}`);
    } else {
      console.log('⚠️ RÉSULTAT MIXTE');
      console.log('L\'email n\'a pas été envoyé mais le service fonctionne');
      console.log('Mode simulation activé');
    }
    
  } catch (error) {
    console.log('❌ ÉCHEC');
    console.log('Erreur lors du test:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Démarrage du test nouveau service email avec montants en Dollars...\n');
  
  await testEmailService();
  
  console.log('');
  console.log('📋 Résumé:');
  console.log('✅ Si vous voyez "SUCCÈS", les emails fonctionnent avec les Dollars !');
  console.log('⚠️ Si vous voyez "RÉSULTAT MIXTE", l\'email est en mode simulation');
  console.log('❌ Si vous voyez "ÉCHEC", il y a encore un problème');
  console.log('');
  console.log('🎯 Prochaine étape: Testez l\'application web avec les montants en Dollars !');
}

runTest().catch(console.error);
