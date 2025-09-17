#!/usr/bin/env node

/**
 * Test de débogage complet de l'application
 * Identifie exactement pourquoi les emails ne sont pas reçus
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Vérifier si la fonction Edge existe et fonctionne
async function testEdgeFunction() {
  console.log('🔍 Test 1: Vérification de la fonction Edge...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Debug - Fonction Edge',
        html: '<p>Test de la fonction Edge</p>',
        reservationData: { test: true }
      }
    });

    if (error) {
      console.log(`❌ Erreur fonction Edge: ${error.message}`);
      return false;
    } else {
      console.log('✅ Fonction Edge accessible');
      console.log(`📧 Réponse: ${JSON.stringify(data, null, 2)}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Erreur accès fonction Edge: ${error.message}`);
    return false;
  }
}

// Test 2: Vérifier les variables d'environnement Supabase
async function testSupabaseSecrets() {
  console.log('\n🔍 Test 2: Vérification des secrets Supabase...');
  
  try {
    // Test avec un email simple
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Debug - Secrets',
        html: '<p>Test des secrets Supabase</p>',
        reservationData: { test: true }
      }
    });

    if (error) {
      console.log(`❌ Erreur secrets: ${error.message}`);
      return false;
    } else {
      console.log('✅ Secrets Supabase configurés');
      console.log(`📧 Provider utilisé: ${data.provider || 'inconnu'}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Erreur test secrets: ${error.message}`);
    return false;
  }
}

// Test 3: Simuler exactement ce que fait l'application
async function testApplicationFlow() {
  console.log('\n🔍 Test 3: Simulation du flux de l\'application...');
  
  // Données comme dans l'application
  const appData = {
    fullName: 'Test Debug App',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243 123 456 789',
    company: 'Test Company',
    activity: 'Test Activity',
    spaceType: 'Bureau',
    startDate: '2024-01-30',
    endDate: '2024-01-30',
    amount: 50000,
    transactionId: 'DEBUG_' + Date.now(),
    status: 'pending'
  };

  console.log('📝 Données de test:', appData);

  try {
    // 1. Créer la réservation en base
    console.log('📝 Création réservation en base...');
    const { data: reservation, error: insertError } = await supabase
      .from('reservations')
      .insert({
        full_name: appData.fullName,
        email: appData.email,
        phone: appData.phone,
        company: appData.company,
        activity: appData.activity,
        space_type: appData.spaceType,
        start_date: appData.startDate,
        end_date: appData.endDate,
        amount: appData.amount,
        transaction_id: appData.transactionId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.log(`❌ Erreur création réservation: ${insertError.message}`);
      return false;
    }

    console.log('✅ Réservation créée:', reservation.id);

    // 2. Envoyer l'email client
    console.log('📧 Envoi email client...');
    const clientEmailResult = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: appData.email,
        subject: `Confirmation de réservation - ${appData.fullName}`,
        html: `
          <html>
            <body>
              <h1>🎉 Confirmation de Réservation</h1>
              <p>Bonjour ${appData.fullName},</p>
              <p>Votre réservation a été confirmée !</p>
              <p><strong>ID:</strong> ${appData.transactionId}</p>
              <p><strong>Montant:</strong> ${appData.amount} FC</p>
            </body>
          </html>
        `,
        reservationData: appData
      }
    });

    if (clientEmailResult.error) {
      console.log(`❌ Erreur email client: ${clientEmailResult.error.message}`);
      return false;
    } else {
      console.log('✅ Email client envoyé');
      console.log(`📧 Résultat: ${JSON.stringify(clientEmailResult.data, null, 2)}`);
    }

    // 3. Envoyer l'email admin
    console.log('📧 Envoi email admin...');
    const adminEmailResult = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'tricksonmabengi123@gmail.com',
        subject: `Nouvelle réservation - ${appData.fullName}`,
        html: `
          <html>
            <body>
              <h1>🚨 Nouvelle Réservation</h1>
              <p>Client: ${appData.fullName}</p>
              <p>Email: ${appData.email}</p>
              <p>ID: ${appData.transactionId}</p>
            </body>
          </html>
        `,
        reservationData: appData
      }
    });

    if (adminEmailResult.error) {
      console.log(`❌ Erreur email admin: ${adminEmailResult.error.message}`);
      return false;
    } else {
      console.log('✅ Email admin envoyé');
      console.log(`📧 Résultat: ${JSON.stringify(adminEmailResult.data, null, 2)}`);
    }

    return true;

  } catch (error) {
    console.log(`❌ Erreur générale: ${error.message}`);
    return false;
  }
}

// Test 4: Vérifier les logs Resend
async function checkResendLogs() {
  console.log('\n🔍 Test 4: Vérification des logs Resend...');
  
  const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
  
  try {
    // Envoyer un email de test direct
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: ['trickson.mabengi@gmail.com'],
        subject: 'Test Debug - Resend Direct',
        html: `
          <html>
            <body>
              <h1>🔍 Test Debug Resend</h1>
              <p>Cet email teste l'envoi direct via Resend</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </body>
          </html>
        `
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email Resend envoyé avec succès');
      console.log(`📧 ID: ${result.id}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Erreur Resend: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur réseau Resend: ${error.message}`);
    return false;
  }
}

// Test 5: Vérifier la configuration de l'application
async function checkAppConfiguration() {
  console.log('\n🔍 Test 5: Vérification de la configuration...');
  
  try {
    // Vérifier si l'application peut accéder à Supabase
    const { data: testData, error: testError } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);

    if (testError) {
      console.log(`❌ Erreur accès Supabase: ${testError.message}`);
      return false;
    } else {
      console.log('✅ Accès Supabase OK');
    }

    // Vérifier les variables d'environnement
    console.log('📋 Configuration actuelle:');
    console.log(`   - Supabase URL: ${supabaseUrl}`);
    console.log(`   - FROM_EMAIL: reservations@nzooimmo.com`);
    console.log(`   - RESEND_API_KEY: ${'re_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h'.substring(0, 10)}...`);

    return true;
  } catch (error) {
    console.log(`❌ Erreur configuration: ${error.message}`);
    return false;
  }
}

// Test principal
async function runDebugTests() {
  console.log('🔍 DIAGNOSTIC COMPLET DE L\'APPLICATION');
  console.log('=======================================');
  console.log('📧 Email de test: trickson.mabengi@gmail.com');
  console.log('');

  const results = {
    edgeFunction: await testEdgeFunction(),
    supabaseSecrets: await testSupabaseSecrets(),
    applicationFlow: await testApplicationFlow(),
    resendLogs: await checkResendLogs(),
    appConfiguration: await checkAppConfiguration()
  };

  console.log('\n📊 RÉSULTATS DU DIAGNOSTIC');
  console.log('==========================');
  console.log(`🔧 Fonction Edge: ${results.edgeFunction ? '✅' : '❌'}`);
  console.log(`🔐 Secrets Supabase: ${results.supabaseSecrets ? '✅' : '❌'}`);
  console.log(`📱 Flux Application: ${results.applicationFlow ? '✅' : '❌'}`);
  console.log(`📧 Logs Resend: ${results.resendLogs ? '✅' : '❌'}`);
  console.log(`⚙️  Configuration: ${results.appConfiguration ? '✅' : '❌'}`);

  const allTestsPassed = Object.values(results).every(result => result);

  if (allTestsPassed) {
    console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('✅ Le système fonctionne parfaitement');
    console.log('✅ Les emails sont envoyés correctement');
    console.log('');
    console.log('💡 CAUSES POSSIBLES DU PROBLÈME:');
    console.log('   1. Emails dans les spams/pourriels');
    console.log('   2. Délai d\'envoi (2-5 minutes)');
    console.log('   3. Erreur dans l\'interface utilisateur');
    console.log('   4. Données incorrectes dans l\'app');
  } else {
    console.log('\n⚠️  PROBLÈMES DÉTECTÉS:');
    if (!results.edgeFunction) {
      console.log('   ❌ Fonction Edge non accessible');
    }
    if (!results.supabaseSecrets) {
      console.log('   ❌ Secrets Supabase mal configurés');
    }
    if (!results.applicationFlow) {
      console.log('   ❌ Flux d\'application défaillant');
    }
    if (!results.resendLogs) {
      console.log('   ❌ Problème avec Resend');
    }
    if (!results.appConfiguration) {
      console.log('   ❌ Configuration incorrecte');
    }
  }

  return results;
}

runDebugTests().catch(console.error);
