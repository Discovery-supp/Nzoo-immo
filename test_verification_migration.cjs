const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Vérification de la migration - Nzoo Immo');
console.log('==========================================\n');

async function verifyMigration() {
  try {
    console.log('1️⃣ Test de création d\'une réservation service-juridique...');
    
    const testReservation = {
      fullName: 'Test Service Juridique',
      email: 'test@juridique.com',
      phone: '+1234567890',
      company: 'Test Company',
      activity: 'Test Activity',
      address: 'Test Address',
      spaceType: 'service-juridique',
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      occupants: 1,
      subscriptionType: 'monthly',
      amount: 150.00,
      paymentMethod: 'orange_money',
      transactionId: `TEST_JURIDIQUE_${Date.now()}`,
      contract_accepted: true,
      selected_months: 3
    };

    console.log('📝 Tentative d\'insertion...');

    const { data: insertResult, error: insertError } = await supabase
      .from('reservations')
      .insert([testReservation])
      .select();

    if (insertError) {
      console.log('❌ ERREUR:', insertError.message);
      console.log('🔍 Code:', insertError.code);
      console.log('💡 La migration n\'a pas été appliquée correctement');
      return false;
    }

    console.log('✅ RÉUSSITE: Réservation créée avec succès!');
    console.log('📋 Données insérées:', insertResult[0]);

    // Nettoyer
    await supabase
      .from('reservations')
      .delete()
      .eq('transactionId', testReservation.transactionId);

    console.log('\n2️⃣ Test de création d\'une réservation service-comptable...');
    
    const testReservation2 = {
      fullName: 'Test Service Comptable',
      email: 'test@comptable.com',
      phone: '+1234567890',
      company: 'Test Company',
      activity: 'Test Activity',
      address: 'Test Address',
      spaceType: 'service-comptable',
      startDate: '2024-01-20',
      endDate: '2024-01-20',
      occupants: 1,
      subscriptionType: 'monthly',
      amount: 200.00,
      paymentMethod: 'airtel_money',
      transactionId: `TEST_COMPTABLE_${Date.now()}`,
      contract_accepted: true,
      selected_months: 6
    };

    const { data: insertResult2, error: insertError2 } = await supabase
      .from('reservations')
      .insert([testReservation2])
      .select();

    if (insertError2) {
      console.log('❌ ERREUR:', insertError2.message);
      return false;
    }

    console.log('✅ RÉUSSITE: Réservation comptable créée avec succès!');

    // Nettoyer
    await supabase
      .from('reservations')
      .delete()
      .eq('transactionId', testReservation2.transactionId);

    console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS!');
    console.log('✅ La migration a été appliquée correctement');
    console.log('✅ Les réservations pour tous les services fonctionnent maintenant');
    
    return true;

  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    return false;
  }
}

verifyMigration().then(success => {
  if (success) {
    console.log('\n🚀 Le bouton "Réserver" devrait maintenant fonctionner pour tous les services!');
  } else {
    console.log('\n⚠️ La migration doit être appliquée dans Supabase SQL Editor');
  }
});
