#!/usr/bin/env node

/**
 * Test SendGrid avec une adresse email de test
 */

// Utiliser une variable d'environnement pour la clé API
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'VOTRE_CLE_API_SENDGRID_ICI';

async function testSendGridTestEmail() {
  console.log('🔧 TEST SENDGRID AVEC EMAIL DE TEST');
  console.log('=====================================');
  console.log('');
  
  if (SENDGRID_API_KEY === 'VOTRE_CLE_API_SENDGRID_ICI') {
    console.log('❌ ERREUR: Clé API SendGrid non configurée');
    console.log('');
    console.log('📋 Pour configurer :');
    console.log('1. Obtenez votre clé API sur https://sendgrid.com');
    console.log('2. Exécutez : SENDGRID_API_KEY=votre_cle node test_sendgrid_test_email.cjs');
    console.log('');
    return false;
  }
  
  try {
    console.log('📧 Test d\'envoi avec email de test...');
    
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'trickson.mabengi@gmail.com' }]
          }
        ],
        from: { email: 'test@example.com' }, // Email de test
        subject: 'Test SendGrid Test Email - Nzoo Immo',
        content: [
          {
            type: 'text/html',
            value: `
              <h1>Test SendGrid avec Email de Test</h1>
              <p>Cet email a été envoyé via SendGrid avec une adresse de test.</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
              <p>Si vous recevez cet email, SendGrid fonctionne parfaitement !</p>
            `
          }
        ]
      })
    });

    console.log('📊 Statut de la réponse:', response.status);

    if (response.ok) {
      console.log('✅ SendGrid fonctionne parfaitement !');
      console.log('📧 Email envoyé avec succès');
      console.log('✅ Vérifiez votre boîte de réception');
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur SendGrid:', response.status);
      console.log('❌ Détails:', errorText);
      
      if (errorText.includes('verified Sender Identity')) {
        console.log('');
        console.log('💡 SOLUTION : Vérifiez votre adresse email dans SendGrid');
        console.log('📋 Étapes détaillées :');
        console.log('1. Allez sur https://sendgrid.com');
        console.log('2. Connectez-vous à votre compte');
        console.log('3. Allez dans Settings → Sender Authentication');
        console.log('4. Cliquez sur "Verify a Single Sender"');
        console.log('5. Ajoutez : trickson.mabengi@gmail.com');
        console.log('6. Confirmez l\'email de vérification');
        console.log('');
        console.log('🔧 En attendant, nous pouvons continuer avec Resend qui fonctionne déjà !');
      }
      
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    return false;
  }
}

testSendGridTestEmail().then(success => {
  if (success) {
    console.log('\n🎉 TEST RÉUSSI ! SendGrid fonctionne.');
    console.log('🔧 Maintenant nous pouvons configurer Supabase.');
  } else {
    console.log('\n❌ TEST ÉCHOUÉ. Vérifiez votre adresse email dans SendGrid.');
    console.log('💡 En attendant, Resend fonctionne déjà parfaitement !');
  }
}).catch(console.error);
