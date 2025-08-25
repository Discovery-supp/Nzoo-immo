const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - utiliser les mêmes valeurs que dans l'application
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Configuration du storage pour les avatars - Nzoo Immo');
console.log('==================================================');

async function setupAvatarStorage() {
  try {
    console.log('📋 1. Vérification des buckets existants...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError);
      return;
    }

    console.log('📦 Buckets existants:', buckets?.map(b => b.name) || []);
    
    const userAvatarsBucket = buckets?.find(b => b.name === 'user-avatars');
    
    if (userAvatarsBucket) {
      console.log('✅ Le bucket "user-avatars" existe déjà');
    } else {
      console.log('📋 2. Création du bucket "user-avatars"...');
      
      // Note: La création de bucket via l'API publique n'est pas toujours autorisée
      // Il faut généralement le faire via l'interface Supabase
      console.log('⚠️ La création de bucket via l\'API n\'est pas autorisée');
      console.log('💡 Veuillez créer le bucket manuellement dans Supabase :');
      console.log('');
      console.log('   1. Allez dans votre projet Supabase');
      console.log('   2. Cliquez sur l\'onglet "Storage"');
      console.log('   3. Cliquez sur "New bucket"');
      console.log('   4. Nom du bucket: user-avatars');
      console.log('   5. Cochez "Public bucket" (pour permettre l\'accès public aux avatars)');
      console.log('   6. Cliquez sur "Create bucket"');
      console.log('');
      console.log('   Une fois le bucket créé, relancez ce script pour configurer les permissions.');
      return;
    }

    console.log('📋 3. Test de l\'upload vers le bucket...');
    
    // Tester l'upload d'un fichier de test
    const testFileName = `test_${Date.now()}.txt`;
    const testContent = 'Test file for avatar storage setup';
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
      console.log('');
      console.log('   Pour configurer les politiques RLS :');
      console.log('   1. Allez dans Storage > user-avatars > Policies');
      console.log('   2. Ajoutez une politique pour permettre l\'upload :');
      console.log('      - Policy name: "Allow authenticated uploads"');
      console.log('      - Allowed operation: INSERT');
      console.log('      - Target roles: authenticated');
      console.log('      - Using expression: true');
      console.log('   3. Ajoutez une politique pour permettre la lecture :');
      console.log('      - Policy name: "Allow public reads"');
      console.log('      - Allowed operation: SELECT');
      console.log('      - Target roles: public');
      console.log('      - Using expression: true');
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

    console.log('📋 4. Test de l\'obtention d\'URL publique...');
    
    // Tester l'obtention d'une URL publique
    const testUrl = supabase.storage
      .from('user-avatars')
      .getPublicUrl('test/example.jpg');

    console.log('✅ URL publique générée:', testUrl.data.publicUrl);

    console.log('\n🎉 Configuration du storage terminée avec succès !');
    console.log('✅ Le bucket "user-avatars" est configuré et fonctionnel');
    console.log('✅ L\'upload d\'avatar devrait maintenant fonctionner correctement');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  }
}

// Exécuter la configuration
setupAvatarStorage();
