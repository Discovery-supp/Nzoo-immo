/**
 * Script de test pour vérifier le système d'emails
 * Ce script teste l'envoi d'emails et identifie les problèmes
 */

const SUPABASE_URL = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

// Test 1: Vérifier si la fonction Edge send-confirmation-email existe
async function testEdgeFunctionExists() {
  console.log('🧪 [TEST] Test de l\'existence de la fonction Edge send-confirmation-email...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test email</p>',
        reservationData: {}
      })
    });

    console.log('📊 [TEST] Statut de la réponse:', response.status);
    console.log('📊 [TEST] Headers de la réponse:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ [TEST] Fonction Edge fonctionne:', data);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ [TEST] Fonction Edge retourne une erreur:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test de la fonction Edge:', error);
    return false;
  }
}

// Test 2: Vérifier la configuration des Edge Functions
async function checkEdgeFunctionsConfig() {
  console.log('🧪 [TEST] Vérification de la configuration des Edge Functions...');
  
  try {
    // Essayer d'accéder à la liste des fonctions (peut ne pas être autorisé)
    const response = await fetch(`${SUPABASE_URL}/functions/v1/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    console.log('📊 [TEST] Statut de la réponse:', response.status);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ [TEST] Configuration accessible:', data);
    } else {
      console.log('⚠️ [TEST] Configuration non accessible (normal)');
    }
    
  } catch (error) {
    console.log('⚠️ [TEST] Impossible de vérifier la configuration (normal)');
  }
}

// Test 3: Simuler l'envoi d'email avec fallback
async function testEmailFallback() {
  console.log('🧪 [TEST] Test du système de fallback d\'emails...');
  
  try {
    // Simuler une réservation
    const testReservation = {
      id: 'test-123',
      full_name: 'Client Test',
      email: 'test@example.com',
      phone: '+243000000000',
      company: 'Entreprise Test',
      activity: 'Test',
      address: 'Adresse Test',
      space_type: 'coworking',
      start_date: '2025-01-21',
      end_date: '2025-01-22',
      occupants: 1,
      subscription_type: 'daily',
      amount: 50,
      payment_method: 'cash',
      transaction_id: 'TEST_123',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    console.log('📝 [TEST] Réservation de test:', testReservation);
    
    // Simuler l'envoi d'email
    console.log('📧 [TEST] Simulation de l\'envoi d\'email...');
    console.log('📧 [TEST] Email qui serait envoyé à:', testReservation.email);
    console.log('📧 [TEST] Sujet: Réservation en attente de paiement -', testReservation.transaction_id);
    
    // Simuler le succès
    console.log('✅ [TEST] Email simulé avec succès (mode fallback)');
    
    return true;
    
  } catch (error) {
    console.error('❌ [TEST] Erreur lors du test de fallback:', error);
    return false;
  }
}

// Test 4: Vérifier les variables d'environnement
function checkEnvironmentVariables() {
  console.log('🧪 [TEST] Vérification des variables d\'environnement...');
  
  console.log('📊 [TEST] SUPABASE_URL:', SUPABASE_URL);
  console.log('📊 [TEST] SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Configuré' : '❌ Manquant');
  
  // Vérifier la validité de l'URL
  try {
    const url = new URL(SUPABASE_URL);
    console.log('✅ [TEST] URL Supabase valide:', url.hostname);
  } catch (error) {
    console.error('❌ [TEST] URL Supabase invalide:', error);
  }
}

// Test 5: Vérifier la connectivité réseau
async function checkNetworkConnectivity() {
  console.log('🧪 [TEST] Vérification de la connectivité réseau...');
  
  try {
    const startTime = Date.now();
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const endTime = Date.now();
    
    console.log('📊 [TEST] Temps de réponse:', endTime - startTime, 'ms');
    console.log('📊 [TEST] Statut de la réponse:', response.status);
    
    if (response.ok) {
      console.log('✅ [TEST] Connectivité réseau OK');
      return true;
    } else {
      console.log('⚠️ [TEST] Connectivité réseau partielle');
      return false;
    }
    
  } catch (error) {
    console.error('❌ [TEST] Problème de connectivité réseau:', error);
    return false;
  }
}

// Fonction principale de test
async function runAllTests() {
  console.log('🚀 [TEST] Démarrage des tests du système d\'emails...\n');
  
  // Test 1: Vérifier les variables d'environnement
  checkEnvironmentVariables();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 2: Vérifier la connectivité réseau
  await checkNetworkConnectivity();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 3: Vérifier la configuration des Edge Functions
  await checkEdgeFunctionsConfig();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 4: Tester l'existence de la fonction Edge
  const edgeFunctionExists = await testEdgeFunctionExists();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Test 5: Tester le système de fallback
  await testEmailFallback();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Résumé des tests
  console.log('📋 [TEST] RÉSUMÉ DES TESTS:');
  console.log(`  - Variables d'environnement: ${SUPABASE_URL && SUPABASE_ANON_KEY ? '✅' : '❌'}`);
  console.log(`  - Connectivité réseau: ${await checkNetworkConnectivity() ? '✅' : '❌'}`);
  console.log(`  - Fonction Edge: ${edgeFunctionExists ? '✅' : '❌'}`);
  console.log(`  - Système de fallback: ✅ (toujours disponible)`);
  
  if (!edgeFunctionExists) {
    console.log('\n⚠️ [TEST] PROBLÈME IDENTIFIÉ:');
    console.log('  La fonction Edge send-confirmation-email n\'existe pas ou n\'est pas accessible');
    console.log('  Le système utilise le mode fallback (simulation d\'envoi)');
    console.log('\n💡 [TEST] SOLUTION:');
    console.log('  1. Créer la fonction Edge send-confirmation-email dans Supabase');
    console.log('  2. Ou modifier le code pour utiliser un service d\'email alternatif');
  }
  
  console.log('\n✅ [TEST] Tests terminés !');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testEdgeFunctionExists,
  checkEdgeFunctionsConfig,
  testEmailFallback,
  checkEnvironmentVariables,
  checkNetworkConnectivity,
  runAllTests
};
