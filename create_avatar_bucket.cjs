const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - utiliser les mêmes valeurs que dans l'application
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 Création automatique du bucket user-avatars - Nzoo Immo');
console.log('==================================================');

async function createAvatarBucket() {
  try {
    console.log('📋 1. Vérification des buckets existants...');
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Erreur lors de la récupération des buckets:', bucketsError);
      console.log('💡 Tentative de création directe...');
    } else {
      console.log('📦 Buckets existants:', buckets?.map(b => b.name) || []);
      
      const userAvatarsBucket = buckets?.find(b => b.name === 'user-avatars');
      
      if (userAvatarsBucket) {
        console.log('✅ Le bucket "user-avatars" existe déjà !');
        return;
      }
    }

    console.log('📋 2. Tentative de création du bucket via API...');
    
    // Tentative de création via l'API REST directe
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        id: 'user-avatars',
        name: 'user-avatars',
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      })
    });

    if (response.ok) {
      console.log('✅ Bucket créé avec succès via API !');
    } else {
      const errorData = await response.text();
      console.log('⚠️ Impossible de créer via API:', errorData);
      console.log('📋 3. Instructions manuelles détaillées...');
      
      console.log('\n🔧 CRÉATION MANUELLE REQUISE');
      console.log('============================');
      console.log('');
      console.log('1️⃣ Ouvrez votre navigateur et allez sur :');
      console.log('   https://supabase.com/dashboard');
      console.log('');
      console.log('2️⃣ Sélectionnez votre projet Nzoo Immo');
      console.log('');
      console.log('3️⃣ Dans le menu de gauche, cliquez sur "Storage"');
      console.log('');
      console.log('4️⃣ Cliquez sur le bouton "New bucket" (généralement en haut à droite)');
      console.log('');
      console.log('5️⃣ Remplissez le formulaire :');
      console.log('   - Name: user-avatars');
      console.log('   - ✅ Public bucket (COCHER cette case)');
      console.log('   - File size limit: 5MB (optionnel)');
      console.log('   - Allowed MIME types: image/* (optionnel)');
      console.log('');
      console.log('6️⃣ Cliquez sur "Create bucket"');
      console.log('');
      console.log('7️⃣ Une fois créé, cliquez sur "user-avatars" puis "Policies"');
      console.log('');
      console.log('8️⃣ Ajoutez ces 2 politiques :');
      console.log('');
      console.log('   📤 Politique d\'upload :');
      console.log('   - Policy name: Allow authenticated uploads');
      console.log('   - Allowed operation: INSERT');
      console.log('   - Target roles: authenticated');
      console.log('   - Using expression: true');
      console.log('');
      console.log('   📖 Politique de lecture :');
      console.log('   - Policy name: Allow public reads');
      console.log('   - Allowed operation: SELECT');
      console.log('   - Target roles: public');
      console.log('   - Using expression: true');
      console.log('');
      console.log('9️⃣ Après avoir créé le bucket et les politiques,');
      console.log('   relancez ce script pour vérifier :');
      console.log('   node create_avatar_bucket.cjs');
      return;
    }

    console.log('📋 3. Vérification de la création...');
    
    // Vérifier que le bucket a été créé
    const { data: newBuckets, error: newBucketsError } = await supabase.storage.listBuckets();
    
    if (newBucketsError) {
      console.error('❌ Erreur lors de la vérification:', newBucketsError);
      return;
    }

    const createdBucket = newBuckets?.find(b => b.name === 'user-avatars');
    
    if (createdBucket) {
      console.log('✅ Bucket "user-avatars" créé et vérifié !');
      console.log('📋 4. Test d\'upload...');
      
      // Test d'upload
      const testFileName = `test_${Date.now()}.txt`;
      const testContent = 'Test file for bucket creation';
      const testBlob = new Blob([testContent], { type: 'text/plain' });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(`test/${testFileName}`, testBlob);

      if (uploadError) {
        console.log('⚠️ Upload échoué - Politiques RLS nécessaires');
        console.log('💡 Veuillez configurer les politiques RLS manuellement');
        console.log('   (voir instructions ci-dessus)');
      } else {
        console.log('✅ Test d\'upload réussi !');
        
        // Nettoyer le fichier de test
        await supabase.storage
          .from('user-avatars')
          .remove([`test/${testFileName}`]);
        
        console.log('✅ Fichier de test supprimé');
      }

      console.log('\n🎉 Bucket créé avec succès !');
      console.log('✅ L\'upload d\'avatar devrait maintenant fonctionner');
      console.log('💡 N\'oubliez pas de configurer les politiques RLS si nécessaire');

    } else {
      console.log('❌ Le bucket n\'a pas été créé correctement');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
    console.log('\n💡 Utilisez les instructions manuelles ci-dessus');
  }
}

// Exécuter la création
createAvatarBucket();
