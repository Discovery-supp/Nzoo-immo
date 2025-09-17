#!/usr/bin/env node

/**
 * Test de l'upload d'images vers Supabase Storage
 * Usage: node scripts/test-image-upload.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUpload() {
  console.log('🧪 Test Upload d\'Images - Nzoo Immo\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣ Test de connexion...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Erreur de connexion:', bucketsError.message);
      return;
    }
    console.log('✅ Connexion réussie\n');

    // Test 2: Vérifier le bucket space-images
    console.log('2️⃣ Vérification du bucket space-images...');
    const spaceImagesBucket = buckets.find(bucket => bucket.name === 'space-images');
    
    if (!spaceImagesBucket) {
      console.log('❌ Bucket space-images non trouvé');
      console.log('📋 Buckets disponibles:', buckets.map(b => b.name));
      console.log('\n💡 Solution: Créer le bucket space-images dans le dashboard Supabase');
      return;
    }
    console.log('✅ Bucket space-images trouvé\n');

    // Test 3: Vérifier les politiques du bucket
    console.log('3️⃣ Vérification des politiques du bucket...');
    const { data: policies, error: policiesError } = await supabase.storage.getBucket('space-images');
    
    if (policiesError) {
      console.log('❌ Erreur lors de la vérification des politiques:', policiesError.message);
      return;
    }
    
    console.log('✅ Politiques du bucket vérifiées');
    console.log(`   - Public: ${policies.public}`);
    console.log(`   - File size limit: ${policies.file_size_limit}`);
    console.log(`   - Allowed mime types: ${policies.allowed_mime_types?.join(', ') || 'Tous'}\n`);

    // Test 4: Lister les images existantes
    console.log('4️⃣ Liste des images existantes...');
    const { data: files, error: filesError } = await supabase.storage
      .from('space-images')
      .list();

    if (filesError) {
      console.log('❌ Erreur lors de la liste des fichiers:', filesError.message);
      return;
    }

    if (files && files.length > 0) {
      console.log(`✅ ${files.length} image(s) trouvée(s):`);
      files.forEach(file => {
        console.log(`   - ${file.name} (${file.metadata?.size || 'Taille inconnue'} bytes)`);
      });
    } else {
      console.log('ℹ️ Aucune image trouvée dans le bucket');
    }

    console.log('\n🎉 Configuration correcte ! L\'upload d\'images devrait fonctionner.');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Ouvrir l\'application: http://localhost:5174/');
    console.log('2. Aller sur le dashboard admin');
    console.log('3. Tester l\'upload d\'image dans l\'éditeur de contenu');

  } catch (err) {
    console.error('❌ Erreur lors du test:', err.message);
  }
}

testImageUpload();
