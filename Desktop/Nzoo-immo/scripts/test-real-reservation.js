#!/usr/bin/env node

/**
 * Script de test pour simuler une vraie réservation
 * Usage: node scripts/test-real-reservation.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealReservation() {
  console.log('🧪 Test de vraie réservation - Nzoo Immo\n');
  
  const testEmail = 'trickson.mabengi@gmail.com';
  
  console.log('📋 Simulation d\'une vraie réservation...');
  
  // Simuler les données d'une vraie réservation
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

  console.log('📧 Envoi de l\'email de confirmation client...');
  
  try {
    // Test 1: Email de confirmation client
    const clientEmailResult = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        to: reservationData.email,
        subject: `Confirmation de réservation - ${reservationData.fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Confirmation de Réservation - N'zoo Immo</title>
          </head>
          <body>
            <h1>🎉 Confirmation de Réservation</h1>
            <p>Bonjour <strong>${reservationData.fullName}</strong>,</p>
            <p>Nous avons le plaisir de vous confirmer votre réservation chez <strong>N'zoo Immo</strong>.</p>
            <hr>
            <h2>Détails de votre réservation :</h2>
            <ul>
              <li><strong>Référence :</strong> ${reservationData.transactionId}</li>
              <li><strong>Type d'espace :</strong> ${reservationData.spaceType}</li>
              <li><strong>Période :</strong> Du ${reservationData.startDate} au ${reservationData.endDate}</li>
              <li><strong>Montant :</strong> ${reservationData.amount}€</li>
            </ul>
            <p>Merci de votre confiance !</p>
          </body>
          </html>
        `,
        reservationData: reservationData
      }
    });

    if (clientEmailResult.error) {
      console.log('❌ Erreur email client:', clientEmailResult.error.message);
    } else {
      console.log('✅ Email client envoyé avec succès !');
      console.log('📧 Réponse:', clientEmailResult.data);
    }

    // Test 2: Email d'administration
    console.log('\n📧 Envoi de l\'email d\'administration...');
    
    const adminEmailResult = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        to: 'admin@nzooimmo.com',
        subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
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

    if (adminEmailResult.error) {
      console.log('❌ Erreur email admin:', adminEmailResult.error.message);
    } else {
      console.log('✅ Email admin envoyé avec succès !');
      console.log('📧 Réponse:', adminEmailResult.data);
    }

    console.log('\n🎉 Test de réservation terminé !');
    console.log('📧 Vérifiez votre boîte mail :', testEmail);
    console.log('📧 Vérifiez aussi admin@nzooimmo.com');

  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

testRealReservation().catch(console.error);





