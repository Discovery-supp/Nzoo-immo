#!/usr/bin/env node

/**
 * Test avec des adresses email alternatives
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAlternativeEmails() {
  console.log('🔍 TEST AVEC ADRESSES EMAIL ALTERNATIVES');
  console.log('=========================================');
  console.log('');
  
  const testEmails = [
    'trickson.mabengi@gmail.com',
    'esther.kilolo@celluleinfra.org',
    'myv.nsuanda2012@gmail.com'
  ];
  
  for (const email of testEmails) {
    console.log(`📧 Test envoi vers: ${email}`);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: email,
          subject: `Test Email Alternative - ${new Date().toISOString()}`,
          html: `
            <h1>Test Email Alternative</h1>
            <p>Cet email est un test pour vérifier la livraison.</p>
            <p>Adresse testée: ${email}</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
            <p>Si vous recevez cet email, la livraison fonctionne !</p>
          `,
          reservationData: { test: 'alternative' }
        }
      });

      if (error) {
        console.log(`❌ Erreur pour ${email}:`, error.message);
      } else {
        console.log(`✅ Email envoyé vers ${email}`);
        console.log(`📧 Réponse:`, data);
      }
    } catch (error) {
      console.log(`❌ Erreur générale pour ${email}:`, error.message);
    }
    
    console.log('---');
  }
  
  console.log('\n📋 INSTRUCTIONS');
  console.log('===============');
  console.log('1. Vérifiez TOUTES vos adresses email');
  console.log('2. Regardez dans les dossiers SPAM/POURRIELS');
  console.log('3. Attendez 5-10 minutes');
  console.log('4. Dites-moi quelles adresses ont reçu l\'email');
}

testAlternativeEmails().catch(console.error);
