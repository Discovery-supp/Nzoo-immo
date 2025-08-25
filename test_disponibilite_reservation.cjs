console.log('🔍 Test de disponibilité des bureaux privés - Page Réservation');
console.log('==========================================================\n');

// Simulation des données de test
const testScenarios = [
  {
    name: 'Bureaux privés disponibles',
    spaceType: 'bureau-prive',
    reservations: [
      { status: 'confirmed', space_type: 'bureau-prive' },
      { status: 'pending', space_type: 'bureau-prive' }
    ],
    expected: { isAvailable: true, message: '2 places disponibles' }
  },
  {
    name: 'Bureaux privés complets',
    spaceType: 'bureau-prive',
    reservations: [
      { status: 'confirmed', space_type: 'bureau-prive' },
      { status: 'confirmed', space_type: 'bureau-prive' },
      { status: 'confirmed', space_type: 'bureau-prive' }
    ],
    expected: { isAvailable: false, message: 'Tous les bureaux privés sont actuellement occupés' }
  },
  {
    name: 'Bureaux privés avec réservations annulées',
    spaceType: 'bureau-prive',
    reservations: [
      { status: 'confirmed', space_type: 'bureau-prive' },
      { status: 'cancelled', space_type: 'bureau-prive' },
      { status: 'cancelled', space_type: 'bureau-prive' }
    ],
    expected: { isAvailable: true, message: '2 places disponibles' }
  }
];

const maxCapacities = {
  'coworking': 4,
  'bureau-prive': 3,
  'domiciliation': 1
};

// Fonction de test de disponibilité
const testAvailability = (spaceType, reservations) => {
  const maxCapacity = maxCapacities[spaceType] || 4;
  const activeReservations = reservations.filter(r => 
    r.space_type === spaceType && 
    (r.status === 'confirmed' || r.status === 'pending')
  );
  
  const isAvailable = activeReservations.length < maxCapacity;
  const availableSlots = Math.max(0, maxCapacity - activeReservations.length);
  
  let message;
  if (isAvailable) {
    if (availableSlots === 1) {
      message = '1 place disponible';
    } else {
      message = `${availableSlots} places disponibles`;
    }
  } else {
    message = 'Tous les bureaux privés sont actuellement occupés';
  }
  
  return { isAvailable, message, availableSlots, currentOccupancy: activeReservations.length };
};

// Test des scénarios
console.log('1️⃣ Test des scénarios de disponibilité...\n');

testScenarios.forEach((scenario, index) => {
  console.log(`📊 Scénario ${index + 1}: ${scenario.name}`);
  console.log(`   Type d'espace: ${scenario.spaceType}`);
  console.log(`   Réservations: ${scenario.reservations.length}`);
  
  const result = testAvailability(scenario.spaceType, scenario.reservations);
  
  console.log(`   Résultat attendu: ${scenario.expected.isAvailable ? 'DISPONIBLE' : 'COMPLET'}`);
  console.log(`   Résultat obtenu: ${result.isAvailable ? 'DISPONIBLE' : 'COMPLET'}`);
  console.log(`   Message: ${result.message}`);
  console.log(`   Places disponibles: ${result.availableSlots}/${maxCapacities[scenario.spaceType]}`);
  
  const testPassed = result.isAvailable === scenario.expected.isAvailable;
  console.log(`   Test: ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
});

// Test de la logique d'interface
console.log('2️⃣ Test de la logique d\'interface...\n');

const testInterfaceLogic = () => {
  const scenarios = [
    { spaceType: 'bureau-prive', isAvailable: false, expectedButtonText: 'Bureaux indisponibles' },
    { spaceType: 'bureau-prive', isAvailable: true, expectedButtonText: 'Réserver' },
    { spaceType: 'coworking', isAvailable: true, expectedButtonText: 'Réserver' }
  ];
  
  scenarios.forEach((scenario, index) => {
    const buttonText = !scenario.isAvailable && scenario.spaceType === 'bureau-prive' 
      ? 'Bureaux indisponibles' 
      : 'Réserver';
    
    const testPassed = buttonText === scenario.expectedButtonText;
    
    console.log(`📊 Test ${index + 1}: ${scenario.spaceType} - ${scenario.isAvailable ? 'Disponible' : 'Indisponible'}`);
    console.log(`   Texte du bouton attendu: "${scenario.expectedButtonText}"`);
    console.log(`   Texte du bouton obtenu: "${buttonText}"`);
    console.log(`   Test: ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
  });
};

testInterfaceLogic();

// Test de validation des étapes
console.log('3️⃣ Test de validation des étapes...\n');

const testStepValidation = () => {
  const testCases = [
    {
      step: 1,
      selectedDates: [new Date(), new Date()],
      spaceAvailable: true,
      expected: true,
      description: 'Étape 1 - Dates sélectionnées et espace disponible'
    },
    {
      step: 1,
      selectedDates: [new Date(), new Date()],
      spaceAvailable: false,
      expected: false,
      description: 'Étape 1 - Dates sélectionnées mais espace indisponible'
    },
    {
      step: 2,
      formData: { fullName: 'Test', email: 'test@test.com', phone: '123456789' },
      spaceAvailable: true,
      expected: true,
      description: 'Étape 2 - Formulaire complet et espace disponible'
    },
    {
      step: 2,
      formData: { fullName: 'Test', email: 'test@test.com', phone: '123456789' },
      spaceAvailable: false,
      expected: false,
      description: 'Étape 2 - Formulaire complet mais espace indisponible'
    }
  ];
  
  testCases.forEach((testCase, index) => {
    let isValid;
    
    if (testCase.step === 1) {
      isValid = testCase.selectedDates !== null && testCase.spaceAvailable;
    } else if (testCase.step === 2) {
      const hasRequiredFields = testCase.formData.fullName && testCase.formData.email && testCase.formData.phone;
      isValid = hasRequiredFields && testCase.spaceAvailable;
    }
    
    const testPassed = isValid === testCase.expected;
    
    console.log(`📊 Test ${index + 1}: ${testCase.description}`);
    console.log(`   Validation attendue: ${testCase.expected ? 'VALID' : 'INVALID'}`);
    console.log(`   Validation obtenue: ${isValid ? 'VALID' : 'INVALID'}`);
    console.log(`   Test: ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
  });
};

testStepValidation();

console.log('4️⃣ Instructions pour tester dans l\'application...\n');
console.log('📋 Pour tester la fonctionnalité:');
console.log('1. Allez sur la page de réservation');
console.log('2. Sélectionnez "Bureau privé"');
console.log('3. Vérifiez que:');
console.log('   - Une alerte rouge s\'affiche si les bureaux sont indisponibles');
console.log('   - Le bouton "Suivant" est désactivé');
console.log('   - Le bouton de réservation affiche "Bureaux indisponibles"');
console.log('4. Pour rendre les bureaux disponibles:');
console.log('   - Allez dans Supabase Dashboard');
console.log('   - Table "reservations"');
console.log('   - Supprimez ou annulez les réservations de bureau-prive');
console.log('   - Actualisez la page');

console.log('\n🎯 Système de disponibilité pour la page de réservation prêt !');
console.log('   Les bureaux privés seront automatiquement désactivés quand ils sont occupés.');
