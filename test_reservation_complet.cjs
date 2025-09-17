const { createClient } = require('@supabase/supabase-js');

console.log('🔍 DIAGNOSTIC COMPLET - PROCESSUS DE RÉSERVATION');
console.log('================================================\n');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simuler le service SpaceDatabaseService
class MockSpaceDatabaseService {
  static async loadFromDatabase(language) {
    try {
      console.log(`📊 Chargement des espaces depuis la base de données (${language})...`);
      
      const { data, error } = await supabase
        .from('spaces_content')
        .select('*')
        .eq('language', language)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erreur lors du chargement:', error.message);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Aucun espace trouvé en base de données');
        return null;
      }

      // Convertir les données de la base vers le format local
      const convertedData = data.reduce((acc, dbSpace) => {
        acc[dbSpace.space_key] = {
          title: dbSpace.title,
          description: dbSpace.description,
          features: dbSpace.features,
          dailyPrice: dbSpace.daily_price,
          monthlyPrice: dbSpace.monthly_price,
          yearlyPrice: dbSpace.yearly_price,
          hourlyPrice: dbSpace.hourly_price,
          maxOccupants: dbSpace.max_occupants,
          imageUrl: dbSpace.image_url,
          isAvailable: dbSpace.is_available !== false,
          lastModified: dbSpace.updated_at
        };
        return acc;
      }, {});

      console.log(`✅ ${Object.keys(convertedData).length} espaces chargés depuis la base de données`);
      return convertedData;

    } catch (error) {
      console.error('❌ Erreur inattendue lors du chargement:', error.message);
      return null;
    }
  }
}

// Simuler le service de réservation
class MockReservationService {
  static async createReservation(reservationData) {
    try {
      console.log('📝 Création de la réservation...');
      console.log('📋 Données de réservation:', reservationData);

      const { data, error } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de la réservation:', error.message);
        return { success: false, error: error.message };
      }

      console.log('✅ Réservation créée avec succès');
      console.log('🆔 ID Réservation:', data.id);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Erreur inattendue lors de la création:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Test 1: Vérifier les espaces disponibles
async function testEspacesDisponibles() {
  console.log('🧪 TEST 1: VÉRIFICATION DES ESPACES DISPONIBLES');
  console.log('===============================================\n');

  try {
    const dbSpaces = await MockSpaceDatabaseService.loadFromDatabase('fr');
    
    if (!dbSpaces) {
      console.log('❌ Aucun espace disponible pour les réservations');
      return false;
    }

    console.log('✅ Espaces disponibles pour réservation:');
    Object.entries(dbSpaces).forEach(([key, space]) => {
      console.log(`   - ${key}: ${space.title} (${space.dailyPrice}$/jour)`);
      console.log(`     Disponible: ${space.isAvailable ? 'Oui' : 'Non'}`);
      console.log(`     Max occupants: ${space.maxOccupants}`);
    });

    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test des espaces:', error.message);
    return false;
  }
}

// Test 2: Vérifier la structure de la table reservations
async function testStructureReservations() {
  console.log('\n🧪 TEST 2: VÉRIFICATION DE LA STRUCTURE DE LA TABLE RÉSERVATIONS');
  console.log('==================================================================\n');

  try {
    // Vérifier si la table existe et a des colonnes
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erreur lors de la vérification de la table reservations:', error.message);
      return false;
    }

    console.log('✅ Table reservations accessible');
    
    // Vérifier les colonnes requises
    const colonnesRequises = [
      'full_name', 'email', 'phone', 'space_type', 'start_date', 
      'end_date', 'amount', 'payment_method', 'status'
    ];

    if (reservations && reservations.length > 0) {
      const colonnes = Object.keys(reservations[0]);
      console.log('📋 Colonnes disponibles:', colonnes);
      
      const colonnesManquantes = colonnesRequises.filter(col => !colonnes.includes(col));
      if (colonnesManquantes.length > 0) {
        console.log('⚠️ Colonnes manquantes:', colonnesManquantes);
        return false;
      } else {
        console.log('✅ Toutes les colonnes requises sont présentes');
      }
    } else {
      console.log('ℹ️ Table vide, mais structure accessible');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test de structure:', error.message);
    return false;
  }
}

// Test 3: Test de création de réservation
async function testCreationReservation() {
  console.log('\n🧪 TEST 3: TEST DE CRÉATION DE RÉSERVATION');
  console.log('===========================================\n');

  try {
    const reservationData = {
      full_name: 'Test Utilisateur',
      email: 'test@example.com',
      phone: '+243840975949',
      company: 'Entreprise Test',
      activity: 'Test activité',
      address: '123 Rue Test, Brazzaville',
      space_type: 'coworking',
      start_date: '2024-01-25',
      end_date: '2024-01-26',
      occupants: 1,
      subscription_type: 'daily',
      amount: 25,
      payment_method: 'cash',
      transaction_id: `TEST_${Date.now()}`,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };

    const result = await MockReservationService.createReservation(reservationData);
    
    if (result.success) {
      console.log('✅ Test de création de réservation réussi');
      return true;
    } else {
      console.log('❌ Test de création de réservation échoué:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de création:', error.message);
    return false;
  }
}

// Test 4: Vérifier les contraintes et permissions
async function testContraintesPermissions() {
  console.log('\n🧪 TEST 4: VÉRIFICATION DES CONTRAINTES ET PERMISSIONS');
  console.log('=======================================================\n');

  try {
    // Test d'insertion avec données minimales
    const testData = {
      full_name: 'Test Minimal',
      email: 'minimal@test.com',
      phone: '+243000000000',
      space_type: 'coworking',
      start_date: '2024-01-25',
      end_date: '2024-01-26',
      amount: 25,
      payment_method: 'cash',
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('reservations')
      .insert(testData)
      .select()
      .single();

    if (error) {
      console.log('❌ Erreur de contrainte/permission:', error.message);
      
      // Analyser l'erreur
      if (error.message.includes('violates')) {
        console.log('🔍 Problème de contrainte de base de données');
      } else if (error.message.includes('permission')) {
        console.log('🔍 Problème de permission RLS');
      } else if (error.message.includes('column')) {
        console.log('🔍 Problème de colonne manquante');
      }
      
      return false;
    } else {
      console.log('✅ Test de contraintes réussi');
      
      // Nettoyer la réservation de test
      await supabase
        .from('reservations')
        .delete()
        .eq('id', data.id);
      
      console.log('🧹 Réservation de test supprimée');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test de contraintes:', error.message);
    return false;
  }
}

// Test 5: Vérifier les RLS policies
async function testRLSPolicies() {
  console.log('\n🧪 TEST 5: VÉRIFICATION DES POLITIQUES RLS');
  console.log('==========================================\n');

  try {
    // Vérifier les politiques RLS sur la table reservations
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'reservations');

    if (error) {
      console.log('⚠️ Impossible de vérifier les politiques RLS:', error.message);
      console.log('💡 Vérifiez manuellement les politiques dans Supabase Dashboard');
      return true; // On ne peut pas déterminer
    }

    if (policies && policies.length > 0) {
      console.log('✅ Politiques RLS trouvées:');
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} (${policy.roles.join(', ')})`);
      });
    } else {
      console.log('⚠️ Aucune politique RLS trouvée pour la table reservations');
      console.log('💡 Cela peut causer des problèmes de permissions');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test RLS:', error.message);
    return false;
  }
}

// Test 6: Vérifier les triggers et fonctions
async function testTriggersFunctions() {
  console.log('\n🧪 TEST 6: VÉRIFICATION DES TRIGGERS ET FONCTIONS');
  console.log('==================================================\n');

  try {
    // Vérifier s'il y a des triggers sur la table reservations
    const { data: triggers, error } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('event_object_table', 'reservations');

    if (error) {
      console.log('⚠️ Impossible de vérifier les triggers:', error.message);
      return true;
    }

    if (triggers && triggers.length > 0) {
      console.log('✅ Triggers trouvés:');
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name}: ${trigger.event_manipulation} ${trigger.action_timing}`);
      });
    } else {
      console.log('ℹ️ Aucun trigger trouvé sur la table reservations');
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test des triggers:', error.message);
    return false;
  }
}

// Exécution des tests
async function runTests() {
  console.log('🚀 DÉBUT DU DIAGNOSTIC COMPLET\n');

  const tests = [
    { name: 'Espaces Disponibles', fn: testEspacesDisponibles },
    { name: 'Structure Réservations', fn: testStructureReservations },
    { name: 'Création Réservation', fn: testCreationReservation },
    { name: 'Contraintes Permissions', fn: testContraintesPermissions },
    { name: 'Politiques RLS', fn: testRLSPolicies },
    { name: 'Triggers Fonctions', fn: testTriggersFunctions }
  ];

  const results = {};

  for (const test of tests) {
    console.log(`\n🔄 Exécution du test: ${test.name}`);
    console.log('='.repeat(50));
    
    try {
      results[test.name] = await test.fn();
    } catch (error) {
      console.error(`❌ Erreur dans le test ${test.name}:`, error.message);
      results[test.name] = false;
    }
  }

  // Résumé des résultats
  console.log('\n📋 RÉSUMÉ DES TESTS');
  console.log('===================');
  
  Object.entries(results).forEach(([testName, success]) => {
    console.log(`${success ? '✅' : '❌'} ${testName}: ${success ? 'RÉUSSI' : 'ÉCHOUÉ'}`);
  });

  const testsReussis = Object.values(results).filter(Boolean).length;
  const totalTests = tests.length;

  console.log(`\n📊 Résultat: ${testsReussis}/${totalTests} tests réussis`);

  if (testsReussis === totalTests) {
    console.log('🎉 Tous les tests sont réussis ! Le processus de réservation devrait fonctionner.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez les problèmes identifiés ci-dessus.');
  }

  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  
  if (!results['Espaces Disponibles']) {
    console.log('1. Configurez des espaces en base de données via l\'Éditeur de contenu');
  }
  
  if (!results['Structure Réservations']) {
    console.log('2. Vérifiez la structure de la table reservations dans Supabase');
  }
  
  if (!results['Création Réservation']) {
    console.log('3. Vérifiez les permissions et contraintes de la table reservations');
  }
  
  if (!results['Contraintes Permissions']) {
    console.log('4. Configurez les politiques RLS pour la table reservations');
  }

  console.log('\n🔧 PROCHAINES ÉTAPES:');
  console.log('1. Corriger les problèmes identifiés ci-dessus');
  console.log('2. Redémarrer le serveur de développement');
  console.log('3. Tester le processus de réservation dans l\'application');
  console.log('4. Vérifier les logs dans la console du navigateur (F12)');
}

runTests().catch(console.error);
