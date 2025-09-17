#!/usr/bin/env node

/**
 * Test d'envoi d'emails vers plusieurs adresses
 * esther.kilolo@celluleinfra.org
 * myv.nsuanda2012@gmail.com
 */

const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
const FROM_EMAIL = 'reservations@nzooimmo.com';

// Liste des emails à tester
const TEST_EMAILS = [
  'esther.kilolo@celluleinfra.org',
  'myv.nsuanda2012@gmail.com'
];

console.log('📧 Test d\'envoi vers plusieurs adresses email');
console.log('=============================================');
console.log(`📧 De: ${FROM_EMAIL}`);
console.log(`📧 Vers: ${TEST_EMAILS.join(', ')}`);
console.log('');

async function sendTestEmail(toEmail) {
  const testHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Test Email Nzoo Immo</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Système de Réservation - Test de Configuration</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Bonjour !</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Cet email confirme que le système d'emails de réservation de Nzoo Immo fonctionne parfaitement !
          </p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Système Opérationnel</h3>
            <ul style="color: #666;">
              <li>Configuration Resend validée</li>
              <li>Emails de réservation automatiques</li>
              <li>Notifications d'administration</li>
              <li>Design professionnel</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Informations</h3>
            <p><strong>Destinataire :</strong> ${toEmail}</p>
            <p><strong>Expéditeur :</strong> ${FROM_EMAIL}</p>
            <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
            <p><strong>Test ID :</strong> ${Math.random().toString(36).substring(7)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nzoo.immo" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Visiter Nzoo Immo
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Merci de confirmer la réception de cet email.</p>
          <p>© 2024 Nzoo Immo. Tous droits réservés.</p>
        </div>
      </body>
    </html>
  `;

  try {
    console.log(`📧 Envoi vers: ${toEmail}...`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: `Test Email Nzoo Immo - ${new Date().toLocaleDateString('fr-FR')}`,
        html: testHtml,
        reply_to: FROM_EMAIL
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Email envoyé avec succès vers ${toEmail}`);
      console.log(`   ID: ${result.id}`);
      return { success: true, email: toEmail, id: result.id };
    } else {
      const error = await response.text();
      console.log(`❌ Erreur pour ${toEmail}: ${response.status} - ${error}`);
      return { success: false, email: toEmail, error: error };
    }
  } catch (error) {
    console.log(`❌ Erreur réseau pour ${toEmail}: ${error.message}`);
    return { success: false, email: toEmail, error: error.message };
  }
}

async function sendAllTestEmails() {
  console.log('🚀 Envoi des emails de test...\n');
  
  const results = [];
  
  for (const email of TEST_EMAILS) {
    const result = await sendTestEmail(email);
    results.push(result);
    
    // Pause entre les envois
    if (email !== TEST_EMAILS[TEST_EMAILS.length - 1]) {
      console.log('⏳ Pause de 2 secondes...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 Résultats des envois');
  console.log('======================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log(`✅ ${successful.length} email(s) envoyé(s) avec succès:`);
    successful.forEach(result => {
      console.log(`   - ${result.email} (ID: ${result.id})`);
    });
  }
  
  if (failed.length > 0) {
    console.log(`❌ ${failed.length} email(s) en échec:`);
    failed.forEach(result => {
      console.log(`   - ${result.email}: ${result.error}`);
    });
  }
  
  console.log('\n💡 Instructions pour les destinataires:');
  console.log('   1. Vérifiez leur boîte mail principale');
  console.log('   2. Vérifiez les dossiers spam/pourriels');
  console.log('   3. Confirmez la réception');
  
  return results;
}

sendAllTestEmails().catch(console.error);
