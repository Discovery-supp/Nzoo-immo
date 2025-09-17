#!/usr/bin/env node

/**
 * Test d'envoi d'email vers votre vraie adresse email
 * trickson.mabengi@gmail.com
 */

const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
const FROM_EMAIL = 'reservations@nzooimmo.com';
const TO_EMAIL = 'trickson.mabengi@gmail.com'; // Votre vraie adresse email

console.log('📧 Test d\'envoi vers votre vraie adresse email');
console.log('==============================================');
console.log(`📧 De: ${FROM_EMAIL}`);
console.log(`📧 Vers: ${TO_EMAIL}`);
console.log(`📧 API Key: ${RESEND_API_KEY.substring(0, 10)}...`);
console.log('');

async function sendTestEmail() {
  const testHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Test Email Réussi !</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Nzoo Immo - Système de Réservation</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Bonjour !</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Cet email confirme que votre système d'emails de réservation fonctionne parfaitement !
          </p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Configuration Validée</h3>
            <ul style="color: #666;">
              <li>API Resend configurée correctement</li>
              <li>Email d'expéditeur fonctionnel</li>
              <li>Système de réservation opérationnel</li>
              <li>Emails de confirmation automatiques</li>
            </ul>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Détails Techniques</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Provider :</strong></td>
                <td style="padding: 8px 0; color: #333;">Resend</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>From Email :</strong></td>
                <td style="padding: 8px 0; color: #333;">${FROM_EMAIL}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>API Key :</strong></td>
                <td style="padding: 8px 0; color: #333;">${RESEND_API_KEY.substring(0, 10)}...</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Timestamp :</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString('fr-FR')}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nzoo.immo" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Visiter Nzoo Immo
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Votre système d'emails est maintenant opérationnel !</p>
          <p>© 2024 Nzoo Immo. Tous droits réservés.</p>
        </div>
      </body>
    </html>
  `;

  try {
    console.log('📧 Envoi de l\'email...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: '✅ Test Email Réussi - Nzoo Immo Configuration Validée',
        html: testHtml,
        reply_to: FROM_EMAIL
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email envoyé avec succès !');
      console.log(`📧 ID de l'email: ${result.id}`);
      console.log(`📧 Vérifiez votre boîte mail: ${TO_EMAIL}`);
      console.log('');
      console.log('💡 Si vous ne voyez pas l\'email:');
      console.log('   1. Vérifiez vos spams/pourriels');
      console.log('   2. Attendez quelques minutes');
      console.log('   3. Vérifiez que l\'adresse email est correcte');
      return true;
    } else {
      const error = await response.text();
      console.log(`❌ Erreur d'envoi: ${response.status} - ${error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Erreur réseau: ${error.message}`);
    return false;
  }
}

// Test également via Supabase Edge Function
async function testViaSupabase() {
  console.log('\n🔧 Test via Supabase Edge Function...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: TO_EMAIL,
        subject: 'Test Supabase Edge Function - Nzoo Immo',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h1>Test Supabase Edge Function</h1>
              <p>Cet email confirme que votre fonction Edge Supabase fonctionne correctement.</p>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString('fr-FR')}</p>
              <p style="color: #28a745; font-weight: bold;">✅ Configuration Supabase validée !</p>
            </body>
          </html>
        `
      }
    });

    if (error) {
      console.log(`❌ Erreur Supabase: ${error.message}`);
      return false;
    } else {
      console.log('✅ Email Supabase envoyé avec succès');
      console.log(`📧 Résultat: ${JSON.stringify(data, null, 2)}`);
      return true;
    }
  } catch (error) {
    console.log(`❌ Erreur Supabase: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests...\n');
  
  const directResult = await sendTestEmail();
  const supabaseResult = await testViaSupabase();

  console.log('\n📊 Résultats des tests');
  console.log('=====================');
  console.log(`📧 Envoi direct: ${directResult ? '✅' : '❌'}`);
  console.log(`🔧 Supabase Edge: ${supabaseResult ? '✅' : '❌'}`);

  if (directResult || supabaseResult) {
    console.log('\n🎉 Au moins un test a réussi !');
    console.log(`📧 Vérifiez votre email: ${TO_EMAIL}`);
  } else {
    console.log('\n⚠️  Aucun test n\'a réussi');
    console.log('💡 Vérifiez la configuration Resend');
  }
}

runTests().catch(console.error);
