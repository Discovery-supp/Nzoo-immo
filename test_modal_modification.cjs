/**
 * Script de test pour diagnostiquer le problème de sauvegarde du modal de modification
 * des réservations dans AdminDashboard.tsx
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre environnement)
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test 1: Vérifier la structure de la table reservations
 */
async function testTableStructure() {
  console.log('🔍 Test 1: Vérification de la structure de la table reservations');
  
  try {
    // Vérifier si la table existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'reservations')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.error('❌ Erreur lors de la vérification de la table:', tableError);
      return false;
    }
    
    if (!tableInfo || tableInfo.length === 0) {
      console.error('❌ Table "reservations" non trouvée');
      return false;
    }
    
    console.log('✅ Table "reservations" trouvée');
    
    // Vérifier la structure des colonnes
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'reservations')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ Erreur lors de la vérification des colonnes:', columnsError);
      return false;
    }
    
    console.log('📋 Colonnes de la table reservations:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de structure:', error);
    return false;
  }
}

/**
 * Test 2: Vérifier les permissions sur la table reservations
 */
async function testTablePermissions() {
  console.log('\n🔍 Test 2: Vérification des permissions sur la table reservations');
  
  try {
    // Vérifier les permissions RLS
    const { data: rlsInfo, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .eq('table_name', 'reservations')
      .eq('table_schema', 'public');
    
    if (rlsError) {
      console.error('❌ Erreur lors de la vérification RLS:', rlsError);
      return false;
    }
    
    if (rlsInfo && rlsInfo.length > 0) {
      console.log(`📋 RLS activé: ${rlsInfo[0].row_security}`);
    }
    
    // Vérifier les permissions d'insertion/mise à jour
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'reservations');
    
    if (policiesError) {
      console.error('❌ Erreur lors de la vérification des politiques:', policiesError);
    } else if (policies && policies.length > 0) {
      console.log('📋 Politiques RLS trouvées:');
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.cmd} (WHERE: ${policy.qual})`);
      });
    } else {
      console.log('⚠️ Aucune politique RLS trouvée');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test des permissions:', error);
    return false;
  }
}

/**
 * Test 3: Tester la mise à jour d'une réservation existante
 */
async function testUpdateReservation() {
  console.log('\n🔍 Test 3: Test de mise à jour d\'une réservation');
  
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
    
    // Tester la mise à jour
    const updateData = {
      admin_notes: `Test de mise à jour - ${new Date().toISOString()}`,
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Tentative de mise à jour avec les données:', updateData);
    
    const { data: updateResult, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
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
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de mise à jour:', error);
    return false;
  }
}

/**
 * Test 4: Vérifier la fonction refetch
 */
async function testRefetchFunction() {
  console.log('\n🔍 Test 4: Vérification de la fonction refetch');
  
  try {
    // Simuler un appel à refetch
    console.log('📋 Test de la fonction refetch...');
    
    // Vérifier si les données sont bien rechargées
    const { data: reservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Erreur lors du rechargement:', fetchError);
      return false;
    }
    
    console.log(`✅ Rechargement réussi: ${reservations.length} réservations récupérées`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test de refetch:', error);
    return false;
  }
}

/**
 * Test 5: Vérifier les données du formulaire
 */
async function testFormData() {
  console.log('\n🔍 Test 5: Vérification des données du formulaire');
  
  try {
    // Simuler les données du formulaire
    const mockFormData = {
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      activity: 'Test Activity',
      address: 'Test Address',
      space_type: 'coworking',
      start_date: '2025-01-21',
      end_date: '2025-02-21',
      occupants: 1,
      subscription_type: 'monthly',
      amount: 100,
      payment_method: 'cash',
      status: 'pending',
      notes: 'Test notes',
      admin_notes: 'Test admin notes'
    };
    
    console.log('📋 Données du formulaire simulées:', mockFormData);
    
    // Vérifier que toutes les colonnes correspondent
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'reservations')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.error('❌ Erreur lors de la récupération des colonnes:', columnsError);
      return false;
    }
    
    const columnNames = columns.map(col => col.column_name);
    console.log('📋 Colonnes de la base de données:', columnNames);
    
    // Vérifier la correspondance
    const formFields = Object.keys(mockFormData);
    const missingFields = formFields.filter(field => !columnNames.includes(field));
    const extraFields = columnNames.filter(col => !formFields.includes(col) && col !== 'id' && col !== 'created_at');
    
    if (missingFields.length > 0) {
      console.log('⚠️ Champs du formulaire manquants dans la base:', missingFields);
    }
    
    if (extraFields.length > 0) {
      console.log('⚠️ Colonnes de la base non utilisées dans le formulaire:', extraFields);
    }
    
    if (missingFields.length === 0 && extraFields.length === 0) {
      console.log('✅ Correspondance parfaite entre formulaire et base de données');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors du test des données du formulaire:', error);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runAllTests() {
  console.log('🚀 Démarrage des tests de diagnostic du modal de modification');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Structure de la table', fn: testTableStructure },
    { name: 'Permissions', fn: testTablePermissions },
    { name: 'Mise à jour', fn: testUpdateReservation },
    { name: 'Refetch', fn: testRefetchFunction },
    { name: 'Données du formulaire', fn: testFormData }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 Exécution du test: ${test.name}`);
      const result = await test.fn();
      results.push({ name: test.name, success: result });
      console.log(`✅ Test ${test.name}: ${result ? 'SUCCÈS' : 'ÉCHEC'}`);
    } catch (error) {
      console.error(`❌ Test ${test.name} a échoué avec une erreur:`, error);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Résumé des tests
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅ SUCCÈS' : '❌ ÉCHEC';
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Erreur: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Résultat global: ${successCount}/${totalCount} tests réussis`);
  
  if (successCount === totalCount) {
    console.log('🎉 Tous les tests sont passés! Le problème pourrait être côté frontend.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration de la base de données.');
  }
}

// Exécution des tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testTableStructure,
  testTablePermissions,
  testUpdateReservation,
  testRefetchFunction,
  testFormData,
  runAllTests
};
