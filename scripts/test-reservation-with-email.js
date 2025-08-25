#!/usr/bin/env node

/**
 * Script de test de réservation complète avec envoi d'email
 * Usage: node scripts/test-reservation-with-email.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReservationWithEmail() {
  console.log('🧪 Test de réservation complète avec email - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔗 URL Supabase :', supabaseUrl);
  
  // Données de réservation de test
  const reservationData = {
    fullName: 'Test Utilisateur Email',
    email: testEmail,
    phone: '+1234567890',
    company: 'Test Company',
    activity: 'Test Email Reservation',
    spaceType: 'coworking',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    occupants: 2,
    subscriptionType: 'daily',
    amount: 150,
    paymentMethod: 'orange_money',
    transactionId: `TEST-EMAIL-${Date.now()}`,
    address: '123 Test Street'
  };
  
  console.log('\n📋 Données de réservation :');
  console.log('👤 Nom :', reservationData.fullName);
  console.log('📧 Email :', reservationData.email);
  console.log('🏢 Espace :', reservationData.spaceType);
  console.log('💰 Montant :', reservationData.amount);
  console.log('💳 Paiement :', reservationData.paymentMethod);
  
  console.log('\n📧 Test de création de réservation avec envoi d\'email...');
  
  try {
    // Créer la réservation
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert([{
        full_name: reservationData.fullName,
        email: reservationData.email,
        phone: reservationData.phone,
        company: reservationData.company,
        activity: reservationData.activity,
        space_type: reservationData.spaceType,
        start_date: reservationData.startDate,
        end_date: reservationData.endDate,
        occupants: reservationData.occupants,
        subscription_type: reservationData.subscriptionType,
        amount: reservationData.amount,
        payment_method: reservationData.paymentMethod,
        transaction_id: reservationData.transactionId,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (reservationError) {
      console.log('❌ Erreur création réservation:', reservationError.message);
      return;
    }

    console.log('✅ Réservation créée avec succès !');
    console.log('🆔 ID Réservation:', reservation.id);
    
    // Maintenant, tester l'envoi d'email
    console.log('\n📧 Test d\'envoi d\'email...');
    
    // Importer le service d'email
    const { sendReservationEmails } = await import('../src/services/emailService.js');
    
    const emailResult = await sendReservationEmails({
      fullName: reservationData.fullName,
      email: reservationData.email,
      phone: reservationData.phone,
      company: reservationData.company,
      activity: reservationData.activity,
      spaceType: reservationData.spaceType,
      startDate: reservationData.startDate,
      endDate: reservationData.endDate,
      amount: reservationData.amount,
      transactionId: reservationData.transactionId,
      status: 'confirmed'
    });
    
    console.log('\n📧 Résultats d\'envoi d\'email :');
    console.log('✅ Email client envoyé :', emailResult.clientEmailSent);
    console.log('✅ Email admin envoyé :', emailResult.adminEmailSent);
    
    if (emailResult.clientEmailError) {
      console.log('❌ Erreur email client :', emailResult.clientEmailError);
    }
    
    if (emailResult.adminEmailError) {
      console.log('❌ Erreur email admin :', emailResult.adminEmailError);
    }
    
    if (emailResult.clientEmailSent && emailResult.adminEmailSent) {
      console.log('\n🎉 Succès complet !');
      console.log('✅ Réservation créée');
      console.log('✅ Email client envoyé');
      console.log('✅ Email admin envoyé');
      console.log('📧 Vérifiez votre boîte mail :', testEmail);
    } else {
      console.log('\n⚠️ Problème partiel détecté');
      console.log('Vérifiez les logs pour plus de détails.');
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

testReservationWithEmail().catch(console.error);


