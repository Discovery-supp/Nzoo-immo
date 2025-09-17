#!/usr/bin/env node

/**
 * Test de debug des emails depuis l'application
 * Vérifie exactement ce qui se passe avec l'envoi d'emails
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (même que l'application)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test 1: Vérifier la réservation récente
async function checkRecentReservation() {
  console.log('🔍 Test 1: Vérification de la réservation récente...');
  
  try {
    // Chercher la réservation récente avec la référence RES_1756309987721
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('transaction_id', 'RES_1756309987721')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.log('❌ Erreur recherche réservation:', error.message);
      return null;
    }

    if (!reservations || reservations.length === 0) {
      console.log('❌ Réservation non trouvée');
      return null;
    }

    const reservation = reservations[0];
    console.log('✅ Réservation trouvée:', {
      id: reservation.id,
      email: reservation.email,
      full_name: reservation.full_name,
      transaction_id: reservation.transaction_id,
      created_at: reservation.created_at
    });

    return reservation;
  } catch (error) {
    console.log('❌ Erreur recherche réservation:', error.message);
    return null;
  }
}

// Test 2: Tester l'envoi d'email directement
async function testDirectEmailSending() {
  console.log('\n🔍 Test 2: Test d\'envoi d\'email direct...');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Email Direct - Debug',
        html: `
          <h1>Test Email Direct</h1>
          <p>Cet email est un test pour diagnostiquer le problème d'envoi.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
        reservationData: { test: true }
      }
    });

    if (error) {
      console.log('❌ Erreur envoi email direct:', error.message);
      return false;
    }

    console.log('✅ Email direct envoyé avec succès');
    console.log('📧 Réponse:', data);
    return true;
  } catch (error) {
    console.log('❌ Erreur envoi email direct:', error.message);
    return false;
  }
}

// Test 3: Simuler l'envoi d'email comme dans l'application
async function testAppEmailSending(reservation) {
  console.log('\n🔍 Test 3: Simulation de l\'envoi d\'email comme dans l\'application...');
  
  try {
    // Email de confirmation au client (comme dans l'application)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Confirmation de Réservation - N'zoo Immo</title>
        <meta charset="utf-8">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c5aa0; text-align: center;">✅ Confirmation de Réservation</h1>
          
          <p>Bonjour <strong>${reservation.full_name}</strong>,</p>
          
          <p>Nous avons le plaisir de confirmer votre réservation d'espace de travail chez N'zoo Immo.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2c5aa0; margin-top: 0;">📋 Détails de votre réservation :</h2>
            <ul style="list-style: none; padding: 0;">
              <li><strong>Nom :</strong> ${reservation.full_name}</li>
              <li><strong>Email :</strong> ${reservation.email}</li>
              <li><strong>Téléphone :</strong> ${reservation.phone}</li>
              <li><strong>Type d'espace :</strong> ${reservation.space_type}</li>
              <li><strong>Date de début :</strong> ${reservation.start_date}</li>
              <li><strong>Date de fin :</strong> ${reservation.end_date}</li>
              <li><strong>Référence :</strong> ${reservation.transaction_id}</li>
              <li><strong>Montant :</strong> ${reservation.amount}€</li>
            </ul>
          </div>
          
          <p>Votre réservation a été enregistrée avec succès. Nous vous contacterons bientôt pour finaliser les détails.</p>
          
          <p>Pour toute question, n'hésitez pas à nous contacter :</p>
          <ul>
            <li>Email : contact@nzooimmo.com</li>
            <li>Téléphone : +243 XXX XXX XXX</li>
          </ul>
          
          <p>Cordialement,<br>
          <strong>L'équipe N'zoo Immo</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
          </p>
        </div>
      </body>
      </html>
    `;

    console.log('📧 Envoi email de confirmation au client...');
    const { data: clientData, error: clientError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: reservation.email,
        subject: `Confirmation de réservation - ${reservation.full_name}`,
        html: emailHtml,
        reservationData: reservation
      }
    });

    if (clientError) {
      console.log('❌ Erreur email client:', clientError.message);
      return false;
    }

    console.log('✅ Email client envoyé avec succès');
    console.log('📧 Réponse client:', clientData);

    // Email d'information à l'administration
    console.log('📧 Envoi email d\'information à l\'administration...');
    const { data: adminData, error: adminError } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'tricksonmabengi123@gmail.com',
        subject: `Nouvelle réservation reçue - ${reservation.full_name}`,
        html: `
          <h1>Nouvelle Réservation Reçue</h1>
          <p>Une nouvelle réservation nécessite votre attention.</p>
          <p><strong>Client :</strong> ${reservation.full_name}</p>
          <p><strong>Email :</strong> ${reservation.email}</p>
          <p><strong>Référence :</strong> ${reservation.transaction_id}</p>
        `,
        reservationData: reservation
      }
    });

    if (adminError) {
      console.log('❌ Erreur email admin:', adminError.message);
      return false;
    }

    console.log('✅ Email admin envoyé avec succès');
    console.log('📧 Réponse admin:', adminData);

    return true;
  } catch (error) {
    console.log('❌ Erreur envoi emails:', error.message);
    return false;
  }
}

// Test 4: Vérifier les logs de la fonction Edge
async function checkEdgeFunctionLogs() {
  console.log('\n🔍 Test 4: Vérification des logs de la fonction Edge...');
  
  try {
    // Test simple pour voir si la fonction répond
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'trickson.mabengi@gmail.com',
        subject: 'Test Logs Edge Function',
        html: '<p>Test pour vérifier les logs</p>',
        reservationData: { test: 'logs' }
      }
    });

    if (error) {
      console.log('❌ Erreur fonction Edge:', error.message);
      return false;
    }

    console.log('✅ Fonction Edge répond correctement');
    console.log('📧 Réponse complète:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ Erreur fonction Edge:', error.message);
    return false;
  }
}

// Test principal
async function testAppEmailDebug() {
  console.log('🔍 TEST DE DEBUG DES EMAILS DEPUIS L\'APPLICATION');
  console.log('================================================');
  
  try {
    // Test 1: Vérifier la réservation récente
    const reservation = await checkRecentReservation();
    if (!reservation) {
      console.log('❌ Impossible de continuer sans réservation');
      return;
    }

    // Test 2: Test d'envoi d'email direct
    const directEmailOk = await testDirectEmailSending();
    if (!directEmailOk) {
      console.log('❌ Problème avec l\'envoi d\'email direct');
      return;
    }

    // Test 3: Simulation de l'envoi comme dans l'application
    const appEmailOk = await testAppEmailSending(reservation);
    if (!appEmailOk) {
      console.log('❌ Problème avec l\'envoi d\'email comme dans l\'application');
      return;
    }

    // Test 4: Vérifier les logs
    const logsOk = await checkEdgeFunctionLogs();

    console.log('\n📊 RÉSULTATS FINAUX');
    console.log('===================');
    console.log(`✅ Réservation trouvée: ${reservation ? 'OUI' : 'NON'}`);
    console.log(`✅ Email direct: ${directEmailOk ? 'OK' : 'ERREUR'}`);
    console.log(`✅ Email application: ${appEmailOk ? 'OK' : 'ERREUR'}`);
    console.log(`✅ Logs Edge Function: ${logsOk ? 'OK' : 'ERREUR'}`);

    if (directEmailOk && appEmailOk) {
      console.log('\n🎉 TOUS LES TESTS RÉUSSIS !');
      console.log('📧 Les emails devraient être reçus dans les 2-3 minutes.');
      console.log('📧 Vérifiez votre boîte de réception et les spams.');
    } else {
      console.log('\n⚠️ PROBLÈMES DÉTECTÉS');
      console.log('📧 Il y a des problèmes avec l\'envoi d\'emails.');
    }

  } catch (error) {
    console.error('❌ Erreur test:', error);
  }
}

testAppEmailDebug().catch(console.error);
