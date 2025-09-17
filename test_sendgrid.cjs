#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSendGrid() {
  console.log('🔧 TEST CONFIGURATION SENDGRID');
  console.log('===============================');
  console.log('');
  
  try {
    console.log('📧 Envoi d\'un email de test via SendGrid...');
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test SendGrid - Nzoo Immo',
        html: `
          <h1>Test SendGrid</h1>
          <p>Cet email a été envoyé via SendGrid.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
          <p>Si vous recevez cet email, SendGrid fonctionne parfaitement !</p>
        `,
        reservationData: { test: 'sendgrid' }
      }
    });

    if (error) {
      console.log('❌ Erreur:', error.message);
      return false;
    }

    console.log('✅ Réponse de la fonction Edge:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.provider === 'sendgrid') {
      console.log('');
      console.log('🎉 SENDGRID FONCTIONNE PARFAITEMENT !');
      console.log('📧 Email envoyé via SendGrid');
      console.log('✅ Vérifiez votre boîte de réception');
      return true;
    } else if (data.provider === 'resend') {
      console.log('');
      console.log('⚠️ SendGrid non configuré, Resend utilisé');
      console.log('📧 Email envoyé via Resend');
      console.log('🔧 Configurez SendGrid pour l\'utiliser en priorité');
      return true;
    } else {
      console.log('');
      console.log('⚠️ Aucun service d\'email configuré');
      console.log('📧 Email simulé');
      console.log('🔧 Configurez SendGrid ou Resend');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    return false;
  }
}

testSendGrid().then(success => {
  if (success) {
    console.log('\n✅ Test terminé avec succès');
  } else {
    console.log('\n❌ Test échoué');
  }
}).catch(console.error);
