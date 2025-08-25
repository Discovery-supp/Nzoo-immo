import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Test d\'upload réel d\'image...\n');

// Créer une image de test simple
function createTestImage() {
  const testImagePath = path.join(__dirname, 'test-image.png');
  
  // Créer une image PNG simple (1x1 pixel transparent)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(testImagePath, pngData);
  console.log('✅ Image de test créée:', testImagePath);
  return testImagePath;
}

// Test d'upload vers le serveur
async function testUpload(imagePath) {
  try {
    console.log('\n📤 Test d\'upload vers le serveur...');
    
    // Créer FormData
    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    
    // Upload vers le serveur
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erreur lors de l\'upload:', response.status, errorText);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ Upload réussi !');
    console.log('📁 Fichier:', result.fileName);
    console.log('🖼️ Chemin:', result.filePath);
    console.log('📏 Taille:', result.size, 'bytes');
    
    return result;
    
  } catch (error) {
    console.log('❌ Erreur de connexion:', error.message);
    return false;
  }
}

// Vérifier que le fichier a été créé
function verifyFileCreated(fileName) {
  const expectedPath = path.join(__dirname, '..', 'public', 'images', 'spaces', fileName);
  
  if (fs.existsSync(expectedPath)) {
    const stats = fs.statSync(expectedPath);
    console.log('✅ Fichier créé avec succès !');
    console.log('📁 Chemin:', expectedPath);
    console.log('📏 Taille:', stats.size, 'bytes');
    return true;
  } else {
    console.log('❌ Fichier non trouvé:', expectedPath);
    return false;
  }
}

// Test de l'API de liste
async function testListImages() {
  try {
    console.log('\n📋 Test de la liste des images...');
    
    const response = await fetch('http://localhost:3001/images');
    const result = await response.json();
    
    console.log(`✅ ${result.images.length} image(s) trouvée(s)`);
    result.images.forEach(img => {
      console.log(`   - ${img.name} (${img.size} bytes)`);
    });
    
    return result.images.length > 0;
    
  } catch (error) {
    console.log('❌ Erreur lors de la liste:', error.message);
    return false;
  }
}

// Test principal
async function main() {
  console.log('🚀 Démarrage du test d\'upload réel...\n');
  
  // 1. Créer une image de test
  const testImagePath = createTestImage();
  
  // 2. Tester l'upload
  const uploadResult = await testUpload(testImagePath);
  if (!uploadResult) {
    console.log('\n❌ Test d\'upload échoué');
    return;
  }
  
  // 3. Vérifier que le fichier a été créé
  const fileCreated = verifyFileCreated(uploadResult.fileName);
  if (!fileCreated) {
    console.log('\n❌ Fichier non créé localement');
    return;
  }
  
  // 4. Tester la liste des images
  const listSuccess = await testListImages();
  
  // 5. Nettoyer l'image de test
  try {
    fs.unlinkSync(testImagePath);
    console.log('\n🧹 Image de test supprimée');
  } catch (error) {
    console.log('\n⚠️ Impossible de supprimer l\'image de test');
  }
  
  // Résumé
  console.log('\n📊 Résumé du test:');
  console.log('✅ Upload vers serveur:', uploadResult ? 'SUCCÈS' : 'ÉCHEC');
  console.log('✅ Création fichier local:', fileCreated ? 'SUCCÈS' : 'ÉCHEC');
  console.log('✅ Liste des images:', listSuccess ? 'SUCCÈS' : 'ÉCHEC');
  
  if (uploadResult && fileCreated && listSuccess) {
    console.log('\n🎉 Tous les tests sont passés ! Le système fonctionne parfaitement.');
    console.log('\n💡 Vous pouvez maintenant:');
    console.log('1. Aller sur http://localhost:5173');
    console.log('2. Dashboard Admin → Espaces → Ajouter un espace');
    console.log('3. Uploader une vraie image');
    console.log('4. Vérifier qu\'elle apparaît dans public/images/spaces/');
  } else {
    console.log('\n❌ Certains tests ont échoué. Vérifiez la configuration.');
  }
}

// Exécuter le test
main().catch(console.error);


