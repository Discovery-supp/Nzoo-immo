const { createClient } = require('@supabase/supabase-js');

console.log('🧹 NETTOYAGE DES ESPACES - CORRECTION DES DOUBLONS');
console.log('==================================================\n');

// Configuration Supabase
const supabaseUrl = 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuration des espaces corrects
const espacesCorrects = {
  'coworking': {
    title: 'Espace Coworking',
    description: 'Un espace de travail collaboratif moderne avec toutes les commodités nécessaires pour votre productivité.',
    features: [
      'Wi-Fi haute vitesse',
      'Bureau ergonomique',
      'Chaise confortable',
      'Éclairage naturel',
      'Salle de réunion',
      'Café et thé gratuits',
      'Imprimante/scanner',
      'Casiers sécurisés'
    ],
    daily_price: 25,
    monthly_price: 450,
    yearly_price: 4800,
    hourly_price: 5,
    max_occupants: 20,
    image_url: '/images/spaces/coworking.jpg',
    is_available: true
  },
  'bureau-prive': {
    title: 'Bureau Privé',
    description: 'Un bureau privé et confortable pour votre équipe ou votre activité professionnelle.',
    features: [
      'Bureau privé fermé',
      'Wi-Fi dédié',
      'Mobilier de qualité',
      'Climatisation',
      'Sécurité 24/7',
      'Réception téléphonique',
      'Adresse postale',
      'Parking privé'
    ],
    daily_price: 50,
    monthly_price: 900,
    yearly_price: 9600,
    hourly_price: 10,
    max_occupants: 4,
    image_url: '/images/spaces/bureau_prive.jpg',
    is_available: true
  },
  'domiciliation': {
    title: 'Service de Domiciliation',
    description: 'Service complet de domiciliation commerciale avec gestion administrative.',
    features: [
      'Adresse postale professionnelle',
      'Réception et gestion du courrier',
      'Numéro de téléphone dédié',
      'Gestion administrative',
      'Support juridique',
      'Sécurité des données',
      'Accès aux bureaux',
      'Services personnalisés'
    ],
    daily_price: 0,
    monthly_price: 150,
    yearly_price: 1600,
    hourly_price: 0,
    max_occupants: 1,
    image_url: '/images/spaces/domiciliation.jpg',
    is_available: true
  }
};

// Analyser les espaces existants
async function analyserEspaces() {
  console.log('🔍 ANALYSE DES ESPACES EXISTANTS');
  console.log('================================\n');

  try {
    const { data: espaces, error } = await supabase
      .from('spaces_content')
      .select('*')
      .eq('language', 'fr')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Erreur lors de la récupération des espaces:', error.message);
      return;
    }

    console.log(`📊 ${espaces.length} espaces trouvés en base de données:\n`);

    // Grouper par clé d'espace
    const groupes = {};
    espaces.forEach(espace => {
      const key = espace.space_key.trim();
      if (!groupes[key]) {
        groupes[key] = [];
      }
      groupes[key].push(espace);
    });

    // Analyser chaque groupe
    Object.entries(groupes).forEach(([key, espacesGroupe]) => {
      console.log(`📋 Clé: "${key}" (${espacesGroupe.length} entrée(s))`);
      
      espacesGroupe.forEach((espace, index) => {
        console.log(`   ${index + 1}. ID: ${espace.id}`);
        console.log(`      Titre: "${espace.title}"`);
        console.log(`      Prix: ${espace.daily_price}$/jour`);
        console.log(`      Disponible: ${espace.is_available ? 'Oui' : 'Non'}`);
        console.log(`      Modifié: ${espace.updated_at}`);
      });
      console.log('');
    });

    return groupes;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    return null;
  }
}

// Nettoyer les doublons
async function nettoyerDoublons(groupes) {
  console.log('🧹 NETTOYAGE DES DOUBLONS');
  console.log('=========================\n');

  try {
    for (const [key, espacesGroupe] of Object.entries(groupes)) {
      if (espacesGroupe.length > 1) {
        console.log(`🗑️ Suppression des doublons pour "${key}":`);
        
        // Garder le plus récent et supprimer les autres
        const espacesTries = espacesGroupe.sort((a, b) => 
          new Date(b.updated_at) - new Date(a.updated_at)
        );
        
        const aGarder = espacesTries[0];
        const aSupprimer = espacesTries.slice(1);
        
        console.log(`   ✅ Garder: ID ${aGarder.id} (${aGarder.updated_at})`);
        
        for (const espace of aSupprimer) {
          console.log(`   🗑️ Supprimer: ID ${espace.id}`);
          
          const { error } = await supabase
            .from('spaces_content')
            .delete()
            .eq('id', espace.id);
          
          if (error) {
            console.error(`      ❌ Erreur suppression ID ${espace.id}:`, error.message);
          } else {
            console.log(`      ✅ Supprimé avec succès`);
          }
        }
        console.log('');
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  }
}

// Corriger les données des espaces
async function corrigerDonnees() {
  console.log('🔧 CORRECTION DES DONNÉES');
  console.log('=========================\n');

  try {
    for (const [key, donneesCorrectes] of Object.entries(espacesCorrects)) {
      console.log(`🔧 Correction de l'espace "${key}":`);
      
      // Vérifier si l'espace existe
      const { data: espaceExistant, error: erreurRecherche } = await supabase
        .from('spaces_content')
        .select('*')
        .eq('space_key', key)
        .eq('language', 'fr')
        .eq('is_active', true)
        .single();

      if (erreurRecherche && erreurRecherche.code !== 'PGRST116') {
        console.error(`   ❌ Erreur lors de la recherche:`, erreurRecherche.message);
        continue;
      }

      if (espaceExistant) {
        // Mettre à jour l'espace existant
        console.log(`   📝 Mise à jour de l'espace existant (ID: ${espaceExistant.id})`);
        
        const { error: erreurUpdate } = await supabase
          .from('spaces_content')
          .update({
            title: donneesCorrectes.title,
            description: donneesCorrectes.description,
            features: donneesCorrectes.features,
            daily_price: donneesCorrectes.daily_price,
            monthly_price: donneesCorrectes.monthly_price,
            yearly_price: donneesCorrectes.yearly_price,
            hourly_price: donneesCorrectes.hourly_price,
            max_occupants: donneesCorrectes.max_occupants,
            image_url: donneesCorrectes.image_url,
            is_available: donneesCorrectes.is_available,
            updated_at: new Date().toISOString()
          })
          .eq('id', espaceExistant.id);

        if (erreurUpdate) {
          console.error(`   ❌ Erreur lors de la mise à jour:`, erreurUpdate.message);
        } else {
          console.log(`   ✅ Espace mis à jour avec succès`);
        }
      } else {
        // Créer un nouvel espace
        console.log(`   ➕ Création d'un nouvel espace`);
        
        const { error: erreurInsert } = await supabase
          .from('spaces_content')
          .insert({
            space_key: key,
            language: 'fr',
            title: donneesCorrectes.title,
            description: donneesCorrectes.description,
            features: donneesCorrectes.features,
            daily_price: donneesCorrectes.daily_price,
            monthly_price: donneesCorrectes.monthly_price,
            yearly_price: donneesCorrectes.yearly_price,
            hourly_price: donneesCorrectes.hourly_price,
            max_occupants: donneesCorrectes.max_occupants,
            image_url: donneesCorrectes.image_url,
            is_available: donneesCorrectes.is_available,
            is_active: true
          });

        if (erreurInsert) {
          console.error(`   ❌ Erreur lors de la création:`, erreurInsert.message);
        } else {
          console.log(`   ✅ Espace créé avec succès`);
        }
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
  }
}

// Vérifier le résultat
async function verifierResultat() {
  console.log('✅ VÉRIFICATION DU RÉSULTAT');
  console.log('============================\n');

  try {
    const { data: espaces, error } = await supabase
      .from('spaces_content')
      .select('*')
      .eq('language', 'fr')
      .eq('is_active', true)
      .order('space_key');

    if (error) {
      console.error('❌ Erreur lors de la vérification:', error.message);
      return;
    }

    console.log(`📊 ${espaces.length} espaces après nettoyage:\n`);

    espaces.forEach(espace => {
      console.log(`📋 ${espace.space_key}:`);
      console.log(`   Titre: "${espace.title}"`);
      console.log(`   Prix: ${espace.daily_price}$/jour`);
      console.log(`   Disponible: ${espace.is_available ? 'Oui' : 'Non'}`);
      console.log(`   Modifié: ${espace.updated_at}`);
      console.log('');
    });

    // Vérifier les clés attendues
    const clesAttendues = Object.keys(espacesCorrects);
    const clesTrouvees = espaces.map(e => e.space_key);
    
    console.log('🔍 Vérification des clés:');
    clesAttendues.forEach(cle => {
      if (clesTrouvees.includes(cle)) {
        console.log(`   ✅ "${cle}": Présent`);
      } else {
        console.log(`   ❌ "${cle}": Manquant`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

// Exécution principale
async function main() {
  console.log('🚀 DÉBUT DU NETTOYAGE DES ESPACES\n');
  
  // Étape 1: Analyser
  const groupes = await analyserEspaces();
  if (!groupes) {
    console.log('❌ Impossible de continuer sans analyse');
    return;
  }

  // Étape 2: Nettoyer les doublons
  await nettoyerDoublons(groupes);

  // Étape 3: Corriger les données
  await corrigerDonnees();

  // Étape 4: Vérifier le résultat
  await verifierResultat();

  console.log('🎉 NETTOYAGE TERMINÉ !');
  console.log('======================');
  console.log('✅ Doublons supprimés');
  console.log('✅ Données corrigées');
  console.log('✅ Espaces synchronisés');
  console.log('');
  console.log('💡 Prochaines étapes:');
  console.log('1. Tester la page Réservation');
  console.log('2. Vérifier que les données correspondent à la page Espace');
  console.log('3. Confirmer qu\'il n\'y a plus de doublons');
}

main().catch(console.error);
