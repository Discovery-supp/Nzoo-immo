// Script de test pour vérifier les réservations dans la base de données

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacez par vos vraies clés)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReservations() {
  console.log('🔍 Test des réservations dans la base de données...\n');

  try {
    // Test de connexion
    console.log('📡 Test de connexion à Supabase...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Erreur de connexion:', connectionError.message);
      return;
    }
    
    console.log('✅ Connexion réussie\n');

    // Récupérer toutes les réservations
    console.log('📋 Récupération de toutes les réservations...');
    const { data: allReservations, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError.message);
      return;
    }

    console.log(`✅ ${allReservations?.length || 0} réservations trouvées\n`);

    if (!allReservations || allReservations.length === 0) {
      console.log('ℹ️ Aucune réservation dans la base de données');
      return;
    }

    // Afficher les détails des réservations
    console.log('📊 Détails des réservations:');
    allReservations.forEach((reservation, index) => {
      console.log(`\n${index + 1}. Réservation ID: ${reservation.id}`);
      console.log(`   Nom: ${reservation.full_name || reservation.fullname || 'N/A'}`);
      console.log(`   Email: ${reservation.email || 'N/A'}`);
      console.log(`   Statut: ${reservation.status || 'N/A'}`);
      console.log(`   Espace: ${reservation.space_type || reservation.spacetype || 'N/A'}`);
      console.log(`   Date début: ${reservation.start_date || reservation.startdate || 'N/A'}`);
      console.log(`   Date fin: ${reservation.end_date || reservation.enddate || 'N/A'}`);
      console.log(`   Montant: ${reservation.amount || 'N/A'}`);
      console.log(`   Créée le: ${reservation.created_at || reservation.createdat || 'N/A'}`);
    });

    // Statistiques par statut
    console.log('\n📈 Statistiques par statut:');
    const statusStats = {};
    allReservations.forEach(reservation => {
      const status = reservation.status || 'unknown';
      statusStats[status] = (statusStats[status] || 0) + 1;
    });

    Object.entries(statusStats).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} réservation(s)`);
    });

    // Test de filtrage par email (simulation client)
    console.log('\n🔍 Test de filtrage par email (simulation client)...');
    const testEmail = allReservations[0]?.email;
    if (testEmail) {
      const { data: clientReservations, error: clientError } = await supabase
        .from('reservations')
        .select('*')
        .eq('email', testEmail);

      if (clientError) {
        console.error('❌ Erreur lors du filtrage client:', clientError.message);
      } else {
        console.log(`✅ ${clientReservations?.length || 0} réservation(s) trouvée(s) pour l'email: ${testEmail}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le test
testReservations().catch(console.error);
