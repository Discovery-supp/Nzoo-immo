#!/usr/bin/env node

/**
 * Test d'intégration complète de l'application
 * Simule une réservation réelle via l'application
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Données de réservation simulées (comme dans l'application)
const testReservationData = {
  fullName: 'Marie Dupont',
  email: 'trickson.mabengi@gmail.com', // Votre email pour le test
  phone: '+243 987 654 321',
  company: 'Entreprise Test App',
  activity: 'Réunion d\'équipe',
  spaceType: 'Bureau',
  startDate: '2024-01-20',
  endDate: '2024-01-20',
  amount: 75000,
  transactionId: 'APP_TEST_' + Date.now(),
  status: 'pending'
};

// Test 1: Simulation de l'envoi d'email client (comme dans l'app)
async function testClientEmailFromApp() {
  console.log('📧 Test 1: Email client depuis l\'application...');
  
  const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Réservation Confirmée</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Nzoo Immo - Espaces de Travail</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Bonjour ${testReservationData.fullName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Nous confirmons votre réservation d'espace de travail. Voici les détails de votre réservation :
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">📋 Détails de la Réservation</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Nom complet :</strong></td>
                <td style="padding: 8px 0; color: #333;">${testReservationData.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Email :</strong></td>
                <td style="padding: 8px 0; color: #333;">${testReservationData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Téléphone :</strong></td>
                <td style="padding: 8px 0; color: #333;">${testReservationData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Entreprise :</strong></td>
                <td style="padding: 8px 0; color: #333;">${testReservationData.company}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Activité :</strong></td>
                <td style="padding: 8px 0; color: #333;">${testReservationData.activity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Type d'espace :</strong></td>
                <td style="padding: 8px 0; color: #333;">${testReservationData.spaceType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Date :</strong></td>
                <td style="padding: 8px 0; color: #333;">${new Date(testReservationData.startDate).toLocaleDateString('fr-FR')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>Montant :</strong></td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${testReservationData.amount.toLocaleString('fr-FR')} FC</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;"><strong>ID Transaction :</strong></td>
                <td style="padding: 8px 0; color: #333; font-family: monospace;">${testReservationData.transactionId}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">✅ Statut : En attente de confirmation</h3>
            <p style="color: #666; margin: 0;">
              Votre réservation a été enregistrée avec succès. Nous vous contacterons bientôt pour confirmer les détails.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://nzoo.immo" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Visiter notre site
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>Pour toute question, contactez-nous à <a href="mailto:contact@nzooimmo.com" style="color: #667eea;">contact@nzooimmo.com</a></p>
          <p>© 2024 Nzoo Immo. Tous droits réservés.</p>
        </div>
      </body>
    </html>
  `;

  try {
    // Simuler exactement ce que fait l'application
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: testReservationData.email,
        subject: `Confirmation de réservation - ${testReservationData.fullName}`,
        html: emailHtml,
        reservationData: testReservationData
      }
    });

    if (error) {
      console.log(`❌ Erreur: ${error.message}`);
      return false;
    } else {
      console.log('✅ Email client envoyé avec succès depuis l\'app');
      console.log(`📧 Résultat: ${JSON.stringify(data, null, 2)}`);
      return data.success;
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    return false;
  }
}

// Test 2: Simulation de l'envoi d'email admin (comme dans l'app)
async function testAdminEmailFromApp() {
  console.log('\n📧 Test 2: Email admin depuis l\'application...');
  
  const adminEmailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; border-radius: 15px; text-align: center;">
          <h1>🚨 Nouvelle Réservation Reçue</h1>
          <p>Action requise - Nzoo Immo</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 15px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #dc3545;">Nouvelle réservation de ${testReservationData.fullName}</h2>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">⚠️ Action Requise</h3>
            <ul style="color: #856404;">
              <li>Vérifier la disponibilité de l'espace</li>
              <li>Confirmer la réservation</li>
              <li>Préparer l'espace pour le client</li>
            </ul>
          </div>
          
          <h3>Détails de la réservation :</h3>
          <p><strong>Client :</strong> ${testReservationData.fullName}</p>
          <p><strong>Email :</strong> ${testReservationData.email}</p>
          <p><strong>Téléphone :</strong> ${testReservationData.phone}</p>
          <p><strong>Activité :</strong> ${testReservationData.activity}</p>
          <p><strong>Espace :</strong> ${testReservationData.spaceType}</p>
          <p><strong>Date :</strong> ${new Date(testReservationData.startDate).toLocaleDateString('fr-FR')}</p>
          <p><strong>Montant :</strong> ${testReservationData.amount.toLocaleString('fr-FR')} FC</p>
        </div>
      </body>
    </html>
  `;

  // Emails d'administration (comme dans l'app)
  const ADMIN_EMAILS = [
    'tricksonmabengi123@gmail.com',
    'contact@nzooimmo.com',
    'esther.kilolo@celluleinfra.org',
    'myv.nsuanda2012@gmail.com'
  ];

  try {
    const emailPromises = ADMIN_EMAILS.map(async (adminEmail) => {
      console.log(`📧 Envoi admin vers: ${adminEmail}`);
      
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: adminEmail,
          subject: `Nouvelle réservation reçue - ${testReservationData.fullName}`,
          html: adminEmailHtml,
          reservationData: testReservationData
        }
      });

      if (error) {
        console.log(`❌ Erreur pour ${adminEmail}: ${error.message}`);
        return { success: false, email: adminEmail, error: error.message };
      }

      return { success: true, email: adminEmail, data };
    });

    const results = await Promise.all(emailPromises);
    const successfulEmails = results.filter(r => r.success).length;
    const failedEmails = results.filter(r => !r.success).length;

    console.log(`📧 Résultats admin: ${successfulEmails}/${ADMIN_EMAILS.length} succès`);

    return successfulEmails > 0;
  } catch (error) {
    console.log(`❌ Erreur générale admin: ${error.message}`);
    return false;
  }
}

// Test principal
async function runAppIntegrationTest() {
  console.log('🧪 Test d\'intégration complète de l\'application');
  console.log('================================================');
  console.log(`📋 Données de test:`);
  console.log(`   - Client: ${testReservationData.fullName}`);
  console.log(`   - Email: ${testReservationData.email}`);
  console.log(`   - Espace: ${testReservationData.spaceType}`);
  console.log(`   - Montant: ${testReservationData.amount.toLocaleString('fr-FR')} FC`);
  console.log('');

  const clientEmailResult = await testClientEmailFromApp();
  const adminEmailResult = await testAdminEmailFromApp();

  console.log('\n📊 Résultats de l\'intégration');
  console.log('==============================');
  console.log(`📧 Email client depuis l'app: ${clientEmailResult ? '✅' : '❌'}`);
  console.log(`📧 Email admin depuis l'app: ${adminEmailResult ? '✅' : '❌'}`);

  if (clientEmailResult && adminEmailResult) {
    console.log('\n🎉 Intégration application réussie !');
    console.log('✅ Les emails sont envoyés correctement depuis l\'application');
    console.log('✅ Le système de réservation fonctionne parfaitement');
  } else {
    console.log('\n⚠️  Problème d\'intégration détecté');
    console.log('💡 Vérifiez la configuration de l\'application');
    
    if (!clientEmailResult) {
      console.log('   - Problème avec l\'email client');
    }
    if (!adminEmailResult) {
      console.log('   - Problème avec l\'email admin');
    }
  }

  return clientEmailResult && adminEmailResult;
}

runAppIntegrationTest().catch(console.error);
