#!/usr/bin/env node

/**
 * Script de test pour la nouvelle fonction send-email-confirmation
 * Usage: node scripts/test-new-function.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testNewFunction() {
  console.log('🧪 Test de la nouvelle fonction email - Nzoo Immo\n');
  
  const testEmail = 'trickson.mabengi@gmail.com';
  
  console.log('📋 Configuration :');
  console.log('✅ Clé API Resend : re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h');
  console.log('✅ Email d\'expédition : reservations@nzooimmo.com');
  console.log('📧 Email de test :', testEmail);
  
  console.log('\n📧 Test de la nouvelle fonction send-email-confirmation...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        to: testEmail,
        subject: 'Test Nouvelle Fonction - Nzoo Immo',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Nouvelle Fonction - Nzoo Immo</title>
          </head>
          <body>
            <h1>🎉 Nouvelle Fonction Email Réussie !</h1>
            <p>Félicitations ! Votre nouvelle fonction d'emails Nzoo Immo fonctionne parfaitement.</p>
            <p>Email envoyé via Resend avec succès !</p>
            <hr>
            <h2>Détails du test :</h2>
            <ul>
              <li><strong>Service :</strong> Resend</li>
              <li><strong>Projet :</strong> Nzoo Immo</li>
              <li><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</li>
              <li><strong>Email d'expédition :</strong> reservations@nzooimmo.com</li>
              <li><strong>Fonction :</strong> send-email-confirmation</li>
            </ul>
            <p>Vos emails de réservation fonctionnent maintenant !</p>
          </body>
          </html>
        `,
        reservationData: {
          fullName: 'Test Nouvelle Fonction',
          email: testEmail,
          phone: '+1234567890',
          activity: 'Test Nouvelle Fonction Email',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-NEW-FUNCTION-001',
          status: 'confirmed'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur de la nouvelle fonction:', error.message);
      
      if (error.message.includes('Function not found')) {
        console.log('\n🔧 Solution : Créez la nouvelle fonction send-email-confirmation');
        console.log('1. Dashboard Supabase > Edge Functions > Create new function');
        console.log('2. Nom : send-email-confirmation');
        console.log('3. Copiez le code du fichier index.ts');
        console.log('4. Variables d\'environnement :');
        console.log('   RESEND_API_KEY=re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h');
        console.log('   FROM_EMAIL=reservations@nzooimmo.com');
      }
    } else {
      console.log('✅ Nouvelle fonction répond correctement');
      console.log('📧 Réponse:', data);
      
      if (data && data.provider === 'resend') {
        console.log('\n🎉 Configuration Resend réussie !');
        console.log('📧 Email envoyé avec succès via Resend à :', testEmail);
        console.log('📧 Vérifiez votre boîte mail et les spams !');
      } else if (data && data.provider === 'simulation') {
        console.log('\n⚠️ Mode simulation activé');
        console.log('La fonction fonctionne mais Resend n\'est pas configuré.');
        console.log('Vérifiez les variables d\'environnement dans Supabase.');
      } else if (data && data.success) {
        console.log('\n✅ Email envoyé avec succès !');
        console.log('📧 Service utilisé :', data.provider || 'inconnu');
        console.log('📧 Vérifiez votre boîte mail :', testEmail);
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
  console.log('2. Vérifiez aussi le dossier spam/courrier indésirable');
  console.log('3. Si l\'email arrive, le système fonctionne !');
}

testNewFunction().catch(console.error);




