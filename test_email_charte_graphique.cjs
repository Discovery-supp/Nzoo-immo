#!/usr/bin/env node

/**
 * Test des emails avec charte graphique Nzoo Immo officielle
 * 
 * Ce script teste les emails avec les couleurs et polices officielles
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Template d'email avec charte graphique Nzoo Immo officielle
const createEmailTemplate = (content, isAdmin = false) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nzoo Immo - Réservation</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Poppins', sans-serif;
                line-height: 1.6;
                color: #183154;
                background-color: #f8f9fa;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #FFFFFF;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(24, 49, 84, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #183154 0%, #1e3a5f 100%);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            
            .logo-container {
                margin-bottom: 15px;
            }
            
            .logo {
                max-width: 200px;
                height: auto;
                filter: brightness(0) invert(1);
            }
            
            .tagline {
                font-family: 'Montserrat', sans-serif;
                font-size: 16px;
                font-weight: 500;
                opacity: 0.95;
                font-style: italic;
                margin-top: 10px;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-family: 'Montserrat', sans-serif;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 25px;
                color: #183154;
            }
            
            .main-message {
                font-family: 'Poppins', sans-serif;
                font-size: 16px;
                font-weight: 400;
                margin-bottom: 30px;
                color: #183154;
            }
            
            .reservation-details {
                background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
                border-radius: 10px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #183154;
            }
            
            .detail-title {
                font-family: 'Montserrat', sans-serif;
                font-size: 20px;
                font-weight: 700;
                color: #183154;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #bcccdc;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                color: #183154;
                min-width: 140px;
            }
            
            .detail-value {
                font-family: 'Poppins', sans-serif;
                color: #183154;
                text-align: right;
                font-weight: 500;
            }
            
            .amount {
                font-family: 'Montserrat', sans-serif;
                font-size: 18px;
                font-weight: 700;
                color: #10b981;
            }
            
            .footer {
                background-color: #183154;
                color: white;
                padding: 25px 30px;
                text-align: center;
            }
            
            .footer-content {
                margin-bottom: 20px;
            }
            
            .contact-info {
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
                margin-bottom: 15px;
            }
            
            .contact-phone {
                color: #D3D6DB;
                font-weight: 600;
                text-decoration: none;
            }
            
            .social-links {
                margin-top: 15px;
            }
            
            .social-link {
                display: inline-block;
                margin: 0 10px;
                color: #D3D6DB;
                text-decoration: none;
                font-weight: 500;
            }
            
            .success-icon {
                font-size: 48px;
                color: #10b981;
                margin-bottom: 15px;
            }
            
            .admin-badge {
                background-color: #ef4444;
                color: white;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                margin-left: 10px;
            }
            
            @media (max-width: 600px) {
                .content {
                    padding: 20px 15px;
                }
                
                .header {
                    padding: 20px 15px;
                }
                
                .logo {
                    max-width: 150px;
                }
                
                .detail-row {
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }
                
                .detail-value {
                    text-align: left;
                    margin-top: 5px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo-container">
                    <img src="https://nnkywmfxoohehtyyzzgp.supabase.co/storage/v1/object/public/nzoo-immo-bucket/logo_nzooimmo.svg" 
                         alt="Nzoo Immo" 
                         class="logo">
                </div>
                <div class="tagline">Votre partenaire immobilier de confiance à Kinshasa</div>
            </div>
            
            <div class="content">
                ${content}
            </div>
            
            <div class="footer">
                <div class="footer-content">
                    <div class="contact-info">
                        <strong>Nzoo Immo</strong><br>
                        📍 16, colonel Lukusa, Commune de la Gombe<br>
📍 Kinshasa, République Démocratique du Congo<br>
                        📧 contact@nzooimmo.com<br>
                        📞 <a href="tel:+243893796306" class="contact-phone">+243 893 796 306</a><br>
                        📞 <a href="tel:+243827323686" class="contact-phone">+243 827 323 686</a>
                    </div>
                    <div class="social-links">
                        <a href="#" class="social-link">Facebook</a> |
                        <a href="#" class="social-link">LinkedIn</a> |
                        <a href="#" class="social-link">Instagram</a>
                    </div>
                </div>
                <div style="font-size: 12px; opacity: 0.8;">
                    © 2024 Nzoo Immo. Tous droits réservés.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Simuler le service d'email direct
async function sendEmailDirect(to, subject, html, reservationData) {
  try {
    console.log('📧 [CHARTE] Envoi email avec charte graphique à:', to);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        reservationData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [CHARTE] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [CHARTE] Email avec charte graphique envoyé avec succès:', data);
    return data;
    
  } catch (error) {
    console.error('❌ [CHARTE] Erreur envoi email avec charte graphique:', error);
    throw error;
  }
}

// Test des emails avec charte graphique officielle
async function testEmailWithCharteGraphique() {
  console.log('🎨 TEST EMAILS AVEC CHARTE GRAPHIQUE NZOO IMMO OFFICIELLE');
  console.log('==========================================================');
  console.log('');
  
  // Données de test
  const testReservation = {
    id: 'test_' + Date.now(),
    full_name: 'Test Utilisateur',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243123456789',
    company: 'Test Company',
    activity: 'Développement web',
    space_type: 'coworking',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    amount: 50,
    transaction_id: 'TEST_' + Date.now(),
    payment_method: 'cash'
  };

  console.log('📝 [TEST] Données de test:', testReservation);
  console.log('');

  try {
    console.log('📧 [TEST] Test envoi email avec charte graphique Nzoo Immo...');
    
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="success-icon">🎉</div>
            <h1 style="color: #10b981; font-size: 24px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;">Réservation Confirmée !</h1>
            <p style="color: #183154; font-size: 16px; font-family: 'Poppins', sans-serif;">Votre réservation a été traitée avec succès</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${testReservation.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous sommes ravis de vous confirmer que votre réservation a été acceptée et confirmée. 
            Vous trouverez ci-dessous tous les détails de votre réservation.
        </div>
        
        <div class="reservation-details">
            <div class="detail-title">📋 Détails de votre réservation</div>
            
            <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${testReservation.transaction_id}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espace :</span>
                <span class="detail-value">${testReservation.space_type}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Dates :</span>
                <span class="detail-value">${testReservation.start_date} à ${testReservation.end_date}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Montant :</span>
                <span class="detail-value amount">$${testReservation.amount}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Paiement :</span>
                <span class="detail-value">${testReservation.payment_method}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #183154; font-size: 14px; font-family: 'Poppins', sans-serif;">
                Merci de votre confiance ! Notre équipe est à votre disposition pour toute question.
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    const result = await sendEmailDirect(
      testReservation.email,
      `🎨 Test Email avec Charte Graphique Nzoo Immo - ${testReservation.transaction_id}`,
      emailHtml,
      testReservation
    );
    
    console.log('');
    if (result && result.success) {
      console.log('🎉 SUCCÈS !');
      console.log('Les emails avec charte graphique Nzoo Immo fonctionnent !');
      console.log(`📧 Provider utilisé: ${result.provider || 'unknown'}`);
      console.log(`📧 Email envoyé: ${result.emailSent || false}`);
      console.log(`🎨 Charte graphique: Couleurs et polices officielles`);
      console.log(`📞 Contacts: +243 893 796 306 / +243 827 323 686`);
      console.log(`💰 Montant affiché: $${testReservation.amount}`);
    } else {
      console.log('⚠️ RÉSULTAT MIXTE');
      console.log('L\'email n\'a pas été envoyé mais le design est prêt');
      console.log('Mode simulation activé');
    }
    
  } catch (error) {
    console.log('❌ ÉCHEC');
    console.log('Erreur lors du test:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Démarrage du test emails avec charte graphique Nzoo Immo...\n');
  
  await testEmailWithCharteGraphique();
  
  console.log('');
  console.log('📋 Résumé:');
  console.log('✅ Si vous voyez "SUCCÈS", les emails avec charte graphique fonctionnent !');
  console.log('⚠️ Si vous voyez "RÉSULTAT MIXTE", l\'email est en mode simulation');
  console.log('❌ Si vous voyez "ÉCHEC", il y a encore un problème');
  console.log('');
  console.log('🎨 Charte graphique appliquée:');
  console.log('   - Couleur principale: #183154 (nzoo-dark)');
  console.log('   - Couleur secondaire: #D3D6DB (nzoo-gray)');
  console.log('   - Police titres: Montserrat');
  console.log('   - Police corps: Poppins');
  console.log('   - Logo officiel Nzoo Immo');
  console.log('   - Vrais numéros de contact');
  console.log('');
  console.log('📞 Contacts intégrés:');
  console.log('   - +243 893 796 306');
  console.log('   - +243 827 323 686');
  console.log('');
  console.log('🎯 Prochaine étape: Testez l\'application web avec la charte graphique !');
}

runTest().catch(console.error);
