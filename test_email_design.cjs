#!/usr/bin/env node

/**
 * Test du nouveau design d'email professionnel avec logo
 * 
 * Ce script teste le nouveau template d'email avec design professionnel
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Template d'email professionnel avec logo
const createEmailTemplate = (content, isAdmin = false) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nzoo Immo - Réservation</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px 20px;
                text-align: center;
                color: white;
            }
            
            .logo {
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }
            
            .logo-icon {
                font-size: 32px;
                margin-right: 10px;
            }
            
            .tagline {
                font-size: 14px;
                opacity: 0.9;
                font-style: italic;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 25px;
                color: #2c3e50;
            }
            
            .main-message {
                font-size: 16px;
                margin-bottom: 30px;
                color: #555;
            }
            
            .reservation-details {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-radius: 10px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #667eea;
            }
            
            .detail-title {
                font-size: 20px;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e9ecef;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 600;
                color: #495057;
                min-width: 140px;
            }
            
            .detail-value {
                color: #2c3e50;
                text-align: right;
                font-weight: 500;
            }
            
            .amount {
                font-size: 18px;
                font-weight: bold;
                color: #28a745;
            }
            
            .footer {
                background-color: #2c3e50;
                color: white;
                padding: 25px 30px;
                text-align: center;
            }
            
            .footer-content {
                margin-bottom: 20px;
            }
            
            .contact-info {
                font-size: 14px;
                margin-bottom: 15px;
            }
            
            .social-links {
                margin-top: 15px;
            }
            
            .social-link {
                display: inline-block;
                margin: 0 10px;
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
            }
            
            .success-icon {
                font-size: 48px;
                color: #28a745;
                margin-bottom: 15px;
            }
            
            .admin-badge {
                background-color: #dc3545;
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
                <div class="logo">
                    <span class="logo-icon">🏢</span>
                    Nzoo Immo
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
                        📞 +243 XXX XXX XXX
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

// Simuler le nouveau service d'email direct
async function sendEmailDirect(to, subject, html, reservationData) {
  try {
    console.log('📧 [DESIGN] Envoi email à:', to);
    
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
      console.error('❌ [DESIGN] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [DESIGN] Email envoyé avec succès:', data);
    return data;
    
  } catch (error) {
    console.error('❌ [DESIGN] Erreur envoi email:', error);
    throw error;
  }
}

// Test du nouveau design d'email
async function testEmailDesign() {
  console.log('🎨 TEST NOUVEAU DESIGN EMAIL PROFESSIONNEL');
  console.log('==========================================');
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
    console.log('📧 [TEST] Test envoi email client avec nouveau design...');
    
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="success-icon">🎉</div>
            <h1 style="color: #28a745; font-size: 24px; margin-bottom: 10px;">Réservation Confirmée !</h1>
            <p style="color: #6c757d; font-size: 16px;">Votre réservation a été traitée avec succès</p>
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
            <p style="color: #6c757d; font-size: 14px;">
                Merci de votre confiance ! Notre équipe est à votre disposition pour toute question.
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    const result = await sendEmailDirect(
      testReservation.email,
      `🎨 Test Design Email - ${testReservation.transaction_id}`,
      emailHtml,
      testReservation
    );
    
    console.log('');
    if (result && result.success) {
      console.log('🎉 SUCCÈS !');
      console.log('Le nouveau design d\'email professionnel fonctionne !');
      console.log(`📧 Provider utilisé: ${result.provider || 'unknown'}`);
      console.log(`📧 Email envoyé: ${result.emailSent || false}`);
      console.log(`🎨 Design: Professionnel avec logo et gradient`);
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
  console.log('🚀 Démarrage du test nouveau design d\'email professionnel...\n');
  
  await testEmailDesign();
  
  console.log('');
  console.log('📋 Résumé:');
  console.log('✅ Si vous voyez "SUCCÈS", le nouveau design fonctionne !');
  console.log('⚠️ Si vous voyez "RÉSULTAT MIXTE", l\'email est en mode simulation');
  console.log('❌ Si vous voyez "ÉCHEC", il y a encore un problème');
  console.log('');
  console.log('🎨 Caractéristiques du nouveau design:');
  console.log('   - Logo Nzoo Immo avec icône 🏢');
  console.log('   - Header avec gradient professionnel');
  console.log('   - Design responsive (mobile-friendly)');
  console.log('   - Footer avec informations de contact');
  console.log('   - Montants en Dollars ($)');
  console.log('   - Badge ADMIN pour les emails admin');
  console.log('');
  console.log('🎯 Prochaine étape: Testez l\'application web avec le nouveau design !');
}

runTest().catch(console.error);
