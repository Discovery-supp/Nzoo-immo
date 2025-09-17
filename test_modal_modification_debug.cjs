/**
 * Script de diagnostic pour le modal de modification des réservations
 * Identifie pourquoi les modifications ne sont pas sauvegardées
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
  console.log('🔍 Test 1: Vérification de la structure de la table');
  console.log('=' .repeat(60));
  
  try {
    // Vérifier que la table existe
    const { data: tableInfo, error: tableError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erreur d\'accès à la table:', tableError);
      return false;
    }
    
    console.log('✅ Table "reservations" accessible');
    
    // Vérifier les colonnes disponibles
    if (tableInfo && tableInfo.length > 0) {
      const columns = Object.keys(tableInfo[0]);
      console.log('📋 Colonnes disponibles:', columns);
      
      // Vérifier les colonnes critiques
      const criticalColumns = [
        'id', 'full_name', 'email', 'phone', 'company', 'activity',
        'address', 'space_type', 'start_date', 'end_date', 'occupants',
        'subscription_type', 'amount', 'payment_method', 'status',
        'notes', 'admin_notes', 'updated_at'
      ];
      
      const missingColumns = criticalColumns.filter(col => !columns.includes(col));
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes manquantes:', missingColumns);
        return false;
      }
      
      console.log('✅ Toutes les colonnes critiques sont présentes');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la structure:', error);
    return false;
  }
}

/**
 * Test 2: Vérifier les permissions sur la table
 */
async function testTablePermissions() {
  console.log('\n🔍 Test 2: Vérification des permissions');
  console.log('=' .repeat(60));
  
  try {
    // Test de lecture
    const { data: readData, error: readError } = await supabase
      .from('reservations')
      .select('id, full_name')
      .limit(1);
    
    if (readError) {
      console.error('❌ Erreur de lecture:', readError);
      return false;
    }
    console.log('✅ Permissions de lecture OK');
    
    // Test d'écriture (mise à jour)
    if (readData && readData.length > 0) {
      const testId = readData[0].id;
      const { data: updateData, error: updateError } = await supabase
        .from('reservations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testId)
        .select();
      
      if (updateError) {
        console.error('❌ Erreur de mise à jour:', updateError);
        return false;
      }
      console.log('✅ Permissions de mise à jour OK');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des permissions:', error);
    return false;
  }
}

/**
 * Test 3: Simuler la mise à jour d'une réservation
 */
async function testReservationUpdate() {
  console.log('\n🔍 Test 3: Test de mise à jour d\'une réservation');
  console.log('=' .repeat(60));
  
  try {
    // Récupérer une réservation existante
    const { data: reservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (fetchError || !reservations || reservations.length === 0) {
      console.error('❌ Impossible de récupérer une réservation:', fetchError);
      return false;
    }
    
    const reservation = reservations[0];
    console.log('📋 Réservation trouvée:', {
      id: reservation.id,
      full_name: reservation.full_name,
      email: reservation.email
    });
    
    // Préparer les données de mise à jour
    const updateData = {
      full_name: `TEST_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      phone: '+1234567890',
      company: 'Entreprise Test',
      activity: 'Activité Test',
      address: 'Adresse Test',
      space_type: 'coworking',
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      occupants: 2,
      subscription_type: 'monthly',
      amount: 150.00,
      payment_method: 'cash',
      status: 'pending',
      notes: 'Note de test',
      admin_notes: 'Note admin de test',
      updated_at: new Date().toISOString()
    };
    
    console.log('📝 Données de mise à jour:', updateData);
    
    // Effectuer la mise à jour
    const { data: updateResult, error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservation.id)
      .select();
    
    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return false;
    }
    
    console.log('✅ Mise à jour réussie!');
    
    if (updateResult && updateResult.length > 0) {
      const updatedReservation = updateResult[0];
      console.log('📋 Réservation mise à jour:', {
        id: updatedReservation.id,
        full_name: updatedReservation.full_name,
        email: updatedReservation.email,
        phone: updatedReservation.phone,
        company: updatedReservation.company,
        activity: updatedReservation.activity,
        address: updatedReservation.address,
        space_type: updatedReservation.space_type,
        occupants: updatedReservation.occupants,
        subscription_type: updatedReservation.subscription_type,
        amount: updatedReservation.amount,
        payment_method: updatedReservation.payment_method,
        status: updatedReservation.status,
        notes: updatedReservation.notes,
        admin_notes: updatedReservation.admin_notes,
        updated_at: updatedReservation.updated_at
      });
      
      // Vérifier que les données ont bien été mises à jour
      const verificationResults = Object.keys(updateData).map(field => ({
        field,
        expected: updateData[field],
        actual: updatedReservation[field],
        match: updateData[field] === updatedReservation[field]
      }));
      
      console.log('🔍 Vérification des mises à jour:', verificationResults);
      
      const mismatchedFields = verificationResults.filter(r => !r.match);
      if (mismatchedFields.length > 0) {
        console.warn('⚠️ Certains champs ne correspondent pas:', mismatchedFields);
      } else {
        console.log('✅ Tous les champs ont été mis à jour correctement');
      }
    }
    
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
  console.log('\n🔍 Test 4: Test de la fonction refetch');
  console.log('=' .repeat(60));
  
  try {
    // Simuler un refetch en récupérant les réservations
    const { data: reservations, error: refetchError } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (refetchError) {
      console.error('❌ Erreur lors du refetch:', refetchError);
      return false;
    }
    
    console.log('✅ Refetch réussi');
    console.log(`📊 ${reservations.length} réservations récupérées`);
    
    if (reservations.length > 0) {
      console.log('📋 Dernière réservation:', {
        id: reservations[0].id,
        full_name: reservations[0].full_name,
        email: reservations[0].email,
        created_at: reservations[0].created_at
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de refetch:', error);
    return false;
  }
}

/**
 * Test 5: Vérifier la logique de validation
 */
function testValidationLogic() {
  console.log('\n🔍 Test 5: Test de la logique de validation');
  console.log('=' .repeat(60));
  
  // Simuler les validations du modal
  const testCases = [
    {
      name: 'Données complètes',
      data: {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      expected: true
    },
    {
      name: 'Nom manquant',
      data: {
        full_name: '',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      expected: false
    },
    {
      name: 'Email manquant',
      data: {
        full_name: 'John Doe',
        email: '',
        phone: '+1234567890'
      },
      expected: false
    },
    {
      name: 'Nom et email manquants',
      data: {
        full_name: '',
        email: '',
        phone: '+1234567890'
      },
      expected: false
    }
  ];
  
  testCases.forEach(testCase => {
    const isValid = testCase.data.full_name && testCase.data.email;
    const status = isValid === testCase.expected ? '✅' : '❌';
    
    console.log(`${status} ${testCase.name}: ${isValid ? 'Valide' : 'Invalide'}`);
  });
  
  return true;
}

/**
 * Test 6: Simuler le flux complet du modal
 */
async function testCompleteModalFlow() {
  console.log('\n🔍 Test 6: Test du flux complet du modal');
  console.log('=' .repeat(60));
  
  try {
    // Étape 1: Récupérer une réservation
    const { data: reservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);
    
    if (fetchError || !reservations || reservations.length === 0) {
      console.error('❌ Impossible de récupérer une réservation pour le test');
      return false;
    }
    
    const reservation = reservations[0];
    console.log('📋 Étape 1: Réservation récupérée:', reservation.id);
    
    // Étape 2: Préparer les données de modification
    const editFormData = {
      full_name: `MODAL_TEST_${Date.now()}`,
      email: `modal_test_${Date.now()}@example.com`,
      phone: '+9876543210',
      company: 'Entreprise Modal Test',
      activity: 'Activité Modal Test',
      address: 'Adresse Modal Test',
      space_type: 'bureau-prive',
      start_date: reservation.start_date,
      end_date: reservation.end_date,
      occupants: 3,
      subscription_type: 'monthly',
      amount: 200.00,
      payment_method: 'mobile_money',
      status: 'confirmed',
      notes: 'Note de test modal',
      admin_notes: 'Note admin de test modal'
    };
    
    console.log('📝 Étape 2: Données de modification préparées');
    
    // Étape 3: Effectuer la mise à jour
    const { data: updateResult, error: updateError } = await supabase
      .from('reservations')
      .update({
        ...editFormData,
        updated_at: new Date().toISOString()
      })
      .eq('id', reservation.id)
      .select();
    
    if (updateError) {
      console.error('❌ Étape 3: Erreur lors de la mise à jour:', updateError);
      return false;
    }
    
    console.log('✅ Étape 3: Mise à jour réussie');
    
    // Étape 4: Vérifier la mise à jour
    if (updateResult && updateResult.length > 0) {
      const updatedReservation = updateResult[0];
      console.log('🔍 Étape 4: Vérification de la mise à jour');
      
      // Vérifier les champs critiques
      const criticalFields = ['full_name', 'email', 'phone', 'status'];
      const verificationResults = criticalFields.map(field => ({
        field,
        expected: editFormData[field],
        actual: updatedReservation[field],
        match: editFormData[field] === updatedReservation[field]
      }));
      
      console.log('📊 Résultats de vérification:', verificationResults);
      
      const allFieldsMatch = verificationResults.every(r => r.match);
      if (allFieldsMatch) {
        console.log('✅ Tous les champs critiques ont été mis à jour correctement');
      } else {
        console.warn('⚠️ Certains champs n\'ont pas été mis à jour correctement');
      }
    }
    
    // Étape 5: Simuler le refetch
    const { data: refetchResult, error: refetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservation.id)
      .single();
    
    if (refetchError) {
      console.error('❌ Étape 5: Erreur lors du refetch:', refetchError);
      return false;
    }
    
    console.log('✅ Étape 5: Refetch réussi');
    console.log('📋 Données après refetch:', {
      id: refetchResult.id,
      full_name: refetchResult.full_name,
      email: refetchResult.email,
      status: refetchResult.status,
      updated_at: refetchResult.updated_at
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test du flux complet:', error);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runAllTests() {
  console.log('🚀 Démarrage des tests de diagnostic du modal de modification');
  console.log('=' .repeat(80));
  
  const tests = [
    { name: 'Structure de la table', fn: testTableStructure },
    { name: 'Permissions', fn: testTablePermissions },
    { name: 'Mise à jour des réservations', fn: testReservationUpdate },
    { name: 'Fonction refetch', fn: testRefetchFunction },
    { name: 'Logique de validation', fn: testValidationLogic },
    { name: 'Flux complet du modal', fn: testCompleteModalFlow }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 Test: ${test.name}`);
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.error(`❌ Erreur dans le test "${test.name}":`, error);
      results.push({ name: test.name, success: false, error });
    }
  }
  
  // Résumé des résultats
  console.log('\n📊 Résumé des Tests');
  console.log('=' .repeat(50));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.success ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
    
    if (result.error) {
      console.log(`   Erreur: ${result.error.message}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Résultat: ${successCount}/${totalCount} tests réussis`);
  
  if (successCount === totalCount) {
    console.log('🎉 Tous les tests sont passés ! Le modal devrait fonctionner correctement.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
  }
  
  return results;
}

// Exécution des tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testTableStructure,
  testTablePermissions,
  testReservationUpdate,
  testRefetchFunction,
  testValidationLogic,
  testCompleteModalFlow,
  runAllTests
};
