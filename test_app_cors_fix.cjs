#!/usr/bin/env node

/**
 * Test de la correction CORS dans l'application
 * 
 * Ce script simule exactement ce que fait l'application web
 * pour vérifier que la correction CORS fonctionne.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (identique à l'application)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simuler la fonction sendClientConfirmationEmail de l'application
async function sendClientConfirmationEmail(reservation) {
  console.log('📧 [APP] Envoi confirmation client:', reservation.email);

  try {
    // Approche alternative pour contourner le problème CORS (comme dans l'app)
    const response = await fetch('https://nnkywmfxoohehtyyzzgp.supabase.co/functions/v1/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [APP] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [APP] Email client envoyé:', data);
    return data;
    
  } catch (error) {
    console.error('❌ [APP] Erreur email client:', error);
    
    // Fallback: simulation d'envoi d'email
    console.log('📧 [APP] Mode simulation - Email non envoyé mais réservation créée');
    console.log('📧 [APP] Email qui aurait été envoyé à:', reservation.email);
    console.log('📧 [APP] Sujet: Réservation confirmée -', reservation.transaction_id);
    
    return { success: false, error: error.message };
  }
}

// Simuler une réservation complète
async function testCompleteReservation() {
  console.log('🔧 TEST APPLICATION AVEC CORRECTION CORS');
  console.log('==========================================');
  console.log('');
  
  // Données de test (similaires à celles de l'application)
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
    amount: 50000,
    transaction_id: 'TEST_' + Date.now(),
    payment_method: 'cash'
  };

  console.log('📝 [APP] Données de test:', testReservation);
  console.log('');

  try {
    console.log('📧 [APP] Test envoi email client...');
    const result = await sendClientConfirmationEmail(testReservation);
    
    console.log('');
    if (result && result.success) {
      console.log('🎉 SUCCÈS !');
      console.log('La correction CORS fonctionne dans l\'application !');
      console.log(`📧 Provider utilisé: ${result.provider || 'unknown'}`);
      console.log(`📧 Email envoyé: ${result.emailSent || false}`);
    } else {
      console.log('⚠️ RÉSULTAT MIXTE');
      console.log('L\'email n\'a pas été envoyé mais la réservation peut être créée');
      console.log('Mode simulation activé');
    }
    
  } catch (error) {
    console.log('❌ ÉCHEC');
    console.log('Erreur lors du test:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Démarrage du test application avec correction CORS...\n');
  
  await testCompleteReservation();
  
  console.log('');
  console.log('📋 Résumé:');
  console.log('✅ Si vous voyez "SUCCÈS", l\'application fonctionne');
  console.log('⚠️ Si vous voyez "RÉSULTAT MIXTE", l\'email est en mode simulation');
  console.log('❌ Si vous voyez "ÉCHEC", il y a encore un problème');
  console.log('');
  console.log('🎯 Prochaine étape: Testez l\'application web directement !');
}

runTest().catch(console.error);
