// Diagnostic des variables d'environnement et configuration
console.log('🔍 Diagnostic des variables d\'environnement - Nzoo Immo\n');

// Vérifier les variables d'environnement disponibles
console.log('📋 Variables d\'environnement disponibles:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'non définie');
console.log('- PORT:', process.env.PORT || 'non définie');
console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL || 'non définie');
console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'définie' : 'non définie');

// Configuration Supabase hardcodée (comme dans l'application)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

console.log('\n📋 Configuration Supabase:');
console.log('- URL:', supabaseUrl);
console.log('- Clé:', supabaseKey ? 'définie' : 'non définie');

// Configuration Resend
const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

console.log('\n📋 Configuration Resend:');
console.log('- Clé API:', RESEND_API_KEY ? 'définie' : 'non définie');
console.log('- Longueur de la clé:', RESEND_API_KEY ? RESEND_API_KEY.length : 0);

// Test de connexion Supabase
async function testSupabaseConnection() {
  console.log('\n🔍 Test de connexion Supabase...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur connexion Supabase:', error.message);
      return false;
    } else {
      console.log('✅ Connexion Supabase réussie');
      return true;
    }
  } catch (err) {
    console.log('❌ Erreur lors du test Supabase:', err.message);
    return false;
  }
}

// Test de l'API Resend
async function testResendAPI() {
  console.log('\n🔍 Test de l\'API Resend...');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: ['test@example.com'],
        subject: 'Test API Resend - Nzoo Immo',
        html: '<h1>Test</h1><p>Test de l\'API Resend.</p>',
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API Resend fonctionnelle:', result.id);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur API Resend:', response.status, errorText);
      return false;
    }
  } catch (err) {
    console.log('❌ Erreur réseau Resend:', err.message);
    return false;
  }
}

// Test de la fonction Edge
async function testEdgeFunction() {
  console.log('\n🔍 Test de la fonction Edge...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Edge Function - Nzoo Immo',
        html: '<h1>Test</h1><p>Test de la fonction Edge.</p>',
        reservationData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '123456789',
          amount: 100,
          transactionId: 'TEST-123'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur fonction Edge:', error.message);
      return false;
    } else {
      console.log('✅ Fonction Edge fonctionnelle:', data);
      return true;
    }
  } catch (err) {
    console.log('❌ Erreur lors du test Edge Function:', err.message);
    return false;
  }
}

// Test complet
async function runDiagnostic() {
  console.log('🚀 Démarrage du diagnostic complet...\n');
  
  const results = {
    supabase: await testSupabaseConnection(),
    resend: await testResendAPI(),
    edgeFunction: await testEdgeFunction()
  };
  
  console.log('\n📊 Résultats du diagnostic:');
  console.log('- Supabase:', results.supabase ? '✅' : '❌');
  console.log('- Resend API:', results.resend ? '✅' : '❌');
  console.log('- Edge Function:', results.edgeFunction ? '✅' : '❌');
  
  if (results.supabase && results.resend && results.edgeFunction) {
    console.log('\n🎉 Tous les services fonctionnent correctement !');
    console.log('Le problème pourrait être dans l\'application elle-même.');
  } else {
    console.log('\n⚠️ Certains services ne fonctionnent pas :');
    if (!results.supabase) console.log('- Vérifiez la configuration Supabase');
    if (!results.resend) console.log('- Vérifiez la clé API Resend');
    if (!results.edgeFunction) console.log('- Vérifiez la fonction Edge');
  }
  
  // Suggestions de résolution
  console.log('\n💡 Suggestions de résolution:');
  console.log('1. Vérifiez que l\'application utilise les bonnes variables d\'environnement');
  console.log('2. Vérifiez les logs de la console du navigateur lors d\'une réservation');
  console.log('3. Vérifiez que le service d\'emails est bien appelé dans l\'application');
  console.log('4. Vérifiez les erreurs CORS ou de sécurité');
}

// Exécuter le diagnostic
runDiagnostic().catch(console.error);
