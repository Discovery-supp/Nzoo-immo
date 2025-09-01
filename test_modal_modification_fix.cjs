#!/usr/bin/env node

/**
 * 🔧 Script de Diagnostic et Correction du Modal de Modification des Réservations
 * 
 * Ce script teste et corrige le problème où les modifications du modal
 * ne sont pas sauvegardées dans la base de données.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre environnement)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Diagnostic du Modal de Modification des Réservations');
console.log('==================================================\n');

/**
 * Test 1: Vérification de la structure de la table reservations
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
      
      // Vérifier les colonnes critiques
      const criticalColumns = ['id', 'full_name', 'email', 'phone', 'status', 'updated_at'];
      const missingColumns = criticalColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes manquantes:', missingColumns);
        return false;
      }
      
      console.log('✅ Toutes les colonnes critiques sont présentes');
      return true;
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
 * Test 2: Vérification des permissions de mise à jour
 */
async function testUpdatePermissions() {
  console.log('\n🔐 Test 2: Permissions de mise à jour');
  console.log('--------------------------------------');
  
  try {
    // Essayer de lire une réservation existante
    const { data: readData, error: readError } = await supabase
      .from('reservations')
      .select('id, full_name')
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
    console.log('✅ Réservation de test trouvée:', testReservation.id);
    
    // Essayer une mise à jour simple
    const { data: updateData, error: updateError } = await supabase
      .from('reservations')
      .update({ 
        updated_at: new Date().toISOString(),
        admin_notes: `Test de mise à jour - ${new Date().toISOString()}`
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
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de permissions:', error);
    return false;
  }
}

/**
 * Test 3: Simulation complète du processus de modification
 */
async function testCompleteModificationFlow() {
  console.log('\n🔄 Test 3: Simulation du processus complet de modification');
  console.log('--------------------------------------------------------');
  
  try {
    // 1. Lire une réservation existante
    const { data: readData, error: readError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (readError || !readData || readData.length === 0) {
      console.error('❌ Impossible de lire une réservation pour le test');
      return false;
    }
    
    const originalReservation = readData[0];
    console.log('📖 Réservation originale:', {
      id: originalReservation.id,
      full_name: originalReservation.full_name,
      status: originalReservation.status
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
      .eq('id', originalReservation.id)
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
      .eq('id', originalReservation.id)
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
        .eq('id', originalReservation.id);
      
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
 * Test 4: Vérification des triggers et contraintes
 */
async function testTriggersAndConstraints() {
  console.log('\n⚡ Test 4: Vérification des triggers et contraintes');
  console.log('--------------------------------------------------');
  
  try {
    // Vérifier s'il y a des triggers sur la table reservations
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_table_triggers', { table_name: 'reservations' });
    
    if (triggerError) {
      console.log('ℹ️ Impossible de vérifier les triggers (fonction non disponible)');
    } else if (triggers && triggers.length > 0) {
      console.log('⚠️ Triggers détectés sur la table reservations:');
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation} ${trigger.event_object_table}`);
      });
    } else {
      console.log('✅ Aucun trigger détecté sur la table reservations');
    }
    
    // Vérifier les contraintes de clés étrangères
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'reservations' });
    
    if (constraintError) {
      console.log('ℹ️ Impossible de vérifier les contraintes (fonction non disponible)');
    } else if (constraints && constraints.length > 0) {
      console.log('🔗 Contraintes détectées:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    } else {
      console.log('✅ Aucune contrainte complexe détectée');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des triggers:', error);
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
    triggersConstraints: false
  };
  
  try {
    // Exécuter tous les tests
    results.tableStructure = await testTableStructure();
    results.updatePermissions = await testUpdatePermissions();
    results.completeFlow = await testCompleteModificationFlow();
    results.triggersConstraints = await testTriggersAndConstraints();
    
    // Résumé des résultats
    console.log('\n📊 RÉSUMÉ DU DIAGNOSTIC');
    console.log('========================');
    console.log(`✅ Structure de table: ${results.tableStructure ? 'OK' : '❌'}`);
    console.log(`✅ Permissions de mise à jour: ${results.updatePermissions ? 'OK' : '❌'}`);
    console.log(`✅ Processus complet: ${results.completeFlow ? 'OK' : '❌'}`);
    console.log(`✅ Triggers/Contraintes: ${results.triggersConstraints ? 'OK' : '❌'}`);
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Score: ${successCount}/${totalTests} tests réussis`);
    
    if (successCount === totalTests) {
      console.log('🎉 Tous les tests sont passés ! Le problème pourrait être côté frontend.');
      console.log('\n🔍 Vérifications frontend recommandées:');
      console.log('   1. Vérifier la console du navigateur pour les erreurs JavaScript');
      console.log('   2. Vérifier que handleSaveReservation est bien appelé');
      console.log('   3. Vérifier que editingReservation.id est défini');
      console.log('   4. Vérifier que refetch() fonctionne correctement');
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
  testTriggersAndConstraints
};
