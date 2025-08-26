// Test simple de l'API CinetPay avec le format exact requis

const CINETPAY_CONFIG = {
  apiKey: '17852597076873f647d76131.41366104',
  siteId: '105901836'
};

async function testCinetPaySimple() {
  console.log('🔍 Test simple de l\'API CinetPay...\n');

  try {
    // Format exact selon la documentation CinetPay
    const paymentData = {
      apikey: CINETPAY_CONFIG.apiKey,
      site_id: CINETPAY_CONFIG.siteId,
      transaction_id: `TXN_${Date.now()}`,
      amount: 100,
      currency: 'XAF',
      description: 'Test CinetPay',
      return_url: 'https://example.com/success',
      cancel_url: 'https://example.com/cancel',
      notify_url: 'https://example.com/notify',
      client_id: 'test_client',
      client_name: 'Test Client',
      client_email: 'test@example.com',
      client_phone: '+242061234567',
      channel: 'ORANGE',
      lang: 'FR'
    };

    console.log('📡 Données envoyées:', JSON.stringify(paymentData, null, 2));

    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();
    
    console.log('📡 Réponse reçue:', JSON.stringify(result, null, 2));
    
    if (result.code === '201') {
      console.log('✅ Succès ! Paiement initialisé');
      return true;
    } else {
      console.log('❌ Erreur:', result.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

testCinetPaySimple()
  .then(success => {
    if (success) {
      console.log('\n🎉 Test réussi !');
    } else {
      console.log('\n⚠️ Test échoué');
    }
    process.exit(success ? 0 : 1);
  });
