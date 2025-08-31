/**
 * Script de test pour l'annulation automatique des réservations en cash
 * Ce script simule l'appel à la fonction Edge Function d'annulation automatique
 */

const SUPABASE_URL = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

async function testAutoCancellation() {
  console.log('🧪 [TEST] Test de l\'annulation automatique des réservations en cash...');
  
  try {
    // Appeler la fonction Edge Function d'annulation automatique
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auto-cancel-cash-reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [TEST] Erreur HTTP:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ [TEST] Résultat de l\'annulation automatique:', result);
    
    if (result.success) {
      console.log(`📊 [TEST] ${result.cancelledCount} réservations annulées`);
      console.log(`❌ [TEST] ${result.errorCount} erreurs`);
      
      if (result.cancelledReservations && result.cancelledReservations.length > 0) {
        console.log('📋 [TEST] Réservations annulées:');
        result.cancelledReservations.forEach((reservation, index) => {
          console.log(`  ${index + 1}. ${reservation.transaction_id} - ${reservation.full_name} (${reservation.email})`);
        });
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log('⚠️ [TEST] Erreurs rencontrées:');
        result.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. Réservation ${error.reservation_id}: ${error.error}`);
        });
      }
    } else {
      console.error('❌ [TEST] Échec de l\'annulation automatique:', result.error);
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test:', error);
  }
}

// Fonction pour créer une réservation de test en cash (pour tester le système)
async function createTestCashReservation() {
  console.log('🧪 [TEST] Création d\'une réservation de test en cash...');
  
  try {
    // Créer une réservation avec une date de création de 6 jours en arrière (pour déclencher l'annulation)
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    
    const testReservation = {
      full_name: 'Client Test Auto-Cancel',
      email: 'test.autocancel@example.com',
      phone: '+243000000000',
      company: 'Entreprise Test',
      activity: 'Test automatique',
      address: 'Adresse de test',
      space_type: 'coworking',
      start_date: '2025-02-01',
      end_date: '2025-02-28',
      occupants: 1,
      subscription_type: 'monthly',
      amount: 150,
      payment_method: 'cash',
      transaction_id: `TEST_AUTO_${Date.now()}`,
      status: 'pending',
      created_at: sixDaysAgo.toISOString(),
      updated_at: sixDaysAgo.toISOString()
    };
    
    console.log('📝 [TEST] Réservation de test créée:', testReservation);
    console.log('📅 [TEST] Date de création (6 jours en arrière):', sixDaysAgo.toISOString());
    console.log('💡 [TEST] Cette réservation devrait être annulée automatiquement lors du prochain test');
    
    return testReservation;
    
  } catch (error) {
    console.error('❌ [TEST] Erreur lors de la création de la réservation de test:', error);
    return null;
  }
}

// Fonction pour vérifier les réservations en cash en attente
async function checkPendingCashReservations() {
  console.log('🔍 [TEST] Vérification des réservations en cash en attente...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reservations?select=*&payment_method=eq.cash&status=eq.pending&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [TEST] Erreur lors de la vérification:', response.status, errorText);
      return;
    }

    const reservations = await response.json();
    console.log(`📊 [TEST] ${reservations.length} réservations en cash en attente trouvées`);
    
    if (reservations.length > 0) {
      console.log('📋 [TEST] Détails des réservations en attente:');
      reservations.forEach((reservation, index) => {
        const createdDate = new Date(reservation.created_at);
        const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        
        console.log(`  ${index + 1}. ${reservation.transaction_id} - ${reservation.full_name}`);
        console.log(`     Email: ${reservation.email}`);
        console.log(`     Créée: ${createdDate.toLocaleDateString('fr-FR')} (il y a ${daysSinceCreation} jours)`);
        console.log(`     Montant: $${reservation.amount}`);
        console.log(`     Espace: ${reservation.space_type}`);
        console.log(`     Statut: ${reservation.status}`);
        console.log('');
      });
      
      // Identifier les réservations qui devraient être annulées (plus de 5 jours)
      const shouldBeCancelled = reservations.filter(r => {
        const createdDate = new Date(r.created_at);
        const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation > 5;
      });
      
      if (shouldBeCancelled.length > 0) {
        console.log(`⚠️ [TEST] ${shouldBeCancelled.length} réservations devraient être annulées automatiquement (plus de 5 jours):`);
        shouldBeCancelled.forEach((reservation, index) => {
          const createdDate = new Date(reservation.created_at);
          const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`  ${index + 1}. ${reservation.transaction_id} - ${reservation.full_name} (${daysSinceCreation} jours)`);
        });
      } else {
        console.log('✅ [TEST] Toutes les réservations en attente sont récentes (< 5 jours)');
      }
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erreur lors de la vérification des réservations:', error);
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 [TEST] Démarrage des tests d\'annulation automatique...\n');
  
  // Test 1: Vérifier les réservations en attente
  await checkPendingCashReservations();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Créer une réservation de test (optionnel)
  // await createTestCashReservation();
  // console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: Exécuter l'annulation automatique
  await testAutoCancellation();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 4: Vérifier à nouveau les réservations après annulation
  console.log('🔄 [TEST] Vérification après annulation automatique...');
  await checkPendingCashReservations();
  
  console.log('\n✅ [TEST] Tests terminés !');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAutoCancellation,
  createTestCashReservation,
  checkPendingCashReservations,
  runTests
};
