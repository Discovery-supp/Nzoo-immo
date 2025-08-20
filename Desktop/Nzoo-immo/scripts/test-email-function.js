#!/usr/bin/env node

/**
 * Script de test de la fonction d'email
 * Usage: node scripts/test-email-function.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailFunction() {
  console.log('🧪 Test de la fonction d\'email - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔗 URL Supabase :', supabaseUrl);
  
  console.log('\n📧 Test d\'appel de la fonction send-confirmation-email...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: testEmail,
        subject: 'Test Fonction Email - Nzoo Immo',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Fonction Email</title>
          </head>
          <body>
            <h1>🎉 Test Fonction Email</h1>
            <p>Ceci est un test de la fonction d'email.</p>
            <p>Date : ${new Date().toLocaleString('fr-FR')}</p>
          </body>
          </html>
        `,
        reservationData: {
          fullName: 'Test Utilisateur',
          email: testEmail,
          phone: '+1234567890',
          activity: 'Test',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-001',
          status: 'confirmed'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur de la fonction Edge:', error.message);
      console.log('📋 Détails de l\'erreur:', error);
    } else {
      console.log('✅ Fonction Edge répond correctement');
      console.log('📧 Réponse complète:', JSON.stringify(data, null, 2));
      
      if (data && data.success) {
        console.log('\n🎉 Succès !');
        console.log('📧 Provider utilisé:', data.provider);
        console.log('📧 Email envoyé:', data.emailSent);
        if (data.note) {
          console.log('📝 Note:', data.note);
        }
      } else {
        console.log('\n⚠️ Problème détecté');
        console.log('📧 Succès:', data?.success);
        console.log('📧 Email envoyé:', data?.emailSent);
        console.log('📧 Erreur:', data?.error);
        console.log('📧 Provider:', data?.provider);
      }
    }
  } catch (err) {
    console.log('❌ Erreur lors du test :', err.message);
    console.log('📋 Stack trace:', err.stack);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez les logs Supabase pour plus de détails');
  console.log('2. Vérifiez les variables d\'environnement dans Supabase');
  console.log('3. Testez avec une vraie réservation dans l\'application');
}

testEmailFunction().catch(console.error);



