// Test final de l'API CinetPay avec la devise CDF

const CINETPAY_CONFIG = {
  apiKey: '17852597076873f647d76131.41366104',
  siteId: '105901836'
};

async function testCinetPayFinal() {
  console.log('🔍 Test final de l\'API CinetPay avec CDF...\n');

  try {
    // Format avec la devise CDF autorisée
    const paymentData = {
      apikey: CINETPAY_CONFIG.apiKey,
      site_id: CINETPAY_CONFIG.siteId,
      transaction_id: `TXN_${Date.now()}`,
      amount: 100,
      currency: 'CDF', // Devise autorisée pour votre compte
      description: 'Test CinetPay - N\'zoo Immo',
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

    console.log('📡 Test avec devise CDF...');

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
      console.log('✅ Succès ! Paiement initialisé avec CDF');
      console.log('   - Transaction ID:', result.data.transaction_id);
      console.log('   - URL de paiement:', result.data.payment_url);
      return true;
    } else {
      console.log('❌ Erreur:', result.message);
      console.log('   - Description:', result.description);
      return false;
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    return false;
  }
}

testCinetPayFinal()
  .then(success => {
    if (success) {
      console.log('\n🎉 Configuration CinetPay validée !');
      console.log('✅ Vos paiements mobile money fonctionneront avec la devise CDF');
      console.log('\n💡 Note: Votre compte CinetPay accepte CDF et USD, pas XAF');
    } else {
      console.log('\n⚠️ Il y a encore un problème');
    }
    process.exit(success ? 0 : 1);
  });
