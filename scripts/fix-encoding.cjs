#!/usr/bin/env node

/**
 * Script pour corriger les problèmes d'encodage des caractères spéciaux
 * Usage: node scripts/fix-encoding.cjs
 */

const fs = require('fs');
const path = require('path');

// Caractères spéciaux français et leurs équivalents corrects
const specialChars = {
  // Accents et caractères spéciaux mal encodés
  'Ã©': '\u00E9', // é
  'Ã¨': '\u00E8', // è
  'Ã ': '\u00E0', // à
  'Ã§': '\u00E7', // ç
  'Ã¹': '\u00F9', // ù
  'Ã¢': '\u00E2', // â
  'Ãª': '\u00EA', // ê
  'Ã®': '\u00EE', // î
  'Ã´': '\u00F4', // ô
  'Ã»': '\u00FB', // û
  'Ã«': '\u00EB', // ë
  'Ã¯': '\u00EF', // ï
  'Ã¼': '\u00FC', // ü
  'Å"': '\u0153', // œ
  'Ã¦': '\u00E6', // æ
  
  // Guillemets et ponctuation mal encodés
  'Â«': '\u00AB', // «
  'Â»': '\u00BB', // »
  'â€™': '\u2019', // '
  'â€œ': '\u201C', // "
  'â€': '\u201D', // "
  'â€¦': '\u2026', // …
  'â€"': '\u2013', // –
  'â€"': '\u2014', // —
  
  // Encodages HTML incorrects
  '&eacute;': '\u00E9', // é
  '&egrave;': '\u00E8', // è
  '&agrave;': '\u00E0', // à
  '&ccedil;': '\u00E7', // ç
  '&ugrave;': '\u00F9', // ù
  '&acirc;': '\u00E2', // â
  '&ecirc;': '\u00EA', // ê
  '&icirc;': '\u00EE', // î
  '&ocirc;': '\u00F4', // ô
  '&ucirc;': '\u00FB', // û
  '&euml;': '\u00EB', // ë
  '&iuml;': '\u00EF', // ï
  '&uuml;': '\u00FC', // ü
  '&oelig;': '\u0153', // œ
  '&aelig;': '\u00E6', // æ
  '&laquo;': '\u00AB', // «
  '&raquo;': '\u00BB', // »
  '&rsquo;': '\u2019', // '
  '&ldquo;': '\u201C', // "
  '&rdquo;': '\u201D', // "
  '&hellip;': '\u2026', // …
  '&ndash;': '\u2013', // –
  '&mdash;': '\u2014'  // —
};

// Extensions de fichiers à traiter
const extensions = ['.tsx', '.ts', '.jsx', '.js'];

// Fonction pour récursivement parcourir les dossiers
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath, callback);
    } else if (stat.isFile() && extensions.includes(path.extname(file))) {
      callback(filePath);
    }
  });
}

// Fonction pour corriger l'encodage d'un fichier
function fixFileEncoding(filePath) {
  try {
    console.log(`🔍 Vérification de: ${filePath}`);
    
    // Lire le fichier en UTF-8
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Appliquer les corrections
    Object.entries(specialChars).forEach(([incorrect, correct]) => {
      if (content.includes(incorrect)) {
        console.log(`  🔧 Correction: "${incorrect}" → "${correct}"`);
        content = content.replace(new RegExp(incorrect, 'g'), correct);
        hasChanges = true;
      }
    });
    
    // Vérifier les caractères spéciaux mal encodés avec des patterns regex
    const encodingIssues = [
      { pattern: /Ã©/g, description: 'é mal encodé' },
      { pattern: /Ã¨/g, description: 'è mal encodé' },
      { pattern: /Ã /g, description: 'à mal encodé' },
      { pattern: /Ã§/g, description: 'ç mal encodé' },
      { pattern: /Ã¹/g, description: 'ù mal encodé' },
      { pattern: /Ã¢/g, description: 'â mal encodé' },
      { pattern: /Ãª/g, description: 'ê mal encodé' },
      { pattern: /Ã®/g, description: 'î mal encodé' },
      { pattern: /Ã´/g, description: 'ô mal encodé' },
      { pattern: /Ã»/g, description: 'û mal encodé' },
      { pattern: /Ã«/g, description: 'ë mal encodé' },
      { pattern: /Ã¯/g, description: 'ï mal encodé' },
      { pattern: /Ã¼/g, description: 'ü mal encodé' },
      { pattern: /Å"/g, description: 'œ mal encodé' },
      { pattern: /Ã¦/g, description: 'æ mal encodé' },
      { pattern: /Â«/g, description: '« mal encodé' },
      { pattern: /Â»/g, description: '» mal encodé' },
      { pattern: /â€™/g, description: "' mal encodé" },
      { pattern: /â€œ/g, description: '" mal encodé' },
      { pattern: /â€/g, description: '" mal encodé' },
      { pattern: /â€¦/g, description: '… mal encodé' },
      { pattern: /â€"/g, description: '– mal encodé' },
      { pattern: /â€"/g, description: '— mal encodé' }
    ];
    
    encodingIssues.forEach(({ pattern, description }) => {
      if (pattern.test(content)) {
        console.log(`  ⚠️  ${description} détecté`);
        hasChanges = true;
      }
    });
    
    // Écrire le fichier corrigé si des changements ont été faits
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  ✅ Fichier corrigé: ${filePath}`);
      return true;
    } else {
      console.log(`  ✅ Aucun problème détecté: ${filePath}`);
      return false;
    }
    
  } catch (error) {
    console.error(`  ❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return false;
  }
}

// Fonction principale
function main() {
  console.log('🔧 Correction de l\'encodage des caractères spéciaux\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const publicDir = path.join(__dirname, '..', 'public');
  
  let totalFiles = 0;
  let fixedFiles = 0;
  
  // Traiter les fichiers dans src/
  if (fs.existsSync(srcDir)) {
    console.log('📁 Traitement du dossier src/...');
    walkDir(srcDir, (filePath) => {
      totalFiles++;
      if (fixFileEncoding(filePath)) {
        fixedFiles++;
      }
    });
  }
  
  // Traiter les fichiers dans public/
  if (fs.existsSync(publicDir)) {
    console.log('\n📁 Traitement du dossier public/...');
    walkDir(publicDir, (filePath) => {
      totalFiles++;
      if (fixFileEncoding(filePath)) {
        fixedFiles++;
      }
    });
  }
  
  // Résumé
  console.log('\n📊 Résumé:');
  console.log(`  📁 Fichiers traités: ${totalFiles}`);
  console.log(`  🔧 Fichiers corrigés: ${fixedFiles}`);
  console.log(`  ✅ Fichiers sans problème: ${totalFiles - fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log('\n🎉 Correction terminée ! Les caractères spéciaux devraient maintenant s\'afficher correctement.');
  } else {
    console.log('\n✅ Aucun problème d\'encodage détecté.');
  }
  
  console.log('\n💡 Conseils:');
  console.log('  - Assurez-vous que votre éditeur utilise l\'encodage UTF-8');
  console.log('  - Vérifiez que le fichier index.html a la bonne langue (lang="fr")');
  console.log('  - Redémarrez votre serveur de développement si nécessaire');
}

// Exécuter le script
main();
