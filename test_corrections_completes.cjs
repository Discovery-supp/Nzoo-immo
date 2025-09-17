/**
 * Script de test pour vérifier toutes les corrections apportées :
 * 1. Calcul des prix sans arrondissement incorrect
 * 2. Modal de modification des réservations
 * 3. Offre "Bienvenu à Kin" avec espace correct
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre environnement)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test 1: Vérification du calcul des prix
 */
function testCalculPrix() {
  console.log('🧮 Test 1: Vérification du calcul des prix');
  
  // Prix mensuel de test
  const monthlyPrice = 100;
  
  // Tests de calcul
  const tests = [
    { days: 30, expected: 100, description: '1 mois exact (30 jours)' },
    { days: 31, expected: 103, description: '1 mois + 1 jour (31 jours)' },
    { days: 45, expected: 150, description: '1.5 mois (45 jours)' },
    { days: 60, expected: 200, description: '2 mois exacts (60 jours)' },
    { days: 90, expected: 300, description: '3 mois exacts (90 jours)' }
  ];
  
  tests.forEach(test => {
    let calculatedPrice;
    
    if (test.days <= 30) {
      calculatedPrice = monthlyPrice;
    } else {
      const months = Math.round((test.days / 30) * 100) / 100;
      calculatedPrice = Math.round(monthlyPrice * months);
    }
    
    const success = calculatedPrice === test.expected;
    const status = success ? '✅' : '❌';
    
    console.log(`${status} ${test.description}:`);
    console.log(`   Jours: ${test.days}, Prix attendu: ${test.expected}€, Prix calculé: ${calculatedPrice}€`);
    
    if (!success) {
      console.log(`   ⚠️ Différence: ${calculatedPrice - test.expected}€`);
    }
  });
  
  console.log('');
}

/**
 * Test 2: Vérification de la structure de la table reservations
 */
async function testStructureTable() {
  console.log('🏗️ Test 2: Vérification de la structure de la table reservations');
  
  try {
    // Vérifier les colonnes importantes
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'reservations')
      .eq('table_schema', 'public')
      .in('column_name', ['id', 'full_name', 'email', 'activity', 'space_type', 'amount', 'updated_at']);
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return false;
    }
    
    console.log('📋 Colonnes importantes trouvées:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Vérifier que toutes les colonnes nécessaires existent
    const requiredColumns = ['id', 'full_name', 'email', 'activity', 'space_type', 'amount', 'updated_at'];
    const existingColumns = columns.map(col => col.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`❌ Colonnes manquantes: ${missingColumns.join(', ')}`);
      return false;
    } else {
      console.log('✅ Toutes les colonnes nécessaires sont présentes');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de structure:', error);
    return false;
  }
}

/**
 * Test 3: Test de mise à jour d'une réservation
 */
async function testUpdateReservation() {
  console.log('\n🔧 Test 3: Test de mise à jour d\'une réservation');
  
  try {
    // Récupérer une réservation existante
    const { data: reservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des réservations:', fetchError);
      return false;
    }
    
    if (!reservations || reservations.length === 0) {
      console.log('⚠️ Aucune réservation trouvée pour le test');
      return false;
    }
    
    const testReservation = reservations[0];
    console.log(`📋 Réservation de test trouvée: ID ${testReservation.id}`);
    
    // Données de test pour la mise à jour
    const testUpdateData = {
      admin_notes: `Test de correction - ${new Date().toISOString()}`,
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Tentative de mise à jour avec les données:', testUpdateData);
    
    // Test de mise à jour
    const { data: updateResult, error: updateError } = await supabase
      .from('reservations')
      .update(testUpdateData)
      .eq('id', testReservation.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      console.error('🔍 Détails de l\'erreur:', {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint
      });
      return false;
    }
    
    console.log('✅ Mise à jour réussie!');
    console.log('📋 Résultat:', updateResult);
    
    // Vérifier que les données ont été mises à jour
    if (updateResult && updateResult.length > 0) {
      const updatedReservation = updateResult[0];
      const notesUpdated = updatedReservation.admin_notes === testUpdateData.admin_notes;
      const timestampUpdated = updatedReservation.updated_at !== testReservation.updated_at;
      
      console.log('🔍 Vérification des mises à jour:');
      console.log(`   - Notes mises à jour: ${notesUpdated ? '✅' : '❌'}`);
      console.log(`   - Timestamp mis à jour: ${timestampUpdated ? '✅' : '❌'}`);
      
      if (notesUpdated && timestampUpdated) {
        console.log('✅ Toutes les mises à jour sont confirmées');
      } else {
        console.log('⚠️ Certaines mises à jour n\'ont pas été confirmées');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de mise à jour:', error);
    return false;
  }
}

/**
 * Test 4: Vérification de l'offre "Bienvenu à Kin"
 */
async function testOffreBienvenuKin() {
  console.log('\n🎯 Test 4: Vérification de l\'offre "Bienvenu à Kin"');
  
  try {
    // Rechercher des réservations avec l'activité "Bienvenu à Kin"
    const { data: bienvenuReservations, error: searchError } = await supabase
      .from('reservations')
      .select('*')
      .or('activity.ilike.%bienvenu%,activity.ilike.%kin%')
      .limit(5);
    
    if (searchError) {
      console.error('❌ Erreur lors de la recherche des réservations "Bienvenu à Kin":', searchError);
      return false;
    }
    
    if (!bienvenuReservations || bienvenuReservations.length === 0) {
      console.log('⚠️ Aucune réservation "Bienvenu à Kin" trouvée');
      console.log('💡 Créez une réservation avec l\'activité contenant "Bienvenu à Kin" pour tester');
      return true;
    }
    
    console.log(`📋 ${bienvenuReservations.length} réservation(s) "Bienvenu à Kin" trouvée(s):`);
    
    bienvenuReservations.forEach((reservation, index) => {
      console.log(`\n   Réservation ${index + 1}:`);
      console.log(`   - ID: ${reservation.id}`);
      console.log(`   - Activité: ${reservation.activity}`);
      console.log(`   - Type d'espace: ${reservation.space_type}`);
      console.log(`   - Email: ${reservation.email}`);
      
      // Vérifier si l'espace est correctement défini
      const isCorrectSpace = reservation.space_type === 'accompagnement_jeunes_entrepreneuriat';
      const status = isCorrectSpace ? '✅' : '❌';
      
      console.log(`   - Espace correct: ${status} ${reservation.space_type}`);
      
      if (!isCorrectSpace) {
        console.log(`   ⚠️ L'espace devrait être "accompagnement_jeunes_entrepreneuriat" au lieu de "${reservation.space_type}"`);
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de l\'offre "Bienvenu à Kin":', error);
    return false;
  }
}

/**
 * Test 5: Simulation de la logique de détection "Bienvenu à Kin"
 */
function testDetectionBienvenuKin() {
  console.log('\n🔍 Test 5: Simulation de la logique de détection "Bienvenu à Kin"');
  
  const testActivities = [
    'Bienvenu à Kin',
    'bienvenu à kin',
    'BIENVENU À KIN',
    'Bienvenu à Kinshasa',
    'Accueil Bienvenu à Kin',
    'Coworking normal',
    'Bureau privé',
    'Domiciliation'
  ];
  
  testActivities.forEach(activity => {
    const isBienvenuKin = activity.toLowerCase().includes('bienvenu') && 
                          activity.toLowerCase().includes('kin');
    
    const spaceType = isBienvenuKin ? 'accompagnement_jeunes_entrepreneuriat' : 'coworking';
    
    const status = isBienvenuKin ? '🎯' : '📋';
    
    console.log(`${status} Activité: "${activity}"`);
    console.log(`   Détectée comme "Bienvenu à Kin": ${isBienvenuKin ? 'OUI' : 'NON'}`);
    console.log(`   Type d'espace assigné: ${spaceType}`);
  });
  
  console.log('');
}

/**
 * Fonction principale de test
 */
async function runAllTests() {
  console.log('🚀 Démarrage des tests de vérification des corrections');
  console.log('=' .repeat(70));
  
  const tests = [
    { name: 'Calcul des prix', fn: testCalculPrix, async: false },
    { name: 'Structure de la table', fn: testStructureTable, async: true },
    { name: 'Mise à jour des réservations', fn: testUpdateReservation, async: true },
    { name: 'Offre "Bienvenu à Kin"', fn: testOffreBienvenuKin, async: true },
    { name: 'Détection "Bienvenu à Kin"', fn: testDetectionBienvenuKin, async: false }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 Exécution du test: ${test.name}`);
      
      let result;
      if (test.async) {
        result = await test.fn();
      } else {
        result = test.fn();
      }
      
      results.push({ name: test.name, success: result, async: test.async });
      console.log(`✅ Test ${test.name}: ${result ? 'SUCCÈS' : 'ÉCHEC'}`);
      
    } catch (error) {
      console.error(`❌ Test ${test.name} a échoué avec une erreur:`, error);
      results.push({ name: test.name, success: false, error: error.message, async: test.async });
    }
  }
  
  // Résumé des tests
  console.log('\n' + '=' .repeat(70));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(70));
  
  results.forEach(result => {
    const status = result.success ? '✅ SUCCÈS' : '❌ ÉCHEC';
    const type = result.async ? '[ASYNC]' : '[SYNC]';
    console.log(`${status} ${type} - ${result.name}`);
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Résultat global: ${successCount}/${totalCount} tests réussis`);
  
  if (successCount === totalCount) {
    console.log('🎉 Tous les tests sont passés! Les corrections semblent fonctionner.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  if (successCount === totalCount) {
    console.log('✅ Testez l\'application en conditions réelles');
    console.log('✅ Vérifiez que les prix se calculent correctement');
    console.log('✅ Testez la modification des réservations via le modal');
    console.log('✅ Créez une réservation avec l\'offre "Bienvenu à Kin"');
  } else {
    console.log('🔧 Corrigez les problèmes identifiés ci-dessus');
    console.log('🔧 Vérifiez la configuration de la base de données');
    console.log('🔧 Relancez les tests après correction');
  }
}

// Exécution des tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testCalculPrix,
  testStructureTable,
  testUpdateReservation,
  testOffreBienvenuKin,
  testDetectionBienvenuKin,
  runAllTests
};
