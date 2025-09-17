#!/usr/bin/env node

/**
 * Test simple pour vérifier que l'application fonctionne
 * Usage: node scripts/test-simple.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimple() {
  console.log('🧪 Test Simple - Nzoo Immo\n');
  
  try {
    // Test 1: Connexion
    console.log('1️⃣ Test de connexion...');
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return;
    }
    console.log('✅ Connexion réussie\n');
    
    // Test 2: Récupération des réservations
    console.log('2️⃣ Test de récupération des réservations...');
    const { data: reservations, error: resError } = await supabase
      .from('reservations')
      .select('*')
      .limit(5);
    
    if (resError) {
      console.log('❌ Erreur de récupération:', resError.message);
      return;
    }
    
    console.log(`✅ ${reservations.length} réservations récupérées`);
    
    if (reservations.length > 0) {
      console.log('📋 Exemple de réservation:');
      console.log(`   - Nom: ${reservations[0].full_name}`);
      console.log(`   - Email: ${reservations[0].email}`);
      console.log(`   - Statut: ${reservations[0].status}`);
    }
    
    console.log('\n🎉 Test réussi ! L\'application devrait fonctionner.');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Ouvrir l\'application: http://localhost:5174/');
    console.log('2. Se connecter');
    console.log('3. Aller sur les réservations');
    console.log('4. Vérifier le panneau de diagnostic');
    
  } catch (err) {
    console.error('❌ Erreur lors du test:', err.message);
  }
}

testSimple();
