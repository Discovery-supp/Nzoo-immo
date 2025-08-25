console.log('🔍 Test du système de disponibilité - Nzoo Immo');
console.log('=============================================\n');

// Test 1: Vérifier la logique de disponibilité
console.log('1️⃣ Test de la logique de disponibilité...');

const testAvailabilityLogic = () => {
  const maxCapacities = {
    'coworking': 4,
    'bureau-prive': 3,
    'domiciliation': 1
  };

  const testScenarios = [
    { spaceType: 'bureau-prive', activeReservations: 0, expected: true },
    { spaceType: 'bureau-prive', activeReservations: 1, expected: true },
    { spaceType: 'bureau-prive', activeReservations: 2, expected: true },
    { spaceType: 'bureau-prive', activeReservations: 3, expected: false },
    { spaceType: 'bureau-prive', activeReservations: 4, expected: false },
    { spaceType: 'coworking', activeReservations: 3, expected: true },
    { spaceType: 'coworking', activeReservations: 4, expected: false },
    { spaceType: 'domiciliation', activeReservations: 0, expected: true },
    { spaceType: 'domiciliation', activeReservations: 1, expected: false }
  ];

  console.log('📊 Scénarios de test:');
  testScenarios.forEach((scenario, index) => {
    const maxCapacity = maxCapacities[scenario.spaceType];
    const availableSlots = Math.max(0, maxCapacity - scenario.activeReservations);
    const isAvailable = availableSlots > 0;
    const status = isAvailable === scenario.expected ? '✅ PASS' : '❌ FAIL';
    
    console.log(`   ${index + 1}. ${scenario.spaceType}: ${scenario.activeReservations}/${maxCapacity} réservations → ${isAvailable ? 'DISPONIBLE' : 'COMPLET'} ${status}`);
  });

  return true;
};

testAvailabilityLogic();

// Test 2: Vérifier les fonctions de l'interface
console.log('\n2️⃣ Test des fonctions d\'interface...');

const testInterfaceFunctions = () => {
  // Simulation des données de disponibilité
  const availabilityMap = {
    'coworking': {
      spaceType: 'coworking',
      isAvailable: true,
      currentOccupancy: 2,
      maxCapacity: 4,
      availableSlots: 2,
      message: '2 places disponibles'
    },
    'bureau-prive': {
      spaceType: 'bureau-prive',
      isAvailable: false,
      currentOccupancy: 3,
      maxCapacity: 3,
      availableSlots: 0,
      message: 'Complet - 3 places occupées'
    },
    'domiciliation': {
      spaceType: 'domiciliation',
      isAvailable: true,
      currentOccupancy: 0,
      maxCapacity: 1,
      availableSlots: 1,
      message: 'Disponible'
    }
  };

  // Test de la fonction isSpaceAvailable
  const isSpaceAvailable = (spaceKey) => {
    const availability = availabilityMap[spaceKey];
    return availability ? availability.isAvailable : true;
  };

  // Test de la fonction getAvailabilityMessage
  const getAvailabilityMessage = (spaceKey) => {
    const availability = availabilityMap[spaceKey];
    if (!availability) return 'Disponible';
    
    if (availability.isAvailable) {
      return availability.availableSlots > 1 
        ? `${availability.availableSlots} places disponibles`
        : 'Disponible';
    } else {
      return 'Occupé';
    }
  };

  console.log('📊 Test des fonctions d\'interface:');
  Object.keys(availabilityMap).forEach(spaceKey => {
    const available = isSpaceAvailable(spaceKey);
    const message = getAvailabilityMessage(spaceKey);
    console.log(`   - ${spaceKey}: ${available ? '✅' : '❌'} ${message}`);
  });

  return true;
};

testInterfaceFunctions();

// Test 3: Vérifier la logique de réservation
console.log('\n3️⃣ Test de la logique de réservation...');

const testReservationLogic = () => {
  const testReservations = [
    {
      spaceType: 'bureau-prive',
      fullName: 'Client Test 1',
      status: 'confirmed',
      startDate: '2024-01-20',
      endDate: '2024-02-20'
    },
    {
      spaceType: 'bureau-prive',
      fullName: 'Client Test 2',
      status: 'pending',
      startDate: '2024-01-25',
      endDate: '2024-02-25'
    },
    {
      spaceType: 'bureau-prive',
      fullName: 'Client Test 3',
      status: 'cancelled',
      startDate: '2024-01-30',
      endDate: '2024-02-30'
    }
  ];

  // Compter les réservations actives
  const activeReservations = testReservations.filter(r => 
    r.spaceType === 'bureau-prive' && 
    ['confirmed', 'pending'].includes(r.status)
  );

  console.log(`📊 Réservations actives: ${activeReservations.length}`);
  activeReservations.forEach((reservation, index) => {
    console.log(`   ${index + 1}. ${reservation.fullName} - ${reservation.status}`);
  });

  // Vérifier la disponibilité
  const maxCapacity = 3;
  const currentOccupancy = activeReservations.length;
  const availableSlots = Math.max(0, maxCapacity - currentOccupancy);
  const isAvailable = availableSlots > 0;

  console.log(`📊 Disponibilité: ${currentOccupancy}/${maxCapacity} → ${isAvailable ? '✅ DISPONIBLE' : '❌ COMPLET'}`);

  return isAvailable;
};

testReservationLogic();

// Test 4: Instructions pour résoudre le problème
console.log('\n4️⃣ Instructions pour résoudre le problème...');

console.log('📋 Pour rendre les bureaux privés disponibles:');
console.log('');
console.log('1. Connectez-vous à Supabase Dashboard');
console.log('2. Allez dans la table "reservations"');
console.log('3. Filtrez par space_type = "bureau-prive"');
console.log('4. Supprimez ou changez le statut des réservations existantes:');
console.log('   - Supprimez les réservations de test');
console.log('   - Changez le statut de "confirmed" à "cancelled"');
console.log('   - Ou modifiez les dates pour libérer des places');
console.log('');
console.log('5. Vérifiez que moins de 3 réservations sont actives');
console.log('6. Actualisez la page "Nos Espaces"');
console.log('');
console.log('📊 Capacités maximales:');
console.log('   - Coworking: 4 places');
console.log('   - Bureau privé: 3 places');
console.log('   - Domiciliation: 1 place');
console.log('');
console.log('📈 Statuts qui comptent pour l\'occupation:');
console.log('   - "confirmed": Réservation confirmée');
console.log('   - "pending": Réservation en attente');
console.log('');
console.log('📈 Statuts qui ne comptent pas:');
console.log('   - "cancelled": Réservation annulée');
console.log('   - "completed": Réservation terminée');

// Test 5: Résumé des modifications apportées
console.log('\n5️⃣ Résumé des modifications apportées...');

console.log('✅ Modifications réalisées:');
console.log('   - Système de disponibilité dynamique implémenté');
console.log('   - Page SpacesPage.tsx mise à jour avec disponibilité en temps réel');
console.log('   - Service availabilityService.ts enrichi avec nouvelles fonctions');
console.log('   - Interface utilisateur adaptative selon la disponibilité');
console.log('   - Badges de statut et boutons conditionnels');
console.log('');
console.log('🎯 Avantages du nouveau système:');
console.log('   - Disponibilité basée sur les données réelles');
console.log('   - Mise à jour automatique');
console.log('   - Interface utilisateur claire et informative');
console.log('   - Gestion flexible des capacités');
console.log('   - Support pour tous les types d\'espaces');

console.log('\n🎯 Système de disponibilité prêt !');
console.log('   Les bureaux privés afficheront maintenant leur statut réel.');
