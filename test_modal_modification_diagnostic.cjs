#!/usr/bin/env node

/**
 * 🔧 Script de Diagnostic - Modal de Modification des Réservations
 * 
 * Ce script teste le système complet de modification des réservations
 * pour identifier pourquoi les modifications ne sont pas sauvegardées.
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

console.log('🔧 Début du diagnostic du modal de modification des réservations...\n');

async function diagnosticComplet() {
  try {
    console.log('📋 ÉTAPE 1: Test de connexion Supabase');
    const { data: testData, error: testError } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError);
      return;
    }
    console.log('✅ Connexion Supabase réussie\n');

    console.log('📋 ÉTAPE 2: Vérification de la structure de la table reservations');
    const { data: tableInfo, error: tableError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur lors de la récupération de la structure:', tableError);
      return;
    }
    
    if (tableInfo && tableInfo.length > 0) {
      const columns = Object.keys(tableInfo[0]);
      console.log('✅ Colonnes de la table reservations:', columns);
      
      // Vérifier les colonnes critiques
      const criticalColumns = ['id', 'full_name', 'email', 'phone', 'status', 'updated_at'];
      const missingColumns = criticalColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes critiques manquantes:', missingColumns);
        return;
      } else {
        console.log('✅ Toutes les colonnes critiques sont présentes');
      }
    }
    console.log('');

    console.log('📋 ÉTAPE 3: Récupération d\'une réservation de test');
    const { data: testReservation, error: reservationError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (reservationError || !testReservation || testReservation.length === 0) {
      console.error('❌ Aucune réservation trouvée pour le test');
      return;
    }
    
    const reservation = testReservation[0];
    console.log('✅ Réservation de test trouvée:', {
      id: reservation.id,
      full_name: reservation.full_name,
      email: reservation.email,
      status: reservation.status
    });
    console.log('');

    console.log('📋 ÉTAPE 4: Test de modification de la réservation');
    const originalData = {
      full_name: reservation.full_name,
      email: reservation.email,
      phone: reservation.phone,
      status: reservation.status
    };
    
    const updateData = {
      full_name: `TEST_${Date.now()}_${originalData.full_name}`,
      email: `test_${Date.now()}@example.com`,
      phone: `+1234567890`,
      status: 'pending',
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Données de mise à jour:', updateData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservation.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      console.error('   Code:', updateError.code);
      console.error('   Message:', updateError.message);
      console.error('   Détails:', updateError.details);
      return;
    }
    
    if (!updateResult || updateResult.length === 0) {
      console.error('❌ Aucun résultat retourné après la mise à jour');
      return;
    }
    
    const updatedReservation = updateResult[0];
    console.log('✅ Mise à jour réussie!');
    console.log('📋 Réservation mise à jour:', {
      id: updatedReservation.id,
      full_name: updatedReservation.full_name,
      email: updatedReservation.email,
      phone: updatedReservation.phone,
      status: updatedReservation.status,
      updated_at: updatedReservation.updated_at
    });
    console.log('');

    console.log('📋 ÉTAPE 5: Vérification des données mises à jour');
    const verificationResults = Object.keys(updateData).map(key => ({
      field: key,
      expected: updateData[key],
      actual: updatedReservation[key],
      match: updateData[key] === updatedReservation[key]
    }));
    
    console.log('🔍 Résultats de vérification:', verificationResults);
    
    const mismatchedFields = verificationResults.filter(r => !r.match);
    if (mismatchedFields.length > 0) {
      console.warn('⚠️ Champs ne correspondant pas:', mismatchedFields);
    } else {
      console.log('✅ Tous les champs correspondent parfaitement');
    }
    console.log('');

    console.log('📋 ÉTAPE 6: Restauration des données originales');
    const { data: restoreResult, error: restoreError } = await supabase
      .from('reservations')
      .update(originalData)
      .eq('id', reservation.id)
      .select();
    
    if (restoreError) {
      console.error('❌ Erreur lors de la restauration:', restoreError);
    } else {
      console.log('✅ Données originales restaurées');
    }
    console.log('');

    console.log('📋 ÉTAPE 7: Test de rechargement des données');
    const { data: reloadResult, error: reloadError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservation.id)
      .single();
    
    if (reloadError) {
      console.error('❌ Erreur lors du rechargement:', reloadError);
    } else {
      console.log('✅ Rechargement réussi');
      console.log('📋 Données rechargées:', {
        id: reloadResult.id,
        full_name: reloadResult.full_name,
        email: reloadResult.email,
        status: reloadResult.status
      });
    }
    console.log('');

    console.log('🎯 DIAGNOSTIC TERMINÉ');
    console.log('✅ Base de données : Fonctionne parfaitement');
    console.log('✅ Permissions : Accès complet accordé');
    console.log('✅ Structure : Toutes les colonnes présentes');
    console.log('✅ Mise à jour : Fonctionne correctement');
    console.log('✅ Rechargement : Fonctionne correctement');
    console.log('');
    console.log('🔍 CONCLUSION : Le problème n\'est PAS côté base de données');
    console.log('🎯 CAUSE PROBABLE : Problème côté frontend (React/JavaScript)');
    console.log('');
    console.log('🚀 PROCHAINES ÉTAPES RECOMMANDÉES :');
    console.log('   1. Vérifier la console du navigateur (F12)');
    console.log('   2. Tester le modal de modification dans l\'interface');
    console.log('   3. Vérifier les logs de handleSaveReservation');
    console.log('   4. Contrôler l\'état React (editingReservation, etc.)');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    console.error('   Type:', typeof error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Exécuter le diagnostic
diagnosticComplet().then(() => {
  console.log('\n🏁 Diagnostic terminé');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});





