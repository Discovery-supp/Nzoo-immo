#!/usr/bin/env node

/**
 * Test des logs de l'application
 * Vérifie si l'application fonctionne correctement
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Vérifier les réservations récentes
async function checkRecentReservations() {
  console.log('🔍 Test 1: Vérification des réservations récentes...');
  
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.log(`❌ Erreur: ${error.message}`);
      return false;
    }

    console.log(`✅ ${reservations.length} réservation(s) trouvée(s)`);
    
    if (reservations.length > 0) {
      console.log('\n📋 Dernières réservations:');
      reservations.forEach((reservation, index) => {
        console.log(`${index + 1}. ${reservation.full_name} - ${reservation.email} - ${reservation.created_at}`);
      });
    } else {
      console.log('⚠️ Aucune réservation trouvée');
    }

    return true;
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return false;
  }
}

// Test 2: Vérifier si l'application peut créer des réservations
async function testReservationCreation() {
  console.log('\n🔍 Test 2: Test de création de réservation...');
  
  const testData = {
    full_name: 'Test App Diagnostic',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243 123 456 789',
    company: 'Test Company',
    activity: 'Test Activity',
    space_type: 'Bureau',
    start_date: '2024-01-30',
    end_date: '2024-01-30',
    amount: 50000,
    transaction_id: 'APP_TEST_' + Date.now(),
    status: 'pending',
    created_at: new Date().toISOString()
  };

  try {
    console.log('📝 Tentative de création de réservation...');
    
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.log(`❌ Erreur création: ${error.message}`);
      return false;
    }

    console.log('✅ Réservation créée avec succès');
    console.log(`📧 Email: ${reservation.email}`);
    console.log(`🆔 ID: ${reservation.id}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return false;
  }
}

// Test 3: Vérifier les logs de la fonction Edge
async function checkEdgeFunctionLogs() {
  console.log('\n🔍 Test 3: Test de la fonction Edge...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Logs Application',
        html: '<p>Test des logs de l\'application</p>',
        reservationData: { test: true }
      }
    });

    if (error) {
      console.log(`❌ Erreur fonction Edge: ${error.message}`);
      return false;
    }

    console.log('✅ Fonction Edge accessible');
    console.log(`📧 Réponse: ${JSON.stringify(data, null, 2)}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return false;
  }
}

// Test 4: Simuler le flux complet de l'application
async function simulateAppFlow() {
  console.log('\n🔍 Test 4: Simulation du flux de l\'application...');
  
  const appData = {
    fullName: 'Test Flux App',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243 123 456 789',
    company: 'Test Company',
    activity: 'Test Activity',
    spaceType: 'Bureau',
    startDate: '2024-01-30',
    endDate: '2024-01-30',
    amount: 50000,
    transactionId: 'FLUX_TEST_' + Date.now(),
    status: 'pending'
  };

  console.log('📝 Données de test:', appData);

  try {
    // 1. Créer la réservation
    console.log('📝 Création réservation...');
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
      console.log(`❌ Erreur création: ${insertError.message}`);
      return false;
    }

    console.log('✅ Réservation créée:', reservation.id);

    // 2. Envoyer l'email
    console.log('📧 Envoi email...');
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: appData.email,
        subject: `Test Flux - ${appData.fullName}`,
        html: `<p>Test du flux de l'application pour ${appData.fullName}</p>`,
        reservationData: appData
      }
    });

    if (emailError) {
      console.log(`❌ Erreur email: ${emailError.message}`);
      return false;
    }

    console.log('✅ Email envoyé:', emailResult);
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur générale: ${error.message}`);
    return false;
  }
}

// Test principal
async function runAppDiagnostic() {
  console.log('🔍 DIAGNOSTIC DE L\'APPLICATION');
  console.log('===============================');
  
  const results = {
    recentReservations: await checkRecentReservations(),
    reservationCreation: await testReservationCreation(),
    edgeFunction: await checkEdgeFunctionLogs(),
    appFlow: await simulateAppFlow()
  };

  console.log('\n📊 RÉSULTATS DU DIAGNOSTIC');
  console.log('==========================');
  console.log(`📋 Réservations récentes: ${results.recentReservations ? '✅' : '❌'}`);
  console.log(`📝 Création réservation: ${results.reservationCreation ? '✅' : '❌'}`);
  console.log(`🔧 Fonction Edge: ${results.edgeFunction ? '✅' : '❌'}`);
  console.log(`📱 Flux application: ${results.appFlow ? '✅' : '❌'}`);

  const allTestsPassed = Object.values(results).every(result => result);

  if (allTestsPassed) {
    console.log('\n🎉 DIAGNOSTIC RÉUSSI !');
    console.log('✅ L\'application fonctionne correctement');
    console.log('✅ Tous les composants sont opérationnels');
    console.log('');
    console.log('💡 Si vous ne recevez pas les emails :');
    console.log('   1. Vérifiez la console du navigateur (F12)');
    console.log('   2. L\'application pourrait avoir une erreur JavaScript');
    console.log('   3. L\'email saisi pourrait être incorrect');
  } else {
    console.log('\n⚠️  PROBLÈMES DÉTECTÉS');
    if (!results.recentReservations) {
      console.log('   ❌ Problème d\'accès aux réservations');
    }
    if (!results.reservationCreation) {
      console.log('   ❌ Problème de création de réservation');
    }
    if (!results.edgeFunction) {
      console.log('   ❌ Problème avec la fonction Edge');
    }
    if (!results.appFlow) {
      console.log('   ❌ Problème avec le flux de l\'application');
    }
  }

  return results;
}

runAppDiagnostic().catch(console.error);
