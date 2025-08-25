console.log('🧪 Test de la gestion de disponibilité des espaces - Nzoo Immo');
console.log('================================================================\n');

// Simulation des données d'espaces avec disponibilité
const testSpaces = {
  coworking: {
    title: 'Espace de Coworking',
    description: 'Un espace de travail collaboratif moderne',
    features: ['Wi-Fi', 'Bureau', 'Chaise'],
    dailyPrice: 25,
    monthlyPrice: 450,
    yearlyPrice: 4800,
    hourlyPrice: 5,
    maxOccupants: 20,
    imageUrl: '/images/spaces/coworking.jpg',
    isAvailable: true
  },
  'bureau-prive': {
    title: 'Bureau Privé',
    description: 'Un bureau privé et confortable',
    features: ['Bureau privé', 'Wi-Fi dédié'],
    dailyPrice: 50,
    monthlyPrice: 900,
    yearlyPrice: 9600,
    hourlyPrice: 10,
    maxOccupants: 4,
    imageUrl: '/images/spaces/bureau_prive.jpg',
    isAvailable: false // Test d'un espace indisponible
  },
  domiciliation: {
    title: 'Service de Domiciliation',
    description: 'Service complet de domiciliation',
    features: ['Adresse postale', 'Réception courrier'],
    dailyPrice: 0,
    monthlyPrice: 150,
    yearlyPrice: 1600,
    hourlyPrice: 0,
    maxOccupants: 1,
    imageUrl: '/images/spaces/domiciliation.jpg',
    isAvailable: true
  }
};

// Test 1: Filtrage des espaces disponibles
console.log('1️⃣ Test de filtrage des espaces disponibles...');
const availableSpaces = Object.entries(testSpaces)
  .filter(([key, space]) => space.isAvailable !== false)
  .map(([key, space]) => ({ key, title: space.title, isAvailable: space.isAvailable }));

console.log('Espaces disponibles:', availableSpaces);
console.log(`✅ ${availableSpaces.length} espaces disponibles sur ${Object.keys(testSpaces).length} total\n`);

// Test 2: Vérification de la logique de disponibilité
console.log('2️⃣ Test de la logique de disponibilité...');
const testCases = [
  { isAvailable: true, expected: true, description: 'Explicitement disponible' },
  { isAvailable: false, expected: false, description: 'Explicitement indisponible' },
  { isAvailable: undefined, expected: true, description: 'Non défini (par défaut disponible)' },
  { isAvailable: null, expected: true, description: 'Null (par défaut disponible)' }
];

testCases.forEach((testCase, index) => {
  const result = testCase.isAvailable !== false;
  const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
  console.log(`   ${index + 1}. ${testCase.description}: ${status}`);
  console.log(`      isAvailable: ${testCase.isAvailable} → Résultat: ${result} (attendu: ${testCase.expected})`);
});
console.log('');

// Test 3: Simulation de l'interface utilisateur
console.log('3️⃣ Simulation de l\'interface utilisateur...');
console.log('Dans l\'éditeur de contenu:');
Object.entries(testSpaces).forEach(([key, space]) => {
  const status = space.isAvailable !== false ? '🟢 Disponible' : '🔴 Indisponible';
  console.log(`   - ${space.title}: ${status}`);
});

console.log('\nDans la page de réservation:');
const reservationSpaces = Object.entries(testSpaces)
  .filter(([key, space]) => space.isAvailable !== false)
  .map(([key, space]) => space.title);
console.log(`   Espaces affichés: ${reservationSpaces.join(', ')}`);
console.log('');

// Test 4: Validation des données
console.log('4️⃣ Validation des données...');
let validationPassed = true;

Object.entries(testSpaces).forEach(([key, space]) => {
  // Vérifier que tous les champs requis sont présents
  const requiredFields = ['title', 'description', 'features', 'dailyPrice', 'monthlyPrice', 'yearlyPrice', 'hourlyPrice', 'maxOccupants'];
  const missingFields = requiredFields.filter(field => !(field in space));
  
  if (missingFields.length > 0) {
    console.log(`   ❌ ${space.title}: Champs manquants: ${missingFields.join(', ')}`);
    validationPassed = false;
  } else {
    console.log(`   ✅ ${space.title}: Tous les champs requis présents`);
  }
  
  // Vérifier que isAvailable est un booléen ou undefined
  if (space.isAvailable !== undefined && typeof space.isAvailable !== 'boolean') {
    console.log(`   ❌ ${space.title}: isAvailable doit être un booléen ou undefined`);
    validationPassed = false;
  }
});

console.log(`\nValidation globale: ${validationPassed ? '✅ PASS' : '❌ FAIL'}`);
console.log('');

// Test 5: Simulation de sauvegarde en base de données
console.log('5️⃣ Simulation de sauvegarde en base de données...');
const dbFormat = Object.entries(testSpaces).map(([key, space]) => ({
  space_key: key,
  language: 'fr',
  title: space.title,
  description: space.description,
  features: space.features,
  daily_price: space.dailyPrice,
  monthly_price: space.monthlyPrice,
  yearly_price: space.yearlyPrice,
  hourly_price: space.hourlyPrice,
  max_occupants: space.maxOccupants,
  image_url: space.imageUrl,
  is_available: space.isAvailable !== false
}));

console.log('Format base de données:');
dbFormat.forEach(space => {
  console.log(`   - ${space.space_key}: is_available = ${space.is_available}`);
});
console.log('');

// Résumé
console.log('🎯 Résumé du test:');
console.log(`   - Espaces testés: ${Object.keys(testSpaces).length}`);
console.log(`   - Espaces disponibles: ${availableSpaces.length}`);
console.log(`   - Espaces indisponibles: ${Object.keys(testSpaces).length - availableSpaces.length}`);
console.log(`   - Validation: ${validationPassed ? '✅ Réussie' : '❌ Échouée'}`);
console.log('');
console.log('📋 Instructions pour tester manuellement:');
console.log('   1. Aller sur Dashboard → Espaces → Éditer le contenu');
console.log('   2. Cliquer sur "Modifier" pour un espace');
console.log('   3. Basculer le switch de disponibilité');
console.log('   4. Sauvegarder les modifications');
console.log('   5. Aller sur la page Réservations');
console.log('   6. Vérifier que l\'espace indisponible n\'apparaît plus');
console.log('');
console.log('✅ Test terminé !');
