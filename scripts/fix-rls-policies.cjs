const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  console.log('🔧 Correction des politiques RLS...\n');

  try {
    // Test 1: Vérifier que la table existe
    console.log('1️⃣ Vérification de la table...');
    const { data: testData, error: testError } = await supabase
      .from('spaces_content')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erreur:', testError.message);
      return false;
    }
    
    console.log('✅ Table spaces_content trouvée');
    
    // Test 2: Tester l'insertion avant correction
    console.log('\n2️⃣ Test d\'insertion avant correction...');
    const testSpace = {
      space_key: 'test-rls-fix',
      language: 'fr',
      title: 'Test RLS Fix',
      description: 'Test pour vérifier la correction RLS',
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
      console.log('❌ Erreur RLS avant correction:', insertError.message);
      
      if (insertError.message.includes('row-level security policy')) {
        console.log('💡 Problème RLS détecté - application de la correction...');
        
        // Note: Dans un environnement réel, vous devriez exécuter la migration SQL
        console.log('\n📋 Pour corriger les politiques RLS, exécutez cette migration SQL dans votre dashboard Supabase:');
        console.log('📁 Fichier: supabase/migrations/20241201000002_fix_rls_policies.sql');
        
        return false;
      }
    } else {
      console.log('✅ Insertion réussie - RLS fonctionne déjà');
      
      // Nettoyer les données de test
      await supabase
        .from('spaces_content')
        .delete()
        .eq('space_key', 'test-rls-fix');
    }

    console.log('\n🎉 Vérification terminée !');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    return false;
  }
}

// Exécuter la vérification
fixRLSPolicies()
  .then(success => {
    if (success) {
      console.log('\n✅ Les politiques RLS sont correctement configurées');
      console.log('🚀 La sauvegarde silencieuse devrait fonctionner');
    } else {
      console.log('\n⚠️ Correction des politiques RLS nécessaire');
      console.log('💡 Exécutez la migration SQL dans votre dashboard Supabase');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
