#!/usr/bin/env node

/**
 * Script de test simple d'envoi d'email
 * Usage: node scripts/test-simple-email.js
 */

const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

async function testSimpleEmail() {
  console.log('🧪 Test simple d\'envoi d\'email - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔑 Clé API Resend :', RESEND_API_KEY ? 'Configurée' : 'Non configurée');
  
  if (!RESEND_API_KEY) {
    console.log('❌ Clé API Resend non configurée');
    return;
  }
  
  console.log('\n📧 Test d\'envoi simple...');
  
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
        subject: 'Test Simple - Nzoo Immo',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Simple - Nzoo Immo</title>
          </head>
          <body>
            <h1>🎉 Test Simple Réussi !</h1>
            <p>Ceci est un test simple d\'envoi d\'email.</p>
            <p>Date : ${new Date().toLocaleString('fr-FR')}</p>
            <p>Si vous recevez cet email, le système fonctionne !</p>
          </body>
          </html>
        `,
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email envoyé avec succès !');
      console.log('📧 ID Email:', result.id);
      console.log('\n🎉 Le système d\'email fonctionne !');
      console.log('📧 Vérifiez votre boîte mail :', testEmail);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', response.status, errorText);
    }
  } catch (err) {
    console.log('❌ Erreur réseau:', err.message);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez votre boîte mail :', testEmail);
  console.log('2. Si ça marche, testez dans l\'application');
}

testSimpleEmail().catch(console.error);



