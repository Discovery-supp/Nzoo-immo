#!/usr/bin/env node

/**
 * Script de diagnostic pour identifier le problème d'email dans l'application
 * Usage: node scripts/diagnostic-email.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnosticEmail() {
  console.log('🔍 Diagnostic du système d\'email - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔗 URL Supabase :', supabaseUrl);
  
  // Test 1: Vérifier la connexion Supabase
  console.log('\n🔍 Test 1: Connexion Supabase...');
  try {
    const { data, error } = await supabase.from('reservations').select('count').limit(1);
    if (error) {
      console.log('❌ Erreur connexion Supabase:', error.message);
    } else {
      console.log('✅ Connexion Supabase OK');
    }
  } catch (err) {
    console.log('❌ Erreur connexion Supabase:', err.message);
  }
  
  // Test 2: Vérifier la fonction Edge
  console.log('\n🔍 Test 2: Fonction Edge send-confirmation-email...');
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: testEmail,
        subject: 'Test Diagnostic',
        html: '<h1>Test Diagnostic</h1>',
        reservationData: {
          fullName: 'Test Diagnostic',
          email: testEmail,
          phone: '+1234567890',
          activity: 'Test',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'DIAG-001',
          status: 'confirmed'
        }
      }
    });
    
    if (error) {
      console.log('❌ Erreur fonction Edge:', error.message);
      if (error.message.includes('404')) {
        console.log('⚠️ Fonction Edge non déployée - c\'est normal, on utilise Resend direct');
      }
    } else {
      console.log('✅ Fonction Edge répond:', data);
    }
  } catch (err) {
    console.log('❌ Erreur fonction Edge:', err.message);
  }
  
  // Test 3: Test direct Resend
  console.log('\n🔍 Test 3: Test direct Resend...');
  const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: [testEmail],
        subject: 'Test Diagnostic Resend',
        html: '<h1>Test Diagnostic Resend</h1>',
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Resend direct fonctionne:', result.id);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur Resend:', response.status, errorText);
    }
  } catch (err) {
    console.log('❌ Erreur Resend:', err.message);
  }
  
  // Test 4: Simuler exactement ce que fait l'application
  console.log('\n🔍 Test 4: Simulation application...');
  try {
    // Créer une réservation comme l'application
    const reservationData = {
      fullName: 'Test Diagnostic App',
      email: testEmail,
      phone: '+1234567890',
      company: 'Test Company',
      activity: 'Test Diagnostic',
      address: '123 Test Street',
      spaceType: 'coworking',
      startDate: '2024-02-01',
      endDate: '2024-02-02',
      occupants: 2,
      subscriptionType: 'daily',
      amount: 200,
      paymentMethod: 'orange_money',
      transactionId: `DIAG-APP-${Date.now()}`
    };
    
    console.log('📝 Création réservation...');
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

    console.log('✅ Réservation créée:', reservation.id);
    
    // Maintenant tester l'envoi d'email comme l'application
    console.log('📧 Test envoi email comme l\'application...');
    
    // Simuler l'appel au service d'email
    const emailResult = {
      clientEmailSent: false,
      adminEmailSent: false,
      clientEmailError: null,
      adminEmailError: null
    };
    
    // Test email client
    try {
      const clientResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'reservations@nzooimmo.com',
          to: [reservationData.email],
          subject: `Confirmation de réservation - ${reservationData.fullName}`,
          html: `<h1>Test Diagnostic App</h1><p>Email client pour: ${reservationData.fullName}</p>`,
          reply_to: 'reservations@nzooimmo.com'
        })
      });

      if (clientResponse.ok) {
        emailResult.clientEmailSent = true;
        console.log('✅ Email client envoyé');
      } else {
        emailResult.clientEmailError = `Erreur ${clientResponse.status}`;
        console.log('❌ Erreur email client:', clientResponse.status);
      }
    } catch (err) {
      emailResult.clientEmailError = err.message;
      console.log('❌ Erreur email client:', err.message);
    }
    
    // Test email admin
    try {
      const adminResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'reservations@nzooimmo.com',
          to: ['tricksonmabengi123@gmail.com'],
          subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
          html: `<h1>Test Diagnostic App</h1><p>Email admin pour: ${reservationData.fullName}</p>`,
          reply_to: 'reservations@nzooimmo.com'
        })
      });

      if (adminResponse.ok) {
        emailResult.adminEmailSent = true;
        console.log('✅ Email admin envoyé');
      } else {
        emailResult.adminEmailError = `Erreur ${adminResponse.status}`;
        console.log('❌ Erreur email admin:', adminResponse.status);
      }
    } catch (err) {
      emailResult.adminEmailError = err.message;
      console.log('❌ Erreur email admin:', err.message);
    }
    
    console.log('\n📧 Résultats finaux:');
    console.log('✅ Email client:', emailResult.clientEmailSent ? 'Envoyé' : 'Échec');
    console.log('✅ Email admin:', emailResult.adminEmailSent ? 'Envoyé' : 'Échec');
    
    if (emailResult.clientEmailError) {
      console.log('❌ Erreur client:', emailResult.clientEmailError);
    }
    if (emailResult.adminEmailError) {
      console.log('❌ Erreur admin:', emailResult.adminEmailError);
    }
    
  } catch (error) {
    console.log('❌ Erreur simulation:', error.message);
  }
  
  console.log('\n📋 Diagnostic terminé');
  console.log('Vérifiez les résultats ci-dessus pour identifier le problème.');
}

diagnosticEmail().catch(console.error);
