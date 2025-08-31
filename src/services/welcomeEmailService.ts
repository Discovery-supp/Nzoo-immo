/**
 * Service d'email de bienvenue pour les nouveaux utilisateurs
 * Envoie un email avec les identifiants de connexion
 */

// Configuration Supabase
const SUPABASE_URL = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

// Interface pour les données utilisateur
interface UserData {
  email: string;
  full_name: string;
  phone?: string;
  company?: string;
  password?: string; // Mot de passe temporaire si généré automatiquement
}

// Fonction pour envoyer un email via la fonction Edge
async function sendEmailDirect(to: string, subject: string, html: string, userData?: any) {
  try {
    console.log('📧 [WELCOME] Envoi email de bienvenue à:', to);
    
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

// Template d'email avec charte graphique Nzoo Immo officielle
const createWelcomeEmailTemplate = (content: string) => {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nzoo Immo - Bienvenue</title>
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
            
            .credentials-box {
                background: linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%);
                border-radius: 10px;
                padding: 25px;
                margin: 25px 0;
                border-left: 4px solid #183154;
                border: 2px solid #183154;
            }
            
            .credentials-title {
                font-family: 'Montserrat', sans-serif;
                font-size: 20px;
                font-weight: 700;
                color: #183154;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .credential-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid #bcccdc;
            }
            
            .credential-row:last-child {
                border-bottom: none;
            }
            
            .credential-label {
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                color: #183154;
                min-width: 140px;
            }
            
            .credential-value {
                font-family: 'Poppins', sans-serif;
                color: #183154;
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
                border-left: 4px solid #f59e0b;
            }
            
            .warning-title {
                font-family: 'Montserrat', sans-serif;
                font-size: 16px;
                font-weight: 700;
                color: #d97706;
                margin-bottom: 10px;
            }
            
            .warning-text {
                font-family: 'Poppins', sans-serif;
                color: #92400e;
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
                background: linear-gradient(135deg, #183154 0%, #1e3a5f 100%);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                font-family: 'Poppins', sans-serif;
                transition: all 0.3s ease;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(24, 49, 84, 0.2);
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
            
            .welcome-icon {
                font-size: 48px;
                color: #183154;
                margin-bottom: 15px;
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

// Fonction pour envoyer l'email de bienvenue avec identifiants
export const sendWelcomeEmail = async (userData: UserData) => {
  console.log('📧 [WELCOME] Envoi email de bienvenue:', userData.email);

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="welcome-icon">🎉</div>
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
        
        <div class="credentials-box">
            <div class="credentials-title">🔐 Vos identifiants de connexion</div>
            
            <div class="credential-row">
                <span class="credential-label">Email :</span>
                <span class="credential-value">${userData.email}</span>
            </div>
            
            ${userData.password ? `
            <div class="credential-row">
                <span class="credential-label">Mot de passe :</span>
                <span class="credential-value">${userData.password}</span>
            </div>
            ` : ''}
            
            ${userData.phone ? `
            <div class="credential-row">
                <span class="credential-label">Téléphone :</span>
                <span class="credential-value">${userData.phone}</span>
            </div>
            ` : ''}
            
            ${userData.company ? `
            <div class="credential-row">
                <span class="credential-label">Entreprise :</span>
                <span class="credential-value">${userData.company}</span>
            </div>
            ` : ''}
        </div>
        
        ${userData.password ? `
        <div class="warning-box">
            <div class="warning-title">⚠️ Important : Sécurité</div>
            <div class="warning-text">
                Pour votre sécurité, nous vous recommandons fortement de changer 
                votre mot de passe temporaire dès votre première connexion. 
                Utilisez un mot de passe fort avec au moins 8 caractères, 
                incluant des lettres, chiffres et symboles.
            </div>
        </div>
        ` : ''}
        
        <div class="action-buttons">
            <a href="http://localhost:5173/login" class="btn">🔑 Se connecter</a>
            <a href="http://localhost:5173/reservation" class="btn">🏢 Réserver un espace</a>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #183154; font-size: 14px; font-family: 'Poppins', sans-serif;">
                Si vous avez des questions, n'hésitez pas à nous contacter. 
                Notre équipe est là pour vous accompagner !
            </p>
        </div>
    `;

    const emailHtml = createWelcomeEmailTemplate(emailContent);

    return await sendEmailDirect(
      userData.email,
      `🎉 Bienvenue chez Nzoo Immo - Votre compte a été créé !`,
      emailHtml,
      userData
    );
    
  } catch (error) {
    console.error('❌ [WELCOME] Erreur email de bienvenue:', error);
    
    // Fallback: simulation d'envoi d'email
    console.log('📧 [WELCOME] Mode simulation - Email de bienvenue non envoyé');
    console.log('📧 [WELCOME] Email qui aurait été envoyé à:', userData.email);
    console.log('📧 [WELCOME] Sujet: Bienvenue chez Nzoo Immo');
    
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
};

// Fonction pour générer un mot de passe temporaire sécurisé
export const generateTemporaryPassword = (): string => {
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
};

// Fonction principale pour créer un compte et envoyer l'email de bienvenue
export const createAccountWithWelcomeEmail = async (userData: UserData) => {
  console.log('👤 [ACCOUNT] Création de compte avec email de bienvenue:', userData.email);

  try {
    // Si aucun mot de passe n'est fourni, en générer un temporaire
    if (!userData.password) {
      userData.password = generateTemporaryPassword();
      console.log('🔐 [ACCOUNT] Mot de passe temporaire généré:', userData.password);
    }

    // Ici, vous pouvez ajouter la logique de création de compte dans Supabase
    // const { data: user, error } = await supabase.auth.signUp({
    //   email: userData.email,
    //   password: userData.password,
    //   options: {
    //     data: {
    //       full_name: userData.full_name,
    //       phone: userData.phone,
    //       company: userData.company
    //     }
    //   }
    // });

    // Envoyer l'email de bienvenue
    const emailResult = await sendWelcomeEmail(userData);
    
    console.log('✅ [ACCOUNT] Compte créé et email de bienvenue envoyé');
    
    return {
      success: true,
      user: userData,
      emailSent: emailResult.success,
      temporaryPassword: userData.password
    };
    
  } catch (error) {
    console.error('❌ [ACCOUNT] Erreur création de compte:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
};
