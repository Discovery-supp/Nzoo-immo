const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lire les variables d'environnement depuis le fichier .env
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      return envVars;
    }
  } catch (error) {
    console.warn('⚠️ Impossible de lire le fichier .env:', error.message);
  }
  return {};
}

const env = loadEnv();

// Configuration Supabase
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  console.log('Vérifiez que votre fichier .env contient :');
  console.log('VITE_SUPABASE_URL=votre_url_supabase');
  console.log('VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeSpacesDatabase() {
  console.log('🚀 Initialisation de la base de données des espaces...\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣ Test de connexion...');
    const { data: testData, error: testError } = await supabase
      .from('spaces_content')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('ℹ️ Table spaces_content non trouvée, création en cours...');
      
      // Lire le fichier de migration
      const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20241201000000_create_spaces_content_table.sql');
      
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log('📋 Migration SQL trouvée');
        
        // Note: Dans un environnement réel, vous devriez exécuter cette migration via Supabase CLI
        console.log('💡 Pour créer la table, exécutez la migration SQL dans votre dashboard Supabase');
        console.log('📁 Fichier de migration: supabase/migrations/20241201000000_create_spaces_content_table.sql');
        
        return false;
      } else {
        console.error('❌ Fichier de migration non trouvé');
        return false;
      }
    }
    
    console.log('✅ Table spaces_content existe déjà');
    
    // Test 2: Insérer des données de test
    console.log('\n2️⃣ Test d\'insertion de données...');
    const testSpace = {
      space_key: 'test-init',
      language: 'fr',
      title: 'Test d\'Initialisation',
      description: 'Espace de test pour vérifier l\'initialisation',
      features: ['Test 1', 'Test 2'],
      daily_price: 50,
      monthly_price: 1000,
      max_occupants: 5,
      is_active: true
    };

    const { data: insertedSpace, error: insertError } = await supabase
      .from('spaces_content')
      .insert(testSpace)
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Violation de contrainte unique
        console.log('ℹ️ Données de test déjà présentes');
      } else {
        console.error('❌ Erreur lors de l\'insertion de test:', insertError.message);
        return false;
      }
    } else {
      console.log('✅ Insertion de test réussie');
    }

    // Test 3: Nettoyer les données de test
    console.log('\n3️⃣ Nettoyage des données de test...');
    const { error: deleteError } = await supabase
      .from('spaces_content')
      .delete()
      .eq('space_key', 'test-init');

    if (deleteError) {
      console.error('❌ Erreur lors du nettoyage:', deleteError.message);
    } else {
      console.log('✅ Nettoyage réussi');
    }

    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('✅ La base de données des espaces est prête pour la sauvegarde silencieuse');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    return false;
  }
}

// Exécuter l'initialisation
initializeSpacesDatabase()
  .then(success => {
    if (success) {
      console.log('\n🚀 La sauvegarde silencieuse en base de données est maintenant active !');
      console.log('💡 Les modifications seront sauvegardées automatiquement en arrière-plan');
    } else {
      console.log('\n⚠️ L\'initialisation a échoué');
      console.log('💡 La sauvegarde silencieuse sera désactivée mais l\'application continuera de fonctionner');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
