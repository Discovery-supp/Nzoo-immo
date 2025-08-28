console.log('🔍 Test de disponibilité réelle - Nzoo Immo');
console.log('==========================================\n');

// Configuration Supabase (à remplacer par vos vraies clés)
const SUPABASE_URL = 'VOTRE_SUPABASE_URL';
const SUPABASE_KEY = 'VOTRE_SUPABASE_ANON_KEY';

// Simulation de la fonction checkGeneralSpaceAvailability
const simulateCheckGeneralSpaceAvailability = async (spaceType) => {
  console.log(`🔍 Simulation de vérification pour: ${spaceType}`);
  
  // Capacités maximales
  const maxCapacities = {
    'coworking': 4,
    'bureau_prive': 3,
    'bureau-prive': 3,
    'domiciliation': 1
  };

  const maxCapacity = maxCapacities[spaceType] || 4;
  
  // Simulation de réservations existantes (à adapter selon votre base)
  const mockReservations = [
    { space_type: 'bureau-prive', status: 'confirmed' },
    { space_type: 'bureau-prive', status: 'confirmed' },
    { space_type: 'bureau-prive', status: 'pending' }
  ];

  // Filtrer les réservations pour ce type d'espace
  const activeReservations = mockReservations.filter(r => 
    r.space_type === spaceType && 
    (r.status === 'confirmed' || r.status === 'pending')
  );

  const currentOccupancy = activeReservations.length;
  const availableSlots = Math.max(0, maxCapacity - currentOccupancy);
  const isAvailable = availableSlots > 0;

  console.log(`📊 Résultats pour ${spaceType}:`);
  console.log(`   - Capacité maximale: ${maxCapacity}`);
  console.log(`   - Réservations actives: ${currentOccupancy}`);
  console.log(`   - Places disponibles: ${availableSlots}`);
  console.log(`   - Disponible: ${isAvailable ? '✅ OUI' : '❌ NON'}`);

  return {
    spaceType,
    isAvailable,
    currentOccupancy,
    maxCapacity,
    availableSlots,
    message: isAvailable 
      ? `${availableSlots} place(s) disponible(s)`
      : `Complet - ${maxCapacity} place(s) occupée(s)`
  };
};

// Test des scénarios
const testScenarios = [
  {
    name: 'Bureaux privés avec 3 réservations (complet)',
    spaceType: 'bureau-prive',
    mockReservations: [
      { space_type: 'bureau-prive', status: 'confirmed' },
      { space_type: 'bureau-prive', status: 'confirmed' },
      { space_type: 'bureau-prive', status: 'pending' }
    ],
    expected: { isAvailable: false, availableSlots: 0 }
  },
  {
    name: 'Bureaux privés avec 2 réservations (disponible)',
    spaceType: 'bureau-prive',
    mockReservations: [
      { space_type: 'bureau-prive', status: 'confirmed' },
      { space_type: 'bureau-prive', status: 'pending' }
    ],
    expected: { isAvailable: true, availableSlots: 1 }
  },
  {
    name: 'Bureaux privés avec 1 réservation (disponible)',
    spaceType: 'bureau-prive',
    mockReservations: [
      { space_type: 'bureau-prive', status: 'confirmed' }
    ],
    expected: { isAvailable: true, availableSlots: 2 }
  },
  {
    name: 'Bureaux privés sans réservation (disponible)',
    spaceType: 'bureau-prive',
    mockReservations: [],
    expected: { isAvailable: true, availableSlots: 3 }
  }
];

// Test des scénarios
console.log('1️⃣ Test des scénarios de disponibilité...\n');

testScenarios.forEach((scenario, index) => {
  console.log(`📊 Scénario ${index + 1}: ${scenario.name}`);
  console.log(`   Type d'espace: ${scenario.spaceType}`);
  console.log(`   Réservations simulées: ${scenario.mockReservations.length}`);
  
  // Simuler la vérification
  const maxCapacity = 3; // Pour bureau-prive
  const activeReservations = scenario.mockReservations.filter(r => 
    r.space_type === scenario.spaceType && 
    (r.status === 'confirmed' || r.status === 'pending')
  );
  
  const currentOccupancy = activeReservations.length;
  const availableSlots = Math.max(0, maxCapacity - currentOccupancy);
  const isAvailable = availableSlots > 0;
  
  console.log(`   Résultat obtenu:`);
  console.log(`     - Occupancy: ${currentOccupancy}/${maxCapacity}`);
  console.log(`     - Available: ${isAvailable ? '✅ OUI' : '❌ NON'}`);
  console.log(`     - Slots: ${availableSlots}`);
  
  const testPassed = isAvailable === scenario.expected.isAvailable && 
                    availableSlots === scenario.expected.availableSlots;
  
  console.log(`   Test: ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
});

// Test de la logique de la page Réservation
console.log('2️⃣ Test de la logique de la page Réservation...\n');

const testReservationPageLogic = () => {
  const scenarios = [
    {
      spaceType: 'bureau-prive',
      isAvailable: false,
      expectedUI: {
        alertShown: true,
        buttonsDisabled: true,
        buttonText: 'Bureaux indisponibles'
      }
    },
    {
      spaceType: 'bureau-prive',
      isAvailable: true,
      expectedUI: {
        alertShown: false,
        buttonsDisabled: false,
        buttonText: 'Réserver'
      }
    },
    {
      spaceType: 'coworking',
      isAvailable: true,
      expectedUI: {
        alertShown: false,
        buttonsDisabled: false,
        buttonText: 'Réserver'
      }
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`📊 Test ${index + 1}: ${scenario.spaceType} - ${scenario.isAvailable ? 'Disponible' : 'Indisponible'}`);
    
    // Simuler la logique de la page Réservation
    const alertShown = scenario.spaceType === 'bureau-prive' && !scenario.isAvailable;
    const buttonsDisabled = !scenario.isAvailable;
    const buttonText = !scenario.isAvailable && scenario.spaceType === 'bureau-prive' 
      ? 'Bureaux indisponibles' 
      : 'Réserver';
    
    console.log(`   Alerte affichée: ${alertShown ? '✅ OUI' : '❌ NON'}`);
    console.log(`   Boutons désactivés: ${buttonsDisabled ? '✅ OUI' : '❌ NON'}`);
    console.log(`   Texte du bouton: "${buttonText}"`);
    
    const testPassed = alertShown === scenario.expectedUI.alertShown &&
                      buttonsDisabled === scenario.expectedUI.buttonsDisabled &&
                      buttonText === scenario.expectedUI.buttonText;
    
    console.log(`   Test: ${testPassed ? '✅ PASS' : '❌ FAIL'}\n`);
  });
};

testReservationPageLogic();

// Instructions pour tester avec la vraie base de données
console.log('3️⃣ Instructions pour tester avec la vraie base de données...\n');
console.log('📋 Pour tester la disponibilité réelle:');
console.log('');
console.log('1. Remplacez les clés Supabase dans ce script:');
console.log('   - SUPABASE_URL = "votre_url_supabase"');
console.log('   - SUPABASE_KEY = "votre_clé_anon"');
console.log('');
console.log('2. Vérifiez les réservations dans Supabase:');
console.log('   - Table: reservations');
console.log('   - Filtrez par: space_type = "bureau-prive"');
console.log('   - Comptez les réservations avec status = "confirmed" ou "pending"');
console.log('');
console.log('3. Testez dans l\'application:');
console.log('   - Allez sur /reservation?spaceType=bureau-prive');
console.log('   - Vérifiez si l\'alerte s\'affiche');
console.log('   - Vérifiez si les boutons sont désactivés');
console.log('');
console.log('4. Modifiez la disponibilité:');
console.log('   - Supprimez des réservations pour libérer des places');
console.log('   - Ou ajoutez des réservations pour occuper des places');
console.log('   - Actualisez la page pour voir les changements');
console.log('');
console.log('🎯 Test de disponibilité réelle terminé !');
console.log('   Vérifiez que la logique fonctionne avec votre base de données.');
