#!/usr/bin/env node

/**
 * Test d'envoi avec email vérifié - Nzoo Immo
 */

const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

// Test avec différents emails d'expéditeur
const FROM_EMAILS = [
  'reservation@nzoo.immo',
  'reservations@nzooimmo.com',
  'contact@nzooimmo.com',
  'test@resend.dev' // Email de test Resend
];

async function testEmailSending(fromEmail) {
  console.log(`\n📧 Test avec: ${fromEmail}`);
  
  const testHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
          <h1>Test de Configuration Resend</h1>
          <p>Nzoo Immo - Système de Réservation</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
          <h2>Détails du Test</h2>
          <ul>
            <li><strong>From Email:</strong> ${fromEmail}</li>
            <li><strong>API Key:</strong> ${RESEND_API_KEY.substring(0, 10)}...</li>
            <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            <li><strong>Test ID:</strong> ${Math.random().toString(36).substring(7)}</li>
          </ul>
          
          <p style="color: #28a745; font-weight: bold;">
            ✅ Si vous recevez cet email, votre configuration Resend fonctionne !
          </p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e9ecef; border-radius: 5px; font-size: 12px; color: #6c757d;">
          <p><strong>Note:</strong> Cet email est un test de configuration pour le système de réservation Nzoo Immo.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ['test@example.com'],
        subject: `Test Resend - ${fromEmail} - ${new Date().toLocaleString()}`,
        html: testHtml,
        reply_to: fromEmail
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Succès avec ${fromEmail}`);
      console.log(`   ID: ${result.id}`);
      return { success: true, email: fromEmail, id: result.id };
    } else {
      const error = await response.text();
      console.log(`❌ Échec avec ${fromEmail}: ${response.status} - ${error}`);
      return { success: false, email: fromEmail, error: error };
    }
  } catch (error) {
    console.log(`❌ Erreur réseau avec ${fromEmail}: ${error.message}`);
    return { success: false, email: fromEmail, error: error.message };
  }
}

async function testAllEmails() {
  console.log('🧪 Test de tous les emails d\'expéditeur possibles');
  console.log('================================================');
  
  const results = [];
  
  for (const fromEmail of FROM_EMAILS) {
    const result = await testEmailSending(fromEmail);
    results.push(result);
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 Résultats des tests');
  console.log('=====================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length > 0) {
    console.log(`✅ ${successful.length} email(s) fonctionnel(s):`);
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
  
  if (successful.length > 0) {
    console.log('\n🎉 Configuration réussie !');
    console.log(`💡 Utilisez l'email: ${successful[0].email}`);
    
    // Mettre à jour la configuration Supabase
    console.log('\n🔧 Mise à jour de la configuration Supabase...');
    try {
      const { execSync } = require('child_process');
      execSync(`npx supabase secrets set FROM_EMAIL=${successful[0].email} --project-ref nnkywmfxoohehtyyzzgp`, { stdio: 'inherit' });
      console.log('✅ Configuration Supabase mise à jour');
    } catch (error) {
      console.log('⚠️  Impossible de mettre à jour Supabase automatiquement');
      console.log(`   Configurez manuellement FROM_EMAIL=${successful[0].email} dans Supabase`);
    }
  } else {
    console.log('\n⚠️  Aucun email fonctionnel trouvé');
    console.log('💡 Solutions:');
    console.log('1. Vérifiez votre domaine dans le dashboard Resend');
    console.log('2. Ajoutez un email vérifié dans Resend');
    console.log('3. Configurez les enregistrements DNS pour nzoo.immo');
  }
  
  return successful.length > 0;
}

testAllEmails().catch(console.error);
