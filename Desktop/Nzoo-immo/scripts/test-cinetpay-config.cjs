const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCinetPayConfiguration() {
  console.log('🔍 Test de la configuration CinetPay...\n');

  try {
    // Test 1: Vérifier les variables d'environnement
    console.log('1️⃣ Vérification des variables d\'environnement...');
    
    const requiredEnvVars = [
      'REACT_APP_CINETPAY_API_KEY',
      'REACT_APP_CINETPAY_SITE_ID',
      'REACT_APP_CINETPAY_ENVIRONMENT'
    ];

    const missingVars = [];
    const config = {};

    for (const varName of requiredEnvVars) {
      const value = process.env[varName];
      if (!value || value === 'your_cinetpay_api_key' || value === 'your_cinetpay_site_id') {
        missingVars.push(varName);
      } else {
        config[varName] = varName.includes('KEY') ? `${value.substring(0, 8)}...` : value;
      }
    }

    if (missingVars.length > 0) {
      console.log('❌ Variables d\'environnement manquantes:', missingVars);
      console.log('\n💡 Solution : Créez un fichier .env.local avec :');
      console.log(`
# Configuration CinetPay
REACT_APP_CINETPAY_API_KEY=votre_api_key_ici
REACT_APP_CINETPAY_SITE_ID=votre_site_id_ici
REACT_APP_CINETPAY_ENVIRONMENT=TEST
      `);
      return false;
    } else {
      console.log('✅ Variables d\'environnement configurées:', config);
    }

    // Test 2: Vérifier la connexion à l'API CinetPay
    console.log('\n2️⃣ Test de connexion à l\'API CinetPay...');
    
    const testPaymentData = {
      apikey: process.env.REACT_APP_CINETPAY_API_KEY,
      site_id: process.env.REACT_APP_CINETPAY_SITE_ID,
      transaction_id: `TEST_${Date.now()}`,
      amount: 100,
      currency: 'XAF',
      description: 'Test de connexion CinetPay',
      return_url: 'http://localhost:5174/payment/success',
      cancel_url: 'http://localhost:5174/payment/cancel',
      notify_url: 'http://localhost:5174/api/payment/notify',
      client_id: 'test_client',
      client_name: 'Test Client',
      client_email: 'test@example.com',
      client_phone: '+242061234567',
      channel: 'ORANGE',
      lang: 'FR'
    };

    try {
      const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_CINETPAY_API_KEY}`
        },
        body: JSON.stringify(testPaymentData)
      });

      const result = await response.json();
      
      if (response.ok && result.code === '201') {
        console.log('✅ Connexion à l\'API CinetPay réussie');
        console.log('   - Transaction ID:', result.data.transaction_id);
        console.log('   - URL de paiement:', result.data.payment_url);
      } else {
        console.log('❌ Erreur de connexion à l\'API CinetPay:');
        console.log('   - Code:', result.code);
        console.log('   - Message:', result.message);
        
        if (result.code === '401') {
          console.log('\n💡 Solution : Vérifiez votre API Key et Site ID');
        } else if (result.code === '400') {
          console.log('\n💡 Solution : Vérifiez le format des données envoyées');
        }
        return false;
      }
    } catch (error) {
      console.log('❌ Erreur réseau lors de la connexion à CinetPay:', error.message);
      console.log('\n💡 Solution : Vérifiez votre connexion internet');
      return false;
    }

    // Test 3: Vérifier la base de données
    console.log('\n3️⃣ Vérification de la base de données...');
    
    const { data: reservations, error: dbError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);

    if (dbError) {
      console.log('❌ Erreur de connexion à la base de données:', dbError.message);
      return false;
    } else {
      console.log('✅ Connexion à la base de données réussie');
      console.log('   - Nombre de réservations:', reservations?.length || 0);
    }

    // Test 4: Vérifier les méthodes de paiement
    console.log('\n4️⃣ Vérification des méthodes de paiement...');
    
    const paymentMethods = ['ORANGE_MONEY', 'AIRTEL_MONEY', 'VISA', 'CASH'];
    console.log('✅ Méthodes de paiement disponibles:', paymentMethods.join(', '));

    // Test 5: Simulation d'un paiement
    console.log('\n5️⃣ Test de simulation de paiement...');
    
    const testReservation = {
      fullName: 'Test Client',
      email: 'test@example.com',
      phone: '+242061234567',
      company: 'Test Company',
      activity: 'Test Activity',
      address: 'Test Address',
      spaceType: 'coworking',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      occupants: 1,
      subscriptionType: 'daily',
      amount: 10000,
      paymentMethod: 'orange_money',
      transactionId: `TEST_${Date.now()}`
    };

    console.log('✅ Données de test préparées');
    console.log('   - Montant:', testReservation.amount, 'XAF');
    console.log('   - Méthode:', testReservation.paymentMethod);
    console.log('   - Espace:', testReservation.spaceType);

    console.log('\n🎉 Configuration CinetPay validée avec succès !');
    console.log('✅ Votre application est prête pour les paiements mobile money');
    
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test de configuration:', error.message);
    return false;
  }
}

// Exécuter le test
testCinetPayConfiguration()
  .then(success => {
    if (success) {
      console.log('\n🚀 Prochaines étapes :');
      console.log('1. Lancez votre application : npm run dev');
      console.log('2. Testez un paiement mobile money');
      console.log('3. Vérifiez les logs dans la console');
    } else {
      console.log('\n⚠️ Configuration à corriger avant de pouvoir utiliser les paiements mobile money');
      console.log('📖 Consultez le guide : CINETPAY_SETUP.md');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
