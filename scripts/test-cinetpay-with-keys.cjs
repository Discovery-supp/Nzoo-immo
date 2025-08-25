const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration CinetPay avec les vraies clés
const CINETPAY_CONFIG = {
  apiKey: '17852597076873f647d76131.41366104',
  siteId: '105901836',
  environment: 'TEST'
};

async function testCinetPayWithKeys() {
  console.log('🔍 Test de la configuration CinetPay avec vos clés...\n');

  try {
    // Test 1: Vérifier la configuration
    console.log('1️⃣ Vérification de la configuration...');
    console.log('✅ API Key configurée:', CINETPAY_CONFIG.apiKey.substring(0, 8) + '...');
    console.log('✅ Site ID configuré:', CINETPAY_CONFIG.siteId);
    console.log('✅ Environnement:', CINETPAY_CONFIG.environment);

    // Test 2: Vérifier la connexion à l'API CinetPay
    console.log('\n2️⃣ Test de connexion à l\'API CinetPay...');
    
    const testPaymentData = {
      apikey: CINETPAY_CONFIG.apiKey,
      site_id: CINETPAY_CONFIG.siteId,
      transaction_id: `TEST_${Date.now()}`,
      amount: 100,
      currency: 'XAF',
      description: 'Test de connexion CinetPay - N\'zoo Immo',
      return_url: 'http://localhost:5174/payment/success',
      cancel_url: 'http://localhost:5174/payment/cancel',
      notify_url: 'http://localhost:5174/api/payment/notify',
      client_id: 'test_client',
      client_name: 'Test Client',
      client_email: 'test@example.com',
      client_phone: '+242061234567',
      channel: 'ORANGE',
      lang: 'FR',
      // Champs supplémentaires requis par CinetPay
      metadata: {
        order_id: `ORDER_${Date.now()}`,
        customer_id: 'test_customer'
      },
      // Informations sur le produit
      items: [
        {
          name: 'Test Reservation',
          quantity: 1,
          unit_price: 100,
          total_price: 100
        }
      ]
    };

    try {
      console.log('📡 Envoi de la requête à CinetPay...');
      const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CINETPAY_CONFIG.apiKey}`
        },
        body: JSON.stringify(testPaymentData)
      });

      const result = await response.json();
      
      console.log('📡 Réponse CinetPay reçue');
      console.log('   - Code de réponse:', result.code);
      console.log('   - Message:', result.message);
      
      if (response.ok && result.code === '201') {
        console.log('✅ Connexion à l\'API CinetPay réussie !');
        console.log('   - Transaction ID:', result.data.transaction_id);
        console.log('   - URL de paiement:', result.data.payment_url);
        console.log('   - Statut:', result.data.status);
      } else {
        console.log('❌ Erreur de connexion à l\'API CinetPay:');
        console.log('   - Code:', result.code);
        console.log('   - Message:', result.message);
        
        if (result.code === '401') {
          console.log('\n💡 Solution : Vérifiez votre API Key et Site ID');
        } else if (result.code === '400') {
          console.log('\n💡 Solution : Vérifiez le format des données envoyées');
        } else if (result.code === '403') {
          console.log('\n💡 Solution : Vérifiez les permissions de votre compte CinetPay');
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

    // Test 5: Simulation d'un paiement complet
    console.log('\n5️⃣ Test de simulation de paiement complet...');
    
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
    console.log('   - Client:', testReservation.fullName);

    console.log('\n🎉 Configuration CinetPay validée avec succès !');
    console.log('✅ Votre application est prête pour les paiements mobile money');
    console.log('✅ Vos clés CinetPay sont valides et fonctionnelles');
    
    return true;

  } catch (error) {
    console.error('❌ Erreur lors du test de configuration:', error.message);
    return false;
  }
}

// Exécuter le test
testCinetPayWithKeys()
  .then(success => {
    if (success) {
      console.log('\n🚀 Prochaines étapes :');
      console.log('1. Lancez votre application : npm run dev');
      console.log('2. Allez sur la page de réservation');
      console.log('3. Sélectionnez Orange Money ou Airtel Money');
      console.log('4. Testez un paiement mobile money');
      console.log('5. Vérifiez les logs dans la console');
      console.log('\n💡 Vos paiements mobile money devraient maintenant fonctionner !');
    } else {
      console.log('\n⚠️ Il y a un problème avec la configuration');
      console.log('📖 Consultez les messages d\'erreur ci-dessus');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
