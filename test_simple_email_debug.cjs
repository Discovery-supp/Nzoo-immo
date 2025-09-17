#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleEmail() {
  console.log('🔍 Test simple d\'envoi d\'email...');
  
  try {
    console.log('📧 Envoi d\'un email de test...');
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Simple - Debug Email',
        html: '<h1>Test Email</h1><p>Ceci est un test simple.</p>',
        reservationData: { test: true }
      }
    });

    if (error) {
      console.log('❌ Erreur:', error.message);
      return false;
    }

    console.log('✅ Email envoyé avec succès!');
    console.log('📧 Réponse:', data);
    return true;
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    return false;
  }
}

testSimpleEmail().then(success => {
  if (success) {
    console.log('\n🎉 Test réussi! Vérifiez votre email.');
  } else {
    console.log('\n❌ Test échoué. Problème détecté.');
  }
}).catch(console.error);
