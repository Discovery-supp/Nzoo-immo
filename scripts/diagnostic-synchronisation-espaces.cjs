#!/usr/bin/env node

/**
 * Script pour diagnostiquer la synchronisation des espaces
 * Usage: node scripts/diagnostic-synchronisation-espaces.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticSynchronisationEspaces() {
  console.log('🔍 Diagnostic de la synchronisation des espaces\n');

  try {
    // Test 1: Vérifier la connexion Supabase
    console.log('📡 Test 1: Vérification de la connexion Supabase...');
    const { data: testData, error: testError } = await supabase.from('spaces_content').select('count').limit(1);
    
    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError.message);
      return;
    }
    console.log('✅ Connexion Supabase réussie\n');

    // Test 2: Récupérer les espaces de la base de données
    console.log('📋 Test 2: Récupération des espaces depuis la base de données...');
    const { data: spacesFromDB, error: spacesError } = await supabase
      .from('spaces_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (spacesError) {
      console.error('❌ Erreur lors de la récupération des espaces:', spacesError.message);
      return;
    }

    console.log(`✅ ${spacesFromDB.length} espaces trouvés dans la base de données\n`);

    // Test 3: Analyser les espaces par langue
    console.log('🌐 Test 3: Analyse des espaces par langue...');
    const spacesByLanguage = {};
    spacesFromDB.forEach(space => {
      if (!spacesByLanguage[space.language]) {
        spacesByLanguage[space.language] = [];
      }
      spacesByLanguage[space.language].push(space);
    });

    Object.entries(spacesByLanguage).forEach(([lang, spaces]) => {
      console.log(`📝 Langue ${lang}: ${spaces.length} espaces`);
      spaces.forEach(space => {
        console.log(`  - ${space.space_key}: "${space.title}" (${space.daily_price || 0}$/jour)`);
      });
    });
    console.log();

    // Test 4: Vérifier les doublons
    console.log('🔍 Test 4: Vérification des doublons...');
    const duplicates = {};
    spacesFromDB.forEach(space => {
      const key = `${space.space_key}_${space.language}`;
      if (!duplicates[key]) {
        duplicates[key] = [];
      }
      duplicates[key].push(space);
    });

    const actualDuplicates = Object.entries(duplicates).filter(([key, spaces]) => spaces.length > 1);
    
    if (actualDuplicates.length > 0) {
      console.log('⚠️ Doublons détectés:');
      actualDuplicates.forEach(([key, spaces]) => {
        console.log(`  - ${key}: ${spaces.length} entrées`);
        spaces.forEach((space, index) => {
          console.log(`    ${index + 1}. ID: ${space.id}, Créé: ${space.created_at}, Titre: "${space.title}"`);
        });
      });
    } else {
      console.log('✅ Aucun doublon détecté');
    }
    console.log();

    // Test 5: Vérifier la structure des données
    console.log('🏗️ Test 5: Vérification de la structure des données...');
    if (spacesFromDB.length > 0) {
      const sampleSpace = spacesFromDB[0];
      const columns = Object.keys(sampleSpace);
      console.log('📋 Colonnes disponibles:', columns);
      
      const requiredColumns = ['id', 'space_key', 'language', 'title', 'description', 'daily_price', 'monthly_price', 'yearly_price', 'hourly_price', 'max_occupants'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.error('❌ Colonnes manquantes:', missingColumns);
      } else {
        console.log('✅ Toutes les colonnes requises sont présentes');
      }
    }
    console.log();

    // Test 6: Vérifier les données par défaut vs base de données
    console.log('⚖️ Test 6: Comparaison données par défaut vs base de données...');
    
    // Données par défaut (simulation)
    const defaultSpaces = {
      'coworking': { title: 'Espace de Coworking', dailyPrice: 25 },
      'bureau-prive': { title: 'Bureau Privé', dailyPrice: 50 },
      'domiciliation': { title: 'Service de Domiciliation', monthlyPrice: 150 }
    };

    const dbSpaces = {};
    spacesFromDB.forEach(space => {
      if (!dbSpaces[space.space_key]) {
        dbSpaces[space.space_key] = {};
      }
      dbSpaces[space.space_key][space.language] = space;
    });

    console.log('📊 Comparaison:');
    Object.keys(defaultSpaces).forEach(spaceKey => {
      const defaultSpace = defaultSpaces[spaceKey];
      const dbSpace = dbSpaces[spaceKey];
      
      if (dbSpace) {
        console.log(`  ✅ ${spaceKey}: Présent en base de données`);
        Object.entries(dbSpace).forEach(([lang, space]) => {
          console.log(`    - ${lang}: "${space.title}" (${space.daily_price || space.monthly_price || 0}$)`);
        });
      } else {
        console.log(`  ⚠️ ${spaceKey}: Seulement en données par défaut`);
      }
    });
    console.log();

    // Test 7: Vérifier les espaces supplémentaires en base
    console.log('➕ Test 7: Espaces supplémentaires en base de données...');
    const dbOnlySpaces = Object.keys(dbSpaces).filter(key => !defaultSpaces[key]);
    
    if (dbOnlySpaces.length > 0) {
      console.log('📝 Espaces uniquement en base de données:');
      dbOnlySpaces.forEach(spaceKey => {
        const space = dbSpaces[spaceKey];
        Object.entries(space).forEach(([lang, spaceData]) => {
          console.log(`  - ${spaceKey} (${lang}): "${spaceData.title}"`);
        });
      });
    } else {
      console.log('✅ Aucun espace supplémentaire en base de données');
    }
    console.log();

    // Résumé
    console.log('📊 Résumé du diagnostic:');
    console.log(`  📋 Espaces en base: ${spacesFromDB.length}`);
    console.log(`  🌐 Langues: ${Object.keys(spacesByLanguage).join(', ')}`);
    console.log(`  🔍 Doublons: ${actualDuplicates.length}`);
    console.log(`  ➕ Espaces supplémentaires: ${dbOnlySpaces.length}`);

    console.log('\n💡 Recommandations:');
    console.log('  1. Vérifiez que la page Réservation utilise uniquement les données de la base');
    console.log('  2. Supprimez les doublons si nécessaire');
    console.log('  3. Assurez-vous que tous les espaces ont des données complètes');
    console.log('  4. Vérifiez la cohérence entre les langues');

  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Exécuter le diagnostic
diagnosticSynchronisationEspaces();
