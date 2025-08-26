#!/usr/bin/env node

/**
 * Script pour diagnostiquer les problèmes de la page de réservation
 * Usage: node scripts/diagnostic-reservation-page.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticReservationPage() {
  console.log('🔍 Diagnostic de la page de réservation\n');

  try {
    // Test 1: Vérifier la connexion Supabase
    console.log('📡 Test 1: Vérification de la connexion Supabase...');
    const { data: testData, error: testError } = await supabase.from('reservations').select('count').limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError.message);
      return;
    }
    console.log('✅ Connexion Supabase réussie\n');

    // Test 2: Vérifier la table reservations
    console.log('📋 Test 2: Vérification de la table reservations...');
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .limit(5);

    if (reservationsError) {
      console.error('❌ Erreur lors de la récupération des réservations:', reservationsError.message);
    } else {
      console.log(`✅ ${reservations.length} réservations trouvées`);
      if (reservations.length > 0) {
        console.log('📊 Exemple de réservation:', {
          id: reservations[0].id,
          space_type: reservations[0].space_type,
          status: reservations[0].status,
          email: reservations[0].email
        });
      }
    }
    console.log();

    // Test 3: Vérifier les types d'espaces
    console.log('🏢 Test 3: Vérification des types d\'espaces...');
    const spaceTypes = ['coworking', 'bureau-prive', 'bureau_prive', 'domiciliation'];
    
    for (const spaceType of spaceTypes) {
      const { data: spaceReservations, error: spaceError } = await supabase
        .from('reservations')
        .select('*')
        .eq('space_type', spaceType)
        .limit(3);

      if (spaceError) {
        console.error(`❌ Erreur pour ${spaceType}:`, spaceError.message);
      } else {
        console.log(`✅ ${spaceType}: ${spaceReservations.length} réservations`);
      }
    }
    console.log();

    // Test 4: Vérifier les statuts de réservation
    console.log('📊 Test 4: Vérification des statuts de réservation...');
    const { data: statusData, error: statusError } = await supabase
      .from('reservations')
      .select('status');

    if (statusError) {
      console.error('❌ Erreur lors de la récupération des statuts:', statusError.message);
    } else {
      const statusCounts = {};
      statusData.forEach(r => {
        statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      });
      console.log('📈 Répartition des statuts:', statusCounts);
    }
    console.log();

    // Test 5: Vérifier les permissions RLS
    console.log('🔐 Test 5: Vérification des permissions RLS...');
    
    // Test sans authentification
    const { data: publicData, error: publicError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1);

    if (publicError) {
      console.log('⚠️ Erreur RLS attendue (sans authentification):', publicError.message);
    } else {
      console.log('⚠️ Attention: Données accessibles publiquement (RLS désactivé)');
    }
    console.log();

    // Test 6: Vérifier la structure de la table
    console.log('🏗️ Test 6: Vérification de la structure de la table...');
    if (reservations && reservations.length > 0) {
      const columns = Object.keys(reservations[0]);
      console.log('📋 Colonnes de la table reservations:', columns);
      
      const requiredColumns = ['id', 'space_type', 'status', 'email', 'full_name', 'start_date', 'end_date'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes manquantes:', missingColumns);
      } else {
        console.log('✅ Toutes les colonnes requises sont présentes');
      }
    }
    console.log();

    // Test 7: Vérifier les données d'exemple
    console.log('📝 Test 7: Vérification des données d\'exemple...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('reservations')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('❌ Erreur lors de la récupération d\'un exemple:', sampleError.message);
    } else {
      console.log('✅ Exemple de données:', {
        id: sampleData.id,
        space_type: sampleData.space_type,
        status: sampleData.status,
        email: sampleData.email,
        full_name: sampleData.full_name,
        start_date: sampleData.start_date,
        end_date: sampleData.end_date,
        created_at: sampleData.created_at
      });
    }
    console.log();

    // Résumé
    console.log('📊 Résumé du diagnostic:');
    console.log('  ✅ Connexion Supabase: Fonctionnelle');
    console.log(`  📋 Réservations: ${reservations?.length || 0} trouvées`);
    console.log('  🏢 Types d\'espaces: Vérifiés');
    console.log('  📊 Statuts: Analysés');
    console.log('  🔐 Permissions RLS: Vérifiées');
    console.log('  🏗️ Structure: Vérifiée');
    console.log('  📝 Données: Analysées');

    console.log('\n💡 Recommandations:');
    console.log('  1. Vérifiez que la page ReservationPage charge correctement');
    console.log('  2. Assurez-vous que les services (availabilityService, etc.) fonctionnent');
    console.log('  3. Vérifiez les erreurs JavaScript dans la console du navigateur');
    console.log('  4. Testez avec différents types d\'espaces');
    console.log('  5. Vérifiez les permissions RLS si nécessaire');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le diagnostic
diagnosticReservationPage();
