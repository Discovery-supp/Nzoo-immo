const { createClient } = require('@supabase/supabase-js');

console.log('🔍 DIAGNOSTIC - SYNCHRONISATION ESPACES');
console.log('=======================================\n');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simuler le service SpaceDatabaseService
class MockSpaceDatabaseService {
  static async loadFromDatabase(language) {
    try {
      console.log(`📊 Chargement des espaces depuis la base de données (${language})...`);
      
      const { data, error } = await supabase
        .from('spaces_content')
        .select('*')
        .eq('language', language)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erreur lors du chargement:', error.message);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Aucun espace trouvé en base de données');
        return null;
      }

      // Convertir les données de la base vers le format local
      const convertedData = data.reduce((acc, dbSpace) => {
        acc[dbSpace.space_key] = {
          title: dbSpace.title,
          description: dbSpace.description,
          features: dbSpace.features,
          dailyPrice: dbSpace.daily_price,
          monthlyPrice: dbSpace.monthly_price,
          yearlyPrice: dbSpace.yearly_price,
          hourlyPrice: dbSpace.hourly_price,
          maxOccupants: dbSpace.max_occupants,
          imageUrl: dbSpace.image_url,
          isAvailable: dbSpace.is_available !== false,
          lastModified: dbSpace.updated_at
        };
        return acc;
      }, {});

      console.log(`✅ ${Object.keys(convertedData).length} espaces chargés depuis la base de données`);
      return convertedData;

    } catch (error) {
      console.error('❌ Erreur inattendue lors du chargement:', error.message);
      return null;
    }
  }
}

// Simuler le service SpaceContentService (ancienne méthode)
class MockSpaceContentService {
  static async getSavedContent(language) {
    try {
      console.log(`📊 Chargement des espaces via SpaceContentService (${language})...`);
      
      // Simuler le chargement depuis la base de données
      const dbData = await MockSpaceDatabaseService.loadFromDatabase(language);
      if (dbData) {
        console.log('✅ Données chargées via SpaceContentService');
        return dbData;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement via SpaceContentService:', error.message);
      return null;
    }
  }

  static async mergeWithDefault(defaultData, language) {
    try {
      console.log(`🔄 Fusion avec les données par défaut (${language})...`);
      
      const savedData = await this.getSavedContent(language);
      
      if (!savedData) {
        console.log('ℹ️ Aucune donnée sauvegardée, utilisation des données par défaut');
        return defaultData;
      }

      // Fusionner les données sauvegardées avec les données par défaut
      const mergedData = { ...defaultData };
      
      Object.entries(savedData).forEach(([key, space]) => {
        mergedData[key] = {
          ...space,
          dailyPrice: space.dailyPrice || 0,
          monthlyPrice: space.monthlyPrice || 0,
          yearlyPrice: space.yearlyPrice || 0,
          hourlyPrice: space.hourlyPrice || 0,
          maxOccupants: space.maxOccupants || 1,
          features: space.features || [],
          isAvailable: space.isAvailable !== undefined ? space.isAvailable : true
        };
      });

      console.log(`✅ ${Object.keys(mergedData).length} espaces après fusion`);
      return mergedData;
    } catch (error) {
      console.error('❌ Erreur lors de la fusion:', error.message);
      return defaultData;
    }
  }
}

// Données par défaut (simulation)
const defaultSpaces = {
  coworking: {
    title: 'Espace de Coworking',
    description: 'Un espace de travail collaboratif moderne',
    features: ['Wi-Fi', 'Bureau', 'Chaise'],
    dailyPrice: 25,
    monthlyPrice: 450,
    yearlyPrice: 4800,
    hourlyPrice: 5,
    maxOccupants: 20,
    isAvailable: true
  },
  'bureau-prive': {
    title: 'Bureau Privé',
    description: 'Un bureau privé et confortable',
    features: ['Bureau privé', 'Wi-Fi dédié', 'Climatisation'],
    dailyPrice: 50,
    monthlyPrice: 900,
    yearlyPrice: 9600,
    hourlyPrice: 10,
    maxOccupants: 4,
    isAvailable: true
  },
  domiciliation: {
    title: 'Service de Domiciliation',
    description: 'Service complet de domiciliation commerciale',
    features: ['Adresse postale', 'Réception courrier', 'Gestion administrative'],
    dailyPrice: 0,
    monthlyPrice: 150,
    yearlyPrice: 1600,
    hourlyPrice: 0,
    maxOccupants: 1,
    isAvailable: true
  }
};

// Test de comparaison
async function testSynchronisation() {
  console.log('🧪 TEST DE SYNCHRONISATION DES ESPACES');
  console.log('=====================================\n');

  try {
    // Test 1: Chargement direct depuis la base de données (nouvelle méthode)
    console.log('📋 TEST 1: Chargement direct depuis la base de données');
    console.log('=====================================================');
    
    const dbSpaces = await MockSpaceDatabaseService.loadFromDatabase('fr');
    
    if (dbSpaces) {
      console.log('✅ Espaces en base de données:');
      Object.entries(dbSpaces).forEach(([key, space]) => {
        console.log(`   - ${key}: ${space.title} (${space.dailyPrice}$/jour)`);
      });
    } else {
      console.log('❌ Aucun espace trouvé en base de données');
    }

    // Test 2: Chargement via SpaceContentService (ancienne méthode)
    console.log('\n📋 TEST 2: Chargement via SpaceContentService (ancienne méthode)');
    console.log('================================================================');
    
    const mergedSpaces = await MockSpaceContentService.mergeWithDefault(defaultSpaces, 'fr');
    
    console.log('✅ Espaces après fusion avec données par défaut:');
    Object.entries(mergedSpaces).forEach(([key, space]) => {
      console.log(`   - ${key}: ${space.title} (${space.dailyPrice}$/jour)`);
    });

    // Test 3: Comparaison des résultats
    console.log('\n📋 TEST 3: Comparaison des résultats');
    console.log('====================================');
    
    if (dbSpaces && mergedSpaces) {
      const dbKeys = Object.keys(dbSpaces);
      const mergedKeys = Object.keys(mergedSpaces);
      
      console.log(`📊 Espaces en base de données: ${dbKeys.length}`);
      console.log(`📊 Espaces après fusion: ${mergedKeys.length}`);
      
      // Vérifier les différences
      const onlyInDb = dbKeys.filter(key => !mergedKeys.includes(key));
      const onlyInMerged = mergedKeys.filter(key => !dbKeys.includes(key));
      const common = dbKeys.filter(key => mergedKeys.includes(key));
      
      console.log(`📊 Espaces communs: ${common.length}`);
      console.log(`📊 Espaces uniquement en base: ${onlyInDb.length}`);
      console.log(`📊 Espaces uniquement après fusion: ${onlyInMerged.length}`);
      
      if (onlyInDb.length > 0) {
        console.log('⚠️ Espaces uniquement en base de données:', onlyInDb);
      }
      
      if (onlyInMerged.length > 0) {
        console.log('⚠️ Espaces uniquement après fusion:', onlyInMerged);
      }
      
      // Comparer les données communes
      if (common.length > 0) {
        console.log('\n📊 Comparaison des données communes:');
        common.forEach(key => {
          const dbSpace = dbSpaces[key];
          const mergedSpace = mergedSpaces[key];
          
          const titleMatch = dbSpace.title === mergedSpace.title;
          const priceMatch = dbSpace.dailyPrice === mergedSpace.dailyPrice;
          
          console.log(`   - ${key}:`);
          console.log(`     Titre: ${titleMatch ? '✅' : '❌'} (DB: "${dbSpace.title}" vs Merged: "${mergedSpace.title}")`);
          console.log(`     Prix: ${priceMatch ? '✅' : '❌'} (DB: ${dbSpace.dailyPrice}$ vs Merged: ${mergedSpace.dailyPrice}$)`);
        });
      }
    }

    // Test 4: Recommandations
    console.log('\n📋 TEST 4: Recommandations');
    console.log('==========================');
    
    if (dbSpaces && Object.keys(dbSpaces).length > 0) {
      console.log('✅ RECOMMANDATION: Utiliser le chargement direct depuis la base de données');
      console.log('   - Données pures sans mélange avec les données par défaut');
      console.log('   - Pas de doublons ou d\'incohérences');
      console.log('   - Synchronisation parfaite avec la page Espace');
    } else {
      console.log('⚠️ RECOMMANDATION: Configurer des espaces en base de données');
      console.log('   - Utiliser l\'Éditeur de contenu dans le Dashboard');
      console.log('   - Créer au moins un espace de test');
      console.log('   - Vérifier que les données sont sauvegardées');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de synchronisation:', error.message);
  }
}

// Test de la base de données
async function testDatabase() {
  console.log('\n🔍 TEST DE LA BASE DE DONNÉES');
  console.log('=============================\n');

  try {
    // Vérifier la table spaces_content
    const { data: spacesData, error: spacesError } = await supabase
      .from('spaces_content')
      .select('*')
      .eq('language', 'fr')
      .eq('is_active', true);

    if (spacesError) {
      console.error('❌ Erreur lors de la vérification de la table spaces_content:', spacesError.message);
      return;
    }

    console.log(`📊 Espaces en base de données: ${spacesData?.length || 0}`);
    
    if (spacesData && spacesData.length > 0) {
      console.log('✅ Détails des espaces:');
      spacesData.forEach(space => {
        console.log(`   - ${space.space_key}: ${space.title} (${space.daily_price}$/jour)`);
        console.log(`     Disponible: ${space.is_available ? 'Oui' : 'Non'}`);
        console.log(`     Dernière modification: ${space.updated_at}`);
      });
    } else {
      console.log('ℹ️ Aucun espace configuré en base de données');
      console.log('💡 Pour configurer des espaces:');
      console.log('   1. Aller dans Dashboard → Éditeur de contenu');
      console.log('   2. Créer ou modifier un espace');
      console.log('   3. Sauvegarder les modifications');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de la base de données:', error.message);
  }
}

// Exécution des tests
async function runTests() {
  await testDatabase();
  await testSynchronisation();
  
  console.log('\n📋 RÉSUMÉ DU DIAGNOSTIC');
  console.log('=======================');
  console.log('✅ Test de la base de données: Terminé');
  console.log('✅ Test de synchronisation: Terminé');
  console.log('✅ Comparaison des méthodes: Terminé');
  
  console.log('\n🎯 PROCHAINES ÉTAPES:');
  console.log('1. Vérifier que les espaces sont configurés en base de données');
  console.log('2. Tester la page Réservation avec le nouveau chargement');
  console.log('3. Confirmer que les données correspondent à la page Espace');
  console.log('4. Vérifier qu\'il n\'y a plus de doublons ou d\'incohérences');
}

runTests().catch(console.error);
