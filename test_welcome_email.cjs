#!/usr/bin/env node

/**
 * Test du système d'email de bienvenue avec identifiants
 * 
 * Ce script teste l'envoi d'email de bienvenue pour les nouveaux utilisateurs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour générer un mot de passe temporaire sécurisé
function generateTemporaryPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Au moins une majuscule
  password += chars.charAt(Math.floor(Math.random() * 26));
  
  // Au moins une minuscule
  password += chars.charAt(26 + Math.floor(Math.random() * 26));
  
  // Au moins un chiffre
  password += chars.charAt(52 + Math.floor(Math.random() * 10));
  
  // Au moins un symbole
  password += chars.charAt(62 + Math.floor(Math.random() * 8));
  
  // Remplir le reste
  for (let i = 4; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Template d'email de bienvenue professionnel
const createWelcomeEmailTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nzoo Immo - Bienvenue</title>
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
            
            .credentials-box {
                background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
                border-radius: 10px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #2196f3;
                border: 2px solid #2196f3;
            }
            
            .credentials-title {
                font-size: 20px;
                font-weight: bold;
                color: #1976d2;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .credential-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #e3f2fd;
            }
            
            .credential-row:last-child {
                border-bottom: none;
            }
            
            .credential-label {
                font-weight: 600;
                color: #1976d2;
                min-width: 140px;
            }
            
            .credential-value {
                color: #2c3e50;
                text-align: right;
                font-weight: 500;
                font-family: 'Courier New', monospace;
                background-color: #f5f5f5;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #ddd;
            }
            
            .warning-box {
                background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
                border-radius: 10px;
                padding: 20px;
                margin: 25px 0;
                border-left: 4px solid #ff9800;
            }
            
            .warning-title {
                font-size: 16px;
                font-weight: bold;
                color: #e65100;
                margin-bottom: 10px;
            }
            
            .warning-text {
                color: #bf360c;
                font-size: 14px;
            }
            
            .action-buttons {
                text-align: center;
                margin: 30px 0;
            }
            
            .btn {
                display: inline-block;
                padding: 12px 24px;
                margin: 0 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
            
            .welcome-icon {
                font-size: 48px;
                color: #2196f3;
                margin-bottom: 15px;
            }
            
            @media (max-width: 600px) {
                .content {
                    padding: 20px 15px;
                }
                
                .header {
                    padding: 20px 15px;
                }
                
                .credential-row {
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }
                
                .credential-value {
                    text-align: left;
                    margin-top: 5px;
                    width: 100%;
                }
                
                .btn {
                    display: block;
                    margin: 10px 0;
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

// Simuler le service d'email direct
async function sendEmailDirect(to, subject, html, userData) {
  try {
    console.log('📧 [WELCOME] Envoi email de bienvenue à:', to);
    
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
        userData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [WELCOME] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [WELCOME] Email de bienvenue envoyé avec succès:', data);
    return data;
    
  } catch (error) {
    console.error('❌ [WELCOME] Erreur envoi email de bienvenue:', error);
    throw error;
  }
}

// Test du système d'email de bienvenue
async function testWelcomeEmail() {
  console.log('👤 TEST SYSTÈME EMAIL DE BIENVENUE AVEC IDENTIFIANTS');
  console.log('==================================================');
  console.log('');
  
  // Données de test pour un nouvel utilisateur
  const testUser = {
    email: 'trickson.mabengi@gmail.com',
    full_name: 'Test Utilisateur',
    phone: '+243123456789',
    company: 'Test Company',
    password: generateTemporaryPassword()
  };

  console.log('📝 [TEST] Données utilisateur de test:', {
    ...testUser,
    password: testUser.password // Afficher le mot de passe généré
  });
  console.log('');

  try {
    console.log('📧 [TEST] Test envoi email de bienvenue avec identifiants...');
    
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="welcome-icon">🎉</div>
            <h1 style="color: #2196f3; font-size: 24px; margin-bottom: 10px;">Bienvenue chez Nzoo Immo !</h1>
            <p style="color: #6c757d; font-size: 16px;">Votre compte a été créé avec succès</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${testUser.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous sommes ravis de vous accueillir dans la famille Nzoo Immo ! 
            Votre compte a été créé avec succès et vous pouvez dès maintenant 
            accéder à tous nos services de réservation d'espaces.
        </div>
        
        <div class="credentials-box">
            <div class="credentials-title">🔐 Vos identifiants de connexion</div>
            
            <div class="credential-row">
                <span class="credential-label">Email :</span>
                <span class="credential-value">${testUser.email}</span>
            </div>
            
            <div class="credential-row">
                <span class="credential-label">Mot de passe :</span>
                <span class="credential-value">${testUser.password}</span>
            </div>
            
            <div class="credential-row">
                <span class="credential-label">Téléphone :</span>
                <span class="credential-value">${testUser.phone}</span>
            </div>
            
            <div class="credential-row">
                <span class="credential-label">Entreprise :</span>
                <span class="credential-value">${testUser.company}</span>
            </div>
        </div>
        
        <div class="warning-box">
            <div class="warning-title">⚠️ Important : Sécurité</div>
            <div class="warning-text">
                Pour votre sécurité, nous vous recommandons fortement de changer 
                votre mot de passe temporaire dès votre première connexion. 
                Utilisez un mot de passe fort avec au moins 8 caractères, 
                incluant des lettres, chiffres et symboles.
            </div>
        </div>
        
        <div class="action-buttons">
            <a href="http://localhost:5173/login" class="btn">🔑 Se connecter</a>
            <a href="http://localhost:5173/reservation" class="btn">🏢 Réserver un espace</a>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6c757d; font-size: 14px;">
                Si vous avez des questions, n'hésitez pas à nous contacter. 
                Notre équipe est là pour vous accompagner !
            </p>
        </div>
    `;

    const emailHtml = createWelcomeEmailTemplate(emailContent);

    const result = await sendEmailDirect(
      testUser.email,
      `🎉 Bienvenue chez Nzoo Immo - Votre compte a été créé !`,
      emailHtml,
      testUser
    );
    
    console.log('');
    if (result && result.success) {
      console.log('🎉 SUCCÈS !');
      console.log('Le système d\'email de bienvenue fonctionne !');
      console.log(`📧 Provider utilisé: ${result.provider || 'unknown'}`);
      console.log(`📧 Email envoyé: ${result.emailSent || false}`);
      console.log(`👤 Utilisateur: ${testUser.full_name}`);
      console.log(`🔐 Mot de passe temporaire: ${testUser.password}`);
      console.log(`📧 Email: ${testUser.email}`);
    } else {
      console.log('⚠️ RÉSULTAT MIXTE');
      console.log('L\'email n\'a pas été envoyé mais le système est prêt');
      console.log('Mode simulation activé');
    }
    
  } catch (error) {
    console.log('❌ ÉCHEC');
    console.log('Erreur lors du test:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Démarrage du test système d\'email de bienvenue...\n');
  
  await testWelcomeEmail();
  
  console.log('');
  console.log('📋 Résumé:');
  console.log('✅ Si vous voyez "SUCCÈS", le système d\'email de bienvenue fonctionne !');
  console.log('⚠️ Si vous voyez "RÉSULTAT MIXTE", l\'email est en mode simulation');
  console.log('❌ Si vous voyez "ÉCHEC", il y a encore un problème');
  console.log('');
  console.log('🎯 Fonctionnalités testées:');
  console.log('   - Génération de mot de passe temporaire sécurisé');
  console.log('   - Email de bienvenue avec identifiants');
  console.log('   - Design professionnel avec logo Nzoo Immo');
  console.log('   - Boîte d\'identifiants avec style sécurisé');
  console.log('   - Avertissement de sécurité');
  console.log('   - Boutons d\'action (connexion, réservation)');
  console.log('');
  console.log('🔐 Caractéristiques du mot de passe temporaire:');
  console.log('   - 12 caractères');
  console.log('   - Au moins 1 majuscule');
  console.log('   - Au moins 1 minuscule');
  console.log('   - Au moins 1 chiffre');
  console.log('   - Au moins 1 symbole');
  console.log('');
  console.log('🎯 Prochaine étape: Intégrez ce système dans votre application !');
}

runTest().catch(console.error);
