#!/usr/bin/env node

/**
 * Script de test pour Resend
 * Usage: node scripts/test-resend.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test de Resend
async function testResend() {
  console.log('🧪 Test de Resend - Nzoo Immo\n');
  
  console.log('📋 Instructions pour configurer Resend:');
  console.log('1. Allez sur https://resend.com');
  console.log('2. Créez un compte gratuit (100 emails/jour)');
  console.log('3. Vérifiez votre domaine ou utilisez un email vérifié');
  console.log('4. Obtenez votre clé API dans Settings > API Keys');
  console.log('5. Dans Supabase > Settings > Edge Functions');
  console.log('6. Ajoutez RESEND_API_KEY=votre_clé_resend');
  console.log('7. Ajoutez FROM_EMAIL=votre_email_verifie@votredomaine.com');
  console.log('8. Déployez: supabase functions deploy send-confirmation-email');
  
  console.log('\n🔗 Avantages de Resend:');
  console.log('- Plus moderne et fiable que SendGrid');
  console.log('- Interface plus simple');
  console.log('- Meilleure délivrabilité');
  console.log('- Support TypeScript natif');
  console.log('- Documentation excellente');
  
  console.log('\n📧 Test de la fonction Edge (mode simulation)...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Email avec Resend',
        html: '<h1>Test Email</h1><p>Test avec Resend comme service d\'email.</p>',
        reservationData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          activity: 'Test',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-RESEND',
          status: 'confirmed'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur de la fonction Edge:', error.message);
    } else {
      console.log('✅ Fonction Edge répond correctement');
      console.log('📧 Réponse:', data);
      
      if (data && data.provider === 'simulation') {
        console.log('\n⚠️ Mode simulation activé');
        console.log('Configurez Resend pour un envoi réel');
      }
    }
  } catch (err) {
    console.log('❌ Erreur lors du test Edge:', err.message);
  }
  
  console.log('\n🎯 Recommandation:');
  console.log('Utilisez Resend au lieu de SendGrid pour une meilleure expérience !');
}

// Exécuter le test
testResend().catch(console.error);





