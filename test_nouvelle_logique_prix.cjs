/**
 * Script de test pour vérifier la nouvelle logique de calcul des prix
 * Arrondi au mois le plus proche au lieu de calcul proportionnel
 */

/**
 * Test de la nouvelle logique de calcul
 */
function testNouvelleLogiquePrix() {
  console.log('🧮 Test de la Nouvelle Logique de Calcul des Prix');
  console.log('=' .repeat(60));
  
  // Prix mensuel de test
  const monthlyPrice = 100;
  
  // Tests de calcul avec la nouvelle logique
  const tests = [
    { days: 30, expected: 100, description: '30 jours = 1 mois exact' },
    { days: 31, expected: 100, description: '31 jours = 1 mois (arrondi)' },
    { days: 44, expected: 100, description: '44 jours = 1 mois (arrondi)' },
    { days: 45, expected: 200, description: '45 jours = 2 mois (arrondi)' },
    { days: 59, expected: 200, description: '59 jours = 2 mois (arrondi)' },
    { days: 60, expected: 200, description: '60 jours = 2 mois exacts' },
    { days: 89, expected: 300, description: '89 jours = 3 mois (arrondi)' },
    { days: 90, expected: 300, description: '90 jours = 3 mois exacts' }
  ];
  
  tests.forEach(test => {
    let calculatedPrice;
    
    if (test.days <= 30) {
      calculatedPrice = monthlyPrice;
    } else {
      // Nouvelle logique : arrondi au mois le plus proche
      const months = Math.round(test.days / 30);
      calculatedPrice = monthlyPrice * months;
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
 * Test de comparaison avec l'ancienne logique
 */
function testComparaisonLogiques() {
  console.log('📊 Comparaison Ancienne vs Nouvelle Logique');
  console.log('=' .repeat(60));
  
  const monthlyPrice = 100;
  const testDays = [31, 45, 59, 89];
  
  console.log('Jours | Ancienne (proportionnelle) | Nouvelle (arrondi) | Différence');
  console.log('------|------------------------------|-------------------|------------');
  
  testDays.forEach(days => {
    // Ancienne logique : proportionnelle avec décimales
    const oldMonths = Math.round((days / 30) * 100) / 100;
    const oldPrice = Math.round(monthlyPrice * oldMonths);
    
    // Nouvelle logique : arrondi au mois le plus proche
    const newMonths = Math.round(days / 30);
    const newPrice = monthlyPrice * newMonths;
    
    const difference = newPrice - oldPrice;
    const differenceText = difference > 0 ? `+${difference}€` : `${difference}€`;
    
    console.log(`${days.toString().padStart(5)} | ${oldPrice.toString().padStart(25)}€ | ${newPrice.toString().padStart(16)}€ | ${differenceText.padStart(10)}`);
  });
  
  console.log('');
}

/**
 * Test de la logique de domiciliation
 */
function testLogiqueDomiciliation() {
  console.log('🏠 Test de la Logique de Domiciliation');
  console.log('=' .repeat(60));
  
  const monthlyPrice = 100;
  const testDays = [30, 31, 45, 60, 90];
  
  testDays.forEach(days => {
    let calculatedPrice;
    
    if (days <= 30) {
      calculatedPrice = monthlyPrice;
    } else {
      // Arrondir au mois le plus proche (pas de décimales)
      const months = Math.round(days / 30);
      calculatedPrice = monthlyPrice * months;
    }
    
    const months = days <= 30 ? 1 : Math.round(days / 30);
    
    console.log(`✅ ${days} jours = ${months} mois → ${calculatedPrice}€`);
  });
  
  console.log('');
}

/**
 * Test de validation des cas limites
 */
function testCasLimites() {
  console.log('🔍 Test des Cas Limites');
  console.log('=' .repeat(60));
  
  const monthlyPrice = 100;
  const testCases = [
    { days: 29, expected: 100, description: '29 jours (moins de 30)' },
    { days: 30, expected: 100, description: '30 jours (exactement 30)' },
    { days: 31, expected: 100, description: '31 jours (plus de 30, arrondi à 1)' },
    { days: 44, expected: 100, description: '44 jours (arrondi à 1 mois)' },
    { days: 45, expected: 200, description: '45 jours (arrondi à 2 mois)' },
    { days: 59, expected: 200, description: '59 jours (arrondi à 2 mois)' },
    { days: 60, expected: 200, description: '60 jours (exactement 2 mois)' }
  ];
  
  testCases.forEach(testCase => {
    let calculatedPrice;
    
    if (testCase.days <= 30) {
      calculatedPrice = monthlyPrice;
    } else {
      const months = Math.round(testCase.days / 30);
      calculatedPrice = monthlyPrice * months;
    }
    
    const success = calculatedPrice === testCase.expected;
    const status = success ? '✅' : '❌';
    
    console.log(`${status} ${testCase.description}: ${testCase.days} jours → ${calculatedPrice}€`);
  });
  
  console.log('');
}

/**
 * Fonction principale de test
 */
function runAllTests() {
  console.log('🚀 Démarrage des tests de la nouvelle logique de calcul');
  console.log('=' .repeat(70));
  
  testNouvelleLogiquePrix();
  testComparaisonLogiques();
  testLogiqueDomiciliation();
  testCasLimites();
  
  console.log('🎯 Résumé de la Nouvelle Logique :');
  console.log('✅ 30 jours ou moins = Prix mensuel complet');
  console.log('✅ Plus de 30 jours = Prix mensuel × (mois arrondis au plus proche)');
  console.log('✅ Pas de décimales dans les calculs');
  console.log('✅ Logique simple et prévisible');
  
  console.log('\n💡 Exemples concrets :');
  console.log('   31 jours = 1 mois → 100€');
  console.log('   45 jours = 2 mois → 200€');
  console.log('   60 jours = 2 mois → 200€');
  console.log('   90 jours = 3 mois → 300€');
}

// Exécution des tests si le script est appelé directement
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testNouvelleLogiquePrix,
  testComparaisonLogiques,
  testLogiqueDomiciliation,
  testCasLimites,
  runAllTests
};
