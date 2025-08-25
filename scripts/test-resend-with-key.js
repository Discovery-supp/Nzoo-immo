#!/usr/bin/env node

/**
 * Script de test Resend avec la clé API fournie
 * Usage: node scripts/test-resend-with-key.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testResendWithKey() {
  console.log('🧪 Test Resend avec clé API - Nzoo Immo\n');
  
  console.log('📋 Configuration :');
  console.log('✅ Clé API Resend : re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h');
  console.log('✅ Email d\'expédition : reservations@nzooimmo.com');
  
  console.log('\n📧 Test de la fonction Edge...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Resend avec clé API - Nzoo Immo',
        html: `
          <h1>Test Resend avec clé API</h1>
          <p>Ceci est un test de Resend pour Nzoo Immo avec votre clé API.</p>
          <p>Si vous recevez cet email, la configuration est réussie !</p>
          <hr>
          <p><strong>Détails du test :</strong></p>
          <ul>
            <li>Service : Resend</li>
            <li>Projet : Nzoo Immo</li>
            <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
                         <li>Clé API : re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h</li>
          </ul>
        `,
        reservationData: {
          fullName: 'Test Resend API',
          email: 'test@example.com',
          phone: '+1234567890',
          activity: 'Test Resend avec clé API',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-RESEND-API-001',
          status: 'confirmed'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur de la fonction Edge:', error.message);
      
      if (error.message.includes('Function not found')) {
        console.log('\n🔧 Solution : Déployez la fonction dans Supabase Dashboard');
        console.log('1. Allez dans votre dashboard Supabase');
        console.log('2. Edge Functions > Create a new function');
        console.log('3. Nommez-la : send-confirmation-email');
        console.log('4. Copiez le code du fichier supabase/functions/send-confirmation-email/index.ts');
        console.log('5. Ajoutez les variables d\'environnement :');
        console.log('   RESEND_API_KEY=re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h');
        console.log('   FROM_EMAIL=reservations@nzooimmo.com');
        console.log('6. Déployez la fonction');
      }
    } else {
      console.log('✅ Fonction Edge répond correctement');
      console.log('📧 Réponse:', data);
      
      if (data && data.provider === 'resend') {
        console.log('\n🎉 Configuration Resend réussie !');
        console.log('Vos emails de réservation fonctionnent maintenant avec Resend.');
      } else if (data && data.provider === 'simulation') {
        console.log('\n⚠️ Mode simulation activé');
        console.log('La fonction fonctionne mais Resend n\'est pas configuré.');
        console.log('Vérifiez les variables d\'environnement dans Supabase.');
      }
    }
  } catch (err) {
    console.log('❌ Erreur lors du test :', err.message);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Déployez la fonction dans Supabase Dashboard');
  console.log('2. Configurez les variables d\'environnement');
  console.log('3. Testez à nouveau');
  console.log('4. Effectuez une vraie réservation pour tester');
}

testResendWithKey().catch(console.error);
