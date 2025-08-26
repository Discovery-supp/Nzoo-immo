const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - utiliser les mêmes valeurs que dans l'application
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Diagnostic du système d\'upload d\'avatar - Nzoo Immo');
console.log('==================================================');

async function diagnoseAvatarUpload() {
  try {
    console.log('📋 1. Vérification de la connexion Supabase...');
    
    // Test de connexion basique
    const { data: testData, error: testError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur de connexion Supabase:', testError);
      return;
    }

    console.log('✅ Connexion Supabase OK');

    console.log('📋 2. Vérification des buckets de storage...');
    
    // Lister les buckets existants
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError);
      console.log('💡 Solution: Vérifiez les permissions de storage dans Supabase');
      return;
    }

    console.log('📦 Buckets existants:', buckets?.map(b => b.name) || []);
    
    const userAvatarsBucket = buckets?.find(b => b.name === 'user-avatars');
    
    if (!userAvatarsBucket) {
      console.log('⚠️ Le bucket "user-avatars" n\'existe pas');
      console.log('💡 Solution: Créez le bucket "user-avatars" dans Supabase Storage');
      console.log('   - Allez dans l\'onglet "Storage" de Supabase');
      console.log('   - Cliquez sur "New bucket"');
      console.log('   - Nom: user-avatars');
      console.log('   - Public bucket: ✓ (pour permettre l\'accès public aux avatars)');
      return;
    }

    console.log('✅ Bucket "user-avatars" trouvé');

    console.log('📋 3. Vérification des permissions du bucket...');
    
    // Tester l'upload d'un fichier de test
    const testFileName = `test_${Date.now()}.txt`;
    const testContent = 'Test file for avatar upload diagnostic';
    const testBlob = new Blob([testContent], { type: 'text/plain' });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(`test/${testFileName}`, testBlob);

    if (uploadError) {
      console.error('❌ Erreur lors du test d\'upload:', uploadError);
      console.log('💡 Solutions possibles:');
      console.log('   - Vérifiez que le bucket est public');
      console.log('   - Vérifiez les politiques RLS du bucket');
      console.log('   - Vérifiez les permissions de l\'API key');
      return;
    }

    console.log('✅ Test d\'upload réussi');

    // Nettoyer le fichier de test
    const { error: deleteError } = await supabase.storage
      .from('user-avatars')
      .remove([`test/${testFileName}`]);

    if (deleteError) {
      console.log('⚠️ Impossible de supprimer le fichier de test:', deleteError);
    } else {
      console.log('✅ Fichier de test supprimé');
    }

    console.log('📋 4. Vérification de la colonne avatar_url...');
    
    // Vérifier que la colonne avatar_url existe
    const { data: testUser, error: userError } = await supabase
      .from('admin_users')
      .select('avatar_url')
      .limit(1);

    if (userError) {
      console.error('❌ Erreur lors de la vérification de la colonne avatar_url:', userError);
      console.log('💡 Solution: Exécutez la migration pour ajouter la colonne avatar_url');
      return;
    }

    console.log('✅ Colonne avatar_url disponible');

    console.log('\n🎉 Diagnostic terminé avec succès !');
    console.log('✅ Tous les composants nécessaires sont en place');
    console.log('✅ L\'upload d\'avatar devrait fonctionner correctement');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

// Exécuter le diagnostic
diagnoseAvatarUpload();
