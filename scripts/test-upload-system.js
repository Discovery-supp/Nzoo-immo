import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Test du système d\'upload d\'images...\n');

// Test 1: Vérifier la structure des dossiers
console.log('1. Vérification de la structure des dossiers...');
const publicImagesDir = path.join(__dirname, '..', 'public', 'images', 'spaces');

if (fs.existsSync(publicImagesDir)) {
  console.log('✅ Dossier public/images/spaces/ existe');
  
  const files = fs.readdirSync(publicImagesDir);
  console.log(`📁 ${files.length} fichier(s) dans le dossier`);
  
  if (files.length > 0) {
    files.forEach(file => {
      console.log(`   - ${file}`);
    });
  }
} else {
  console.log('❌ Dossier public/images/spaces/ manquant');
  console.log('💡 Exécutez: npm run setup:images');
}

// Test 2: Vérifier le serveur d'upload
console.log('\n2. Vérification du serveur d\'upload...');
try {
  const response = await fetch('http://localhost:3001');
  if (response.ok) {
    const data = await response.json();
    console.log('✅ Serveur d\'upload actif');
    console.log(`📡 Message: ${data.message}`);
  } else {
    console.log('❌ Serveur d\'upload non accessible');
    console.log('💡 Démarrez le serveur: npm run upload:server');
  }
} catch (error) {
  console.log('❌ Serveur d\'upload non accessible');
  console.log('💡 Démarrez le serveur: npm run upload:server');
  console.log(`🔍 Erreur: ${error.message}`);
}

// Test 3: Vérifier les dépendances
console.log('\n3. Vérification des dépendances...');
const serverPackageJson = path.join(__dirname, '..', 'server', 'package.json');
if (fs.existsSync(serverPackageJson)) {
  console.log('✅ package.json du serveur existe');
  
  const packageData = JSON.parse(fs.readFileSync(serverPackageJson, 'utf8'));
  console.log(`📦 Dépendances: ${Object.keys(packageData.dependencies || {}).length}`);
} else {
  console.log('❌ package.json du serveur manquant');
}

// Test 4: Vérifier les fichiers de service
console.log('\n4. Vérification des services...');
const services = [
  '../src/services/imageUploadService.ts',
  '../src/components/ImageUpload.tsx',
  '../src/utils/imageUtils.ts'
];

services.forEach(service => {
  const servicePath = path.join(__dirname, service);
  if (fs.existsSync(servicePath)) {
    console.log(`✅ ${service} existe`);
  } else {
    console.log(`❌ ${service} manquant`);
  }
});

// Résumé
console.log('\n📋 Résumé:');
console.log('Pour utiliser le système d\'upload:');
console.log('1. npm run setup:images (si pas déjà fait)');
console.log('2. npm run upload:server (dans un terminal)');
console.log('3. npm run dev (dans un autre terminal)');
console.log('4. Aller dans Dashboard Admin → Espaces → Ajouter un espace');
console.log('5. Uploader une image et vérifier qu\'elle apparaît dans public/images/spaces/');

console.log('\n�� Test terminé !');


