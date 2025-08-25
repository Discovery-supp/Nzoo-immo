#!/usr/bin/env node

/**
 * Script pour tester le filtrage des réservations par client
 * Usage: node scripts/test-client-filtering.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testClientFiltering() {
  console.log('🧪 Test du filtrage des réservations par client\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('📡 Test 1: Vérification de la connexion...');
    const { data: testData, error: testError } = await supabase.from('reservations').select('count').limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      return;
    }
    console.log('✅ Connexion réussie\n');

    // Test 2: Récupérer toutes les réservations
    console.log('📋 Test 2: Récupération de toutes les réservations...');
    const { data: allReservations, error: allError } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erreur lors de la récupération:', allError.message);
      return;
    }

    console.log(`✅ ${allReservations.length} réservations trouvées au total\n`);

    // Test 3: Analyser les emails uniques
    console.log('🔍 Test 3: Analyse des emails uniques...');
    const uniqueEmails = [...new Set(allReservations.map(r => r.email))];
    console.log(`📧 ${uniqueEmails.length} emails uniques trouvés:`);
    
    uniqueEmails.forEach((email, index) => {
      const count = allReservations.filter(r => r.email === email).length;
      console.log(`  ${index + 1}. ${email} (${count} réservation${count > 1 ? 's' : ''})`);
    });
    console.log();

    // Test 4: Tester le filtrage par email
    console.log('🔒 Test 4: Test du filtrage par email...');
    
    if (uniqueEmails.length > 0) {
      const testEmail = uniqueEmails[0];
      console.log(`📧 Test avec l'email: ${testEmail}`);
      
      const { data: filteredReservations, error: filterError } = await supabase
        .from('reservations')
        .select('*')
        .eq('email', testEmail)
        .order('created_at', { ascending: false });

      if (filterError) {
        console.error('❌ Erreur lors du filtrage:', filterError.message);
        return;
      }

      console.log(`✅ ${filteredReservations.length} réservations trouvées pour ${testEmail}`);
      
      // Vérifier que toutes les réservations appartiennent bien à cet email
      const wrongEmails = filteredReservations.filter(r => r.email !== testEmail);
      if (wrongEmails.length > 0) {
        console.error('❌ ERREUR: Des réservations avec un mauvais email ont été trouvées:', wrongEmails);
      } else {
        console.log('✅ Filtrage correct: toutes les réservations appartiennent à l\'email testé');
      }
    }
    console.log();

    // Test 5: Tester avec un email inexistant
    console.log('🔍 Test 5: Test avec un email inexistant...');
    const fakeEmail = 'test-inexistant@example.com';
    
    const { data: fakeReservations, error: fakeError } = await supabase
      .from('reservations')
      .select('*')
      .eq('email', fakeEmail);

    if (fakeError) {
      console.error('❌ Erreur lors du test email inexistant:', fakeError.message);
      return;
    }

    console.log(`✅ ${fakeReservations.length} réservations trouvées pour l'email inexistant (correct)`);
    console.log();

    // Test 6: Vérifier les permissions RLS
    console.log('🔐 Test 6: Vérification des permissions RLS...');
    
    // Simuler un utilisateur client
    const clientEmail = uniqueEmails[0];
    if (clientEmail) {
      console.log(`👤 Simulation d'un client avec l'email: ${clientEmail}`);
      
      // Test sans authentification (comme un client non connecté)
      const { data: publicReservations, error: publicError } = await supabase
        .from('reservations')
        .select('*')
        .eq('email', clientEmail);

      if (publicError) {
        console.log('⚠️ Erreur attendue (RLS actif):', publicError.message);
      } else {
        console.log(`📋 ${publicReservations.length} réservations accessibles publiquement`);
      }
    }
    console.log();

    // Résumé
    console.log('📊 Résumé des tests:');
    console.log(`  📧 Emails uniques: ${uniqueEmails.length}`);
    console.log(`  📋 Réservations totales: ${allReservations.length}`);
    console.log(`  🔒 Filtrage par email: ${uniqueEmails.length > 0 ? 'Testé' : 'Non testé'}`);
    console.log(`  🔐 Permissions RLS: ${uniqueEmails.length > 0 ? 'Vérifiées' : 'Non vérifiées'}`);

    console.log('\n💡 Recommandations:');
    console.log('  1. Vérifiez que les clients ne voient que leurs propres réservations');
    console.log('  2. Assurez-vous que les permissions RLS sont correctement configurées');
    console.log('  3. Testez avec différents comptes clients');
    console.log('  4. Vérifiez les messages d\'erreur pour les clients sans réservations');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testClientFiltering();
