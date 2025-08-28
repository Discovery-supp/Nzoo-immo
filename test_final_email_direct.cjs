#!/usr/bin/env node

/**
 * Test final - Envoi direct d'email pour diagnostiquer le problème
 */

const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
const FROM_EMAIL = 'reservations@nzooimmo.com';
const TO_EMAIL = 'trickson.mabengi@gmail.com';

async function sendDirectEmail() {
  console.log('🔍 TEST FINAL - ENVOI DIRECT D\'EMAIL');
  console.log('=====================================');
  console.log(`📧 De: ${FROM_EMAIL}`);
  console.log(`📧 Vers: ${TO_EMAIL}`);
  console.log('');

  const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🔍 Test Final Email</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Diagnostic Email - Nzoo Immo</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Bonjour !</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Cet email est un test final pour diagnostiquer pourquoi vous ne recevez pas les emails de réservation.
          </p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Si vous recevez cet email :</h3>
            <ul style="color: #666;">
              <li>Le système d'emails fonctionne parfaitement</li>
              <li>Le problème vient de l'application</li>
              <li>Vérifiez la console du navigateur</li>
            </ul>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Si vous ne recevez pas cet email :</h3>
            <ul style="color: #856404;">
              <li>Vérifiez vos spams/pourriels</li>
              <li>Ajoutez reservations@nzooimmo.com à vos contacts</li>
              <li>Le problème vient de votre fournisseur email</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Informations du Test</h3>
            <p><strong>Destinataire :</strong> ${TO_EMAIL}</p>
            <p><strong>Expéditeur :</strong> ${FROM_EMAIL}</p>
            <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Test ID :</strong> FINAL_${Date.now()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nzoo.immo" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Visiter Nzoo Immo
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Merci de confirmer la réception de cet email de test.</p>
          <p>© 2024 Nzoo Immo. Tous droits réservés.</p>
        </div>
      </body>
    </html>
  `;

  try {
    console.log('📧 Envoi de l\'email de test...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `Test Final Email - ${new Date().toLocaleDateString('fr-FR')}`,
        html: emailHtml,
        reply_to: FROM_EMAIL
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email envoyé avec succès !');
      console.log(`📧 ID: ${result.id}`);
      console.log('');
      console.log('🎉 DIAGNOSTIC :');
      console.log('✅ Le système d\'emails fonctionne parfaitement');
      console.log('✅ Resend envoie les emails correctement');
      console.log('');
      console.log('💡 PROCHAINES ÉTAPES :');
      console.log('1. Vérifiez votre boîte mail principale');
      console.log('2. Vérifiez vos spams/pourriels');
      console.log('3. Si vous recevez cet email, le problème vient de l\'application');
      console.log('4. Si vous ne le recevez pas, le problème vient de votre fournisseur email');
      console.log('');
      console.log('📧 Email de test envoyé à :', TO_EMAIL);
      
      return { success: true, id: result.id };
    } else {
      const error = await response.text();
      console.log(`❌ Erreur: ${response.status} - ${error}`);
      return { success: false, error: error };
    }
  } catch (error) {
    console.log(`❌ Erreur réseau: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testMultipleProviders() {
  console.log('\n🔍 TEST AVEC DIFFÉRENTS FOURNISSEURS EMAIL');
  console.log('==========================================');
  
  const testEmails = [
    'trickson.mabengi@gmail.com',
    'tricksonmabengi123@gmail.com',
    'contact@nzooimmo.com'
  ];

  for (const email of testEmails) {
    console.log(`\n📧 Test avec: ${email}`);
    
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: `Test Fournisseur - ${email}`,
          html: `<p>Test d'envoi vers ${email}</p>`,
          reply_to: FROM_EMAIL
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Succès - ID: ${result.id}`);
      } else {
        const error = await response.text();
        console.log(`❌ Échec: ${response.status} - ${error}`);
      }
    } catch (error) {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }
}

async function runFinalTest() {
  console.log('🚀 LANCEMENT DU TEST FINAL');
  console.log('==========================');
  
  const result = await sendDirectEmail();
  
  if (result.success) {
    console.log('\n✅ Test principal réussi !');
    await testMultipleProviders();
  } else {
    console.log('\n❌ Test principal échoué !');
    console.log('💡 Le problème vient de la configuration Resend');
  }
}

runFinalTest().catch(console.error);
