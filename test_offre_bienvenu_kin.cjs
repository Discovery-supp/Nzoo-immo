#!/usr/bin/env node

/**
 * Test de la logique de l'offre "Bienvenu à Kin"
 * Vérifie que l'espace affiché est "Accompagnement des Jeunes Entrepreunariat"
 * au lieu de "Coworking" pour cette offre spéciale
 */

// Simulation de la fonction utilitaire
function getFormattedSpaceText(reservation, defaultText = 'Espace non spécifié') {
  // Vérifier si c'est l'offre "Bienvenu à Kin"
  if (reservation.activity && 
      reservation.activity.toLowerCase().includes('bienvenu') && 
      reservation.activity.toLowerCase().includes('kin')) {
    return 'Accompagnement des Jeunes Entrepreunariat';
  }
  
  return reservation.space_type || defaultText;
}

// Test des différents scénarios
function testOffreBienvenuKin() {
  console.log('🧪 Test de la logique de l\'offre "Bienvenu à Kin"\n');

  // Test 1: Offre "Bienvenu à Kin" classique
  const reservation1 = {
    activity: 'Bienvenu à Kin',
    space_type: 'coworking'
  };
  
  const result1 = getFormattedSpaceText(reservation1);
  console.log('📋 Test 1 - "Bienvenu à Kin":');
  console.log(`   Activité: ${reservation1.activity}`);
  console.log(`   Type d'espace: ${reservation1.space_type}`);
  console.log(`   Résultat affiché: ${result1}`);
  console.log(`   ✅ Attendu: "Accompagnement des Jeunes Entrepreunariat"`);
  console.log(`   ${result1 === 'Accompagnement des Jeunes Entrepreunariat' ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

  // Test 2: Offre "Bienvenu à Kin" avec variation
  const reservation2 = {
    activity: 'Programme Bienvenu à Kin 2025',
    space_type: 'coworking'
  };
  
  const result2 = getFormattedSpaceText(reservation2);
  console.log('📋 Test 2 - "Programme Bienvenu à Kin 2025":');
  console.log(`   Activité: ${reservation2.activity}`);
  console.log(`   Type d'espace: ${reservation2.space_type}`);
  console.log(`   Résultat affiché: ${result2}`);
  console.log(`   ✅ Attendu: "Accompagnement des Jeunes Entrepreunariat"`);
  console.log(`   ${result2 === 'Accompagnement des Jeunes Entrepreunariat' ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

  // Test 3: Offre normale (non "Bienvenu à Kin")
  const reservation3 = {
    activity: 'Développement web',
    space_type: 'coworking'
  };
  
  const result3 = getFormattedSpaceText(reservation3);
  console.log('📋 Test 3 - Activité normale:');
  console.log(`   Activité: ${reservation3.activity}`);
  console.log(`   Type d'espace: ${reservation3.space_type}`);
  console.log(`   Résultat affiché: ${result3}`);
  console.log(`   ✅ Attendu: "coworking"`);
  console.log(`   ${result3 === 'coworking' ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

  // Test 4: Bureau privé
  const reservation4 = {
    activity: 'Consulting',
    space_type: 'bureau-prive'
  };
  
  const result4 = getFormattedSpaceText(reservation4);
  console.log('📋 Test 4 - Bureau privé:');
  console.log(`   Activité: ${reservation4.activity}`);
  console.log(`   Type d'espace: ${reservation4.space_type}`);
  console.log(`   Résultat affiché: ${result4}`);
  console.log(`   ✅ Attendu: "bureau-prive"`);
  console.log(`   ${result4 === 'bureau-prive' ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

  // Test 5: Activité vide
  const reservation5 = {
    activity: '',
    space_type: 'coworking'
  };
  
  const result5 = getFormattedSpaceText(reservation5);
  console.log('📋 Test 5 - Activité vide:');
  console.log(`   Activité: "${reservation5.activity}"`);
  console.log(`   Type d'espace: ${reservation5.space_type}`);
  console.log(`   Résultat affiché: ${result5}`);
  console.log(`   ✅ Attendu: "coworking"`);
  console.log(`   ${result5 === 'coworking' ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

  // Test 6: Activité avec "kin" mais pas "bienvenu"
  const reservation6 = {
    activity: 'Projet Kin',
    space_type: 'coworking'
  };
  
  const result6 = getFormattedSpaceText(reservation6);
  console.log('📋 Test 6 - "Projet Kin" (sans "bienvenu"):');
  console.log(`   Activité: ${reservation6.activity}`);
  console.log(`   Type d'espace: ${reservation6.space_type}`);
  console.log(`   Résultat affiché: ${result6}`);
  console.log(`   ✅ Attendu: "coworking"`);
  console.log(`   ${result6 === 'coworking' ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

  // Test 7: Activité avec "bienvenu" mais pas "kin"
  const reservation7 = {
    activity: 'Bienvenu à Kinshasa',
    space_type: 'coworking'
  };
  
  const result7 = getFormattedSpaceText(reservation7);
  console.log('📋 Test 7 - "Bienvenu à Kinshasa" (avec "bienvenu" mais pas "kin"):');
  console.log(`   Activité: ${reservation7.activity}`);
  console.log(`   Type d'espace: ${reservation7.space_type}`);
  console.log(`   Résultat affiché: ${result7}`);
  console.log(`   ✅ Attendu: "coworking"`);
  console.log(`   ${result7 === 'coworking' ? '✅ SUCCÈS' : '❌ ÉCHEC'}\n`);

  // Résumé des tests
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('===================');
  
  const tests = [
    { name: 'Bienvenu à Kin', expected: 'Accompagnement des Jeunes Entrepreunariat', result: result1 },
    { name: 'Programme Bienvenu à Kin 2025', expected: 'Accompagnement des Jeunes Entrepreunariat', result: result2 },
    { name: 'Activité normale', expected: 'coworking', result: result3 },
    { name: 'Bureau privé', expected: 'bureau-prive', result: result4 },
    { name: 'Activité vide', expected: 'coworking', result: result5 },
    { name: 'Projet Kin', expected: 'coworking', result: result6 },
    { name: 'Bienvenu à Kinshasa', expected: 'coworking', result: result7 }
  ];

  const successCount = tests.filter(test => test.result === test.expected).length;
  const totalCount = tests.length;

  tests.forEach(test => {
    const status = test.result === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.result} (attendu: ${test.expected})`);
  });

  console.log(`\n🎯 Résultat global: ${successCount}/${totalCount} tests réussis`);

  if (successCount === totalCount) {
    console.log('🎉 Tous les tests sont passés! La logique fonctionne parfaitement.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la logique.');
  }
}

// Exécuter les tests
testOffreBienvenuKin();
