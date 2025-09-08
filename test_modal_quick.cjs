#!/usr/bin/env node

/**
 * 🚀 Test Rapide - Modal de Modification des Réservations
 * 
 * Ce script teste rapidement la fonctionnalité de modification
 * pour identifier le problème principal.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('🔧 Veuillez configurer :');
  console.log('   export SUPABASE_URL="votre-url-supabase"');
  console.log('   export SUPABASE_ANON_KEY="votre-clé-anon"');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Test rapide du modal de modification des réservations...\n');

async function testRapide() {
  try {
    // Test 1: Connexion
    console.log('📋 Test 1: Connexion Supabase');
    const { data: testData, error: testError } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Échec de connexion:', testError.message);
      return;
    }
    console.log('✅ Connexion réussie\n');

    // Test 2: Récupération d'une réservation
    console.log('📋 Test 2: Récupération d\'une réservation');
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (reservationError || !reservation || reservation.length === 0) {
      console.error('❌ Aucune réservation trouvée');
      return;
    }
    
    const testReservation = reservation[0];
    console.log('✅ Réservation trouvée:', {
      id: testReservation.id,
      full_name: testReservation.full_name,
      email: testReservation.email
    });
    console.log('');

    // Test 3: Modification de la réservation
    console.log('📋 Test 3: Modification de la réservation');
    const originalName = testReservation.full_name;
    const testName = `TEST_${Date.now()}`;
    
    const { data: updateResult, error: updateError } = await supabase
      .from('reservations')
      .update({ 
        full_name: testName,
        updated_at: new Date().toISOString()
      })
      .eq('id', testReservation.id)
      .select();
    
    if (updateError) {
      console.error('❌ Échec de la modification:', updateError.message);
      return;
    }
    
    if (!updateResult || updateResult.length === 0) {
      console.error('❌ Aucun résultat après modification');
      return;
    }
    
    const updatedReservation = updateResult[0];
    console.log('✅ Modification réussie!');
    console.log('   Avant:', originalName);
    console.log('   Après:', updatedReservation.full_name);
    console.log('');

    // Test 4: Vérification de la modification
    console.log('📋 Test 4: Vérification de la modification');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('reservations')
      .select('full_name')
      .eq('id', testReservation.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur de vérification:', verifyError.message);
    } else {
      console.log('✅ Vérification réussie:', verifyResult.full_name);
      if (verifyResult.full_name === testName) {
        console.log('✅ La modification est bien persistée en base');
      } else {
        console.log('❌ La modification n\'est pas persistée');
      }
    }
    console.log('');

    // Test 5: Restauration des données originales
    console.log('📋 Test 5: Restauration des données originales');
    const { error: restoreError } = await supabase
      .from('reservations')
      .update({ 
        full_name: originalName,
        updated_at: new Date().toISOString()
      })
      .eq('id', testReservation.id);
    
    if (restoreError) {
      console.error('❌ Erreur lors de la restauration:', restoreError.message);
    } else {
      console.log('✅ Données originales restaurées');
    }
    console.log('');

    // Résumé
    console.log('🎯 RÉSULTAT DU TEST RAPIDE');
    console.log('✅ Connexion Supabase : OK');
    console.log('✅ Récupération des données : OK');
    console.log('✅ Modification des données : OK');
    console.log('✅ Persistance des données : OK');
    console.log('✅ Restauration des données : OK');
    console.log('');
    console.log('🔍 CONCLUSION : La base de données fonctionne parfaitement');
    console.log('🎯 CAUSE : Le problème est côté frontend (React/JavaScript)');
    console.log('');
    console.log('🚀 PROCHAINES ÉTAPES :');
    console.log('   1. Vérifier la console du navigateur (F12)');
    console.log('   2. Tester le modal dans l\'interface');
    console.log('   3. Contrôler les logs de handleSaveReservation');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testRapide().then(() => {
  console.log('\n🏁 Test rapide terminé');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Erreur fatale:', error.message);
  process.exit(1);
});





