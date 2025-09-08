/**
 * Service d'email direct pour contourner les problèmes CORS
 * Utilise fetch directement au lieu de supabase.functions.invoke
 */

// Configuration Supabase
const SUPABASE_URL = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

// Fonction pour envoyer un email via la fonction Edge
async function sendEmailDirect(to: string, subject: string, html: string, reservationData?: any) {
  try {
    console.log('📧 [DIRECT] Envoi email à:', to);
    
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
        reservationData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DIRECT] Erreur HTTP:', response.status, errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [DIRECT] Email envoyé avec succès:', data);
    return data;
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur envoi email:', error);
    throw error;
  }
}

// Template d'email avec charte graphique Nzoo Immo officielle
const createEmailTemplate = (content: string, isAdmin: boolean = false) => {
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
            
            .cancellation-icon {
                font-size: 48px;
                color: #ef4444;
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

// Fonction pour envoyer l'email de confirmation client
export const sendClientConfirmationEmail = async (reservation: any) => {
  console.log('📧 [DIRECT] Envoi confirmation client:', reservation.email);

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="success-icon">🎉</div>
            <h1 style="color: #10b981; font-size: 24px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;">Réservation Confirmée !</h1>
            <p style="color: #183154; font-size: 16px; font-family: 'Poppins', sans-serif;">Votre réservation a été traitée avec succès</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${reservation.full_name}</strong>,
        </div>
        
        <div class="greeting">
            Nous sommes ravis de vous confirmer que votre réservation a été acceptée et confirmée. 
            Vous trouverez ci-dessous tous les détails de votre réservation.
        </div>
        
        <div class="reservation-details">
            <div class="detail-title">📋 Détails de votre réservation</div>
            
            <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${reservation.transaction_id}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espace :</span>
                <span class="detail-value">${(reservation.activity && (()=>{const a=reservation.activity.toLowerCase();return a.includes('pack')&&a.includes('bienvenu')&&a.includes('kin');})()) ? 'Accompagnement de Jeunes' : reservation.space_type}</span>
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
                Merci de votre confiance ! Notre équipe est à votre disposition pour toute question.
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    return await sendEmailDirect(
      reservation.email,
      `🎉 Réservation confirmée - ${reservation.transaction_id}`,
      emailHtml,
      reservation
    );
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur email client:', error);
    
    // Fallback: simulation d'envoi d'email
    console.log('📧 [DIRECT] Mode simulation - Email non envoyé mais réservation créée');
    console.log('📧 [DIRECT] Email qui aurait été envoyé à:', reservation.email);
    console.log('📧 [DIRECT] Sujet: Réservation confirmée -', reservation.transaction_id);
    
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
};

// Fonction pour envoyer l'email d'attente de paiement (réservations en cash)
export const sendClientPaymentPendingEmail = async (reservation: any) => {
  console.log('📧 [DIRECT] Envoi email attente paiement client:', reservation.email);

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="warning-icon">⏳</div>
            <h1 style="color: #f59e0b; font-size: 24px; margin-bottom: 10px; font-family: 'Montserrat', sans-serif; font-weight: 700;">Réservation en Attente de Paiement</h1>
            <p style="color: #183154; font-size: 16px; font-family: 'Poppins', sans-serif;">Votre réservation a été reçue et est en attente de confirmation</p>
        </div>
        
        <div class="greeting">
            Bonjour <strong>${reservation.full_name}</strong>,
        </div>
        
        <div class="main-message">
            Nous avons bien reçu votre réservation et nous vous en remercions. 
            Cependant, votre réservation est actuellement <strong>en attente de paiement</strong> et nécessite une confirmation.
        </div>
        
        <div class="reservation-details">
            <div class="detail-title">📋 Détails de votre réservation</div>
            
            <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${reservation.transaction_id}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espace :</span>
                <span class="detail-value">${(reservation.activity && (()=>{const a=reservation.activity.toLowerCase();return a.includes('pack')&&a.includes('bienvenu')&&a.includes('kin');})()) ? 'Accompagnement de Jeunes' : reservation.space_type}</span>
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
                <span class="detail-label">Méthode de paiement :</span>
                <span class="detail-value">${reservation.payment_method}</span>
            </div>
        </div>
        
        <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 30px 0;">
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️ ATTENTION IMPORTANT</div>
            </div>
            <div style="color: #92400e; font-size: 16px; font-family: 'Poppins', sans-serif; font-weight: 600; text-align: center; margin-bottom: 15px;">
                Votre réservation sera automatiquement annulée dans 5 jours si le paiement n'est pas régularisé !
            </div>
            <div style="color: #92400e; font-size: 14px; font-family: 'Poppins', sans-serif; text-align: center;">
                Pour confirmer votre réservation, veuillez vous présenter au bureau pour effectuer le paiement en espèces.
            </div>
        </div>
        
        <div style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
            <div style="text-align: center; margin-bottom: 15px;">
                <div style="color: #1e40af; font-size: 18px; font-family: 'Montserrat', sans-serif; font-weight: 600;">
                    📍 Adresse du Bureau
                </div>
            </div>
            <div style="color: #1e40af; font-size: 16px; font-family: 'Poppins', sans-serif; text-align: center; line-height: 1.6;">
                16, colonel Lukusa, Commune de la Gombe<br>
                Kinshasa, République Démocratique du Congo
            </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <p style="color: #183154; font-size: 14px; font-family: 'Poppins', sans-serif;">
                Merci de votre compréhension. Notre équipe est à votre disposition pour toute question.
            </p>
        </div>
    `;

    const emailHtml = createEmailTemplate(emailContent);

    return await sendEmailDirect(
      reservation.email,
      `⏳ Réservation en attente de paiement - ${reservation.transaction_id}`,
      emailHtml,
      reservation
    );
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur email attente paiement client:', error);
    
    // Fallback: simulation d'envoi d'email
    console.log('📧 [DIRECT] Mode simulation - Email attente paiement non envoyé');
    console.log('📧 [DIRECT] Email qui aurait été envoyé à:', reservation.email);
    console.log('📧 [DIRECT] Sujet: Réservation en attente de paiement -', reservation.transaction_id);
    
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
};

// Fonction pour envoyer l'email d'annulation client
export const sendClientCancellationEmail = async (reservation: any) => {
  console.log('📧 [DIRECT] Envoi annulation client:', reservation.email);

  try {
    const emailContent = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div class="cancellation-icon">❌</div>
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
        
        <div class="reservation-details">
            <div class="detail-title">📋 Détails de la réservation annulée</div>
            
            <div class="detail-row">
                <span class="detail-label">Référence :</span>
                <span class="detail-value">${reservation.transaction_id}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Espace :</span>
                <span class="detail-value">${(reservation.activity && (()=>{const a=reservation.activity.toLowerCase();return a.includes('pack')&&a.includes('bienvenu')&&a.includes('kin');})()) ? 'Accompagnement de Jeunes' : reservation.space_type}</span>
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

    return await sendEmailDirect(
      reservation.email,
      `❌ Réservation annulée - ${reservation.transaction_id}`,
      emailHtml,
      reservation
    );
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur email annulation client:', error);
    
    // Fallback: simulation d'envoi d'email
    console.log('📧 [DIRECT] Mode simulation - Email d\'annulation non envoyé');
    console.log('📧 [DIRECT] Email qui aurait été envoyé à:', reservation.email);
    console.log('📧 [DIRECT] Sujet: Réservation annulée -', reservation.transaction_id);
    
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
};

// Fonction principale pour envoyer les emails (SEULEMENT client)
export const sendReservationEmails = async (reservation: any) => {
  console.log('📧 [DIRECT] Début envoi emails pour réservation:', reservation.id);

  try {
    let clientResult;
    
    // Vérifier le type de paiement pour envoyer le bon email
    if (reservation.payment_method === 'cash') {
      // Pour les paiements en cash : email d'attente de paiement
      console.log('💵 [DIRECT] Paiement en cash détecté - Envoi email attente paiement');
      clientResult = await sendClientPaymentPendingEmail(reservation);
    } else {
      // Pour les autres méthodes de paiement : email de confirmation
      console.log('✅ [DIRECT] Paiement non-cash détecté - Envoi email confirmation');
      clientResult = await sendClientConfirmationEmail(reservation);
    }
    
    console.log('✅ [DIRECT] Email client traité');
    
    return {
      success: clientResult.success,
      clientEmail: clientResult,
      adminEmails: { success: false, message: 'Emails admin désactivés' },
      emailType: reservation.payment_method === 'cash' ? 'payment_pending' : 'confirmed'
    };
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur envoi emails:', error);
    throw error;
  }
};
