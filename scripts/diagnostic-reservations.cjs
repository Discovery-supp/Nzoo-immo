#!/usr/bin/env node

/**
 * Script de diagnostic pour identifier le problème avec l'affichage des réservations
 * Usage: node scripts/diagnostic-reservations.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticReservations() {
  console.log('🔍 Diagnostic du système de réservations - Nzoo Immo\n');
  
  // Test 1: Vérifier la connexion Supabase
  console.log('1️⃣ Test de connexion Supabase...');
  try {
    const { data: testConnection, error: connectionError } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Erreur de connexion Supabase:', connectionError.message);
      return;
    }
    console.log('✅ Connexion Supabase réussie');
  } catch (err) {
    console.log('❌ Erreur de connexion:', err.message);
    return;
  }
  
  // Test 2: Vérifier l'existence de la table reservations
  console.log('\n2️⃣ Test de la table reservations...');
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Erreur lors de la lecture de la table reservations:', error.message);
      return;
    }
    
    console.log('✅ Table reservations accessible');
    console.log(`📊 Nombre de réservations trouvées: ${data.length}`);
    
    if (data.length > 0) {
      console.log('📋 Exemple de réservation:');
      console.log(JSON.stringify(data[0], null, 2));
    }
  } catch (err) {
    console.log('❌ Erreur lors de la lecture des réservations:', err.message);
    return;
  }
  
  // Test 3: Vérifier la structure de la table
  console.log('\n3️⃣ Test de la structure de la table...');
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('id, full_name, email, space_type, start_date, end_date, status, created_at')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur lors de la vérification de la structure:', error.message);
      return;
    }
    
    if (data.length > 0) {
      console.log('✅ Structure de la table correcte');
      console.log('📋 Colonnes disponibles:', Object.keys(data[0]));
    } else {
      console.log('⚠️ Table vide - aucune réservation trouvée');
    }
  } catch (err) {
    console.log('❌ Erreur lors de la vérification de la structure:', err.message);
    return;
  }
  
  // Test 4: Vérifier les politiques RLS
  console.log('\n4️⃣ Test des politiques RLS...');
  try {
    // Test avec un email spécifique
    const testEmail = 'test@example.com';
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('email', testEmail);
    
    if (error) {
      console.log('❌ Erreur lors du test RLS:', error.message);
    } else {
      console.log('✅ Politiques RLS fonctionnelles');
      console.log(`📊 Réservations pour ${testEmail}: ${data.length}`);
    }
  } catch (err) {
    console.log('❌ Erreur lors du test RLS:', err.message);
  }
  
  // Test 5: Vérifier les réservations récentes
  console.log('\n5️⃣ Test des réservations récentes...');
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('❌ Erreur lors de la récupération des réservations récentes:', error.message);
      return;
    }
    
    console.log(`✅ ${data.length} réservations récentes trouvées`);
    
    if (data.length > 0) {
      console.log('📋 Réservations récentes:');
      data.forEach((reservation, index) => {
        console.log(`${index + 1}. ${reservation.full_name} (${reservation.email}) - ${reservation.space_type} - ${reservation.status}`);
      });
    }
  } catch (err) {
    console.log('❌ Erreur lors de la récupération des réservations récentes:', err.message);
  }
  
  // Test 6: Vérifier les statistiques
  console.log('\n6️⃣ Test des statistiques...');
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('status');
    
    if (error) {
      console.log('❌ Erreur lors de la récupération des statistiques:', error.message);
      return;
    }
    
    const stats = data.reduce((acc, reservation) => {
      acc[reservation.status] = (acc[reservation.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('✅ Statistiques des réservations:');
    console.log(JSON.stringify(stats, null, 2));
  } catch (err) {
    console.log('❌ Erreur lors de la récupération des statistiques:', err.message);
  }
  
  console.log('\n🎯 Diagnostic terminé !');
  console.log('\n💡 Solutions possibles:');
  console.log('1. Vérifiez que la table reservations existe dans Supabase');
  console.log('2. Vérifiez les politiques RLS (Row Level Security)');
  console.log('3. Vérifiez que les données sont bien insérées');
  console.log('4. Vérifiez la configuration Supabase dans l\'application');
}

// Exécuter le diagnostic
diagnosticReservations().catch(console.error);
