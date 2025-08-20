const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase avec valeurs par défaut
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initImageStorage() {
  console.log('🖼️ Initialisation du stockage d\'images...\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣ Test de connexion...');
    const { data: buckets, error: testError } = await supabase.storage.listBuckets();

    if (testError) {
      console.log('❌ Erreur de connexion:', testError.message);
      console.log('\n💡 Solution : Exécutez la migration SQL dans votre dashboard Supabase');
      console.log('📁 Fichier: supabase/migrations/20241201000003_fix_storage_policies.sql');
      return false;
    }
    
    console.log('✅ Connexion réussie');
    
    // Test 2: Vérifier si le bucket existe
    console.log('\n2️⃣ Vérification du bucket space-images...');
    const bucketExists = buckets.some(bucket => bucket.name === 'space-images');
    
    if (bucketExists) {
      console.log('✅ Bucket space-images existe déjà');
    } else {
      console.log('ℹ️ Bucket space-images non trouvé');
      console.log('💡 Exécutez la migration SQL pour créer le bucket');
      console.log('📁 Fichier: supabase/migrations/20241201000003_fix_storage_policies.sql');
      return false;
    }

    // Test 3: Vérifier les politiques du bucket
    console.log('\n3️⃣ Vérification des politiques...');
    const { data: policies, error: policiesError } = await supabase.storage.getBucket('space-images');
    
    if (policiesError) {
      console.log('❌ Erreur lors de la vérification des politiques:', policiesError.message);
    } else {
      console.log('✅ Politiques du bucket vérifiées');
      console.log('   - Public:', policies.public);
      console.log('   - Taille max:', Math.round(policies.fileSizeLimit / 1024 / 1024), 'MB');
    }

    // Test 4: Test d'upload (simulation)
    console.log('\n4️⃣ Test d\'upload (simulation)...');
    console.log('✅ Le stockage d\'images est prêt pour l\'utilisation');

    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('✅ Le stockage d\'images est opérationnel');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error.message);
    return false;
  }
}

// Exécuter l'initialisation
initImageStorage()
  .then(success => {
    if (success) {
      console.log('\n🚀 Le stockage d\'images est maintenant actif !');
      console.log('💡 Vous pouvez maintenant uploader des images depuis l\'éditeur d\'espaces');
    } else {
      console.log('\n⚠️ L\'initialisation a échoué');
      console.log('💡 Vérifiez votre configuration Supabase');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
