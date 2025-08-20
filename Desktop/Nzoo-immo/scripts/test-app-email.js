#!/usr/bin/env node

/**
 * Script de test qui simule exactement l'application lors d'une réservation
 * Usage: node scripts/test-app-email.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAppEmail() {
  console.log('🧪 Test simulation application - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔗 URL Supabase :', supabaseUrl);
  
  // Données de réservation comme dans l'application
  const reservationData = {
    fullName: 'Test Application',
    email: testEmail,
    phone: '+1234567890',
    company: 'Test Company',
    activity: 'Test Application Email',
    address: '123 Test Street',
    spaceType: 'coworking',
    startDate: '2024-01-20',
    endDate: '2024-01-21',
    occupants: 2,
    subscriptionType: 'daily',
    amount: 200,
    paymentMethod: 'orange_money',
    transactionId: `APP-TEST-${Date.now()}`
  };
  
  console.log('\n📋 Données de réservation (comme dans l\'app) :');
  console.log('👤 Nom :', reservationData.fullName);
  console.log('📧 Email :', reservationData.email);
  console.log('🏢 Espace :', reservationData.spaceType);
  console.log('💰 Montant :', reservationData.amount);
  console.log('💳 Paiement :', reservationData.paymentMethod);
  
  console.log('\n🚀 Test de création de réservation (comme dans l\'app)...');
  
  try {
    // Importer le service de réservation
    const { createReservation } = await import('../src/services/reservationService.js');
    
    console.log('📧 Appel de createReservation...');
    const result = await createReservation(reservationData);
    
    console.log('\n📧 Résultat de createReservation :');
    console.log('✅ Succès :', result.success);
    console.log('📧 Email envoyé :', result.emailSent);
    console.log('📧 Email client :', result.clientEmailSent);
    console.log('📧 Email admin :', result.adminEmailSent);
    
    if (result.clientEmailError) {
      console.log('❌ Erreur email client :', result.clientEmailError);
    }
    
    if (result.adminEmailError) {
      console.log('❌ Erreur email admin :', result.adminEmailError);
    }
    
    if (result.reservation) {
      console.log('🆔 ID Réservation :', result.reservation.id);
    }
    
    if (result.success && result.emailSent) {
      console.log('\n🎉 Succès complet !');
      console.log('✅ Réservation créée');
      console.log('✅ Email envoyé (comme dans l\'app)');
      console.log('📧 Vérifiez votre boîte mail :', testEmail);
    } else if (result.success && !result.emailSent) {
      console.log('\n⚠️ Réservation créée mais email non envoyé');
      console.log('Vérifiez les logs pour plus de détails.');
    } else {
      console.log('\n❌ Échec de la réservation');
      console.log('Erreur :', result.error);
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test :', error.message);
    console.log('📋 Stack trace:', error.stack);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez votre boîte mail :', testEmail);
  console.log('2. Vérifiez les emails d\'administration');
  console.log('3. Testez dans l\'application web');
}

testAppEmail().catch(console.error);



