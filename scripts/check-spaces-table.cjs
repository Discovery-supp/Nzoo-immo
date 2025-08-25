#!/usr/bin/env node

/**
 * Vérification de la structure de la table spaces_content
 * Usage: node scripts/check-spaces-table.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpacesTable() {
  console.log('🔍 Vérification de la Table spaces_content - Nzoo Immo\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣ Test de connexion...');
    const { data, error } = await supabase
      .from('spaces_content')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return;
    }
    console.log('✅ Connexion réussie\n');

    // Test 2: Récupérer un enregistrement complet
    console.log('2️⃣ Récupération d\'un enregistrement complet...');
    const { data: record, error: recordError } = await supabase
      .from('spaces_content')
      .select('*')
      .limit(1)
      .single();

    if (recordError) {
      console.log('❌ Erreur lors de la récupération:', recordError.message);
      return;
    }

    console.log('📋 Structure de l\'enregistrement:');
    console.log(JSON.stringify(record, null, 2));

    // Test 3: Vérifier les colonnes
    console.log('\n3️⃣ Vérification des colonnes...');
    const columns = Object.keys(record);
    console.log('📊 Colonnes trouvées:', columns);

    // Test 4: Tenter d'insérer des données de test
    console.log('\n4️⃣ Test d\'insertion de données...');
    const testData = {
      language: 'fr',
      content: {
        'test-espace': {
          title: 'Espace de Test',
          description: 'Description de test',
          features: ['WiFi', 'Climatisation'],
          dailyPrice: 25,
          monthlyPrice: 500,
          yearlyPrice: 5000,
          hourlyPrice: 5,
          maxOccupants: 4,
          imageUrl: ''
        }
      },
      last_modified: new Date().toISOString()
    };

    const { data: insertData, error: insertError } = await supabase
      .from('spaces_content')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('❌ Erreur lors de l\'insertion:', insertError.message);
    } else {
      console.log('✅ Données de test insérées avec succès');
      console.log('📋 Données insérées:', JSON.stringify(insertData, null, 2));
    }

    // Test 5: Récupérer toutes les données
    console.log('\n5️⃣ Récupération de toutes les données...');
    const { data: allData, error: allError } = await supabase
      .from('spaces_content')
      .select('*');

    if (allError) {
      console.log('❌ Erreur lors de la récupération:', allError.message);
      return;
    }

    console.log(`📊 Total d'enregistrements: ${allData.length}`);
    allData.forEach((item, index) => {
      console.log(`\n📋 Enregistrement ${index + 1}:`);
      console.log(`   - ID: ${item.id}`);
      console.log(`   - Langue: ${item.language}`);
      console.log(`   - Contenu: ${item.content ? 'Présent' : 'Absent'}`);
      if (item.content) {
        const contentKeys = Object.keys(item.content);
        console.log(`   - Espaces: ${contentKeys.join(', ')}`);
      }
    });

    console.log('\n🎉 Vérification terminée !');

  } catch (err) {
    console.error('❌ Erreur lors de la vérification:', err.message);
  }
}

checkSpacesTable();
