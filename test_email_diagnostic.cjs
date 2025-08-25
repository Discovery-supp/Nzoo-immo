// Script de diagnostic pour tester l'envoi d'emails
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailSending() {
  console.log('🧪 Test de diagnostic des emails - Nzoo Immo\n');

  // Test 1: Vérifier la fonction Edge
  console.log('📧 Test 1: Vérification de la fonction Edge...');
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Email - Nzoo Immo',
        html: '<h1>Test Email</h1><p>Ceci est un test d\'envoi d\'email.</p>',
        reservationData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '123456789',
          amount: 100,
          transactionId: 'TEST-123'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur fonction Edge:', error.message);
      console.log('📋 Détails:', error);
    } else {
      console.log('✅ Réponse fonction Edge:', data);
    }
  } catch (err) {
    console.log('❌ Erreur lors de l\'appel de la fonction:', err.message);
  }

  // Test 2: Test direct Resend
  console.log('\n📧 Test 2: Test direct Resend...');
  const RESEND_API_KEY = 're_co5qjWjp_GhVJvvpZe72FAYaBYsLEEw4h';
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'reservations@nzooimmo.com',
        to: ['test@example.com'],
        subject: 'Test Direct Resend - Nzoo Immo',
        html: '<h1>Test Direct</h1><p>Test d\'envoi direct via Resend.</p>',
        reply_to: 'reservations@nzooimmo.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Envoi direct Resend réussi:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur envoi direct Resend:', response.status, errorText);
    }
  } catch (err) {
    console.log('❌ Erreur réseau Resend:', err.message);
  }

  // Test 3: Vérifier les variables d'environnement
  console.log('\n📧 Test 3: Vérification des variables d\'environnement...');
  console.log('RESEND_API_KEY configurée:', !!RESEND_API_KEY);
  console.log('Longueur de la clé:', RESEND_API_KEY ? RESEND_API_KEY.length : 0);
  
  // Test 4: Simulation d'une réservation complète
  console.log('\n📧 Test 4: Simulation d\'une réservation complète...');
  
  const reservationData = {
    fullName: 'Test User',
    email: 'test@example.com',
    phone: '123456789',
    company: 'Test Company',
    activity: 'Test Activity',
    spaceType: 'coworking',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    amount: 100,
    transactionId: 'TEST-123',
    status: 'confirmed'
  };

  try {
    // Simuler l'envoi d'emails comme dans le service
    console.log('📧 Envoi email client...');
    const clientEmailResult = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: reservationData.email,
        subject: `Confirmation de réservation - ${reservationData.fullName}`,
        html: generateClientEmailHtml(reservationData),
        reservationData
      }
    });

    console.log('📧 Envoi email admin...');
    const adminEmailResult = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'tricksonmabengi123@gmail.com',
        subject: `Nouvelle réservation reçue - ${reservationData.fullName}`,
        html: generateAdminEmailHtml(reservationData),
        reservationData
      }
    });

    console.log('📧 Résultats:');
    console.log('- Client:', clientEmailResult.error ? '❌' : '✅');
    console.log('- Admin:', adminEmailResult.error ? '❌' : '✅');
    
    if (clientEmailResult.error) {
      console.log('Erreur client:', clientEmailResult.error);
    }
    if (adminEmailResult.error) {
      console.log('Erreur admin:', adminEmailResult.error);
    }

  } catch (err) {
    console.log('❌ Erreur lors de la simulation:', err.message);
  }
}

function generateClientEmailHtml(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Confirmation de Réservation - N'zoo Immo</title>
    </head>
    <body>
      <h1>✅ Confirmation de Réservation</h1>
      <p>Bonjour ${data.fullName},</p>
      <p>Votre réservation a été confirmée avec succès.</p>
      <h2>Détails de la réservation :</h2>
      <ul>
        <li><strong>Référence :</strong> ${data.transactionId}</li>
        <li><strong>Montant :</strong> ${data.amount}€</li>
        <li><strong>Type d'espace :</strong> ${data.spaceType}</li>
        <li><strong>Date de début :</strong> ${data.startDate}</li>
        <li><strong>Date de fin :</strong> ${data.endDate}</li>
      </ul>
    </body>
    </html>
  `;
}

function generateAdminEmailHtml(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Nouvelle Réservation - N'zoo Immo</title>
    </head>
    <body>
      <h1>🔔 Nouvelle Réservation Reçue</h1>
      <p>Une nouvelle réservation nécessite votre attention.</p>
      <h2>Détails :</h2>
      <ul>
        <li><strong>Client :</strong> ${data.fullName}</li>
        <li><strong>Email :</strong> ${data.email}</li>
        <li><strong>Téléphone :</strong> ${data.phone}</li>
        <li><strong>Montant :</strong> ${data.amount}€</li>
      </ul>
    </body>
    </html>
  `;
}

// Exécuter le diagnostic
testEmailSending().catch(console.error);
