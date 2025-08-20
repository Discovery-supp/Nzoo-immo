#!/usr/bin/env node

/**
 * Script qui teste exactement ce que fait l'application
 * Usage: node scripts/test-app-exact.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Clé API Resend
const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

// Fonction pour envoyer un email directement (comme dans emailService.ts)
async function sendEmailDirectly(emailData) {
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
        html: emailData.html,
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
}

// Fonction pour générer l'email client (comme dans emailService.ts)
function generateClientConfirmationEmailHtml(reservationData) {
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
                        <span class="detail-value">Espace Coworking</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Période :</span>
                        <span class="detail-value">Du ${reservationData.startDate} au ${reservationData.endDate}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Activité :</span>
                        <span class="detail-value">${reservationData.activity}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Statut :</span>
                        <span class="detail-value">✅ Confirmé</span>
                    </div>
                    
                    <div class="total">
                        Montant total : ${reservationData.amount}€
                    </div>
                </div>
                
                <p>Nous vous remercions de votre confiance et vous souhaitons un excellent séjour chez N'zoo Immo !</p>
                
                <p>Cordialement,<br>
                <strong>L'équipe N'zoo Immo</strong></p>
            </div>
            
            <div class="footer">
                <p>© 2024 N'zoo Immo. Tous droits réservés.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

// Fonction pour envoyer les emails de réservation (comme dans emailService.ts)
async function sendReservationEmails(reservationData) {
  console.log('📧 [EMAIL] Début envoi emails pour:', reservationData.email);
  
  const result = {
    clientEmailSent: false,
    adminEmailSent: false
  };

  try {
    // 1. Envoyer l'email de confirmation au client
    console.log('📧 [EMAIL] Envoi email client...');
    const clientEmailResult = await sendEmailDirectly({
      to: reservationData.email,
      subject: `Confirmation de réservation - ${reservationData.fullName}`,
      html: generateClientConfirmationEmailHtml(reservationData)
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
    const adminEmailResult = await sendEmailDirectly({
      to: 'tricksonmabengi123@gmail.com',
      subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
      html: `
        <h1>🔔 Nouvelle Réservation Reçue</h1>
        <p>Client: ${reservationData.fullName}</p>
        <p>Email: ${reservationData.email}</p>
        <p>Montant: ${reservationData.amount}€</p>
      `
    });
    
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
}

// Fonction pour créer une réservation (comme dans reservationService.ts)
async function createReservation(data) {
  try {
    console.log('📝 Création réservation avec données:', data);

    // Validation des données
    if (!data.startDate || !data.endDate) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }
    
    if (!data.fullName || !data.email || !data.phone) {
      throw new Error('Le nom, email et téléphone sont obligatoires');
    }

    // Préparer les données pour la base
    const reservationData = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      activity: data.activity,
      address: data.address || null,
      space_type: data.spaceType || 'coworking',
      start_date: data.startDate,
      end_date: data.endDate,
      occupants: data.occupants,
      subscription_type: data.subscriptionType || 'daily',
      amount: data.amount,
      payment_method: data.paymentMethod || 'cash',
      transaction_id: data.transactionId || `TXN-${Date.now()}`,
      status: data.paymentMethod === 'cash' ? 'pending' : 'confirmed',
      created_at: new Date().toISOString()
    };

    console.log('📝 Données mappées:', reservationData);
    
    // Insérer dans la base
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion:', error);
      throw new Error(`Erreur d'insertion: ${error.message}`);
    }

    console.log('✅ Réservation créée:', reservation.id);

    // Envoyer les emails
    let emailSent = false;
    let clientEmailSent = false;
    let adminEmailSent = false;
    let clientEmailError = undefined;
    let adminEmailError = undefined;

    try {
      console.log('📧 Envoi emails...');
      
      const emailResult = await sendReservationEmails({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        activity: data.activity,
        spaceType: data.spaceType,
        startDate: data.startDate,
        endDate: data.endDate,
        amount: data.amount,
        transactionId: data.transactionId,
        status: reservation.status || 'pending'
      });
      
      clientEmailSent = emailResult.clientEmailSent;
      adminEmailSent = emailResult.adminEmailSent;
      clientEmailError = emailResult.clientEmailError;
      adminEmailError = emailResult.adminEmailError;
      
      if (clientEmailSent) {
        console.log('✅ Email client envoyé avec succès');
      } else {
        console.warn('⚠️ Échec email client:', clientEmailError);
      }
      
      if (adminEmailSent) {
        console.log('✅ Email admin envoyé avec succès');
      } else {
        console.warn('⚠️ Échec email admin:', adminEmailError);
      }
      
    } catch (emailError) {
      console.warn('⚠️ Erreur envoi emails:', emailError);
      clientEmailSent = false;
      adminEmailSent = false;
      clientEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
      adminEmailError = emailError instanceof Error ? emailError.message : 'Unknown error';
    }

    return {
      success: true,
      reservation,
      emailSent: clientEmailSent, // Pour compatibilité avec l'interface existante
      clientEmailSent,
      adminEmailSent,
      clientEmailError,
      adminEmailError
    };

  } catch (error) {
    console.error('❌ Erreur création réservation:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      emailSent: false,
      clientEmailSent: false,
      adminEmailSent: false,
      clientEmailError: undefined,
      adminEmailError: undefined
    };
  }
}

async function testAppExact() {
  console.log('🧪 Test exact de l\'application - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔗 URL Supabase :', supabaseUrl);
  
  // Données de réservation comme dans l'application
  const reservationData = {
    fullName: 'Test App Exact',
    email: testEmail,
    phone: '+1234567890',
    company: 'Test Company',
    activity: 'Test App Exact',
    address: '123 Test Street',
    spaceType: 'coworking',
    startDate: '2024-02-05',
    endDate: '2024-02-06',
    occupants: 2,
    subscriptionType: 'daily',
    amount: 300,
    paymentMethod: 'orange_money',
    transactionId: `APP-EXACT-${Date.now()}`
  };
  
  console.log('\n📋 Données de réservation :');
  console.log('👤 Nom :', reservationData.fullName);
  console.log('📧 Email :', reservationData.email);
  console.log('🏢 Espace :', reservationData.spaceType);
  console.log('💰 Montant :', reservationData.amount);
  console.log('💳 Paiement :', reservationData.paymentMethod);
  
  console.log('\n🚀 Test de création de réservation (exactement comme l\'app)...');
  
  try {
    const result = await createReservation(reservationData);
    
    console.log('\n📧 Résultat de createReservation :');
    console.log('✅ Succès :', result.success);
    console.log('📧 Email envoyé :', result.emailSent);
    console.log('📧 Email client :', result.clientEmailSent);
    console.log('📧 Email admin :', result.adminEmailSent);
    
    if (result.clientEmailError) {
      console.log('❌ Erreur email client :', result.clientEmailError);
    }
    
    if (result.adminEmailError) {
      console.log('❌ Erreur email admin :', result.adminEmailError);
    }
    
    if (result.reservation) {
      console.log('🆔 ID Réservation :', result.reservation.id);
    }
    
    if (result.success && result.emailSent) {
      console.log('\n🎉 Succès complet !');
      console.log('✅ Réservation créée');
      console.log('✅ Email envoyé (comme dans l\'app)');
      console.log('📧 Vérifiez votre boîte mail :', testEmail);
    } else if (result.success && !result.emailSent) {
      console.log('\n⚠️ Réservation créée mais email non envoyé');
      console.log('Vérifiez les logs pour plus de détails.');
    } else {
      console.log('\n❌ Échec de la réservation');
      console.log('Erreur :', result.error);
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test :', error.message);
    console.log('📋 Stack trace:', error.stack);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez votre boîte mail :', testEmail);
  console.log('2. Vérifiez les emails d\'administration');
  console.log('3. Comparez avec l\'application web');
}

testAppExact().catch(console.error);


