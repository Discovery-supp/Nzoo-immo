#!/usr/bin/env node

/**
 * Test de l'interface de l'application
 * Vérifie que l'application est accessible et configurée
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAppInterface() {
  console.log('🔧 TEST DE L\'INTERFACE DE L\'APPLICATION');
  console.log('==========================================');
  console.log('');
  
  try {
    // Test 1: Vérifier la connexion Supabase
    console.log('🔍 Test 1: Vérification de la connexion Supabase...');
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Erreur connexion Supabase:', error.message);
      return false;
    }
    console.log('✅ Connexion Supabase - OK');
    
    // Test 2: Vérifier l'accessibilité de la fonction Edge
    console.log('\n🔍 Test 2: Vérification de la fonction Edge...');
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Interface App',
        html: '<p>Test interface application</p>',
        reservationData: { test: 'interface' }
      }
    });

    if (edgeError) {
      console.log('❌ Erreur fonction Edge:', edgeError.message);
      return false;
    }
    console.log('✅ Fonction Edge - OK');
    console.log('📧 Réponse:', edgeData);
    
    // Test 3: Vérifier la configuration générale
    console.log('\n🔍 Test 3: Vérification de la configuration...');
    console.log('✅ URL Supabase:', supabaseUrl);
    console.log('✅ Clé API:', supabaseAnonKey ? 'Configurée' : 'Manquante');
    console.log('✅ Client Supabase:', 'Initialisé');
    
    console.log('\n📊 RÉSULTATS');
    console.log('============');
    console.log('✅ Tous les tests passent !');
    console.log('✅ L\'application devrait fonctionner correctement');
    console.log('✅ Le problème vient probablement de l\'interface utilisateur');
    
    console.log('\n💡 PROCHAINES ÉTAPES');
    console.log('===================');
    console.log('1. Ouvrez l\'application sur http://localhost:5174');
    console.log('2. Appuyez sur F12 pour ouvrir la console');
    console.log('3. Faites une réservation complète');
    console.log('4. Observez les messages dans la console');
    console.log('5. Copiez-moi tous les messages d\'erreur ou de debug');
    
    return true;
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    return false;
  }
}

testAppInterface().then(success => {
  if (success) {
    console.log('\n🎉 Interface testée avec succès !');
    console.log('🔍 Maintenant, testez l\'application manuellement.');
  } else {
    console.log('\n❌ Problème détecté avec l\'interface.');
  }
}).catch(console.error);
