import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Test avec une vraie image...\n');

// Créer une vraie image JPEG de test
function createRealTestImage() {
  const testImagePath = path.join(__dirname, 'test-real.jpg');
  
  // Créer une image JPEG simple mais valide
  const jpegData = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, // SOI + APP0
    0x00, 0x10, // Length
    0x4A, 0x46, 0x49, 0x46, 0x00, // "JFIF\0"
    0x01, 0x01, // Version 1.1
    0x00, // Units: none
    0x00, 0x01, // Density: 1x1
    0x00, 0x01,
    0x00, 0x00, // No thumbnail
    0xFF, 0xC0, // SOF0
    0x00, 0x0B, // Length
    0x08, // Precision
    0x00, 0x01, // Height: 1
    0x00, 0x01, // Width: 1
    0x01, // Components: 1
    0x11, 0x00, // Component 1: Y, 1x1
    0xFF, 0xC4, // DHT
    0x00, 0x0B, // Length
    0x00, // Table class: DC
    0x00, // Table ID: 0
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Huffman table
    0xFF, 0xDA, // SOS
    0x00, 0x08, // Length
    0x01, // Components: 1
    0x01, 0x00, // Component 1: Y, table 0
    0x00, 0x3F, 0x00, // Spectral selection
    0xFF, 0xD9  // EOI
  ]);
  
  fs.writeFileSync(testImagePath, jpegData);
  console.log('✅ Vraie image JPEG créée:', testImagePath);
  return testImagePath;
}

// Test d'upload vers le serveur
async function testUpload(imagePath) {
  try {
    console.log('\n📤 Test d\'upload vers le serveur...');
    
    // Lire le fichier
    const fileBuffer = fs.readFileSync(imagePath);
    
    // Créer FormData manuellement
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="image"; filename="test-real.jpg"',
      'Content-Type: image/jpeg',
      '',
      fileBuffer.toString('binary'),
      `--${boundary}--`
    ].join('\r\n');
    
    // Upload vers le serveur
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(formData)
      },
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
    
    // Vérifier le format du fichier
    const fileBuffer = fs.readFileSync(expectedPath);
    const header = fileBuffer.slice(0, 4);
    
    if (header[0] === 0xFF && header[1] === 0xD8) {
      console.log('✅ Format JPEG valide détecté');
    } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
      console.log('✅ Format PNG valide détecté');
    } else {
      console.log('⚠️ Format de fichier non reconnu');
    }
    
    return true;
  } else {
    console.log('❌ Fichier non trouvé:', expectedPath);
    return false;
  }
}

// Test principal
async function main() {
  console.log('🚀 Test avec une vraie image...\n');
  
  // 1. Créer une vraie image de test
  const testImagePath = createRealTestImage();
  
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
  
  // 4. Nettoyer l'image de test
  try {
    fs.unlinkSync(testImagePath);
    console.log('\n🧹 Image de test supprimée');
  } catch (error) {
    console.log('\n⚠️ Impossible de supprimer l\'image de test');
  }
  
  console.log('\n🎉 Test terminé !');
  console.log('\n💡 Maintenant vous pouvez:');
  console.log('1. Aller sur http://localhost:5174');
  console.log('2. Dashboard Admin → Espaces → Ajouter un espace');
  console.log('3. Uploader une vraie image depuis votre ordinateur');
  console.log('4. Vérifier qu\'elle apparaît dans public/images/spaces/');
}

// Exécuter le test
main().catch(console.error);


