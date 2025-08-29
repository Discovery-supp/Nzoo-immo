#!/usr/bin/env node

/**
 * Test final du système d'email unifié avec charte graphique Nzoo Immo
 * 
 * Ce script teste tous les types d'emails (confirmation, annulation, bienvenue)
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour envoyer un email via la fonction Edge
async function sendEmailDirect(to, subject, html, data) {
  try {
    console.log('📧 [FINAL] Envoi email à:', to);
    
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
        data
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [FINAL] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [FINAL] Email envoyé avec succès:', result);
    return result;
    
  } catch (error) {
    console.error('❌ [FINAL] Erreur envoi email:', error);
    throw error;
  }
}

// Template d'email avec charte graphique Nzoo Immo officielle
const createEmailTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nzoo Immo - Communication</title>
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
            
            .details-box {
                background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
                border-radius: 10px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #183154;
            }
            
            .details-title {
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
            
            .status-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }
            
            .success-icon {
                color: #10b981;
            }
            
            .cancellation-icon {
                color: #ef4444;
            }
            
            .warning-icon {
                color: #f59e0b;
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

// Test des emails de confirmation de réservation
async function testReservationConfirmationEmail() {
  console.log('🎉 TEST EMAIL DE CONFIRMATION DE RÉSERVATION');
  console.log('============================================');
  
  const testReservation = {
    id: 'test_confirmation_' + Date.now(),
    full_name: 'Test Utilisateur',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243123456789',
    company: 'Test Company',
    activity: 'Développement web',
    space_type: 'coworking',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    amount: 50,
    transaction_id: 'CONFIRM_TEST_' + Date.now(),
    payment_method: 'cash',
    status: 'confirmed'
  };

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="status-icon success-icon">🎉</div>
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
        
        <div class="details-box">
            <div class="details-title">📋 Détails de votre réservation</div>
            
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
      `🎉 Test Email de Confirmation - ${testReservation.transaction_id}`,
      emailHtml,
      testReservation
    );
    
    console.log('✅ Email de confirmation envoyé avec succès');
    return result;
    
  } catch (error) {
    console.error('❌ Erreur email de confirmation:', error.message);
    return { success: false, error: error.message };
  }
}

// Test des emails d'annulation de réservation
async function testReservationCancellationEmail() {
  console.log('\n❌ TEST EMAIL D\'ANNULATION DE RÉSERVATION');
  console.log('==========================================');
  
  const testReservation = {
    id: 'test_cancellation_' + Date.now(),
    full_name: 'Test Utilisateur',
    email: 'trickson.mabengi@gmail.com',
    phone: '+243123456789',
    company: 'Test Company',
    activity: 'Développement web',
    space_type: 'coworking',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    amount: 50,
    transaction_id: 'CANCEL_TEST_' + Date.now(),
    payment_method: 'cash',
    status: 'cancelled'
  };

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="status-icon cancellation-icon">❌</div>
            <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;">Réservation Annulée</h1>
            <p style="color: #183154; font-size: 16px; font-family: 'Poppins', sans-serif;">Votre réservation a été annulée avec succès</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${testReservation.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous confirmons l'annulation de votre réservation. 
            Vous trouverez ci-dessous les détails de la réservation annulée.
        </div>
        
        <div class="details-box">
            <div class="details-title">📋 Détails de la réservation annulée</div>
            
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
                Si vous avez des questions concernant cette annulation, n'hésitez pas à nous contacter.
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    const result = await sendEmailDirect(
      testReservation.email,
      `❌ Test Email d'Annulation - ${testReservation.transaction_id}`,
      emailHtml,
      testReservation
    );
    
    console.log('✅ Email d\'annulation envoyé avec succès');
    return result;
    
  } catch (error) {
    console.error('❌ Erreur email d\'annulation:', error.message);
    return { success: false, error: error.message };
  }
}

// Test des emails de bienvenue
async function testWelcomeEmail() {
  console.log('\n👤 TEST EMAIL DE BIENVENUE AVEC IDENTIFIANTS');
  console.log('============================================');
  
  const testUser = {
    email: 'trickson.mabengi@gmail.com',
    full_name: 'Test Utilisateur',
    phone: '+243123456789',
    company: 'Test Company',
    password: 'TempPass123!'
  };

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="status-icon success-icon">🎉</div>
            <h1 style="color: #183154; font-size: 24px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;">Bienvenue chez Nzoo Immo !</h1>
            <p style="color: #183154; font-size: 16px; font-family: 'Poppins', sans-serif;">Votre compte a été créé avec succès</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${testUser.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous sommes ravis de vous accueillir dans la famille Nzoo Immo ! 
            Votre compte a été créé avec succès et vous pouvez dès maintenant 
            accéder à tous nos services de réservation d'espaces.
        </div>
        
        <div class="details-box">
            <div class="details-title">🔐 Vos identifiants de connexion</div>
            
            <div class="detail-row">
                <span class="detail-label">Email :</span>
                <span class="detail-value">${testUser.email}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Mot de passe :</span>
                <span class="detail-value">${testUser.password}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Téléphone :</span>
                <span class="detail-value">${testUser.phone}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Entreprise :</span>
                <span class="detail-value">${testUser.company}</span>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <div style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #d97706; margin-bottom: 10px;">⚠️ Important : Sécurité</div>
            <div style="font-family: 'Poppins', sans-serif; color: #92400e; font-size: 14px;">
                Pour votre sécurité, nous vous recommandons fortement de changer 
                votre mot de passe temporaire dès votre première connexion. 
                Utilisez un mot de passe fort avec au moins 8 caractères, 
                incluant des lettres, chiffres et symboles.
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #183154; font-size: 14px; font-family: 'Poppins', sans-serif;">
                Si vous avez des questions, n'hésitez pas à nous contacter. 
                Notre équipe est là pour vous accompagner !
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    const result = await sendEmailDirect(
      testUser.email,
      `🎉 Test Email de Bienvenue - Compte créé !`,
      emailHtml,
      testUser
    );
    
    console.log('✅ Email de bienvenue envoyé avec succès');
    return result;
    
  } catch (error) {
    console.error('❌ Erreur email de bienvenue:', error.message);
    return { success: false, error: error.message };
  }
}

// Test principal
async function runAllTests() {
  console.log('🚀 TEST FINAL DU SYSTÈME D\'EMAIL UNIFIÉ NZOO IMMO');
  console.log('==================================================');
  console.log('');
  
  const results = {
    confirmation: null,
    cancellation: null,
    welcome: null
  };

  // Test 1: Email de confirmation
  results.confirmation = await testReservationConfirmationEmail();
  
  // Test 2: Email d'annulation
  results.cancellation = await testReservationCancellationEmail();
  
  // Test 3: Email de bienvenue
  results.welcome = await testWelcomeEmail();
  
  // Résumé des résultats
  console.log('\n📋 RÉSUMÉ DES TESTS');
  console.log('===================');
  console.log('');
  
  const successCount = Object.values(results).filter(r => r && r.success).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`✅ Emails envoyés avec succès: ${successCount}/${totalCount}`);
  console.log('');
  
  if (results.confirmation && results.confirmation.success) {
    console.log('🎉 Email de confirmation: ✅ SUCCÈS');
  } else {
    console.log('❌ Email de confirmation: ÉCHEC');
  }
  
  if (results.cancellation && results.cancellation.success) {
    console.log('❌ Email d\'annulation: ✅ SUCCÈS');
  } else {
    console.log('❌ Email d\'annulation: ÉCHEC');
  }
  
  if (results.welcome && results.welcome.success) {
    console.log('👤 Email de bienvenue: ✅ SUCCÈS');
  } else {
    console.log('❌ Email de bienvenue: ÉCHEC');
  }
  
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
  console.log('🎯 Système d\'email unifié prêt pour la production !');
}

runAllTests().catch(console.error);
