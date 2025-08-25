console.log('🔍 Diagnostic de l\'enregistrement - Nzoo Immo');
console.log('==========================================\n');

// Test 1: Vérifier la logique de validation
console.log('1️⃣ Test de la logique de validation...');

const validateStep = (step, formData, selectedDates, selectedPaymentMethod, needsDateSelection) => {
  switch (step) {
    case 1:
      if (needsDateSelection) {
        return selectedDates !== null;
      }
      return true;
    case 2:
      const basicValidation = formData.fullName && formData.email && formData.phone;
      return basicValidation; // Plus de condition d'acceptation du contrat
    case 3:
      return selectedPaymentMethod !== null;
    default:
      return true;
  }
};

// Test avec des données simulées
const testFormData = {
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  contractAccepted: false // Test sans accepter le contrat
};

const testValidation = validateStep(2, testFormData, null, null, false);
console.log(`✅ Validation étape 2: ${testValidation ? 'PASS' : 'FAIL'}`);

// Test 2: Vérifier la logique de création des données de réservation
console.log('\n2️⃣ Test de la logique de création des données...');

const createReservationData = (formData, selectedSpace, selectedDates, selectedPaymentMethod, needsDateSelection) => {
  const mappedSpaceType = selectedSpace === 'bureau-prive' ? 'bureau_prive' : selectedSpace;
  
  return {
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    company: formData.company,
    activity: formData.activity,
    address: formData.address,
    spaceType: mappedSpaceType,
    startDate: needsDateSelection ? '2024-01-20' : '2024-01-20', // Date par défaut
    endDate: needsDateSelection ? '2024-01-20' : '2024-01-20', // Date par défaut
    occupants: formData.occupants || 1,
    subscriptionType: formData.subscriptionType || 'monthly',
    amount: 150.00,
    paymentMethod: selectedPaymentMethod,
    transactionId: `${selectedPaymentMethod.toUpperCase()}_${Date.now()}`,
    contract_accepted: formData.contractAccepted || false,
    selected_months: formData.selectedMonths || 1,
  };
};

const testReservationData = createReservationData(
  testFormData,
  'service-juridique',
  null,
  'orange_money',
  false
);

console.log('✅ Données de réservation créées:');
console.log('   - contract_accepted:', testReservationData.contract_accepted);
console.log('   - selected_months:', testReservationData.selected_months);
console.log('   - spaceType:', testReservationData.spaceType);

// Test 3: Vérifier les types d'offres
console.log('\n3️⃣ Test des types d\'offres...');

const OFFERS_WITH_DATES = ['coworking', 'bureau-prive', 'bureau_prive', 'salle-reunion'];
const OFFERS_WITHOUT_DATES = ['domiciliation', 'service-juridique', 'service-comptable'];

const requiresDateSelection = (spaceType) => OFFERS_WITH_DATES.includes(spaceType);
const requiresContract = (spaceType) => OFFERS_WITHOUT_DATES.includes(spaceType);

console.log('✅ Offres avec dates:', OFFERS_WITH_DATES);
console.log('✅ Offres sans dates:', OFFERS_WITHOUT_DATES);

const testOffers = ['coworking', 'service-juridique', 'service-comptable', 'domiciliation'];
testOffers.forEach(offer => {
  console.log(`   - ${offer}: dates=${requiresDateSelection(offer)}, contrat=${requiresContract(offer)}`);
});

// Test 4: Simulation du processus complet
console.log('\n4️⃣ Simulation du processus complet...');

const simulateReservationProcess = (spaceType, formData, paymentMethod) => {
  const needsDates = requiresDateSelection(spaceType);
  const needsContract = requiresContract(spaceType);
  
  console.log(`\n📋 Simulation pour ${spaceType}:`);
  console.log(`   - Nécessite des dates: ${needsDates}`);
  console.log(`   - Nécessite un contrat: ${needsContract}`);
  
  // Validation étape 1
  const step1Valid = !needsDates || (needsDates && selectedDates !== null);
  console.log(`   - Étape 1 valide: ${step1Valid}`);
  
  // Validation étape 2
  const step2Valid = formData.fullName && formData.email && formData.phone;
  console.log(`   - Étape 2 valide: ${step2Valid}`);
  
  // Validation étape 3
  const step3Valid = paymentMethod !== null;
  console.log(`   - Étape 3 valide: ${step3Valid}`);
  
  // Création des données
  const reservationData = createReservationData(
    formData,
    spaceType,
    null,
    paymentMethod,
    needsDates
  );
  
  console.log(`   - Données créées: ${Object.keys(reservationData).length} champs`);
  console.log(`   - contract_accepted: ${reservationData.contract_accepted}`);
  console.log(`   - selected_months: ${reservationData.selected_months}`);
  
  return step1Valid && step2Valid && step3Valid;
};

const selectedDates = null; // Simulation sans dates sélectionnées
const paymentMethod = 'orange_money';

const testResults = testOffers.map(offer => ({
  offer,
  success: simulateReservationProcess(offer, testFormData, paymentMethod)
}));

console.log('\n📊 Résultats des tests:');
testResults.forEach(result => {
  console.log(`   - ${result.offer}: ${result.success ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
});

// Test 5: Identification des problèmes potentiels
console.log('\n5️⃣ Identification des problèmes potentiels...');

const potentialIssues = [];

// Vérifier si les colonnes manquantes sont le problème
potentialIssues.push({
  issue: 'Colonnes manquantes dans la base de données',
  description: 'Les colonnes contract_accepted, selected_months, subscription_type n\'existent pas',
  solution: 'Exécuter la migration SQL dans Supabase',
  priority: 'HAUTE'
});

// Vérifier si la validation bloque
if (!testValidation) {
  potentialIssues.push({
    issue: 'Validation trop stricte',
    description: 'La validation empêche le passage à l\'étape suivante',
    solution: 'Vérifier la fonction validateStep',
    priority: 'MOYENNE'
  });
}

// Vérifier si les données ne sont pas créées correctement
if (!testReservationData.contract_accepted && !testReservationData.selected_months) {
  potentialIssues.push({
    issue: 'Données de réservation incomplètes',
    description: 'Les champs contract_accepted et selected_months ne sont pas définis',
    solution: 'Vérifier la fonction createReservationData',
    priority: 'MOYENNE'
  });
}

console.log('🚨 Problèmes identifiés:');
potentialIssues.forEach((issue, index) => {
  console.log(`   ${index + 1}. ${issue.issue} (${issue.priority})`);
  console.log(`      Description: ${issue.description}`);
  console.log(`      Solution: ${issue.solution}`);
});

// Recommandations
console.log('\n💡 Recommandations:');
console.log('   1. Appliquer la migration SQL dans Supabase immédiatement');
console.log('   2. Vérifier que les colonnes existent dans la table reservations');
console.log('   3. Tester avec une réservation simple (coworking)');
console.log('   4. Vérifier les erreurs dans la console du navigateur');

console.log('\n🎯 Action immédiate requise:');
console.log('   Exécuter ce script SQL dans Supabase:');
console.log(`
-- MIGRATION URGENTE
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS contract_accepted boolean DEFAULT false;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS selected_months integer;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS subscription_type text DEFAULT 'daily';
`);
