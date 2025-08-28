import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script de configuration pour l'upload d'images
 * Crée les dossiers nécessaires et configure Supabase
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Configuration de l\'upload d\'images...');

// Créer le dossier public/images/spaces/
const publicImagesDir = path.join(__dirname, '..', 'public', 'images', 'spaces');

function createDirectories() {
  try {
    // Créer le dossier public s'il n'existe pas
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('✅ Dossier public créé');
    }

    // Créer le dossier images s'il n'existe pas
    const imagesDir = path.join(publicDir, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('✅ Dossier images créé');
    }

    // Créer le dossier spaces s'il n'existe pas
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
      console.log('✅ Dossier spaces créé');
    }

    console.log('📁 Structure des dossiers créée avec succès');
    console.log(`   ${publicImagesDir}`);

    // Créer un fichier .gitkeep pour maintenir le dossier dans git
    const gitkeepFile = path.join(publicImagesDir, '.gitkeep');
    if (!fs.existsSync(gitkeepFile)) {
      fs.writeFileSync(gitkeepFile, '# Ce fichier maintient le dossier dans git\n');
      console.log('✅ Fichier .gitkeep créé');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création des dossiers:', error);
    process.exit(1);
  }
}

function createReadme() {
  const readmeContent = `# Dossier des images d'espaces

Ce dossier contient les images uploadées pour les espaces.

## Structure
- Les images sont nommées avec un timestamp unique
- Format: \`space-{timestamp}-{randomId}.{extension}\`
- Extensions supportées: jpg, jpeg, png, gif, webp

## Exemple
\`\`\`
space-1703123456789-abc123.jpg
space-1703123456790-def456.png
\`\`\`

## Notes
- Les images sont automatiquement uploadées depuis le dashboard admin
- Les URLs sont accessibles via: \`/images/spaces/{filename}\`
- Taille maximum: 5MB par image
`;

  const readmeFile = path.join(publicImagesDir, 'README.md');
  if (!fs.existsSync(readmeFile)) {
    fs.writeFileSync(readmeFile, readmeContent);
    console.log('✅ Fichier README.md créé');
  }
}

function checkSupabaseConfig() {
  console.log('\n🔧 Configuration Supabase:');
  console.log('1. Assurez-vous que votre projet Supabase est configuré');
  console.log('2. Créez un bucket "space-images" dans Supabase Storage');
  console.log('3. Configurez les permissions du bucket comme public');
  console.log('4. Vérifiez que les variables d\'environnement sont définies:');
  console.log('   - VITE_SUPABASE_URL');
  console.log('   - VITE_SUPABASE_ANON_KEY');
}

function main() {
  console.log('📂 Création de la structure des dossiers...');
  createDirectories();
  
  console.log('\n📝 Création de la documentation...');
  createReadme();
  
  console.log('\n🔍 Vérification de la configuration...');
  checkSupabaseConfig();
  
  console.log('\n✅ Configuration terminée !');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Configurez votre bucket Supabase "space-images"');
  console.log('2. Testez l\'upload d\'images depuis le dashboard');
  console.log('3. Vérifiez que les images sont accessibles via /images/spaces/');
}

// Exécuter le script
main();
