#!/usr/bin/env node

/**
 * Script de test pour la configuration email
 * Usage: node scripts/test-email-config.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (utilise les variables d'environnement ou les valeurs par défaut)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailConfiguration() {
  console.log('🧪 Test de configuration email - Nzoo Immo\n');
  
  // Test 1: Connexion Supabase
  console.log('1️⃣ Test de connexion Supabase...');
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion Supabase:', error.message);
      return;
    }
    console.log('✅ Connexion Supabase réussie\n');
  } catch (err) {
    console.log('❌ Erreur de connexion:', err.message);
    return;
  }
  
  // Test 2: Fonction Edge Email
  console.log('2️⃣ Test de la fonction Edge Email...');
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Email - Nzoo Immo',
        html: '<h1>Test Email</h1><p>Ceci est un test du système d\'email Nzoo Immo.</p>',
        reservationData: {
          fullName: 'Utilisateur Test',
          email: 'test@example.com',
          phone: '+1234567890',
          activity: 'Test',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-123',
          status: 'confirmed'
        }
      }
    });
    
    if (error) {
      console.log('❌ Erreur de la fonction email:', error.message);
      
      if (error.message.includes('SENDGRID_API_KEY')) {
        console.log('\n🔧 Solution: Configurez SendGrid');
        console.log('1. Créez un compte sur https://sendgrid.com');
        console.log('2. Obtenez votre clé API');
        console.log('3. Dans Supabase > Settings > Edge Functions');
        console.log('4. Ajoutez SENDGRID_API_KEY=votre_clé');
        console.log('5. Déployez: supabase functions deploy send-confirmation-email');
      }
    } else {
      console.log('✅ Fonction email accessible');
      console.log('📧 Réponse:', data);
      
      if (data && data.provider === 'simulation') {
        console.log('\n⚠️ Mode simulation activé');
        console.log('Les emails ne sont pas réellement envoyés');
        console.log('Configurez SendGrid pour un envoi réel');
      }
    }
  } catch (err) {
    console.log('❌ Erreur lors du test email:', err.message);
  }
  
  console.log('\n📋 Résumé de la configuration:');
  console.log(`Supabase URL: ${supabaseUrl ? '✅ Configurée' : '❌ Manquante'}`);
  console.log(`Supabase Key: ${supabaseAnonKey ? '✅ Configurée' : '❌ Manquante'}`);
  console.log('SendGrid API Key: ❌ Non configurée (requise pour l\'envoi réel)');
  
  console.log('\n🔗 Liens utiles:');
  console.log('- SendGrid: https://sendgrid.com');
  console.log('- Documentation Supabase: https://supabase.com/docs');
  console.log('- Guide Email: EMAIL_SYSTEM_GUIDE.md');
}

// Exécuter le test
testEmailConfiguration().catch(console.error);
