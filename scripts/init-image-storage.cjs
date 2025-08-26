#!/usr/bin/env node

/**
 * Initialisation du stockage d'images Supabase
 * Usage: node scripts/init-image-storage.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initImageStorage() {
  console.log('🚀 Initialisation du Stockage d\'Images - Nzoo Immo\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('1️⃣ Test de connexion...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('❌ Erreur de connexion:', bucketsError.message);
      return;
    }
    console.log('✅ Connexion réussie\n');

    // Test 2: Vérifier si le bucket space-images existe
    console.log('2️⃣ Vérification du bucket space-images...');
    const spaceImagesBucket = buckets.find(bucket => bucket.name === 'space-images');
    
    if (spaceImagesBucket) {
      console.log('✅ Bucket space-images existe déjà');
    } else {
      console.log('📦 Création du bucket space-images...');
      
      // Créer le bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('space-images', {
        public: true,
        file_size_limit: 5242880, // 5MB
        allowed_mime_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (createError) {
        console.log('❌ Erreur lors de la création du bucket:', createError.message);
        console.log('\n💡 Solution manuelle:');
        console.log('1. Aller sur https://supabase.com/dashboard');
        console.log('2. Sélectionner votre projet');
        console.log('3. Aller sur Storage > Buckets');
        console.log('4. Créer un bucket nommé "space-images"');
        console.log('5. Le rendre public');
        return;
      }

      console.log('✅ Bucket space-images créé avec succès');
    }

    // Test 3: Vérifier les politiques du bucket
    console.log('\n3️⃣ Vérification des politiques du bucket...');
    const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('space-images');
    
    if (bucketError) {
      console.log('❌ Erreur lors de la vérification du bucket:', bucketError.message);
      return;
    }
    
    console.log('✅ Politiques du bucket vérifiées');
    console.log(`   - Public: ${bucketInfo.public}`);
    console.log(`   - File size limit: ${bucketInfo.file_size_limit} bytes (${Math.round(bucketInfo.file_size_limit / 1024 / 1024)}MB)`);
    console.log(`   - Allowed mime types: ${bucketInfo.allowed_mime_types?.join(', ') || 'Tous'}`);

    // Test 4: Créer une politique RLS pour permettre l'upload
    console.log('\n4️⃣ Configuration des politiques RLS...');
    console.log('ℹ️ Les politiques RLS doivent être configurées manuellement dans le dashboard Supabase');
    console.log('\n💡 Politiques recommandées:');
    console.log('1. Aller sur Storage > Policies');
    console.log('2. Pour le bucket space-images, créer ces politiques:');
    console.log('   - SELECT: true (pour permettre la lecture publique)');
    console.log('   - INSERT: true (pour permettre l\'upload)');
    console.log('   - UPDATE: true (pour permettre la modification)');
    console.log('   - DELETE: true (pour permettre la suppression)');

    console.log('\n🎉 Initialisation terminée avec succès !');
    console.log('\n💡 Prochaines étapes:');
    console.log('1. Configurer les politiques RLS dans le dashboard Supabase');
    console.log('2. Tester l\'upload d\'images dans l\'application');

  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation:', err.message);
  }
}

initImageStorage();
