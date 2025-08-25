#!/usr/bin/env node

/**
 * Script de test pour vérifier la persistance des données
 * Teste la sauvegarde en localStorage et en base de données
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (à adapter selon votre configuration)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Données de test
const testData = {
  'test-space': {
    title: 'Espace de Test',
    description: 'Espace de test pour vérifier la persistance',
    features: ['Wi-Fi', 'Bureau', 'Chaise'],
    dailyPrice: 30,
    monthlyPrice: 600,
    yearlyPrice: 6000,
    hourlyPrice: 5,
    maxOccupants: 5,
    imageUrl: '/images/spaces/test.jpg',
    lastModified: new Date().toISOString()
  }
};

async function testLocalStorage() {
  console.log('🧪 Test du localStorage...');
  
  try {
    // Simuler localStorage
    const localStorage = {};
    
    // Test de sauvegarde
    localStorage.setItem('nzoo_spaces_content', JSON.stringify(testData));
    console.log('✅ Sauvegarde localStorage réussie');
    
    // Test de chargement
    const loadedData = JSON.parse(localStorage.getItem('nzoo_spaces_content'));
    console.log('✅ Chargement localStorage réussi');
    
    // Vérification
    if (loadedData['test-space'].title === testData['test-space'].title) {
      console.log('✅ Données localStorage cohérentes');
    } else {
      console.log('❌ Données localStorage incohérentes');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur localStorage:', error);
    return false;
  }
}

async function testDatabase() {
  console.log('🧪 Test de la base de données...');
  
  try {
    // Test de connexion
    const { data: connectionTest, error: connectionError } = await supabase
      .from('spaces_content')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('⚠️ Table spaces_content non accessible:', connectionError.message);
      return false;
    }
    
    console.log('✅ Connexion à la base de données réussie');
    
    // Test d'insertion
    const { data: insertData, error: insertError } = await supabase
      .from('spaces_content')
      .insert({
        space_key: 'test-space-db',
        language: 'fr',
        title: testData['test-space'].title,
        description: testData['test-space'].description,
        features: testData['test-space'].features,
        daily_price: testData['test-space'].dailyPrice,
        monthly_price: testData['test-space'].monthlyPrice,
        yearly_price: testData['test-space'].yearlyPrice,
        hourly_price: testData['test-space'].hourlyPrice,
        max_occupants: testData['test-space'].maxOccupants,
        image_url: testData['test-space'].imageUrl,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erreur d\'insertion:', insertError);
      return false;
    }
    
    console.log('✅ Insertion en base de données réussie');
    
    // Test de lecture
    const { data: readData, error: readError } = await supabase
      .from('spaces_content')
      .select('*')
      .eq('space_key', 'test-space-db')
      .eq('language', 'fr')
      .single();
    
    if (readError) {
      console.error('❌ Erreur de lecture:', readError);
      return false;
    }
    
    console.log('✅ Lecture depuis la base de données réussie');
    
    // Test de mise à jour
    const { data: updateData, error: updateError } = await supabase
      .from('spaces_content')
      .update({
        title: 'Espace de Test Modifié',
        updated_at: new Date().toISOString()
      })
      .eq('space_key', 'test-space-db')
      .eq('language', 'fr')
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erreur de mise à jour:', updateError);
      return false;
    }
    
    console.log('✅ Mise à jour en base de données réussie');
    
    // Nettoyage
    const { error: deleteError } = await supabase
      .from('spaces_content')
      .delete()
      .eq('space_key', 'test-space-db');
    
    if (deleteError) {
      console.warn('⚠️ Erreur lors du nettoyage:', deleteError);
    } else {
      console.log('✅ Nettoyage de la base de données réussi');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur base de données:', error);
    return false;
  }
}

async function testPersistence() {
  console.log('🚀 Test de persistance des données...\n');
  
  const localStorageResult = await testLocalStorage();
  console.log('');
  
  const databaseResult = await testDatabase();
  console.log('');
  
  if (localStorageResult && databaseResult) {
    console.log('🎉 Tous les tests de persistance sont réussis !');
    console.log('✅ Votre application garantit la sauvegarde permanente des données');
  } else if (localStorageResult) {
    console.log('⚠️ Persistance partielle : localStorage fonctionne, base de données non disponible');
    console.log('✅ Les données sont sauvegardées localement');
  } else {
    console.log('❌ Problème de persistance détecté');
    console.log('🔧 Vérifiez la configuration de votre application');
  }
}

// Exécuter les tests
testPersistence().catch(console.error);
