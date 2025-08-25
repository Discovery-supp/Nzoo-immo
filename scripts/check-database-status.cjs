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

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

console.log('🔍 Configuration Supabase:');
console.log('URL:', supabaseUrl ? 'Configurée' : 'Manquante');
console.log('Key:', supabaseKey ? 'Configurée' : 'Manquante');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStatus() {
  console.log('🔍 Vérification de l\'état de la base de données...\n');

  try {
    // Test 1: Vérifier la connexion générale
    console.log('1️⃣ Test de connexion générale...');
    const { data: testData, error: testError } = await supabase
      .from('spaces_content')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erreur de connexion:', testError.message);
      
      if (testError.message.includes('relation "spaces_content" does not exist')) {
        console.log('\n💡 Solution :');
        console.log('1. Exécutez la migration SQL dans votre dashboard Supabase');
        console.log('2. Ou utilisez le fichier de correction : supabase/migrations/20241201000001_fix_spaces_content_table.sql');
      }
      
      return false;
    }
    
    console.log('✅ Connexion réussie');
    
    // Test 2: Compter les enregistrements
    console.log('\n2️⃣ Nombre d\'enregistrements...');
    const { count, error: countError } = await supabase
      .from('spaces_content')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Erreur lors du comptage:', countError.message);
    } else {
      console.log(`✅ ${count} enregistrement(s) trouvé(s)`);
    }

    // Test 3: Vérifier la structure
    console.log('\n3️⃣ Test d\'insertion de données...');
    const testSpace = {
      space_key: 'test-status-check',
      language: 'fr',
      title: 'Test de Statut',
      description: 'Test pour vérifier le statut de la base de données',
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
        console.log('❌ Erreur lors de l\'insertion:', insertError.message);
        return false;
      }
    } else {
      console.log('✅ Insertion de test réussie');
    }

    // Test 4: Nettoyer les données de test
    console.log('\n4️⃣ Nettoyage des données de test...');
    const { error: deleteError } = await supabase
      .from('spaces_content')
      .delete()
      .eq('space_key', 'test-status-check');

    if (deleteError) {
      console.log('❌ Erreur lors du nettoyage:', deleteError.message);
    } else {
      console.log('✅ Nettoyage réussi');
    }

    console.log('\n🎉 Vérification terminée avec succès !');
    console.log('✅ La base de données est prête pour la sauvegarde silencieuse');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

// Exécuter la vérification
checkDatabaseStatus()
  .then(success => {
    if (success) {
      console.log('\n🚀 La sauvegarde silencieuse en base de données est opérationnelle !');
      console.log('💡 Les modifications seront sauvegardées automatiquement en arrière-plan');
    } else {
      console.log('\n⚠️ La vérification a échoué');
      console.log('💡 Vérifiez votre configuration Supabase et exécutez les migrations');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
