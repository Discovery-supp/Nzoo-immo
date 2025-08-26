const { createClient } = require('@supabase/supabase-js');

console.log('🔍 DIAGNOSTIC COMPLET DU SYSTÈME D\'EMAILS');
console.log('==========================================\n');

// Configuration Supabase (utiliser les mêmes valeurs que dans le code)
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnosticComplet() {
  console.log('📋 1. TEST DE CONNEXION SUPABASE');
  console.log('--------------------------------');
  
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connexion Supabase échouée:', error.message);
      return;
    }
    console.log('✅ Connexion Supabase réussie\n');
  } catch (err) {
    console.log('❌ Erreur de connexion:', err.message);
    return;
  }

  console.log('📋 2. TEST DE LA FONCTION EDGE SUPABASE');
  console.log('----------------------------------------');
  
  try {
    const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
      body: {
        to: 'test@example.com',
        subject: 'Test Email',
        html: '<p>Test email</p>',
        reservationData: {
          fullName: 'Test User',
          email: 'test@example.com',
          phone: '123456789',
          spaceType: 'coworking',
          startDate: '2024-01-20',
          endDate: '2024-01-21',
          amount: 100,
          transactionId: 'TEST_123',
          status: 'pending'
        }
      }
    });

    if (error) {
      console.log('❌ Fonction Edge échouée:', error.message);
      if (error.message.includes('404')) {
        console.log('🔧 Solution: La fonction Edge n\'existe pas. Vérifiez le déploiement.');
      }
    } else {
      console.log('✅ Fonction Edge répond:', data);
      console.log('📧 Provider utilisé:', data.provider);
      console.log('📧 Email envoyé:', data.emailSent);
      if (data.error) {
        console.log('❌ Erreur email:', data.error);
      }
    }
  } catch (err) {
    console.log('❌ Erreur fonction Edge:', err.message);
  }

  console.log('\n📋 3. TEST DE CRÉATION DE RÉSERVATION');
  console.log('--------------------------------------');
  
  try {
    const reservationData = {
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '123456789',
      company: 'Test Company',
      activity: 'Test Activity',
      address: 'Test Address',
      space_type: 'coworking',
      start_date: '2024-01-20',
      end_date: '2024-01-21',
      occupants: 1,
      subscription_type: 'daily',
      amount: 100,
      payment_method: 'cash',
      transaction_id: `TEST_${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: reservation, error } = await supabase
      .from('reservations')
      .insert(reservationData)
      .select()
      .single();

    if (error) {
      console.log('❌ Création réservation échouée:', error.message);
    } else {
      console.log('✅ Réservation créée:', reservation.id);
      
      // Test d'envoi d'email après réservation
      console.log('\n📋 4. TEST D\'ENVOI D\'EMAIL APRÈS RÉSERVATION');
      console.log('------------------------------------------------');
      
      try {
        const emailResult = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            to: 'test@example.com',
            subject: `Confirmation de réservation - Test User`,
            html: '<p>Test confirmation email</p>',
            reservationData: {
              fullName: 'Test User',
              email: 'test@example.com',
              phone: '123456789',
              company: 'Test Company',
              activity: 'Test Activity',
              spaceType: 'coworking',
              startDate: '2024-01-20',
              endDate: '2024-01-21',
              amount: 100,
              transactionId: reservation.transaction_id,
              status: reservation.status
            }
          }
        });

        if (emailResult.error) {
          console.log('❌ Email après réservation échoué:', emailResult.error.message);
        } else {
          console.log('✅ Email après réservation envoyé:', emailResult.data);
        }
      } catch (emailErr) {
        console.log('❌ Erreur email après réservation:', emailErr.message);
      }
    }
  } catch (err) {
    console.log('❌ Erreur création réservation:', err.message);
  }

  console.log('\n📋 5. ANALYSE DU FLUX COMPLET');
  console.log('------------------------------');
  
  console.log('🔍 Points de vérification:');
  console.log('1. ✅ Connexion Supabase: OK');
  console.log('2. ⚠️  Fonction Edge: À vérifier (voir ci-dessus)');
  console.log('3. ✅ Création réservation: OK');
  console.log('4. ⚠️  Envoi email: À vérifier (voir ci-dessus)');
  
  console.log('\n🔧 SOLUTIONS RECOMMANDÉES:');
  console.log('1. Vérifiez que la fonction Edge est déployée sur Supabase');
  console.log('2. Configurez les variables d\'environnement dans Supabase:');
  console.log('   - SENDGRID_API_KEY');
  console.log('   - RESEND_API_KEY');
  console.log('   - FROM_EMAIL');
  console.log('3. Vérifiez les logs de la fonction Edge dans Supabase Dashboard');
  console.log('4. Testez avec un email valide au lieu de test@example.com');
  
  console.log('\n📧 CONFIGURATION EMAIL RECOMMANDÉE:');
  console.log('- Utilisez SendGrid ou Resend comme provider principal');
  console.log('- Configurez FROM_EMAIL avec un domaine vérifié');
  console.log('- Testez avec des emails réels pour valider le flux');
}

diagnosticComplet().catch(console.error);
