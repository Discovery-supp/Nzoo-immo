#!/usr/bin/env node

/**
 * Script de test pour diagnostiquer le flux de réservation
 * Usage: node scripts/test-reservation-flow.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReservationFlow() {
  console.log('🧪 Test du flux de réservation - Nzoo Immo\n');
  
  const testEmail = 'trickson.mabengi@gmail.com';
  
  console.log('📋 Simulation d\'une réservation complète...');
  
  // Simuler les données d'une réservation
  const reservationData = {
    fullName: 'Jean Dupont',
    email: testEmail,
    phone: '+242 06 123 456',
    company: 'Entreprise Test',
    activity: 'Développement web',
    spaceType: 'coworking',
    startDate: '2024-01-20',
    endDate: '2024-01-25',
    amount: 250,
    transactionId: 'RES-' + Date.now(),
    status: 'confirmed'
  };

  console.log('📧 Test 1: Appel direct de la fonction Edge...');
  
  try {
    // Test direct de la fonction Edge
    const directResult = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        to: testEmail,
        subject: `Test direct - ${reservationData.fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Direct - N'zoo Immo</title>
          </head>
          <body>
            <h1>🧪 Test Direct</h1>
            <p>Ceci est un test direct de la fonction Edge.</p>
            <p>Client: ${reservationData.fullName}</p>
            <p>Email: ${reservationData.email}</p>
          </body>
          </html>
        `,
        reservationData: reservationData
      }
    });

    if (directResult.error) {
      console.log('❌ Erreur appel direct:', directResult.error.message);
    } else {
      console.log('✅ Appel direct réussi !');
      console.log('📧 Réponse:', directResult.data);
    }

  } catch (error) {
    console.log('❌ Erreur lors de l\'appel direct:', error.message);
  }

  console.log('\n📧 Test 2: Test de l\'email d\'administration...');
  
  try {
    // Test email d'administration
    const adminResult = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        to: 'tricksonmabengi123@gmail.com',
        subject: `Test Admin - ${reservationData.fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Admin - N'zoo Immo</title>
          </head>
          <body>
            <h1>🔔 Test Email Admin</h1>
            <p>Test de l'email d'administration.</p>
            <hr>
            <h2>Détails de la réservation :</h2>
            <ul>
              <li><strong>Client :</strong> ${reservationData.fullName}</li>
              <li><strong>Email :</strong> ${reservationData.email}</li>
              <li><strong>Téléphone :</strong> ${reservationData.phone}</li>
              <li><strong>Référence :</strong> ${reservationData.transactionId}</li>
              <li><strong>Montant :</strong> ${reservationData.amount}€</li>
            </ul>
          </body>
          </html>
        `,
        reservationData: reservationData
      }
    });

    if (adminResult.error) {
      console.log('❌ Erreur email admin:', adminResult.error.message);
    } else {
      console.log('✅ Email admin envoyé avec succès !');
      console.log('📧 Réponse:', adminResult.data);
    }

  } catch (error) {
    console.log('❌ Erreur lors de l\'email admin:', error.message);
  }

  console.log('\n🎉 Test du flux terminé !');
  console.log('📧 Vérifiez votre boîte mail :', testEmail);
  console.log('📧 Vérifiez aussi tricksonmabengi123@gmail.com');
  console.log('\n💡 Si les tests fonctionnent mais pas les vraies réservations,');
  console.log('   le problème vient du code de l\'application frontend.');

}

testReservationFlow().catch(console.error);




