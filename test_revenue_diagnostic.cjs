#!/usr/bin/env node

/**
 * Diagnostic des données de revenus
 * 
 * Ce script vérifie les données de revenus dans la base de données
 * et identifie les problèmes potentiels.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour diagnostiquer les données de revenus
async function diagnoseRevenueData() {
  console.log('🔍 Diagnostic des données de revenus');
  console.log('=' .repeat(60));

  try {
    // 1. Vérifier la table reservations
    console.log('📋 1. Vérification de la table reservations...');
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (reservationsError) {
      console.error('❌ Erreur lors de la récupération des réservations:', reservationsError);
      return;
    }

    console.log(`✅ ${reservations.length} réservations trouvées`);

    if (reservations.length === 0) {
      console.log('⚠️ Aucune réservation dans la base de données');
      console.log('💡 Solutions possibles:');
      console.log('   - Créer des réservations de test');
      console.log('   - Vérifier les permissions de la table');
      console.log('   - Vérifier la structure de la table');
      return;
    }

    // 2. Analyser les types d'espaces
    console.log('\n📊 2. Analyse des types d\'espaces...');
    const spaceTypes = [...new Set(reservations.map(r => r.space_type))];
    console.log('Types d\'espaces trouvés:', spaceTypes);

    // 3. Analyser les montants
    console.log('\n💰 3. Analyse des montants...');
    const amounts = reservations.map(r => Number(r.amount) || 0);
    const totalRevenue = amounts.reduce((sum, amount) => sum + amount, 0);
    const validAmounts = amounts.filter(amount => amount > 0);
    
    console.log(`Total des revenus: $${totalRevenue.toFixed(2)}`);
    console.log(`Montants valides (> 0): ${validAmounts.length}/${amounts.length}`);
    console.log(`Montant moyen: $${(totalRevenue / reservations.length).toFixed(2)}`);

    // 4. Analyser par type d'espace
    console.log('\n🏢 4. Analyse par type d\'espace...');
    const revenueByType = {};
    spaceTypes.forEach(type => {
      const typeReservations = reservations.filter(r => r.space_type === type);
      const typeRevenue = typeReservations.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      revenueByType[type] = {
        count: typeReservations.length,
        revenue: typeRevenue,
        average: typeReservations.length > 0 ? typeRevenue / typeReservations.length : 0
      };
    });

    Object.entries(revenueByType).forEach(([type, data]) => {
      console.log(`${type}: ${data.count} réservations, $${data.revenue.toFixed(2)} revenus, $${data.average.toFixed(2)} moyenne`);
    });

    // 5. Vérifier les statuts
    console.log('\n📈 5. Analyse des statuts...');
    const statuses = [...new Set(reservations.map(r => r.status))];
    const statusCounts = {};
    statuses.forEach(status => {
      statusCounts[status] = reservations.filter(r => r.status === status).length;
    });
    console.log('Répartition par statut:', statusCounts);

    // 6. Vérifier les dates
    console.log('\n📅 6. Analyse des dates...');
    const dates = reservations.map(r => new Date(r.created_at));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    console.log(`Période: ${oldestDate.toLocaleDateString()} - ${newestDate.toLocaleDateString()}`);

    // 7. Vérifier les utilisateurs
    console.log('\n👥 7. Analyse des utilisateurs...');
    const users = [...new Set(reservations.map(r => r.email))];
    console.log(`${users.length} utilisateurs uniques`);

    // 8. Exemples de réservations
    console.log('\n📝 8. Exemples de réservations...');
    reservations.slice(0, 5).forEach((r, i) => {
      console.log(`${i + 1}. ID: ${r.id} | Type: ${r.space_type} | Montant: $${r.amount} | Statut: ${r.status} | Date: ${new Date(r.created_at).toLocaleDateString()}`);
    });

    // 9. Diagnostic des problèmes potentiels
    console.log('\n🔍 9. Diagnostic des problèmes potentiels...');
    
    const issues = [];
    
    if (totalRevenue === 0) {
      issues.push('❌ Aucun revenu total calculé');
    }
    
    if (validAmounts.length === 0) {
      issues.push('❌ Aucun montant valide (> 0)');
    }
    
    const invalidAmounts = amounts.filter(amount => amount < 0);
    if (invalidAmounts.length > 0) {
      issues.push(`❌ ${invalidAmounts.length} montants négatifs trouvés`);
    }
    
    const unknownTypes = spaceTypes.filter(type => !['coworking', 'bureau-prive', 'bureau_prive', 'salle-reunion', 'salle_reunion', 'domiciliation'].includes(type));
    if (unknownTypes.length > 0) {
      issues.push(`❌ Types d'espaces non reconnus: ${unknownTypes.join(', ')}`);
    }
    
    if (issues.length === 0) {
      console.log('✅ Aucun problème détecté');
    } else {
      console.log('Problèmes détectés:');
      issues.forEach(issue => console.log(issue));
    }

    // 10. Recommandations
    console.log('\n💡 10. Recommandations...');
    if (reservations.length === 0) {
      console.log('   - Créer des réservations de test');
    } else if (totalRevenue === 0) {
      console.log('   - Vérifier les montants des réservations');
      console.log('   - S\'assurer que les montants sont des nombres valides');
    } else {
      console.log('   - Les données semblent correctes');
      console.log('   - Vérifier les filtres dans l\'interface utilisateur');
      console.log('   - Vérifier les permissions utilisateur');
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }

  console.log('=' .repeat(60));
  console.log('🔍 Diagnostic terminé');
}

// Fonction pour créer des données de test
async function createTestData() {
  console.log('🧪 Création de données de test...');
  
  const testReservations = [
    {
      full_name: 'Test User 1',
      email: 'test1@example.com',
      phone: '+243123456789',
      space_type: 'coworking',
      start_date: '2024-01-15',
      end_date: '2024-01-16',
      amount: 50.00,
      status: 'confirmed',
      payment_method: 'cash'
    },
    {
      full_name: 'Test User 2',
      email: 'test2@example.com',
      phone: '+243123456790',
      space_type: 'bureau-prive',
      start_date: '2024-01-16',
      end_date: '2024-01-17',
      amount: 100.00,
      status: 'confirmed',
      payment_method: 'cash'
    },
    {
      full_name: 'Test User 3',
      email: 'test3@example.com',
      phone: '+243123456791',
      space_type: 'salle-reunion',
      start_date: '2024-01-17',
      end_date: '2024-01-18',
      amount: 75.00,
      status: 'confirmed',
      payment_method: 'cash'
    }
  ];

  try {
    for (const reservation of testReservations) {
      const { error } = await supabase
        .from('reservations')
        .insert([reservation]);

      if (error) {
        console.error('❌ Erreur lors de la création:', error);
      } else {
        console.log('✅ Réservation de test créée:', reservation.full_name);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du diagnostic des revenus');
  console.log('');

  await diagnoseRevenueData();

  console.log('');
  console.log('Voulez-vous créer des données de test ? (y/n)');
  // En mode interactif, vous pouvez répondre 'y' pour créer des données de test
}

// Exécuter le diagnostic
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  diagnoseRevenueData,
  createTestData
};
