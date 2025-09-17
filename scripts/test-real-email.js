#!/usr/bin/env node

/**
 * Script de test avec un vrai email
 * Usage: node scripts/test-real-email.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealEmail() {
  console.log('🧪 Test d\'envoi d\'email réel - Nzoo Immo\n');
  
  // Demander l'email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('✅ Clé API Resend : re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h');
  console.log('✅ Email d\'expédition : reservations@nzooimmo.com');
  console.log('📧 Email de test :', testEmail);
  
  console.log('\n📧 Test d\'envoi d\'email réel...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: testEmail,
        subject: 'Test Email Réel - Nzoo Immo',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Email Réel - Nzoo Immo</title>
          </head>
          <body>
            <h1>🎉 Test Email Réel Réussi !</h1>
            <p>Félicitations ! Votre système d'emails Nzoo Immo fonctionne parfaitement.</p>
            <p>Ceci est un test d'envoi d'email réel avec Resend.</p>
            <hr>
            <h2>Détails du test :</h2>
            <ul>
              <li><strong>Service :</strong> Resend</li>
              <li><strong>Projet :</strong> Nzoo Immo</li>
              <li><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</li>
              <li><strong>Email d'expédition :</strong> reservations@nzooimmo.com</li>
              <li><strong>Clé API :</strong> re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h</li>
            </ul>
            <p>Vos emails de réservation fonctionnent maintenant !</p>
          </body>
          </html>
        `,
        reservationData: {
          fullName: 'Test Email Réel',
          email: testEmail,
          phone: '+1234567890',
          activity: 'Test Email Réel',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-REAL-EMAIL-001',
          status: 'confirmed'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur de la fonction Edge:', error.message);
    } else {
      console.log('✅ Fonction Edge répond correctement');
      console.log('📧 Réponse:', data);
      
      if (data && data.provider === 'resend') {
        console.log('\n🎉 Configuration Resend réussie !');
        console.log('📧 Email envoyé avec succès via Resend.');
        console.log('📧 Vérifiez votre boîte mail :', testEmail);
      } else if (data && data.provider === 'simulation') {
        console.log('\n⚠️ Mode simulation activé');
        console.log('La fonction fonctionne mais Resend n\'est pas configuré.');
        console.log('Vérifiez les variables d\'environnement dans Supabase.');
      } else {
        console.log('\n📧 Réponse reçue :', data);
        console.log('Vérifiez si l\'email a été envoyé.');
      }
    }
  } catch (err) {
    console.log('❌ Erreur lors du test :', err.message);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez votre boîte mail :', testEmail);
  console.log('2. Si l\'email n\'arrive pas, vérifiez les spams');
  console.log('3. Effectuez une vraie réservation pour tester');
}

testRealEmail().catch(console.error);




