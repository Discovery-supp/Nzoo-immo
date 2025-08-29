/**
 * Service d'email direct pour contourner les problèmes CORS
 * Utilise fetch directement au lieu de supabase.functions.invoke
 */

// Configuration des emails d'administration
const ADMIN_EMAILS = [
  'tricksonmabengi123@gmail.com',
  'contact@nzooimmo.com'
];

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

// Fonction pour envoyer l'email de confirmation client
export const sendClientConfirmationEmail = async (reservation: any) => {
  console.log('📧 [DIRECT] Envoi confirmation client:', reservation.email);

  try {
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745;">🎉 Réservation confirmée</h1>
          <p>Bonjour <strong>${reservation.full_name}</strong>,</p>
          <p>Votre réservation a été confirmée avec succès !</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>📋 Détails de votre réservation :</h3>
            <p><strong>Référence :</strong> ${reservation.transaction_id}</p>
            <p><strong>Espace :</strong> ${reservation.space_type}</p>
            <p><strong>Dates :</strong> ${reservation.start_date} à ${reservation.end_date}</p>
            <p><strong>Montant :</strong> $${reservation.amount}</p>
            <p><strong>Méthode de paiement :</strong> ${reservation.payment_method}</p>
          </div>
          
          <p>Merci de votre confiance !</p>
          <p>L'équipe Nzoo Immo</p>
        </body>
      </html>
    `;

    return await sendEmailDirect(
      reservation.email,
      `Réservation confirmée - ${reservation.transaction_id}`,
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

// Fonction pour envoyer l'email de notification admin
export const sendAdminNotificationEmail = async (reservation: any) => {
  console.log('📧 [DIRECT] Envoi notification admin');

  const emailHtml = `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #007bff;">📧 Nouvelle réservation</h1>
        <p>Une nouvelle réservation a été créée.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>👤 Informations client :</h3>
          <p><strong>Nom :</strong> ${reservation.full_name}</p>
          <p><strong>Email :</strong> ${reservation.email}</p>
          <p><strong>Téléphone :</strong> ${reservation.phone}</p>
          <p><strong>Entreprise :</strong> ${reservation.company || 'Non spécifiée'}</p>
          
          <h3>📋 Détails réservation :</h3>
          <p><strong>Espace :</strong> ${reservation.space_type}</p>
          <p><strong>Dates :</strong> ${reservation.start_date} à ${reservation.end_date}</p>
          <p><strong>Montant :</strong> $${reservation.amount}</p>
          <p><strong>Référence :</strong> ${reservation.transaction_id}</p>
          <p><strong>Méthode de paiement :</strong> ${reservation.payment_method}</p>
        </div>
      </body>
    </html>
  `;

  const results = [];
  
  for (const adminEmail of ADMIN_EMAILS) {
    try {
      const result = await sendEmailDirect(
        adminEmail,
        `Nouvelle réservation - ${reservation.transaction_id}`,
        emailHtml,
        reservation
      );
      results.push({ email: adminEmail, success: true, data: result });
    } catch (error) {
      console.error(`❌ [DIRECT] Erreur email admin ${adminEmail}:`, error);
      results.push({ email: adminEmail, success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
  }

  const successfulEmails = results.filter(r => r.success).length;
  const failedEmails = results.filter(r => !r.success).length;

  console.log(`📧 [DIRECT] Résultats admin: ${successfulEmails}/${ADMIN_EMAILS.length} succès`);

  return {
    success: successfulEmails > 0,
    results,
    successfulEmails,
    failedEmails
  };
};

// Fonction principale pour envoyer tous les emails
export const sendReservationEmails = async (reservation: any) => {
  console.log('📧 [DIRECT] Début envoi emails pour réservation:', reservation.id);

  try {
    // Email de confirmation client
    const clientResult = await sendClientConfirmationEmail(reservation);
    
    // Email de notification admin
    const adminResult = await sendAdminNotificationEmail(reservation);
    
    console.log('✅ [DIRECT] Tous les emails traités');
    
    return {
      success: clientResult.success || adminResult.success,
      clientEmail: clientResult,
      adminEmails: adminResult
    };
    
  } catch (error) {
    console.error('❌ [DIRECT] Erreur envoi emails:', error);
    throw error;
  }
};
