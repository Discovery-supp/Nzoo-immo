#!/usr/bin/env node

/**
 * Script de test pour le service de réservation
 * Usage: node scripts/test-reservation-service.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simuler le service de réservation
async function createReservation(data) {
  console.log('📋 Création de réservation avec données:', data);
  
  try {
    // 1. Insérer la réservation dans la base de données
    const { data: reservation, error: insertError } = await supabase
      .from('reservations')
      .insert([{
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company || null,
        activity: data.activity,
        address: data.address || null,
        space_type: data.spaceType,
        start_date: data.startDate,
        end_date: data.endDate,
        occupants: data.occupants,
        subscription_type: data.subscriptionType,
        amount: data.amount,
        payment_method: data.paymentMethod,
        transaction_id: data.transactionId,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur insertion réservation:', insertError);
      return {
        success: false,
        error: insertError.message
      };
    }

    console.log('✅ Réservation créée:', reservation.id);

    // 2. Envoyer les emails
    console.log('📧 Envoi des emails de confirmation...');
    
    // Email client
    const clientEmailResult = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        to: data.email,
        subject: `Confirmation de réservation - ${data.fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Confirmation de Réservation - N'zoo Immo</title>
          </head>
          <body>
            <h1>🎉 Confirmation de Réservation</h1>
            <p>Bonjour <strong>${data.fullName}</strong>,</p>
            <p>Nous avons le plaisir de vous confirmer votre réservation chez <strong>N'zoo Immo</strong>.</p>
            <hr>
            <h2>Détails de votre réservation :</h2>
            <ul>
              <li><strong>Référence :</strong> ${data.transactionId}</li>
              <li><strong>Type d'espace :</strong> ${data.spaceType}</li>
              <li><strong>Période :</strong> Du ${data.startDate} au ${data.endDate}</li>
              <li><strong>Montant :</strong> ${data.amount}€</li>
            </ul>
            <p>Merci de votre confiance !</p>
          </body>
          </html>
        `,
        reservationData: data
      }
    });

    // Email admin
    const adminEmailResult = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        to: 'tricksonmabengi123@gmail.com',
        subject: `Nouvelle réservation reçue - ${data.fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Nouvelle Réservation - N'zoo Immo</title>
          </head>
          <body>
            <h1>🔔 Nouvelle Réservation Reçue</h1>
            <p>Une nouvelle réservation nécessite votre attention.</p>
            <hr>
            <h2>Détails de la réservation :</h2>
            <ul>
              <li><strong>Client :</strong> ${data.fullName}</li>
              <li><strong>Email :</strong> ${data.email}</li>
              <li><strong>Téléphone :</strong> ${data.phone}</li>
              <li><strong>Référence :</strong> ${data.transactionId}</li>
              <li><strong>Montant :</strong> ${data.amount}€</li>
            </ul>
          </body>
          </html>
        `,
        reservationData: data
      }
    });

    console.log('📧 Résultats emails:');
    console.log('- Client:', clientEmailResult.error ? '❌' : '✅');
    console.log('- Admin:', adminEmailResult.error ? '❌' : '✅');

    return {
      success: true,
      reservation,
      clientEmailSent: !clientEmailResult.error,
      adminEmailSent: !adminEmailResult.error,
      clientEmailError: clientEmailResult.error?.message,
      adminEmailError: adminEmailResult.error?.message
    };

  } catch (error) {
    console.error('❌ Erreur dans createReservation:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testReservationService() {
  console.log('🧪 Test du service de réservation - Nzoo Immo\n');
  
  const testData = {
    fullName: 'Marie Dupont',
    email: 'trickson.mabengi@gmail.com',
    phone: '+242 06 789 012',
    company: 'Test Company',
    activity: 'Test Activity',
    address: '123 Test Street',
    spaceType: 'coworking',
    startDate: '2024-01-22',
    endDate: '2024-01-24',
    occupants: 2,
    subscriptionType: 'daily',
    amount: 300,
    paymentMethod: 'cash',
    transactionId: 'TEST-' + Date.now()
  };

  console.log('📋 Test avec données:', testData);
  
  const result = await createReservation(testData);
  
  console.log('\n📊 Résultat final:');
  console.log('- Succès:', result.success ? '✅' : '❌');
  if (result.success) {
    console.log('- ID Réservation:', result.reservation.id);
    console.log('- Email Client:', result.clientEmailSent ? '✅' : '❌');
    console.log('- Email Admin:', result.adminEmailSent ? '✅' : '❌');
  } else {
    console.log('- Erreur:', result.error);
  }
  
  console.log('\n🎉 Test terminé !');
  console.log('📧 Vérifiez votre boîte mail :', testData.email);
  console.log('📧 Vérifiez aussi tricksonmabengi123@gmail.com');
}

testReservationService().catch(console.error);





