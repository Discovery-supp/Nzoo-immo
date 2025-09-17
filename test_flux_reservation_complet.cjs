const { createClient } = require('@supabase/supabase-js');

console.log('🔍 TEST DU FLUX COMPLET DE RÉSERVATION');
console.log('=======================================\n');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simuler le service de réservation
async function createReservation(data) {
  console.log('📝 Création de réservation avec les données:', data);
  
  try {
    // Mapper les données comme dans le service réel
    const reservationData = {
      full_name: data.fullName || '',
      email: data.email,
      phone: data.phone,
      company: data.company || null,
      activity: data.activity,
      address: data.address || null,
      space_type: data.spaceType || 'coworking',
      start_date: data.startDate || new Date().toISOString().split('T')[0],
      end_date: data.endDate || new Date().toISOString().split('T')[0],
      occupants: data.occupants,
      subscription_type: data.subscriptionType || 'daily',
      amount: data.amount,
      payment_method: data.paymentMethod || 'cash',
      transaction_id: data.transactionId || `TXN-${Date.now()}`,
      status: data.paymentMethod === 'cash' ? 'pending' : 'confirmed',
      created_at: new Date().toISOString()
    };

    console.log('📝 Données mappées pour la base:', reservationData);

    // Insérer dans la base
    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur insertion:', error);
      return {
        success: false,
        error: error.message,
        emailSent: false
      };
    }

    console.log('✅ Réservation créée:', reservation.id);

    // Envoyer les emails
    console.log('📧 Envoi des emails de confirmation...');
    
    let clientEmailSent = false;
    let adminEmailSent = false;
    let clientEmailError;
    let adminEmailError;

    try {
      // Email client
      const clientEmailResult = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: data.email,
          subject: `Confirmation de réservation - ${data.fullName}`,
          html: `<p>Confirmation de votre réservation ${data.transactionId}</p>`,
          reservationData: {
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
            status: reservation.status
          }
        }
      });

      if (clientEmailResult.error) {
        console.error('❌ Erreur email client:', clientEmailResult.error);
        clientEmailError = clientEmailResult.error.message;
      } else {
        console.log('✅ Email client envoyé:', clientEmailResult.data);
        clientEmailSent = clientEmailResult.data.emailSent;
      }

      // Email admin
      const adminEmailResult = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          to: 'tricksonmabengi123@gmail.com',
          subject: `Nouvelle réservation reçue - ${data.fullName}`,
          html: `<p>Nouvelle réservation ${data.transactionId} reçue</p>`,
          reservationData: {
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
            status: reservation.status
          }
        }
      });

      if (adminEmailResult.error) {
        console.error('❌ Erreur email admin:', adminEmailResult.error);
        adminEmailError = adminEmailResult.error.message;
      } else {
        console.log('✅ Email admin envoyé:', adminEmailResult.data);
        adminEmailSent = adminEmailResult.data.emailSent;
      }

    } catch (emailError) {
      console.error('❌ Erreur générale emails:', emailError);
      clientEmailError = emailError.message;
      adminEmailError = emailError.message;
    }

    return {
      success: true,
      reservation,
      emailSent: clientEmailSent,
      clientEmailSent,
      adminEmailSent,
      clientEmailError,
      adminEmailError
    };

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return {
      success: false,
      error: error.message,
      emailSent: false
    };
  }
}

async function testFluxComplet() {
  console.log('📋 SIMULATION DU FLUX DE RÉSERVATION');
  console.log('------------------------------------');
  
  // Données de test (simulant le formulaire)
  const testData = {
    fullName: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    phone: '0123456789',
    company: 'Entreprise Test',
    activity: 'Développement web',
    address: '123 Rue Test, Paris',
    spaceType: 'coworking',
    startDate: '2024-01-25',
    endDate: '2024-01-26',
    occupants: 1,
    subscriptionType: 'daily',
    amount: 50,
    paymentMethod: 'cash',
    transactionId: `CASH_${Date.now()}`
  };

  console.log('📝 Données de test:', testData);

  // Simuler handleReservation
  console.log('\n🔄 SIMULATION DE handleReservation()');
  console.log('====================================');
  
  try {
    console.log('1. Validation des données...');
    if (!testData.fullName || !testData.email || !testData.phone) {
      throw new Error('Données manquantes');
    }
    console.log('✅ Validation OK');

    console.log('2. Appel du service de réservation...');
    const result = await createReservation(testData);
    
    console.log('3. Traitement du résultat...');
    if (result.success) {
      console.log('✅ Réservation réussie');
      console.log('📧 Email envoyé:', result.emailSent);
      console.log('📧 Email client:', result.clientEmailSent);
      console.log('📧 Email admin:', result.adminEmailSent);
      
      if (result.clientEmailError) {
        console.log('❌ Erreur email client:', result.clientEmailError);
      }
      if (result.adminEmailError) {
        console.log('❌ Erreur email admin:', result.adminEmailError);
      }
      
      // Simuler setReservationSuccess(true) et setCurrentStep(4)
      console.log('4. Passage à l\'étape 4 (confirmation)...');
      console.log('✅ setReservationSuccess(true)');
      console.log('✅ setCurrentStep(4)');
      console.log('✅ setEmailSent(result.emailSent)');
      
    } else {
      console.log('❌ Échec de la réservation:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erreur dans le flux:', error.message);
  }

  console.log('\n📋 ANALYSE DES RÉSULTATS');
  console.log('========================');
  console.log('🔍 Points à vérifier dans l\'application:');
  console.log('1. Les données du formulaire sont-elles correctement remplies ?');
  console.log('2. La fonction handleReservation est-elle appelée ?');
  console.log('3. Le service createReservation retourne-t-il success: true ?');
  console.log('4. Les emails sont-ils envoyés (emailSent: true) ?');
  console.log('5. L\'état emailSent est-il mis à jour dans l\'interface ?');
  
  console.log('\n🔧 DIAGNOSTIC RECOMMANDÉ:');
  console.log('1. Ajoutez des console.log dans handleReservation');
  console.log('2. Vérifiez les logs du navigateur lors d\'une réservation');
  console.log('3. Vérifiez que result.emailSent est true');
  console.log('4. Vérifiez que setEmailSent(result.emailSent) est appelé');
  console.log('5. Vérifiez que l\'interface affiche le message d\'email envoyé');
}

testFluxComplet().catch(console.error);
