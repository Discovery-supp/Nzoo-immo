// Script de test pour les nouvelles règles d'annulation automatique
// Teste les 3 règles : 4 jours pour timeout, 12h pour completion et expiration

console.log('🧪 Test des nouvelles règles d\'annulation automatique...\n');

// Nouvelles règles d'annulation
const NEW_RULES = {
  pendingCreationDays: 4,        // 4 jours pour le timeout de paiement
  confirmedCompletionHours: 12,  // 12 heures pour la completion
  pendingExpirationHours: 12     // 12 heures pour l'expiration
};

// Fonction pour tester les nouvelles règles
function testNewRules() {
  console.log('🧪 Test des nouvelles règles d\'annulation...\n');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculer les dates de référence selon les nouvelles règles
  const pendingCreationDate = new Date(today);
  pendingCreationDate.setDate(pendingCreationDate.getDate() - NEW_RULES.pendingCreationDays);

  const confirmedCompletionDate = new Date(today);
  confirmedCompletionDate.setHours(confirmedCompletionDate.getHours() + NEW_RULES.confirmedCompletionHours);

  const pendingExpirationDate = new Date(today);
  pendingExpirationDate.setHours(pendingExpirationDate.getHours() + NEW_RULES.pendingExpirationHours);

  console.log('📅 Dates de référence calculées:');
  console.log(`   Aujourd'hui: ${today.toISOString()}`);
  console.log(`   Timeout (pending): ${pendingCreationDate.toISOString()}`);
  console.log(`   Completion (confirmed): ${confirmedCompletionDate.toISOString()}`);
  console.log(`   Expiration (pending): ${pendingExpirationDate.toISOString()}\n`);

  // Cas de test
  const testCases = [
    {
      name: 'Règle 1: Réservation en attente - créée il y a 5 jours (doit être annulée)',
      reservation: {
        status: 'pending',
        start_date: today.toISOString(),
        end_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'cancelled',
      rule: 'pending_creation_timeout'
    },
    {
      name: 'Règle 1: Réservation en attente - créée il y a 3 jours (ne doit PAS être annulée)',
      reservation: {
        status: 'pending',
        start_date: today.toISOString(),
        end_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'none',
      rule: 'pending_creation_timeout'
    },
    {
      name: 'Règle 2: Réservation confirmée - date de fin dans 11h (doit être terminée)',
      reservation: {
        status: 'confirmed',
        start_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'completed',
      rule: 'confirmed_completion'
    },
    {
      name: 'Règle 2: Réservation confirmée - date de fin dans 13h (ne doit PAS être terminée)',
      reservation: {
        status: 'confirmed',
        start_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(today.getTime() + 13 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'none',
      rule: 'confirmed_completion'
    },
    {
      name: 'Règle 3: Réservation en attente - date de fin dans 11h (doit être annulée)',
      reservation: {
        status: 'pending',
        start_date: today.toISOString(),
        end_date: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'cancelled',
      rule: 'pending_expiration'
    },
    {
      name: 'Règle 3: Réservation en attente - date de fin dans 13h (ne doit PAS être annulée)',
      reservation: {
        status: 'pending',
        start_date: today.toISOString(),
        end_date: new Date(today.getTime() + 13 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      expectedAction: 'none',
      rule: 'pending_expiration'
    }
  ];

  // Tester chaque cas
  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`   Règle: ${testCase.rule}`);
    console.log(`   Action attendue: ${testCase.expectedAction}`);
    
    // Appliquer la logique de test
    let actualAction = 'none';
    
    if (testCase.reservation.status === 'pending') {
      const endDate = new Date(testCase.reservation.end_date);
      const createdDate = new Date(testCase.reservation.created_at);
      
      // Règle 1: Timeout de création (4 jours)
      if (createdDate < pendingCreationDate) {
        actualAction = 'cancelled';
      }
      // Règle 3: Expiration (12h) - seulement si pas déjà annulée par la règle 1
      else if (endDate <= pendingExpirationDate) {
        actualAction = 'cancelled';
      }
    } else if (testCase.reservation.status === 'confirmed') {
      const endDate = new Date(testCase.reservation.end_date);
      
      // Règle 2: Completion (12h)
      if (endDate <= confirmedCompletionDate) {
        actualAction = 'completed';
      }
    }
    
    console.log(`   Action réelle: ${actualAction}`);
    
    const testPassed = actualAction === testCase.expectedAction;
    if (testPassed) {
      console.log(`   ✅ Test réussi\n`);
      passedTests++;
    } else {
      console.log(`   ❌ Test échoué\n`);
    }
  }

  console.log(`📊 Résultats: ${passedTests}/${totalTests} tests réussis`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Toutes les nouvelles règles fonctionnent correctement !');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la logique.');
  }
}

// Fonction pour afficher un résumé des nouvelles règles
function showRulesSummary() {
  console.log('📋 Résumé des nouvelles règles d\'annulation:\n');
  
  console.log('🔴 Règle 1: Timeout de création des réservations en attente');
  console.log('   • Condition: créée il y a plus de 4 jours');
  console.log('   • Action: status = "cancelled"');
  console.log('   • Raison: "Réservation annulée automatiquement: créée il y a plus de 4 jours"\n');
  
  console.log('🟢 Règle 2: Completion des réservations confirmées');
  console.log('   • Condition: date de fin <= aujourd\'hui + 12h');
  console.log('   • Action: status = "completed"');
  console.log('   • Raison: "Réservation terminée automatiquement: période de réservation écoulée (12h)"\n');
  
  console.log('🟡 Règle 3: Expiration des réservations en attente');
  console.log('   • Condition: date de fin <= aujourd\'hui + 12h');
  console.log('   • Action: status = "cancelled"');
  console.log('   • Raison: "Réservation annulée automatiquement: dépassement de la date limite de 12h"\n');
  
  console.log('⚙️ Configuration par défaut:');
  console.log(`   • pendingCreationDays: ${NEW_RULES.pendingCreationDays}`);
  console.log(`   • confirmedCompletionHours: ${NEW_RULES.confirmedCompletionHours}`);
  console.log(`   • pendingExpirationHours: ${NEW_RULES.pendingExpirationHours}\n`);
}

// Exécuter les tests
function runTests() {
  console.log('🚀 Démarrage des tests des nouvelles règles d\'annulation\n');
  
  showRulesSummary();
  testNewRules();
  
  console.log('\n✨ Tests terminés');
}

// Exécuter si le script est appelé directement
if (require.main === module) {
  runTests();
}

module.exports = { testNewRules, showRulesSummary, NEW_RULES };
