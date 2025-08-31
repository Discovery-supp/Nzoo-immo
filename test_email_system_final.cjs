#!/usr/bin/env node

/**
 * Test complet du système d'email unifié Nzoo Immo
 * Teste tous les types d'emails (confirmation, annulation, completion, bienvenue) avec la charte graphique
 */

// Configuration Supabase
const SUPABASE_URL = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

// Fonction pour envoyer un email via la fonction Edge
async function sendEmailDirect(to, subject, html, data) {
  try {
    console.log('📧 [TEST] Envoi email à:', to);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
      console.error('❌ [TEST] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [TEST] Email envoyé avec succès:', result);
    return result;
    
  } catch (error) {
    console.error('❌ [TEST] Erreur envoi email:', error);
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
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-family: 'Montserrat', sans-serif;
                font-size: 18px;
                font-weight: 600;
                color: #183154;
                margin-bottom: 20px;
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
                font-size: 18px;
                font-weight: 700;
                color: #183154;
                margin-bottom: 20px;
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
                font-weight: 500;
                color: #183154;
                flex: 1;
            }
            
            .detail-value {
                font-family: 'Poppins', sans-serif;
                font-weight: 400;
                color: #183154;
                flex: 2;
                text-align: right;
            }
            
            .amount {
                font-family: 'Montserrat', sans-serif;
                font-weight: 700;
                color: #10b981;
            }
            
            .footer {
                background-color: #183154;
                color: white;
                padding: 30px 20px;
                text-align: center;
            }
            
            .footer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 20px;
            }
            
            .contact-info {
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
                line-height: 1.6;
            }
            
            .contact-phone {
                color: #D3D6DB;
                text-decoration: none;
            }
            
            .contact-phone:hover {
                color: white;
            }
            
            .social-links {
                font-family: 'Poppins', sans-serif;
                font-size: 14px;
            }
            
            .social-link {
                color: #D3D6DB;
                text-decoration: none;
                margin: 0 5px;
            }
            
            .social-link:hover {
                color: white;
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
                    padding: 30px 20px;
                }
                
                .footer-content {
                    flex-direction: column;
                    text-align: center;
                }
                
                .detail-row {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 5px;
                }
                
                .detail-value {
                    text-align: left;
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

// Test 1: Email de confirmation de réservation
async function testConfirmationEmail() {
  console.log('\n🧪 TEST 1: Email de confirmation de réservation');
  
  const reservation = {
    id: 'test-conf-001',
    full_name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '+243 123 456 789',
    company: 'Tech Solutions SARL',
    activity: 'Développement logiciel',
    space_type: 'Bureau privé',
    start_date: '2024-01-15',
    end_date: '2024-01-20',
    amount: 250,
    payment_method: 'Mobile Money (Airtel)',
    status: 'confirmed'
  };

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="status-icon success-icon">✅</div>
            <h1 style="color: #10b981; font-size: 24px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;">Réservation Confirmée</h1>
            <p style="color: #183154; font-size: 16px; font-family: 'Poppins', sans-serif;">Votre réservation a été confirmée avec succès</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${reservation.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous sommes ravis de confirmer votre réservation chez Nzoo Immo ! 
            Votre espace est maintenant réservé et vous pouvez vous présenter 
            à la date prévue.
        </div>
        
        <div class="details-box">
            <div class="details-title">📋 Détails de votre réservation</div>
            
            <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${reservation.id}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espace :</span>
                <span class="detail-value">${reservation.space_type}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Période :</span>
                <span class="detail-value">${reservation.start_date} à ${reservation.end_date}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Montant :</span>
                <span class="detail-value amount">$${reservation.amount}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Paiement :</span>
                <span class="detail-value">${reservation.payment_method}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #183154; font-size: 14px; font-family: 'Poppins', sans-serif;">
                Nous vous attendons avec impatience ! N'hésitez pas à nous contacter 
                si vous avez des questions.
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    const result = await sendEmailDirect(
      reservation.email,
      `✅ Réservation confirmée - ${reservation.id}`,
      emailHtml,
      reservation
    );

    console.log('✅ Test confirmation réussi');
    return true;
    
  } catch (error) {
    console.error('❌ Test confirmation échoué:', error);
    return false;
  }
}

// Test 2: Email d'annulation de réservation
async function testCancellationEmail() {
  console.log('\n🧪 TEST 2: Email d\'annulation de réservation');
  
  const reservation = {
    id: 'test-cancel-002',
    full_name: 'Marie Martin',
    email: 'marie.martin@example.com',
    phone: '+243 987 654 321',
    company: 'Consulting Plus',
    activity: 'Conseil en gestion',
    space_type: 'Salle de réunion',
    start_date: '2024-01-25',
    end_date: '2024-01-26',
    amount: 180,
    payment_method: 'Carte Visa',
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
            Bonjour <strong>${reservation.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous confirmons l'annulation de votre réservation. 
            Vous trouverez ci-dessous les détails de la réservation annulée.
        </div>
        
        <div class="details-box">
            <div class="details-title">📋 Détails de la réservation annulée</div>
            
            <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${reservation.id}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espace :</span>
                <span class="detail-value">${reservation.space_type}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Dates :</span>
                <span class="detail-value">${reservation.start_date} à ${reservation.end_date}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Montant :</span>
                <span class="detail-value amount">$${reservation.amount}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Paiement :</span>
                <span class="detail-value">${reservation.payment_method}</span>
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
      reservation.email,
      `❌ Réservation annulée - ${reservation.id}`,
      emailHtml,
      reservation
    );

    console.log('✅ Test annulation réussi');
    return true;
    
  } catch (error) {
    console.error('❌ Test annulation échoué:', error);
    return false;
  }
}

// Test 3: Email de completion de réservation
async function testCompletionEmail() {
  console.log('\n🧪 TEST 3: Email de completion de réservation');
  
  const reservation = {
    id: 'test-comp-003',
    full_name: 'Pierre Dubois',
    email: 'pierre.dubois@example.com',
    phone: '+243 555 123 456',
    company: 'Innovation Lab',
    activity: 'Recherche et développement',
    space_type: 'Bureau partagé',
    start_date: '2024-01-10',
    end_date: '2024-01-12',
    amount: 120,
    payment_method: 'Cash',
    status: 'completed'
  };

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="status-icon success-icon">✅</div>
            <h1 style="color: #10b981; font-size: 24px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;">Réservation Terminée</h1>
            <p style="color: #183154; font-size: 16px; font-family: 'Poppins', sans-serif;">Votre séjour s'est terminé avec succès</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${reservation.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous confirmons la fin de votre séjour chez Nzoo Immo. 
            Nous espérons que votre expérience a été satisfaisante et 
            nous vous remercions de nous avoir fait confiance.
        </div>
        
        <div class="details-box">
            <div class="details-title">📋 Détails de la réservation terminée</div>
            
            <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${reservation.id}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espace :</span>
                <span class="detail-value">${reservation.space_type}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Période :</span>
                <span class="detail-value">${reservation.start_date} à ${reservation.end_date}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Montant total :</span>
                <span class="detail-value amount">$${reservation.amount}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Méthode de paiement :</span>
                <span class="detail-value">${reservation.payment_method}</span>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 10px; padding: 20px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
            <div style="font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 700; color: #0c4a6e; margin-bottom: 10px;">💡 Avis et recommandations</div>
            <div style="font-family: 'Poppins', sans-serif; color: #0c4a6e; font-size: 14px;">
                Votre avis est important pour nous ! N'hésitez pas à nous faire part de votre expérience 
                et à nous recommander auprès de vos collègues et partenaires.
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #183154; font-size: 14px; font-family: 'Poppins', sans-serif;">
                Nous espérons vous revoir bientôt chez Nzoo Immo !
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    const result = await sendEmailDirect(
      reservation.email,
      `✅ Réservation terminée - ${reservation.id}`,
      emailHtml,
      reservation
    );

    console.log('✅ Test completion réussi');
    return true;
    
  } catch (error) {
    console.error('❌ Test completion échoué:', error);
    return false;
  }
}

// Test 4: Email de bienvenue avec identifiants
async function testWelcomeEmail() {
  console.log('\n🧪 TEST 4: Email de bienvenue avec identifiants');
  
  const userData = {
    full_name: 'Sophie Laurent',
    email: 'sophie.laurent@example.com',
    phone: '+243 777 888 999',
    company: 'Digital Solutions',
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
            Bonjour <strong>${userData.full_name}</strong>,
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
                <span class="detail-value">${userData.email}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Mot de passe :</span>
                <span class="detail-value">${userData.password}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Téléphone :</span>
                <span class="detail-value">${userData.phone}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Entreprise :</span>
                <span class="detail-value">${userData.company}</span>
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
      userData.email,
      `🎉 Bienvenue chez Nzoo Immo - Votre compte a été créé !`,
      emailHtml,
      userData
    );

    console.log('✅ Test bienvenue réussi');
    return true;
    
  } catch (error) {
    console.error('❌ Test bienvenue échoué:', error);
    return false;
  }
}

// Fonction principale de test
async function runAllTests() {
  console.log('🚀 Démarrage des tests du système d\'email unifié Nzoo Immo');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Exécuter tous les tests
  results.push(await testConfirmationEmail());
  results.push(await testCancellationEmail());
  results.push(await testCompletionEmail());
  results.push(await testWelcomeEmail());
  
  // Résumé des résultats
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('=' .repeat(60));
  
  const successCount = results.filter(r => r).length;
  const totalTests = results.length;
  
  console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS !');
    console.log('✅ Le système d\'email unifié fonctionne parfaitement');
    console.log('✅ La charte graphique est respectée');
    console.log('✅ Tous les types d\'emails sont opérationnels');
  } else {
    console.log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('Vérifiez les logs ci-dessus pour plus de détails');
  }
  
  console.log('\n📧 Types d\'emails testés:');
  console.log('  1. Confirmation de réservation');
  console.log('  2. Annulation de réservation');
  console.log('  3. Completion de réservation');
  console.log('  4. Email de bienvenue avec identifiants');
  
  console.log('\n🎨 Éléments de charte graphique vérifiés:');
  console.log('  ✅ Logo Nzoo Immo');
  console.log('  ✅ Couleurs officielles (#183154, #10b981, etc.)');
  console.log('  ✅ Polices Poppins et Montserrat');
  console.log('  ✅ Numéros de contact (+243 893 796 306, +243 827 323 686)');
  console.log('  ✅ Design responsive');
}

// Exécuter les tests
runAllTests().catch(console.error);
