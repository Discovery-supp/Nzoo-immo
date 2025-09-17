#!/usr/bin/env node

/**
 * Test de diagnostic des espaces
 * Usage: node scripts/test-spaces-debug.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSpacesDebug() {
  console.log('🔍 Diagnostic des Espaces - Nzoo Immo\n');

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

    // Test 2: Récupérer toutes les données des espaces
    console.log('2️⃣ Récupération des données des espaces...');
    const { data: spacesData, error: spacesError } = await supabase
      .from('spaces_content')
      .select('*');

    if (spacesError) {
      console.log('❌ Erreur lors de la récupération:', spacesError.message);
      return;
    }

    if (!spacesData || spacesData.length === 0) {
      console.log('ℹ️ Aucune donnée d\'espace trouvée');
      return;
    }

    console.log(`✅ ${spacesData.length} enregistrement(s) trouvé(s)\n`);

    // Test 3: Analyser chaque enregistrement
    console.log('3️⃣ Analyse des données...');
    spacesData.forEach((record, index) => {
      console.log(`\n📋 Enregistrement ${index + 1}:`);
      console.log(`   - ID: ${record.id}`);
      console.log(`   - Langue: ${record.language}`);
      console.log(`   - Données:`, JSON.stringify(record.content, null, 2));
      
      // Analyser le contenu
      if (record.content) {
        const content = record.content;
        const spaceKeys = Object.keys(content);
        console.log(`   - Espaces trouvés: ${spaceKeys.length}`);
        
        spaceKeys.forEach(spaceKey => {
          const space = content[spaceKey];
          console.log(`     • ${spaceKey}:`);
          console.log(`       - Titre: ${space.title || 'Non défini'}`);
          console.log(`       - Description: ${space.description ? space.description.substring(0, 50) + '...' : 'Non définie'}`);
          console.log(`       - Image: ${space.imageUrl ? 'Oui' : 'Non'}`);
          console.log(`       - Équipements: ${space.features ? space.features.length : 0}`);
        });
      }
    });

    // Test 4: Vérifier s'il y a un espace "Bible"
    console.log('\n4️⃣ Recherche de l\'espace "Bible"...');
    const bibleSpace = spacesData.find(record => {
      if (record.content) {
        return Object.keys(record.content).includes('bible') || 
               Object.values(record.content).some(space => space.title === 'Bible');
      }
      return false;
    });

    if (bibleSpace) {
      console.log('✅ Espace "Bible" trouvé !');
      console.log('📋 Détails:', JSON.stringify(bibleSpace, null, 2));
    } else {
      console.log('ℹ️ Aucun espace "Bible" trouvé dans la base de données');
    }

    console.log('\n🎉 Diagnostic terminé !');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Vérifier les données dans l\'application');
    console.log('2. Tester la suppression d\'espaces');
    console.log('3. Vérifier les logs dans la console du navigateur');

  } catch (err) {
    console.error('❌ Erreur lors du diagnostic:', err.message);
  }
}

testSpacesDebug();
