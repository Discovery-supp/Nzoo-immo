#!/usr/bin/env node

/**
 * Script de test d'envoi direct d'email via Resend
 * Usage: node scripts/test-direct-email.js
 */

const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

async function testDirectEmail() {
  console.log('🧪 Test d\'envoi direct d\'email via Resend - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔑 Clé API Resend :', RESEND_API_KEY ? 'Configurée' : 'Non configurée');
  
  if (!RESEND_API_KEY) {
    console.log('❌ Clé API Resend non configurée');
    return;
  }
  
  console.log('\n📧 Test d\'envoi direct via Resend API...');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: [testEmail],
        subject: 'Test Email Direct - Nzoo Immo',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Email Direct - Nzoo Immo</title>
          </head>
          <body>
            <h1>🎉 Test Email Direct Réussi !</h1>
            <p>Félicitations ! Votre système d'emails Nzoo Immo fonctionne parfaitement.</p>
            <p>Ceci est un test d'envoi d'email direct avec Resend.</p>
            <hr>
            <h2>Détails du test :</h2>
            <ul>
              <li><strong>Service :</strong> Resend (Direct API)</li>
              <li><strong>Projet :</strong> Nzoo Immo</li>
              <li><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</li>
              <li><strong>Email d'expédition :</strong> reservations@nzooimmo.com</li>
              <li><strong>Méthode :</strong> Appel direct API</li>
            </ul>
            <p>Vos emails de réservation fonctionnent maintenant !</p>
          </body>
          </html>
        `,
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email envoyé avec succès !');
      console.log('📧 Réponse Resend:', result);
      console.log('\n🎉 Configuration Resend réussie !');
      console.log('📧 Email envoyé avec succès via Resend.');
      console.log('📧 Vérifiez votre boîte mail :', testEmail);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur Resend:', response.status, errorText);
      console.log('\n⚠️ Problème avec Resend');
      console.log('Vérifiez la clé API et la configuration.');
    }
  } catch (err) {
    console.log('❌ Erreur lors du test :', err.message);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez votre boîte mail :', testEmail);
  console.log('2. Si l\'email n\'arrive pas, vérifiez les spams');
  console.log('3. Effectuez une vraie réservation pour tester');
}

testDirectEmail().catch(console.error);


