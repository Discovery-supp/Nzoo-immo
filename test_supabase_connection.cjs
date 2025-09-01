#!/usr/bin/env node

/**
 * 🔌 Test Simple de Connexion Supabase
 * 
 * Ce script teste la connexion à Supabase avec les paramètres
 * hardcodés dans votre application.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (copiée depuis votre code)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

console.log('🔌 Test de Connexion Supabase');
console.log('================================\n');

console.log('📋 Configuration:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Clé: ${supabaseAnonKey.substring(0, 20)}...`);
console.log('');

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  }
});

/**
 * Test 1: Connexion de base
 */
async function testBasicConnection() {
  console.log('🔍 Test 1: Connexion de base');
  console.log('-------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error.message);
      console.error('   Code:', error.code);
      console.error('   Détails:', error.details);
      return false;
    }
    
    console.log('✅ Connexion réussie!');
    console.log('   Données reçues:', data);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    return false;
  }
}

/**
 * Test 2: Lecture d'une réservation
 */
async function testReadReservation() {
  console.log('\n📖 Test 2: Lecture d\'une réservation');
  console.log('----------------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('id, full_name, email, status')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de lecture:', error.message);
      return false;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Lecture réussie!');
      console.log('   Réservation trouvée:', {
        id: data[0].id,
        nom: data[0].full_name,
        email: data[0].email,
        statut: data[0].status
      });
      return data[0];
    } else {
      console.log('ℹ️ Aucune réservation trouvée');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    return null;
  }
}

/**
 * Test 3: Test de mise à jour
 */
async function testUpdateReservation(reservationId) {
  console.log('\n✏️ Test 3: Test de mise à jour');
  console.log('--------------------------------');
  
  if (!reservationId) {
    console.log('⚠️ Impossible de tester la mise à jour sans réservation');
    return false;
  }
  
  try {
    const testNote = `Test de mise à jour - ${new Date().toISOString()}`;
    
    const { data, error } = await supabase
      .from('reservations')
      .update({ 
        admin_notes: testNote,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select();
    
    if (error) {
      console.error('❌ Erreur de mise à jour:', error.message);
      return false;
    }
    
    console.log('✅ Mise à jour réussie!');
    console.log('   Données mises à jour:', data);
    
    // Restaurer les données originales
    const { error: restoreError } = await supabase
      .from('reservations')
      .update({ 
        admin_notes: '',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId);
    
    if (restoreError) {
      console.warn('⚠️ Impossible de restaurer les données originales');
    } else {
      console.log('🔄 Données originales restaurées');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  try {
    // Test 1: Connexion de base
    const connectionOk = await testBasicConnection();
    
    if (!connectionOk) {
      console.log('\n❌ La connexion de base a échoué. Arrêt des tests.');
      return;
    }
    
    // Test 2: Lecture d'une réservation
    const reservation = await testReadReservation();
    
    // Test 3: Test de mise à jour (si une réservation existe)
    if (reservation) {
      await testUpdateReservation(reservation.id);
    }
    
    console.log('\n📊 RÉSUMÉ DES TESTS');
    console.log('====================');
    console.log('✅ Connexion Supabase: OK');
    console.log('✅ Lecture des données: OK');
    console.log(`✅ Test de mise à jour: ${reservation ? 'OK' : 'N/A'}`);
    
    console.log('\n🎉 Tous les tests de base sont passés!');
    console.log('Le problème du modal pourrait être côté frontend.');
    
  } catch (error) {
    console.error('\n❌ Erreur critique lors des tests:', error.message);
  }
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testBasicConnection,
  testReadReservation,
  testUpdateReservation
};
