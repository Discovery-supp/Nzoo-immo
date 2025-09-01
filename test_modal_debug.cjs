#!/usr/bin/env node

/**
 * 🔍 Script de Debug - Modal de Modification des Réservations
 * 
 * Ce script teste étape par étape le processus de modification
 * pour identifier où le problème se situe.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (copiée depuis votre code)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Debug du Modal de Modification des Réservations');
console.log('==================================================\n');

/**
 * Test 1: Vérifier la structure de la table reservations
 */
async function testTableStructure() {
  console.log('📋 Test 1: Structure de la table reservations');
  console.log('--------------------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur lors de la lecture de la table:', error);
      return false;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('✅ Structure de la table détectée:');
      columns.forEach(col => console.log(`   - ${col}`));
      
      // Vérifier les colonnes critiques pour la modification
      const criticalColumns = ['id', 'full_name', 'email', 'phone', 'status', 'updated_at'];
      const missingColumns = criticalColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes manquantes:', missingColumns);
        return false;
      }
      
      console.log('✅ Toutes les colonnes critiques sont présentes');
      return data[0];
    } else {
      console.error('❌ Aucune donnée dans la table reservations');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de structure:', error);
    return false;
  }
}

/**
 * Test 2: Vérifier les permissions de mise à jour
 */
async function testUpdatePermissions() {
  console.log('\n🔐 Test 2: Permissions de mise à jour');
  console.log('--------------------------------------');
  
  try {
    // Essayer de lire une réservation existante
    const { data: readData, error: readError } = await supabase
      .from('reservations')
      .select('id, full_name, status')
      .limit(1);
    
    if (readError) {
      console.error('❌ Erreur de lecture:', readError);
      return false;
    }
    
    if (!readData || readData.length === 0) {
      console.error('❌ Aucune réservation trouvée pour le test');
      return false;
    }
    
    const testReservation = readData[0];
    console.log('✅ Réservation de test trouvée:', {
      id: testReservation.id,
      full_name: testReservation.full_name,
      status: testReservation.status
    });
    
    // Essayer une mise à jour simple
    const testNote = `Test de mise à jour - ${new Date().toISOString()}`;
    const { data: updateData, error: updateError } = await supabase
      .from('reservations')
      .update({ 
        admin_notes: testNote,
        updated_at: new Date().toISOString()
      })
      .eq('id', testReservation.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur de mise à jour:', updateError);
      console.error('   Code:', updateError.code);
      console.error('   Message:', updateError.message);
      console.error('   Détails:', updateError.details);
      return false;
    }
    
    console.log('✅ Mise à jour réussie:', updateData);
    
    // Restaurer les données originales
    const { error: restoreError } = await supabase
      .from('reservations')
      .update({ 
        admin_notes: '',
        updated_at: new Date().toISOString()
      })
      .eq('id', testReservation.id);
    
    if (restoreError) {
      console.warn('⚠️ Impossible de restaurer les données originales:', restoreError);
    } else {
      console.log('🔄 Données originales restaurées');
    }
    
    return testReservation;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de permissions:', error);
    return false;
  }
}

/**
 * Test 3: Simulation complète du processus de modification
 */
async function testCompleteModificationFlow(reservationId) {
  console.log('\n🔄 Test 3: Simulation du processus complet de modification');
  console.log('--------------------------------------------------------');
  
  if (!reservationId) {
    console.error('❌ Impossible de tester sans ID de réservation');
    return false;
  }
  
  try {
    // 1. Lire la réservation originale
    const { data: readData, error: readError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();
    
    if (readError) {
      console.error('❌ Erreur de lecture:', readError);
      return false;
    }
    
    const originalReservation = readData;
    console.log('📖 Réservation originale:', {
      id: originalReservation.id,
      full_name: originalReservation.full_name,
      status: originalReservation.status,
      admin_notes: originalReservation.admin_notes
    });
    
    // 2. Préparer les données de mise à jour
    const updateData = {
      full_name: `Test Modifié ${Date.now()}`,
      status: 'confirmed',
      admin_notes: `Test automatique - ${new Date().toISOString()}`,
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Données de mise à jour:', updateData);
    
    // 3. Effectuer la mise à jour
    const { data: updateResult, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservationId)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return false;
    }
    
    console.log('✅ Mise à jour effectuée');
    
    // 4. Vérifier que la mise à jour a bien été enregistrée
    const { data: verifyData, error: verifyError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur lors de la vérification:', verifyError);
      return false;
    }
    
    console.log('🔍 Vérification de la mise à jour:');
    console.log('   - Nom original:', originalReservation.full_name);
    console.log('   - Nom après mise à jour:', verifyData.full_name);
    console.log('   - Statut original:', originalReservation.status);
    console.log('   - Statut après mise à jour:', verifyData.status);
    console.log('   - Notes admin originales:', originalReservation.admin_notes);
    console.log('   - Notes admin après mise à jour:', verifyData.admin_notes);
    
    // 5. Vérifier que les changements sont bien présents
    const changesApplied = 
      verifyData.full_name === updateData.full_name &&
      verifyData.status === updateData.status &&
      verifyData.admin_notes === updateData.admin_notes;
    
    if (changesApplied) {
      console.log('✅ Tous les changements ont été appliqués avec succès');
      
      // 6. Restaurer les données originales
      const { error: restoreError } = await supabase
        .from('reservations')
        .update({
          full_name: originalReservation.full_name,
          status: originalReservation.status,
          admin_notes: originalReservation.admin_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);
      
      if (restoreError) {
        console.warn('⚠️ Impossible de restaurer les données originales:', restoreError);
      } else {
        console.log('🔄 Données originales restaurées');
      }
      
      return true;
    } else {
      console.error('❌ Les changements n\'ont pas été appliqués correctement');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error);
    return false;
  }
}

/**
 * Test 4: Vérifier les politiques RLS
 */
async function testRLSPolicies() {
  console.log('\n🔒 Test 4: Vérification des politiques RLS');
  console.log('--------------------------------------------');
  
  try {
    // Essayer de lire les politiques de la table reservations
    const { data: policies, error: policyError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (policyError) {
      console.error('❌ Erreur lors de la lecture des politiques:', policyError);
      console.error('   Code:', policyError.code);
      console.error('   Message:', policyError.message);
      
      if (policyError.code === '42501') {
        console.log('⚠️ Erreur 42501: Permission refusée - Problème de politique RLS');
      }
      
      return false;
    }
    
    console.log('✅ Politiques RLS fonctionnent correctement');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des politiques:', error);
    return false;
  }
}

/**
 * Fonction principale de diagnostic
 */
async function runDiagnostic() {
  console.log('🚀 Démarrage du diagnostic complet...\n');
  
  const results = {
    tableStructure: false,
    updatePermissions: false,
    completeFlow: false,
    rlsPolicies: false
  };
  
  try {
    // Test 1: Structure de table
    const sampleReservation = await testTableStructure();
    results.tableStructure = !!sampleReservation;
    
    if (!sampleReservation) {
      console.log('\n❌ La structure de table a échoué. Arrêt des tests.');
      return;
    }
    
    // Test 2: Permissions de mise à jour
    const testReservation = await testUpdatePermissions();
    results.updatePermissions = !!testReservation;
    
    if (!testReservation) {
      console.log('\n❌ Les permissions de mise à jour ont échoué. Arrêt des tests.');
      return;
    }
    
    // Test 3: Processus complet
    results.completeFlow = await testCompleteModificationFlow(testReservation.id);
    
    // Test 4: Politiques RLS
    results.rlsPolicies = await testRLSPolicies();
    
    // Résumé des résultats
    console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC');
    console.log('========================');
    console.log(`✅ Structure de table: ${results.tableStructure ? 'OK' : '❌'}`);
    console.log(`✅ Permissions de mise à jour: ${results.updatePermissions ? 'OK' : '❌'}`);
    console.log(`✅ Processus complet: ${results.completeFlow ? 'OK' : '❌'}`);
    console.log(`✅ Politiques RLS: ${results.rlsPolicies ? 'OK' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Score: ${successCount}/${totalTests} tests réussis`);
    
    if (successCount === totalTests) {
      console.log('🎉 Tous les tests sont passés ! Le problème pourrait être côté frontend.');
      console.log('\n🔍 Vérifications frontend recommandées:');
      console.log('   1. Vérifier que le modal s\'ouvre correctement');
      console.log('   2. Vérifier que handleEditReservation est appelé');
      console.log('   3. Vérifier que handleSaveReservation est appelé');
      console.log('   4. Vérifier que les logs de debug s\'affichent');
    } else {
      console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration de votre base de données.');
    }
    
  } catch (error) {
    console.error('❌ Erreur critique lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic si le script est appelé directement
if (require.main === module) {
  runDiagnostic().catch(console.error);
}

module.exports = {
  runDiagnostic,
  testTableStructure,
  testUpdatePermissions,
  testCompleteModificationFlow,
  testRLSPolicies
};
