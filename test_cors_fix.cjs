#!/usr/bin/env node

/**
 * Test de la correction CORS pour la fonction Edge
 * 
 * Ce script teste si la fonction Edge accepte maintenant les en-têtes CORS
 * nécessaires pour l'application web.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCorsFix() {
  console.log('🔧 TEST CORRECTION CORS');
  console.log('========================');
  console.log('');
  
  try {
    console.log('📧 Test envoi email avec correction CORS...');
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Correction CORS - Nzoo Immo',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>Test Correction CORS</h1>
              <p>Cet email confirme que la correction CORS fonctionne !</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString('fr-FR')}</p>
              <p style="color: #28a745; font-weight: bold;">✅ CORS corrigé avec succès !</p>
              <p>L\'application web peut maintenant envoyer des emails.</p>
            </body>
          </html>
        `,
        reservationData: { 
          test: 'cors_fix',
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.log('❌ Erreur CORS:', error.message);
      
      if (error.message.includes('CORS')) {
        console.log('⚠️ Le problème CORS persiste. Vérifiez la déploiement de la fonction Edge.');
      }
      
      return false;
    }

    console.log('✅ Succès ! Réponse de la fonction Edge:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('🎉 La correction CORS fonctionne !');
      console.log(`📧 Provider utilisé: ${data.provider}`);
      console.log(`📧 Email envoyé: ${data.emailSent}`);
      
      if (data.note) {
        console.log(`📝 Note: ${data.note}`);
      }
      
      return true;
    } else {
      console.log('❌ La fonction a répondu mais avec une erreur');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    return false;
  }
}

async function runTest() {
  console.log('🚀 Démarrage du test de correction CORS...\n');
  
  const success = await testCorsFix();
  
  console.log('');
  if (success) {
    console.log('✅ TEST RÉUSSI !');
    console.log('La correction CORS fonctionne. L\'application web peut maintenant envoyer des emails.');
  } else {
    console.log('❌ TEST ÉCHOUÉ');
    console.log('Le problème CORS persiste. Vérifiez la déploiement de la fonction Edge.');
  }
  
  console.log('');
  console.log('📋 Prochaines étapes:');
  console.log('1. Si le test réussit, testez l\'application web');
  console.log('2. Si le test échoue, déployez la fonction Edge corrigée');
  console.log('3. Vérifiez les variables d\'environnement Supabase');
}

runTest().catch(console.error);
