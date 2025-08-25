#!/usr/bin/env node

/**
 * Script de test pour vérifier l'affichage des réservations
 * Simule le comportement de l'application frontend
 * Usage: node scripts/test-reservations-display.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simuler le hook useReservations
async function simulateUseReservations(filterByUser) {
  console.log('🔄 Simulation du hook useReservations...');
  console.log('👤 Filtre utilisateur:', filterByUser);
  
  try {
    // Test de connexion à Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Erreur de connexion Supabase:', connectionError.message);
      return { reservations: [], loading: false, error: connectionError.message };
    }
    
    console.log('✅ Connexion Supabase réussie');
    
    // Récupérer les réservations selon le filtre utilisateur
    let query = supabase
      .from('reservations')
      .select('*');
    
    // 🔒 FILTRAGE SÉCURISÉ : Les clients ne peuvent voir que leurs propres réservations
    if (filterByUser && filterByUser.role === 'clients') {
      if (!filterByUser.email) {
        console.log('🔒 ERREUR: Email requis pour filtrer les réservations client');
        return { 
          reservations: [], 
          loading: false, 
          error: 'Email utilisateur requis pour afficher vos réservations' 
        };
      }
      
      console.log('🔒 Filtrage strict pour client:', { email: filterByUser.email });
      query = query.eq('email', filterByUser.email);
    } else if (filterByUser && (filterByUser.role === 'admin' || filterByUser.role === 'user')) {
      console.log('📋 Chargement de toutes les réservations pour admin/user:', filterByUser.role);
    } else {
      console.log('⚠️ Aucun filtre utilisateur fourni - chargement de toutes les réservations');
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Erreur lors de la récupération des réservations:', error.message);
      return { reservations: [], loading: false, error: error.message };
    }
    
    console.log(`📊 Réservations trouvées: ${data?.length || 0}`);
    
    // Vérifier si on a des données
    if (!data || data.length === 0) {
      console.log('⚠️ Aucune réservation trouvée');
      
      // Message spécifique pour les clients sans réservations
      if (filterByUser?.role === 'clients') {
        return { 
          reservations: [], 
          loading: false, 
          error: 'Aucune réservation trouvée pour votre compte. Vous n\'avez pas encore effectué de réservation.' 
        };
      } else {
        return { 
          reservations: [], 
          loading: false, 
          error: 'Aucune réservation trouvée dans la base de données.' 
        };
      }
    }
    
    // Mapper les données avec gestion flexible des noms de colonnes
    const mappedData = (data || []).map(item => ({
      id: item.id,
      full_name: item.full_name || item.fullname || '',
      email: item.email || '',
      phone: item.phone || '',
      company: item.company || '',
      activity: item.activity || '',
      space_type: item.space_type || item.spacetype || 'coworking',
      start_date: item.start_date || item.startdate || new Date().toISOString().split('T')[0],
      end_date: item.end_date || item.enddate || new Date().toISOString().split('T')[0],
      occupants: item.occupants || 1,
      amount: item.amount || 0,
      payment_method: item.payment_method || item.paymentmethod || 'cash',
      status: item.status || 'pending',
      notes: item.notes || '',
      admin_notes: item.admin_notes || '',
      created_at: item.created_at || item.createdat || new Date().toISOString(),
      updated_at: item.updated_at || item.updatedat || new Date().toISOString()
    }));
    
    console.log('✅ Réservations mappées avec succès');
    console.log(`📊 Réservations finales: ${mappedData.length}`);
    
    return { 
      reservations: mappedData, 
      loading: false, 
      error: null 
    };
    
  } catch (err) {
    console.error('❌ Erreur lors de la simulation:', err);
    return { 
      reservations: [], 
      loading: false, 
      error: err.message 
    };
  }
}

async function testReservationsDisplay() {
  console.log('🧪 Test de l\'affichage des réservations - Nzoo Immo\n');
  
  // Test 1: Simulation sans utilisateur (admin)
  console.log('1️⃣ Test sans filtre utilisateur (admin)...');
  const adminResult = await simulateUseReservations(undefined);
  console.log('📊 Résultat admin:', {
    count: adminResult.reservations.length,
    error: adminResult.error,
    loading: adminResult.loading
  });
  
  if (adminResult.reservations.length > 0) {
    console.log('📋 Exemple de réservation admin:', {
      id: adminResult.reservations[0].id,
      full_name: adminResult.reservations[0].full_name,
      email: adminResult.reservations[0].email,
      status: adminResult.reservations[0].status
    });
  }
  
  // Test 2: Simulation avec un client existant
  console.log('\n2️⃣ Test avec un client existant...');
  const clientEmail = 'trickson.mabengi@gmail.com'; // Email trouvé dans le diagnostic précédent
  const clientResult = await simulateUseReservations({ 
    email: clientEmail, 
    role: 'clients' 
  });
  
  console.log('📊 Résultat client:', {
    count: clientResult.reservations.length,
    error: clientResult.error,
    loading: clientResult.loading
  });
  
  if (clientResult.reservations.length > 0) {
    console.log('📋 Réservations du client:');
    clientResult.reservations.forEach((reservation, index) => {
      console.log(`  ${index + 1}. ${reservation.full_name} - ${reservation.space_type} - ${reservation.status}`);
    });
  }
  
  // Test 3: Simulation avec un client inexistant
  console.log('\n3️⃣ Test avec un client inexistant...');
  const fakeClientResult = await simulateUseReservations({ 
    email: 'fake@example.com', 
    role: 'clients' 
  });
  
  console.log('📊 Résultat client inexistant:', {
    count: fakeClientResult.reservations.length,
    error: fakeClientResult.error,
    loading: fakeClientResult.loading
  });
  
  // Test 4: Simulation avec un client sans email
  console.log('\n4️⃣ Test avec un client sans email...');
  const noEmailResult = await simulateUseReservations({ 
    email: '', 
    role: 'clients' 
  });
  
  console.log('📊 Résultat client sans email:', {
    count: noEmailResult.reservations.length,
    error: noEmailResult.error,
    loading: noEmailResult.loading
  });
  
  // Test 5: Simulation avec un utilisateur admin
  console.log('\n5️⃣ Test avec un utilisateur admin...');
  const adminUserResult = await simulateUseReservations({ 
    email: 'admin@example.com', 
    role: 'admin' 
  });
  
  console.log('📊 Résultat utilisateur admin:', {
    count: adminUserResult.reservations.length,
    error: adminUserResult.error,
    loading: adminUserResult.loading
  });
  
  // Résumé des tests
  console.log('\n🎯 Résumé des tests:');
  console.log('✅ Admin (sans filtre):', adminResult.reservations.length, 'réservations');
  console.log('✅ Client existant:', clientResult.reservations.length, 'réservations');
  console.log('✅ Client inexistant:', fakeClientResult.reservations.length, 'réservations');
  console.log('✅ Client sans email:', noEmailResult.error ? 'Erreur détectée' : 'OK');
  console.log('✅ Utilisateur admin:', adminUserResult.reservations.length, 'réservations');
  
  // Diagnostic
  console.log('\n🔍 Diagnostic:');
  if (adminResult.reservations.length > 0) {
    console.log('✅ La base de données contient des réservations');
  } else {
    console.log('❌ Aucune réservation dans la base de données');
  }
  
  if (clientResult.reservations.length > 0) {
    console.log('✅ Le filtrage par client fonctionne');
  } else {
    console.log('⚠️ Aucune réservation trouvée pour le client test');
  }
  
  if (noEmailResult.error) {
    console.log('✅ La validation d\'email fonctionne');
  } else {
    console.log('❌ La validation d\'email ne fonctionne pas');
  }
  
  console.log('\n💡 Recommandations:');
  if (adminResult.reservations.length === 0) {
    console.log('1. Vérifiez que la table reservations contient des données');
  }
  
  if (clientResult.reservations.length === 0 && adminResult.reservations.length > 0) {
    console.log('2. Vérifiez que les réservations ont les bons emails');
  }
  
  console.log('3. Vérifiez la configuration Supabase dans l\'application');
  console.log('4. Vérifiez les politiques RLS (Row Level Security)');
}

// Exécuter les tests
testReservationsDisplay().catch(console.error);
