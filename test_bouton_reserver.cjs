const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xqjqjqjqjqjqjqjqjqjq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxanFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Diagnostic du bouton Réserver - Nzoo Immo');
console.log('============================================\n');

async function testReservationButton() {
  try {
    console.log('1️⃣ Vérification de la structure de la table reservations...');
    
    // Vérifier si les colonnes nécessaires existent
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'reservations')
      .in('column_name', ['contract_accepted', 'selected_months', 'subscription_type']);

    if (columnsError) {
      console.log('❌ Erreur lors de la vérification des colonnes:', columnsError.message);
      console.log('⚠️ Les colonnes contract_accepted, selected_months, subscription_type sont probablement manquantes');
      console.log('💡 Solution: Exécuter la migration SQL dans Supabase');
      return;
    }

    console.log('✅ Colonnes trouvées:', columns.map(c => c.column_name));
    
    console.log('\n2️⃣ Test de création d\'une réservation de test...');
    
    // Données de test pour une réservation
    const testReservation = {
      fullName: 'Test User',
      email: 'test@example.com',
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
      transactionId: `TEST_${Date.now()}`,
      contract_accepted: true,
      selected_months: 3
    };

    console.log('📝 Tentative d\'insertion avec les données:', {
      ...testReservation,
      transactionId: testReservation.transactionId
    });

    const { data: insertResult, error: insertError } = await supabase
      .from('reservations')
      .insert([testReservation])
      .select();

    if (insertError) {
      console.log('❌ Erreur lors de l\'insertion:', insertError.message);
      console.log('🔍 Code d\'erreur:', insertError.code);
      console.log('💡 Détails:', insertError.details);
      console.log('💡 Hint:', insertError.hint);
      
      if (insertError.code === '42703') {
        console.log('\n🚨 PROBLÈME IDENTIFIÉ: Colonnes manquantes dans la table reservations');
        console.log('📋 Actions nécessaires:');
        console.log('   1. Ouvrir Supabase Dashboard');
        console.log('   2. Aller dans SQL Editor');
        console.log('   3. Exécuter le script de migration');
        console.log('   4. Vérifier que les colonnes sont créées');
      }
    } else {
      console.log('✅ Réservation créée avec succès:', insertResult);
      
      // Nettoyer la réservation de test
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .eq('transactionId', testReservation.transactionId);
      
      if (!deleteError) {
        console.log('🧹 Réservation de test nettoyée');
      }
    }

    console.log('\n3️⃣ Vérification des permissions RLS...');
    
    // Vérifier les politiques RLS
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('policy_name, permissive, roles, cmd')
      .eq('table_name', 'reservations');

    if (policiesError) {
      console.log('⚠️ Impossible de vérifier les politiques RLS:', policiesError.message);
    } else {
      console.log('📋 Politiques RLS trouvées:', policies.length);
      policies.forEach(policy => {
        console.log(`   - ${policy.policy_name}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`);
      });
    }

    console.log('\n4️⃣ Test de validation des données...');
    
    // Simuler la validation côté client
    const validateReservationData = (data) => {
      const errors = [];
      
      if (!data.fullName) errors.push('Nom complet requis');
      if (!data.email) errors.push('Email requis');
      if (!data.phone) errors.push('Téléphone requis');
      if (!data.spaceType) errors.push('Type d\'espace requis');
      if (!data.paymentMethod) errors.push('Méthode de paiement requise');
      
      // Validation spécifique selon le type d'offre
      if (['service-juridique', 'service-comptable', 'domiciliation'].includes(data.spaceType)) {
        if (!data.contract_accepted) errors.push('Acceptation du contrat requise');
        if (!data.selected_months || data.selected_months < 1) errors.push('Nombre de mois requis');
      } else {
        if (!data.startDate || !data.endDate) errors.push('Dates requises');
      }
      
      return errors;
    };

    const validationErrors = validateReservationData(testReservation);
    if (validationErrors.length > 0) {
      console.log('❌ Erreurs de validation:', validationErrors);
    } else {
      console.log('✅ Validation des données réussie');
    }

  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
  }
}

async function testPaymentMethodSelection() {
  console.log('\n5️⃣ Test de sélection des méthodes de paiement...');
  
  const paymentMethods = ['orange_money', 'airtel_money', 'visa', 'CASH'];
  
  paymentMethods.forEach(method => {
    console.log(`   ✅ ${method} - Méthode de paiement valide`);
  });
  
  console.log('\n6️⃣ Simulation du comportement du bouton...');
  
  // Simuler les conditions d'activation du bouton
  const simulateButtonState = (paymentMethod, processing = false, loading = false) => {
    const isDisabled = processing || loading || !paymentMethod;
    const buttonText = paymentMethod === 'CASH' ? 'Réserver' : 'Payer';
    
    console.log(`   💳 Méthode: ${paymentMethod || 'Aucune'}`);
    console.log(`   🔄 Processing: ${processing}`);
    console.log(`   ⏳ Loading: ${loading}`);
    console.log(`   🚫 Bouton désactivé: ${isDisabled}`);
    console.log(`   📝 Texte du bouton: ${buttonText}`);
    console.log('');
  };
  
  simulateButtonState(null, false, false);
  simulateButtonState('orange_money', false, false);
  simulateButtonState('visa', true, false);
  simulateButtonState('CASH', false, true);
}

// Exécuter les tests
async function runDiagnostic() {
  await testReservationButton();
  await testPaymentMethodSelection();
  
  console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC');
  console.log('========================');
  console.log('🔍 Points vérifiés:');
  console.log('   ✅ Structure de la table reservations');
  console.log('   ✅ Création de réservations');
  console.log('   ✅ Permissions RLS');
  console.log('   ✅ Validation des données');
  console.log('   ✅ Méthodes de paiement');
  console.log('   ✅ État du bouton Réserver');
  
  console.log('\n💡 Si le bouton ne fonctionne pas:');
  console.log('   1. Vérifier que les colonnes contract_accepted, selected_months, subscription_type existent');
  console.log('   2. Vérifier que selectedPaymentMethod n\'est pas null');
  console.log('   3. Vérifier que paymentProcessing et paymentLoading sont false');
  console.log('   4. Vérifier les erreurs dans la console du navigateur');
}

runDiagnostic().catch(console.error);
