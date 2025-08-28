console.log('🔍 Test de disponibilité des bureaux privés - Nzoo Immo');
console.log('==================================================\n');

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test 1: Vérifier les réservations existantes pour les bureaux privés
console.log('1️⃣ Vérification des réservations existantes...');

const checkExistingReservations = async () => {
  try {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('space_type', 'bureau-prive')
      .in('status', ['confirmed', 'pending']);

    if (error) {
      console.error('❌ Erreur lors de la vérification:', error);
      return;
    }

    console.log(`📊 Réservations trouvées: ${reservations?.length || 0}`);
    
    if (reservations && reservations.length > 0) {
      console.log('\n📋 Détails des réservations:');
      reservations.forEach((reservation, index) => {
        console.log(`   ${index + 1}. ${reservation.full_name} - ${reservation.status} - ${reservation.start_date} à ${reservation.end_date}`);
      });
    } else {
      console.log('✅ Aucune réservation active trouvée');
    }

    return reservations;
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Test 2: Calculer la disponibilité actuelle
console.log('\n2️⃣ Calcul de la disponibilité actuelle...');

const calculateAvailability = async () => {
  try {
    const reservations = await checkExistingReservations();
    const maxCapacity = 3; // Capacité maximale des bureaux privés
    const currentOccupancy = reservations?.length || 0;
    const availableSlots = Math.max(0, maxCapacity - currentOccupancy);
    const isAvailable = availableSlots > 0;

    console.log(`📊 Capacité maximale: ${maxCapacity}`);
    console.log(`📊 Occupation actuelle: ${currentOccupancy}`);
    console.log(`📊 Places disponibles: ${availableSlots}`);
    console.log(`📊 Statut: ${isAvailable ? '✅ DISPONIBLE' : '❌ COMPLET'}`);

    return {
      maxCapacity,
      currentOccupancy,
      availableSlots,
      isAvailable
    };
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Test 3: Nettoyer les réservations de test si nécessaire
console.log('\n3️⃣ Nettoyage des réservations de test...');

const cleanupTestReservations = async () => {
  try {
    // Supprimer les réservations de test (avec des noms spécifiques)
    const { data, error } = await supabase
      .from('reservations')
      .delete()
      .or('full_name.eq.Test User,full_name.eq.Test Client,full_name.like.Test%');

    if (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      return;
    }

    console.log(`✅ ${data?.length || 0} réservations de test supprimées`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Test 4: Créer une réservation de test pour vérifier le système
console.log('\n4️⃣ Test de création de réservation...');

const createTestReservation = async () => {
  try {
    const testReservation = {
      full_name: 'Test Client Disponibilité',
      email: 'test.disponibilite@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      activity: 'Test Activity',
      address: 'Test Address',
      space_type: 'bureau-prive',
      start_date: '2024-01-20',
      end_date: '2024-02-20',
      occupants: 2,
      subscription_type: 'monthly',
      amount: 900.00,
      payment_method: 'cash',
      transaction_id: `TEST_${Date.now()}`,
      status: 'confirmed'
    };

    const { data, error } = await supabase
      .from('reservations')
      .insert([testReservation])
      .select();

    if (error) {
      console.error('❌ Erreur lors de la création:', error);
      return;
    }

    console.log('✅ Réservation de test créée avec succès');
    console.log(`   ID: ${data[0].id}`);
    console.log(`   Client: ${data[0].full_name}`);
    console.log(`   Statut: ${data[0].status}`);

    return data[0];
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Test 5: Vérifier la disponibilité après modification
console.log('\n5️⃣ Vérification de la disponibilité après modification...');

const verifyAvailabilityAfterChange = async () => {
  try {
    const availability = await calculateAvailability();
    
    if (availability.isAvailable) {
      console.log('✅ Les bureaux privés sont maintenant disponibles !');
      console.log('   Les clients peuvent faire des réservations.');
    } else {
      console.log('❌ Les bureaux privés sont toujours complets.');
      console.log('   Considérez supprimer quelques réservations de test.');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Test 6: Instructions pour l'administrateur
console.log('\n6️⃣ Instructions pour l\'administrateur...');

const showAdminInstructions = () => {
  console.log('📋 Instructions pour gérer la disponibilité:');
  console.log('');
  console.log('1. Pour rendre les bureaux privés disponibles:');
  console.log('   - Connectez-vous à Supabase Dashboard');
  console.log('   - Allez dans la table "reservations"');
  console.log('   - Supprimez ou changez le statut des réservations existantes');
  console.log('   - Ou exécutez ce script avec les bonnes clés API');
  console.log('');
  console.log('2. Pour vérifier la disponibilité en temps réel:');
  console.log('   - Utilisez la fonction checkGeneralSpaceAvailability()');
  console.log('   - Ou vérifiez directement dans la base de données');
  console.log('');
  console.log('3. Capacités par type d\'espace:');
  console.log('   - Coworking: 4 places');
  console.log('   - Bureau privé: 3 places');
  console.log('   - Domiciliation: 1 place');
  console.log('');
  console.log('4. Statuts de réservation:');
  console.log('   - "confirmed": Réservation confirmée (occupe une place)');
  console.log('   - "pending": Réservation en attente (occupe une place)');
  console.log('   - "cancelled": Réservation annulée (ne compte pas)');
  console.log('');
};

// Exécution des tests
const runTests = async () => {
  try {
    await checkExistingReservations();
    await calculateAvailability();
    
    // Demander confirmation avant le nettoyage
    console.log('\n⚠️  Voulez-vous nettoyer les réservations de test ? (y/n)');
    console.log('   (Cette action supprimera les réservations avec "Test" dans le nom)');
    
    // Pour l'instant, on simule une réponse 'n'
    const shouldCleanup = false; // Changez à true pour activer le nettoyage
    
    if (shouldCleanup) {
      await cleanupTestReservations();
      await verifyAvailabilityAfterChange();
    } else {
      console.log('   Nettoyage ignoré. Utilisez les instructions ci-dessous.');
    }
    
    showAdminInstructions();
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
  }
};

// Exécuter les tests
runTests().then(() => {
  console.log('\n🎯 Test terminé !');
  console.log('   Vérifiez la disponibilité dans votre application.');
});
