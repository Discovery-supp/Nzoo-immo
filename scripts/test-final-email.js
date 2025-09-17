#!/usr/bin/env node

/**
 * Script final de test d'email - Nzoo Immo
 * Usage: node scripts/test-final-email.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Clé API Resend
const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';

// Fonction pour envoyer un email directement
async function sendEmailDirectly(to, subject, html) {
  try {
    console.log('📧 [RESEND] Envoi direct vers:', to);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: [to],
        subject: subject,
        html: html,
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ [RESEND] Email envoyé avec succès:', result.id);
      return { success: true, id: result.id };
    } else {
      const errorText = await response.text();
      console.error('❌ [RESEND] Erreur:', response.status, errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error('❌ [RESEND] Erreur réseau:', error);
    return { success: false, error: error.message };
  }
}

// Fonction pour générer l'email client
function generateClientEmail(reservationData) {
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

// Fonction pour générer l'email admin
function generateAdminEmail(reservationData) {
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
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 Nouvelle Réservation Reçue</h1>
                <p>Une nouvelle réservation nécessite votre attention</p>
            </div>
            
            <div class="content">
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
                
                <p>Connectez-vous à votre tableau de bord pour gérer cette réservation.</p>
            </div>
            
            <div class="footer">
                <p>© 2024 N'zoo Immo. Tous droits réservés.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

async function testFinalEmail() {
  console.log('🧪 Test final d\'email - Nzoo Immo\n');
  
  // Email de test
  const testEmail = process.argv[2] || 'test@example.com';
  
  console.log('📋 Configuration :');
  console.log('📧 Email de test :', testEmail);
  console.log('🔗 URL Supabase :', supabaseUrl);
  console.log('🔑 Clé API Resend :', RESEND_API_KEY ? 'Configurée' : 'Non configurée');
  
  // Données de réservation
  const reservationData = {
    fullName: 'Test Final Email',
    email: testEmail,
    phone: '+1234567890',
    company: 'Test Company',
    activity: 'Test Final Email',
    spaceType: 'coworking',
    startDate: '2024-01-30',
    endDate: '2024-01-31',
    amount: 300,
    transactionId: `FINAL-TEST-${Date.now()}`
  };
  
  console.log('\n📋 Données de réservation :');
  console.log('👤 Nom :', reservationData.fullName);
  console.log('📧 Email :', reservationData.email);
  console.log('🏢 Espace :', reservationData.spaceType);
  console.log('💰 Montant :', reservationData.amount);
  
  console.log('\n🚀 Test de création de réservation...');
  
  try {
    // Créer la réservation
    console.log('📝 Création de la réservation...');
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .insert([{
        full_name: reservationData.fullName,
        email: reservationData.email,
        phone: reservationData.phone,
        company: reservationData.company,
        activity: reservationData.activity,
        space_type: reservationData.spaceType,
        start_date: reservationData.startDate,
        end_date: reservationData.endDate,
        occupants: 2,
        subscription_type: 'daily',
        amount: reservationData.amount,
        payment_method: 'orange_money',
        transaction_id: reservationData.transactionId,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (reservationError) {
      console.log('❌ Erreur création réservation:', reservationError.message);
      return;
    }

    console.log('✅ Réservation créée avec succès !');
    console.log('🆔 ID Réservation:', reservation.id);
    
    // Envoyer l'email client
    console.log('\n📧 Envoi email client...');
    const clientEmailHtml = generateClientEmail(reservationData);
    const clientResult = await sendEmailDirectly(
      reservationData.email,
      `Confirmation de réservation - ${reservationData.fullName}`,
      clientEmailHtml
    );
    
    // Envoyer l'email admin
    console.log('\n📧 Envoi email admin...');
    const adminEmailHtml = generateAdminEmail(reservationData);
    const adminResult = await sendEmailDirectly(
      'tricksonmabengi123@gmail.com',
      `Nouvelle réservation reçue - ${reservationData.fullName}`,
      adminEmailHtml
    );
    
    console.log('\n📧 Résultats finaux :');
    console.log('✅ Email client :', clientResult.success ? 'Envoyé' : 'Échec');
    console.log('✅ Email admin :', adminResult.success ? 'Envoyé' : 'Échec');
    
    if (clientResult.success && adminResult.success) {
      console.log('\n🎉 Succès complet !');
      console.log('✅ Réservation créée');
      console.log('✅ Email client envoyé');
      console.log('✅ Email admin envoyé');
      console.log('📧 Vérifiez votre boîte mail :', testEmail);
    } else {
      console.log('\n⚠️ Problème partiel détecté');
      if (!clientResult.success) {
        console.log('❌ Erreur email client :', clientResult.error);
      }
      if (!adminResult.success) {
        console.log('❌ Erreur email admin :', adminResult.error);
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur lors du test :', error.message);
  }
  
  console.log('\n📋 Prochaines étapes :');
  console.log('1. Vérifiez votre boîte mail :', testEmail);
  console.log('2. Vérifiez les emails d\'administration');
  console.log('3. Testez dans l\'application web');
}

testFinalEmail().catch(console.error);

