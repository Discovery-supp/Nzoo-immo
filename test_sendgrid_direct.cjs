#!/usr/bin/env node

/**
 * Test direct de SendGrid sans Supabase
 * Pour vérifier si l'API Key fonctionne
 */

// Utiliser une variable d'environnement pour la clé API
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'VOTRE_CLE_API_SENDGRID_ICI';

async function testSendGridDirect() {
  console.log('🔧 TEST DIRECT SENDGRID');
  console.log('========================');
  console.log('');
  
  if (SENDGRID_API_KEY === 'VOTRE_CLE_API_SENDGRID_ICI') {
    console.log('❌ ERREUR: Clé API SendGrid non configurée');
    console.log('');
    console.log('📋 Pour configurer :');
    console.log('1. Obtenez votre clé API sur https://sendgrid.com');
    console.log('2. Exécutez : SENDGRID_API_KEY=votre_cle node test_sendgrid_direct.cjs');
    console.log('');
    return false;
  }
  
  try {
    console.log('📧 Test d\'envoi direct via SendGrid API...');
    
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
        from: { email: 'reservations@nzooimmo.com' },
        subject: 'Test Direct SendGrid - Nzoo Immo',
        content: [
          {
            type: 'text/html',
            value: `
              <h1>Test Direct SendGrid</h1>
              <p>Cet email a été envoyé directement via l'API SendGrid.</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
              <p>Si vous recevez cet email, SendGrid fonctionne parfaitement !</p>
            `
          }
        ]
      })
    });

    console.log('📊 Statut de la réponse:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      console.log('✅ SendGrid fonctionne parfaitement !');
      console.log('📧 Email envoyé avec succès');
      console.log('✅ Vérifiez votre boîte de réception');
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur SendGrid:', response.status);
      console.log('❌ Détails:', errorText);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error.message);
    return false;
  }
}

testSendGridDirect().then(success => {
  if (success) {
    console.log('\n🎉 TEST RÉUSSI ! SendGrid fonctionne.');
    console.log('🔧 Maintenant nous pouvons configurer Supabase.');
  } else {
    console.log('\n❌ TEST ÉCHOUÉ. Problème avec SendGrid.');
  }
}).catch(console.error);
