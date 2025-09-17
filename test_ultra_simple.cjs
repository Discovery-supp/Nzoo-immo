#!/usr/bin/env node

/**
 * Test ultra-simple pour identifier le problème exact
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUltraSimple() {
  console.log('🔍 TEST ULTRA-SIMPLE');
  console.log('====================');
  console.log('');
  
  try {
    // Test 1: Connexion de base
    console.log('1️⃣ Test connexion Supabase...');
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Erreur connexion:', error.message);
      return;
    }
    console.log('✅ Connexion OK');
    
    // Test 2: Fonction Edge simple
    console.log('\n2️⃣ Test fonction Edge...');
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Ultra Simple',
        html: '<p>Test</p>'
      }
    });

    if (emailError) {
      console.log('❌ Erreur fonction Edge:', emailError.message);
      return;
    }
    console.log('✅ Fonction Edge OK');
    console.log('📧 Réponse:', emailData);
    
    // Test 3: Création réservation simple
    console.log('\n3️⃣ Test création réservation...');
    const reservationData = {
      full_name: 'Test Ultra Simple',
      email: 'trickson.mabengi@gmail.com',
      phone: '+243 123 456 789',
      activity: 'Test',
      space_type: 'coworking',
      start_date: '2024-01-30',
      end_date: '2024-01-30',
      amount: 50000,
      payment_method: 'cash',
      transaction_id: `ULTRA_TEST_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (reservationError) {
      console.log('❌ Erreur création réservation:', reservationError.message);
      return;
    }
    console.log('✅ Réservation créée:', reservation.id);
    
    // Test 4: Envoi email après réservation
    console.log('\n4️⃣ Test envoi email après réservation...');
    const { data: finalEmailData, error: finalEmailError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: `Réservation confirmée - ${reservation.transaction_id}`,
        html: `
          <h1>Réservation confirmée</h1>
          <p>ID: ${reservation.id}</p>
          <p>Référence: ${reservation.transaction_id}</p>
          <p>Email: ${reservation.email}</p>
        `,
        reservationData: reservation
      }
    });

    if (finalEmailError) {
      console.log('❌ Erreur email final:', finalEmailError.message);
      return;
    }
    console.log('✅ Email final envoyé');
    console.log('📧 Réponse finale:', finalEmailData);
    
    console.log('\n🎉 TOUS LES TESTS PASSENT !');
    console.log('✅ Le système fonctionne parfaitement');
    console.log('✅ Vérifiez votre email: trickson.mabengi@gmail.com');
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }
}

testUltraSimple().catch(console.error);
