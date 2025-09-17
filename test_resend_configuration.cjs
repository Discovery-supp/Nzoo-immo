#!/usr/bin/env node

/**
 * Test de configuration Resend - Nzoo Immo
 * Vérifie que l'API key et l'email sont correctement configurés
 */

// Configuration
const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
const FROM_EMAIL = 'reservation@nzoo.immo';
const TEST_EMAIL = 'test@example.com'; // Email de test

console.log('🧪 Test de configuration Resend');
console.log('==============================');
console.log(`📧 API Key: ${RESEND_API_KEY.substring(0, 10)}...`);
console.log(`📧 From Email: ${FROM_EMAIL}`);
console.log(`📧 Test Email: ${TEST_EMAIL}`);
console.log('');

// Test 1: Vérifier la validité de l'API key
async function testApiKey() {
  console.log('🔑 Test 1: Vérification de l\'API key...');
  
  try {
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const domains = await response.json();
      console.log('✅ API key valide');
      console.log(`📋 Domaines configurés: ${domains.data?.length || 0}`);
      
      if (domains.data && domains.data.length > 0) {
        domains.data.forEach(domain => {
          console.log(`   - ${domain.name} (${domain.status})`);
        });
      }
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ API key invalide: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur réseau: ${error.message}`);
    return false;
  }
}

// Test 2: Envoyer un email de test
async function testEmailSending() {
  console.log('\n📧 Test 2: Envoi d\'un email de test...');
  
  const testHtml = `
    <html>
      <body>
        <h2>Test de configuration Resend</h2>
        <p>Cet email confirme que votre configuration Resend fonctionne correctement.</p>
        <p><strong>Détails:</strong></p>
        <ul>
          <li>API Key: ${RESEND_API_KEY.substring(0, 10)}...</li>
          <li>From Email: ${FROM_EMAIL}</li>
          <li>Timestamp: ${new Date().toISOString()}</li>
        </ul>
        <p>Si vous recevez cet email, votre configuration est opérationnelle !</p>
      </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TEST_EMAIL],
        subject: 'Test de configuration Resend - Nzoo Immo',
        html: testHtml,
        reply_to: FROM_EMAIL
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email de test envoyé avec succès');
      console.log(`📧 ID de l'email: ${result.id}`);
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Erreur d'envoi: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur réseau: ${error.message}`);
    return false;
  }
}

// Test 3: Vérifier la configuration Supabase
async function testSupabaseConfig() {
  console.log('\n🔧 Test 3: Vérification de la configuration Supabase...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test de la fonction Edge
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: TEST_EMAIL,
        subject: 'Test Supabase Edge Function',
        html: '<h1>Test</h1><p>Ceci est un test de la fonction Edge Supabase.</p>'
      }
    });

    if (error) {
      console.log(`❌ Erreur fonction Edge: ${error.message}`);
      return false;
    } else {
      console.log('✅ Fonction Edge Supabase accessible');
      console.log(`📧 Résultat: ${JSON.stringify(data, null, 2)}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Erreur Supabase: ${error.message}`);
    return false;
  }
}

// Exécution des tests
async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  const results = {
    apiKey: await testApiKey(),
    emailSending: await testEmailSending(),
    supabase: await testSupabaseConfig()
  };

  console.log('\n📊 Résultats des tests');
  console.log('=====================');
  console.log(`🔑 API Key: ${results.apiKey ? '✅' : '❌'}`);
  console.log(`📧 Envoi Email: ${results.emailSending ? '✅' : '❌'}`);
  console.log(`🔧 Supabase: ${results.supabase ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Tous les tests sont passés ! Votre configuration Resend est opérationnelle.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez votre configuration.');
  }

  return allPassed;
}

// Exécuter les tests
runTests().catch(console.error);
