// Test des règles d'annulation automatique des réservations

// Simulation des règles d'annulation
const RESERVATION_RULES = [
  {
    id: 'pending_expiration',
    name: 'Expiration des réservations en attente',
    condition: (reservation, today) => {
      if (reservation.status !== 'pending') return false;
      
      const endDate = new Date(reservation.end_date);
      const expirationDate = new Date(today);
      expirationDate.setHours(expirationDate.getHours() + 48); // +48 heures
      
      return endDate > expirationDate;
    },
    action: 'cancelled',
    reason: 'Réservation annulée automatiquement: dépassement de la date limite de 48h'
  },
  {
    id: 'confirmed_completion',
    name: 'Completion des réservations confirmées',
    condition: (reservation, today) => {
      if (reservation.status !== 'confirmed') return false;
      
      const endDate = new Date(reservation.end_date);
      const completionDate = new Date(today);
      completionDate.setDate(completionDate.getDate() - 1); // -1 jour
      
      return endDate < completionDate;
    },
    action: 'completed',
    reason: 'Réservation terminée automatiquement: période de réservation écoulée'
  },
  {
    id: 'pending_payment_timeout',
    name: 'Timeout de paiement des réservations en attente',
    condition: (reservation, today) => {
      if (reservation.status !== 'pending') return false;
      
      const createdDate = new Date(reservation.created_at);
      const timeoutDate = new Date(today);
      timeoutDate.setDate(timeoutDate.getDate() - 3); // -3 jours
      
      return createdDate < timeoutDate;
    },
    action: 'cancelled',
    reason: 'Réservation annulée automatiquement: dépassement du délai de paiement de 3 jours'
  }
];

// Fonction pour tester les règles
function testReservationRules(reservation, today) {
  for (const rule of RESERVATION_RULES) {
    if (rule.condition(reservation, today)) {
      return {
        applied: true,
        rule: rule.name,
        action: rule.action,
        reason: rule.reason
      };
    }
  }
  return { applied: false };
}

// Tests
const today = new Date('2025-01-15');
console.log('🧪 Tests des règles d\'annulation automatique');
console.log('Date de référence:', today.toISOString().split('T')[0]);
console.log('');

const testCases = [
  {
    name: 'Réservation en attente avec date de fin dans 49h (doit être annulée)',
    reservation: {
      id: 'test1',
      status: 'pending',
      end_date: '2025-01-17T10:00:00Z', // 49h après aujourd'hui
      created_at: '2025-01-14T10:00:00Z'
    },
    expectedAction: 'cancelled',
    expectedRule: 'pending_expiration'
  },
  {
    name: 'Réservation confirmée avec date de fin hier (doit être terminée)',
    reservation: {
      id: 'test2',
      status: 'confirmed',
      end_date: '2025-01-14T10:00:00Z', // hier
      created_at: '2025-01-10T10:00:00Z'
    },
    expectedAction: 'completed',
    expectedRule: 'confirmed_completion'
  },
  {
    name: 'Réservation en attente créée il y a 4 jours (doit être annulée)',
    reservation: {
      id: 'test3',
      status: 'pending',
      end_date: '2025-01-20T10:00:00Z',
      created_at: '2025-01-11T10:00:00Z' // 4 jours avant
    },
    expectedAction: 'cancelled',
    expectedRule: 'pending_payment_timeout'
  },
  {
    name: 'Réservation en attente créée aujourd\'hui (ne doit PAS être annulée)',
    reservation: {
      id: 'test4',
      status: 'pending',
      end_date: '2025-01-20T10:00:00Z',
      created_at: '2025-01-15T10:00:00Z' // aujourd'hui
    },
    expectedAction: null,
    expectedRule: null
  },
  {
    name: 'Réservation confirmée avec date de fin demain (ne doit PAS être terminée)',
    reservation: {
      id: 'test5',
      status: 'confirmed',
      end_date: '2025-01-16T10:00:00Z', // demain
      created_at: '2025-01-10T10:00:00Z'
    },
    expectedAction: null,
    expectedRule: null
  }
];

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Réservation: ${testCase.reservation.status} - Fin: ${testCase.reservation.end_date.split('T')[0]} - Créée: ${testCase.reservation.created_at.split('T')[0]}`);
  
  const result = testReservationRules(testCase.reservation, today);
  
  if (result.applied) {
    console.log(`   ✅ Règle appliquée: ${result.rule}`);
    console.log(`   Action: ${result.action}`);
    console.log(`   Raison: ${result.reason}`);
    
    if (result.action === testCase.expectedAction) {
      console.log(`   ✅ CORRECT - Action attendue: ${testCase.expectedAction}`);
    } else {
      console.log(`   ❌ INCORRECT - Action attendue: ${testCase.expectedAction}, obtenue: ${result.action}`);
    }
  } else {
    console.log(`   ℹ️ Aucune règle appliquée`);
    
    if (testCase.expectedAction === null) {
      console.log(`   ✅ CORRECT - Aucune action attendue`);
    } else {
      console.log(`   ❌ INCORRECT - Action attendue: ${testCase.expectedAction}`);
    }
  }
  
  console.log('');
});

console.log('✅ Tests terminés !');
