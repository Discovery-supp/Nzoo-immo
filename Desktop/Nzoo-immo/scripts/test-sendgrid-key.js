#!/usr/bin/env node

/**
 * Script de test pour la clé SendGrid
 * Usage: node scripts/test-sendgrid-key.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test de la clé SendGrid directement
async function testSendGridKey() {
  console.log('🧪 Test de la clé SendGrid - Nzoo Immo\n');
  
  const testApiKey = 'c469ce1b-978f-4fac-84aa-82a61fa5c03a';
  
  console.log('1️⃣ Test de la clé SendGrid directement...');
  
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'test@example.com' }],
          subject: 'Test SendGrid Key'
        }],
                 from: { 
           email: 'reservation@nzoo.immo', 
           name: 'Nzoo Immo Test' 
         },
        content: [{
          type: 'text/plain',
          value: 'Test de la clé SendGrid'
        }]
      })
    });

    console.log('📧 Status de la réponse SendGrid:', response.status);
    console.log('📧 Status Text:', response.statusText);
    
    if (response.ok) {
      console.log('✅ Clé SendGrid valide !');
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur SendGrid:', errorText);
      
      if (response.status === 401) {
        console.log('🔧 La clé API est invalide ou expirée');
      } else if (response.status === 403) {
        console.log('🔧 Permissions insuffisantes pour cette clé');
      }
    }
  } catch (error) {
    console.log('❌ Erreur lors du test SendGrid:', error.message);
  }
  
  console.log('\n2️⃣ Test de la fonction Edge avec la clé...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Email avec clé SendGrid',
        html: '<h1>Test Email</h1><p>Test avec la clé SendGrid fournie.</p>',
        reservationData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890',
          activity: 'Test',
          spaceType: 'coworking',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          amount: 100,
          transactionId: 'TEST-SENDGRID',
          status: 'confirmed'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur de la fonction Edge:', error.message);
      
      if (error.message.includes('SENDGRID_API_KEY')) {
        console.log('\n🔧 Solution: La clé n\'est pas configurée dans Supabase');
        console.log('1. Allez dans votre projet Supabase');
        console.log('2. Settings > Edge Functions');
                 console.log('3. Ajoutez SENDGRID_API_KEY=c469ce1b-978f-4fac-84aa-82a61fa5c03a');
        console.log('4. Déployez: supabase functions deploy send-confirmation-email');
      }
    } else {
      console.log('✅ Fonction Edge répond correctement');
      console.log('📧 Réponse:', data);
    }
  } catch (err) {
    console.log('❌ Erreur lors du test Edge:', err.message);
  }
  
  console.log('\n📋 Instructions de configuration:');
  console.log('1. Vérifiez que la clé est valide (test ci-dessus)');
  console.log('2. Dans Supabase Dashboard > Settings > Edge Functions');
  console.log('3. Ajoutez la variable d\'environnement:');
     console.log('   SENDGRID_API_KEY=c469ce1b-978f-4fac-84aa-82a61fa5c03a');
     console.log('4. Ajoutez aussi: FROM_EMAIL=reservation@nzoo.immo');
  console.log('5. Déployez la fonction: supabase functions deploy send-confirmation-email');
}

// Exécuter le test
testSendGridKey().catch(console.error);
