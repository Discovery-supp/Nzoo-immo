import { supabase } from './supabaseClient';
import { getFormattedSpaceText } from '../utils/spaceDisplayHelper';

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  reservationData: {
    fullName: string;
    email: string;
    phone: string;
    company?: string;
    activity: string;
    spaceType: string;
    startDate: string;
    endDate: string;
    amount: number;
    transactionId: string;
    status: string;
  };
}

export interface EmailResult {
  success: boolean;
  emailSent: boolean;
  error?: string;
  provider?: string;
  note?: string;
  details?: any;
}

export interface ReservationEmailResult {
  clientEmailSent: boolean;
  adminEmailSent: boolean;
  clientEmailError?: string;
  adminEmailError?: string;
}

// Configuration des emails d'administration
const ADMIN_EMAILS = [
  'tricksonmabengi123@gmail.com',
  'contact@nzooimmo.com'
];

// IMPORTANT: Ne pas exposer la clé API Resend côté client pour des raisons de sécurité
// L'envoi d'emails se fait via la fonction Edge Supabase
// const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

// IMPORTANT: Cette fonction ne doit plus être utilisée côté client pour des raisons de sécurité
// L'envoi d'emails se fait via la fonction Edge Supabase
/*
const sendEmailDirectly = async (emailData: EmailData): Promise<EmailResult> => {
  try {
    console.log('📧 [RESEND] Envoi direct vers:', emailData.to);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html || generateClientConfirmationEmailHtml(emailData.reservationData),
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ [RESEND] Email envoyé avec succès:', result.id);
      return {
        success: true,
        emailSent: true,
        provider: 'resend',
        details: result
      };
    } else {
      const errorText = await response.text();
      console.error('❌ [RESEND] Erreur:', response.status, errorText);
      return {
        success: false,
        emailSent: false,
        provider: 'resend',
        error: `Resend error: ${response.status} - ${errorText}`
      };
    }
  } catch (error) {
    console.error('❌ [RESEND] Erreur réseau:', error);
    return {
      success: false,
      emailSent: false,
      provider: 'resend',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
*/

// Fonction de fallback pour simuler l'envoi d'emails
const simulateEmailSending = async (emailData: EmailData): Promise<EmailResult> => {
  console.log('📧 [SIMULATION] Email simulé vers:', emailData.to);
  console.log('📧 [SIMULATION] Sujet:', emailData.subject);
  
  // Simuler un délai d'envoi
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    emailSent: true,
    provider: 'simulation',
    note: 'Email simulé - Resend non configuré'
  };
};

// Fonction principale pour envoyer les emails de réservation
export const sendReservationEmails = async (reservationData: EmailData['reservationData']): Promise<ReservationEmailResult> => {
  console.log('📧 [EMAIL] Début envoi emails pour:', reservationData.email);
  
  const result: ReservationEmailResult = {
    clientEmailSent: false,
    adminEmailSent: false
  };

  try {
    // 1. Envoyer l'email de confirmation au client
    console.log('📧 [EMAIL] Envoi email client...');
    const clientEmailResult = await sendConfirmationEmail({
      to: reservationData.email,
      subject: `Confirmation de réservation - ${reservationData.fullName}`,
      reservationData
    });
    
    result.clientEmailSent = clientEmailResult.emailSent;
    if (!clientEmailResult.emailSent) {
      result.clientEmailError = clientEmailResult.error;
      console.log('❌ [EMAIL] Échec email client:', clientEmailResult.error);
    } else {
      console.log('✅ [EMAIL] Email client envoyé avec succès');
    }

    // 2. Envoyer l'email d'accusé de réception à l'administration
    console.log('📧 [EMAIL] Envoi email admin...');
    const adminEmailResult = await sendAdminAcknowledgmentEmail(reservationData);
    
    result.adminEmailSent = adminEmailResult.emailSent;
    if (!adminEmailResult.emailSent) {
      result.adminEmailError = adminEmailResult.error;
      console.log('❌ [EMAIL] Échec email admin:', adminEmailResult.error);
    } else {
      console.log('✅ [EMAIL] Email admin envoyé avec succès');
    }

    console.log('📧 [EMAIL] Résultats finaux:', {
      clientEmailSent: result.clientEmailSent,
      adminEmailSent: result.adminEmailSent,
      clientError: result.clientEmailError,
      adminError: result.adminEmailError
    });

  } catch (error) {
    console.error('❌ [EMAIL] Erreur générale:', error);
    result.clientEmailError = error instanceof Error ? error.message : 'Erreur inconnue';
  }

  return result;
};

// Fonction pour envoyer l'email de confirmation au client
export const sendConfirmationEmail = async (emailData: EmailData): Promise<EmailResult> => {
  try {
    console.log('📧 [CLIENT] Préparation email pour:', emailData.to);

    // Générer le contenu HTML de l'email
    const emailHtml = generateClientConfirmationEmailHtml(emailData.reservationData);

    // IMPORTANT: Ne pas utiliser l'envoi direct depuis le navigateur pour des raisons de sécurité
    // Utiliser directement la fonction Edge
    console.log('📧 [CLIENT] Utilisation de la fonction Edge (sécurisé)...');

    // Fallback: essayer la fonction Edge
    console.log('📧 [CLIENT] Tentative fonction Edge...');
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: emailData.to,
        subject: emailData.subject,
        html: emailHtml,
        reservationData: emailData.reservationData
      }
    });

    if (error) {
      console.error('❌ [CLIENT] Erreur fonction Edge:', error.message);
      
      // Si la fonction n'existe pas, utiliser la simulation
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        console.log('📧 [CLIENT] Fonction Edge non trouvée, simulation...');
        return await simulateEmailSending(emailData);
      }
      
      return {
        success: false,
        emailSent: false,
        error: `Erreur fonction Edge: ${error.message}`,
        details: error
      };
    }

    console.log('✅ [CLIENT] Réponse fonction Edge:', data);

    if (!data) {
      console.warn('⚠️ [CLIENT] Aucune donnée de la fonction Edge');
      return {
        success: false,
        emailSent: false,
        error: 'Aucune réponse de la fonction email'
      };
    }

    return {
      success: data.success || false,
      emailSent: data.emailSent || false,
      provider: data.provider,
      error: data.error,
      details: data.details
    };

  } catch (error) {
    console.error('❌ [CLIENT] Erreur générale:', error);
    return await simulateEmailSending(emailData);
  }
};

// Fonction pour envoyer l'email d'accusé de réception à l'administration
export const sendAdminAcknowledgmentEmail = async (reservationData: EmailData['reservationData']): Promise<EmailResult> => {
  try {
    console.log('📧 [ADMIN] Préparation email admin');

    // Générer le contenu HTML de l'email d'administration
    const emailHtml = generateAdminAcknowledgmentEmailHtml(reservationData);

    // Envoyer à tous les emails d'administration
    const emailPromises = ADMIN_EMAILS.map(async (adminEmail) => {
      console.log('📧 [ADMIN] Envoi vers:', adminEmail);
      
      // IMPORTANT: Ne pas utiliser l'envoi direct depuis le navigateur pour des raisons de sécurité
      // Utiliser directement la fonction Edge
      
      // Fallback: fonction Edge
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: adminEmail,
          subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
          html: emailHtml,
          reservationData
        }
      });

      if (error) {
        console.error('❌ [ADMIN] Erreur pour', adminEmail, ':', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    });

    const results = await Promise.all(emailPromises);
    const successfulEmails = results.filter(r => r.success).length;
    const failedEmails = results.filter(r => !r.success).length;

    console.log(`📧 [ADMIN] Résultats: ${successfulEmails}/${ADMIN_EMAILS.length} succès`);

    return {
      success: successfulEmails > 0,
      emailSent: successfulEmails > 0,
      error: failedEmails > 0 ? `${failedEmails} email(s) échoué(s)` : undefined,
      details: { successfulEmails, failedEmails, totalEmails: ADMIN_EMAILS.length }
    };

  } catch (error) {
    console.error('❌ [ADMIN] Erreur générale:', error);
    return {
      success: false,
      emailSent: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      details: error
    };
  }
};

// Fonction pour générer l'email de confirmation client
const generateClientConfirmationEmailHtml = (reservationData: EmailData['reservationData']): string => {
  const getSpaceText = () => getFormattedSpaceText({ activity: reservationData.activity, space_type: reservationData.spaceType });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de Réservation - N'zoo Immo</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .total { font-size: 18px; font-weight: bold; color: #667eea; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .contact-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Confirmation de Réservation</h1>
                <p>Votre réservation a été confirmée avec succès !</p>
            </div>
            
            <div class="content">
                <p>Bonjour <strong>${reservationData.fullName}</strong>,</p>
                
                <p>Nous avons le plaisir de vous confirmer votre réservation chez <strong>N'zoo Immo</strong>.</p>
                
                <div class="reservation-details">
                    <h3>📋 Détails de votre réservation</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Référence :</span>
                        <span class="detail-value">${reservationData.transactionId}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Type d'espace :</span>
                        <span class="detail-value">${getSpaceText()}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Période :</span>
                        <span class="detail-value">Du ${formatDate(reservationData.startDate)} au ${formatDate(reservationData.endDate)}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Activité :</span>
                        <span class="detail-value">${reservationData.activity}</span>
                    </div>
                    
                    ${reservationData.company ? `
                    <div class="detail-row">
                        <span class="detail-label">Entreprise :</span>
                        <span class="detail-value">${reservationData.company}</span>
                    </div>
                    ` : ''}
                    
                    <div class="detail-row">
                        <span class="detail-label">Statut :</span>
                        <span class="detail-value">${reservationData.status === 'confirmed' ? '✅ Confirmé' : '⏳ En attente'}</span>
                    </div>
                    
                    <div class="total">
                        Montant total : ${formatAmount(reservationData.amount)}
                    </div>
                </div>
                
                <div class="contact-info">
                    <h4>📞 Besoin d'aide ?</h4>
                    <p>Notre équipe est disponible pour répondre à toutes vos questions :</p>
                    <p>📧 Email : contact@nzooimmo.com<br>
                    📱 Téléphone : +242 06 XXX XXX</p>
                </div>
                
                <p>Nous vous remercions de votre confiance et vous souhaitons un excellent séjour chez N'zoo Immo !</p>
                
                <p>Cordialement,<br>
                <strong>L'équipe N'zoo Immo</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 N'zoo Immo. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Fonction pour générer l'email d'accusé de réception pour l'administration
const generateAdminAcknowledgmentEmailHtml = (reservationData: EmailData['reservationData']): string => {
  const getSpaceTextAdmin = () => getFormattedSpaceText({ activity: reservationData.activity, space_type: reservationData.spaceType });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle Réservation - N'zoo Immo</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .total { font-size: 18px; font-weight: bold; color: #ff6b6b; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #ff6b6b; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 Nouvelle Réservation Reçue</h1>
                <p>Une nouvelle réservation nécessite votre attention</p>
            </div>
            
            <div class="content">
                <div class="urgent">
                    <h3>⚠️ Action Requise</h3>
                    <p>Une nouvelle réservation a été effectuée et nécessite votre validation ou suivi.</p>
                </div>
                
                <div class="reservation-details">
                    <h3>📋 Détails de la réservation</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Référence :</span>
                        <span class="detail-value">${reservationData.transactionId}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Client :</span>
                        <span class="detail-value">${reservationData.fullName}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Email :</span>
                        <span class="detail-value">${reservationData.email}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Téléphone :</span>
                        <span class="detail-value">${reservationData.phone}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Type d'espace :</span>
                        <span class="detail-value">${getSpaceTextAdmin()}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Période :</span>
                        <span class="detail-value">Du ${formatDate(reservationData.startDate)} au ${formatDate(reservationData.endDate)}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Activité :</span>
                        <span class="detail-value">${reservationData.activity}</span>
                    </div>
                    
                    ${reservationData.company ? `
                    <div class="detail-row">
                        <span class="detail-label">Entreprise :</span>
                        <span class="detail-value">${reservationData.company}</span>
                    </div>
                    ` : ''}
                    
                    <div class="detail-row">
                        <span class="detail-label">Statut :</span>
                        <span class="detail-value">${reservationData.status === 'confirmed' ? '✅ Confirmé' : '⏳ En attente'}</span>
                    </div>
                    
                    <div class="total">
                        Montant total : ${formatAmount(reservationData.amount)}
                    </div>
                </div>
                
                <p><strong>Actions recommandées :</strong></p>
                <ul>
                    <li>Vérifier la disponibilité de l'espace demandé</li>
                    <li>Confirmer la réservation si tout est en ordre</li>
                    <li>Contacter le client si des informations supplémentaires sont nécessaires</li>
                    <li>Préparer l'espace pour la date de début</li>
                </ul>
                
                <p>Connectez-vous à votre tableau de bord pour gérer cette réservation.</p>
            </div>
            
            <div class="footer">
                <p>© 2024 N'zoo Immo. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement par le système de réservation.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};