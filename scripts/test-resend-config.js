#!/usr/bin/env node

/**
 * Script de test pour la configuration Resend
 * Usage: node scripts/test-resend-config.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test de la configuration Resend
async function testResendConfiguration() {
  console.log('🧪 Test de configuration Resend - Nzoo Immo\n');
  
  console.log('📋 Checklist de configuration :');
  console.log('1. ✅ Compte Resend créé');
  console.log('2. ⏳ Domaine configuré (nzoo.immo)');
  console.log('3. ⏳ Clé API obtenue');
  console.log('4. ⏳ Variables d\'environnement configurées dans Supabase');
  console.log('5. ⏳ Fonction Edge déployée');
  
  console.log('\n🔧 Instructions de configuration :');
  console.log('1. Créez votre compte sur https://resend.com');
  console.log('2. Vérifiez votre domaine nzoo.immo');
  console.log('3. Obtenez votre clé API (format: re_xxxxxxxxx)');
  console.log('4. Dans Supabase > Settings > Edge Functions, ajoutez :');
  console.log('   RESEND_API_KEY=votre_clé_api');
  console.log('   FROM_EMAIL=reservations@nzooimmo.com');
  console.log('5. Déployez : npx supabase functions deploy 
    
    send-confirmation-email');
  
  console.log('\n📧 Test de la fonction Edge...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Configuration Resend - Nzoo Immo',
        html: `
          <h1>Test Configuration Resend</h1>
          <p>Ceci est un test de la configuration Resend pour Nzoo Immo.</p>
          <p>Si vous recevez cet email, la configuration est réussie !</p>
          <hr>
          <p><strong>Détails du test :</strong></p>
          <ul>
            <li>Service : Resend</li>
            <li>Projet : Nzoo Immo</li>
            <li>Date : ${new Date().toLocaleString('fr-FR')}</li>
          </ul>
        `,
        reservationData: {
          fullName: 'Test Configuration',
          email: 'test@example.com',
          phone: '+1234567890',
          activity: 'Test Resend',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-RESEND-CONFIG',
          status: 'confirmed'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur de la fonction Edge:', error.message);
      
      if (error.message.includes('RESEND_API_KEY')) {
        console.log('\n🔧 Solution : Configurez Resend dans Supabase');
        console.log('1. Allez dans votre projet Supabase');
        console.log('2. Settings > Edge Functions');
        console.log('3. Ajoutez RESEND_API_KEY=votre_clé_api');
        console.log('4. Ajoutez FROM_EMAIL=reservation@nzoo.immo');
        console.log('5. Déployez la fonction');
      } else if (error.message.includes('Function not found')) {
        console.log('\n🔧 Solution : Déployez la fonction Edge');
        console.log('npx supabase functions deploy send-confirmation-email');
      }
    } else {
      console.log('✅ Fonction Edge répond correctement');
      console.log('📧 Réponse:', data);
      
      if (data && data.provider === 'resend') {
        console.log('\n🎉 Configuration Resend réussie !');
        console.log('Vos emails de réservation fonctionnent maintenant.');
      } else if (data && data.provider === 'simulation') {
        console.log('\n⚠️ Mode simulation activé');
        console.log('Configurez Resend pour un envoi réel.');
      }
    }
  } catch (err) {
    console.log('❌ Erreur lors du test :', err.message);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Configurez Resend selon le tutoriel');
  console.log('2. Testez à nouveau : npm run test:resend');
  console.log('3. Effectuez une vraie réservation pour tester');
  
  console.log('\n📚 Ressources :');
  console.log('- Tutoriel complet : TUTORIEL_RESEND_SUPABASE.md');
  console.log('- Guide Resend : RESEND_SETUP_GUIDE.md');
  console.log('- Documentation : https://resend.com/docs');
}

// Exécuter le test
testResendConfiguration().catch(console.error);

