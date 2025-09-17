#!/usr/bin/env node

/**
 * Test de debug de l'interface utilisateur
 * Identifie pourquoi les emails ne sont pas déclenchés depuis l'application
 */

const http = require('http');

// Test 1: Vérifier l'accessibilité de l'application
async function checkAppAccessibility() {
  console.log('🔍 Test 1: Vérification de l\'accessibilité de l\'application...');
  
  const testUrls = [
    'http://localhost:5174', // Port correct de votre application
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  for (const url of testUrls) {
    try {
      console.log(`📡 Test de ${url}...`);
      
      const response = await new Promise((resolve, reject) => {
        const req = http.get(url, { timeout: 5000 }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            resolve({ 
              url, 
              status: res.statusCode, 
              accessible: res.statusCode < 400,
              contentType: res.headers['content-type'],
              hasReact: data.includes('React') || data.includes('react'),
              hasReservation: data.includes('reservation') || data.includes('Reservation')
            });
          });
        });
        
        req.on('error', (error) => {
          resolve({ url, status: 'ERROR', accessible: false, error: error.message });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({ url, status: 'TIMEOUT', accessible: false, error: 'Timeout' });
        });
      });

      if (response.accessible) {
        console.log(`✅ ${url} - Accessible (${response.status})`);
        console.log(`   Content-Type: ${response.contentType}`);
        console.log(`   React détecté: ${response.hasReact ? '✅' : '❌'}`);
        console.log(`   Réservation détectée: ${response.hasReservation ? '✅' : '❌'}`);
        return url;
      } else {
        console.log(`❌ ${url} - Non accessible (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${url} - Erreur: ${error.message}`);
    }
  }

  return null;
}

// Test 2: Vérifier les fichiers critiques de l'interface
async function checkInterfaceFiles() {
  console.log('\n🔍 Test 2: Vérification des fichiers de l\'interface...');
  
  const fs = require('fs');
  const path = require('path');

  const interfaceFiles = [
    'src/pages/ReservationPage.tsx',
    'src/services/reservationService.ts',
    'src/services/emailService.ts',
    'src/services/supabaseClient.ts',
    'src/components/PaymentSelector.tsx',
    'src/types/index.ts'
  ];

  const missingFiles = [];
  const fileContents = {};

  for (const file of interfaceFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - Présent`);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        fileContents[file] = content;
        
        // Vérifications spécifiques
        if (file.includes('ReservationPage')) {
          const hasHandleReservation = content.includes('handleReservation');
          const hasCreateReservation = content.includes('createReservation');
          console.log(`   handleReservation: ${hasHandleReservation ? '✅' : '❌'}`);
          console.log(`   createReservation: ${hasCreateReservation ? '✅' : '❌'}`);
        }
        
        if (file.includes('reservationService')) {
          const hasSendReservationEmails = content.includes('sendReservationEmails');
          console.log(`   sendReservationEmails: ${hasSendReservationEmails ? '✅' : '❌'}`);
        }
        
        if (file.includes('emailService')) {
          const hasSendConfirmationEmail = content.includes('sendConfirmationEmail');
          const hasSupabaseFunctions = content.includes('supabase.functions.invoke');
          console.log(`   sendConfirmationEmail: ${hasSendConfirmationEmail ? '✅' : '❌'}`);
          console.log(`   supabase.functions.invoke: ${hasSupabaseFunctions ? '✅' : '❌'}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur lecture: ${error.message}`);
      }
    } else {
      console.log(`❌ ${file} - Manquant`);
      missingFiles.push(file);
    }
  }

  return { missingFiles, fileContents };
}

// Test 3: Vérifier la configuration Supabase côté client
async function checkClientSupabaseConfig() {
  console.log('\n🔍 Test 3: Vérification de la configuration Supabase côté client...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Chercher le fichier de configuration Supabase
    const supabaseFiles = [
      'src/services/supabaseClient.ts',
      'src/lib/supabase.ts',
      'src/config/supabase.ts',
      'src/utils/supabase.ts'
    ];
    
    let supabaseConfig = null;
    
    for (const file of supabaseFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - Trouvé`);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Vérifier la configuration
        const hasUrl = content.includes('nnkywmfxoohehtyyzzgp.supabase.co');
        const hasAnonKey = content.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        const hasCreateClient = content.includes('createClient');
        
        console.log(`   URL Supabase: ${hasUrl ? '✅' : '❌'}`);
        console.log(`   Clé anonyme: ${hasAnonKey ? '✅' : '❌'}`);
        console.log(`   createClient: ${hasCreateClient ? '✅' : '❌'}`);
        
        if (hasUrl && hasAnonKey && hasCreateClient) {
          supabaseConfig = { file, content };
          break;
        }
      }
    }
    
    if (!supabaseConfig) {
      console.log('❌ Configuration Supabase côté client non trouvée');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur configuration Supabase: ${error.message}`);
    return false;
  }
}

// Test 4: Vérifier les variables d'environnement côté client
async function checkClientEnvironment() {
  console.log('\n🔍 Test 4: Vérification des variables d\'environnement côté client...');
  
  const fs = require('fs');
  const path = require('path');

  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production'
  ];

  let envFound = false;
  let hasSupabaseVars = false;

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      console.log(`✅ ${envFile} - Présent`);
      envFound = true;
      
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        const supabaseVars = lines.filter(line => 
          line.includes('SUPABASE') || 
          line.includes('VITE_SUPABASE') ||
          line.includes('REACT_APP_SUPABASE')
        );
        
        console.log(`   ${lines.length} variables d'environnement trouvées`);
        console.log(`   Variables Supabase: ${supabaseVars.length}`);
        
        if (supabaseVars.length > 0) {
          hasSupabaseVars = true;
          supabaseVars.forEach(varLine => {
            const [key] = varLine.split('=');
            console.log(`   ✅ ${key}`);
          });
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur lecture: ${error.message}`);
      }
    } else {
      console.log(`❌ ${envFile} - Manquant`);
    }
  }

  if (!envFound) {
    console.log('⚠️ Aucun fichier .env trouvé');
  }

  return { envFound, hasSupabaseVars };
}

// Test 5: Vérifier la compilation et les erreurs
async function checkCompilation() {
  console.log('\n🔍 Test 5: Vérification de la compilation...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Vérifier les fichiers de build
    const buildFiles = [
      'dist',
      'build',
      'node_modules/.vite'
    ];
    
    for (const buildDir of buildFiles) {
      const buildPath = path.join(process.cwd(), buildDir);
      if (fs.existsSync(buildPath)) {
        console.log(`✅ ${buildDir} - Présent`);
        
        // Vérifier les fichiers dans le build
        const files = fs.readdirSync(buildPath);
        console.log(`   ${files.length} fichiers trouvés`);
        
        // Chercher des erreurs de compilation
        const errorFiles = files.filter(file => 
          file.includes('error') || 
          file.includes('Error') ||
          file.includes('.log')
        );
        
        if (errorFiles.length > 0) {
          console.log(`   ⚠️ Fichiers d'erreur trouvés: ${errorFiles.join(', ')}`);
        }
      } else {
        console.log(`❌ ${buildDir} - Manquant`);
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erreur vérification compilation: ${error.message}`);
    return false;
  }
}

// Test principal
async function testAppInterfaceDebug() {
  console.log('🔍 TEST DE DEBUG DE L\'INTERFACE UTILISATEUR');
  console.log('=============================================');
  
  const results = {
    accessibility: await checkAppAccessibility(),
    interfaceFiles: await checkInterfaceFiles(),
    clientSupabase: await checkClientSupabaseConfig(),
    clientEnvironment: await checkClientEnvironment(),
    compilation: await checkCompilation()
  };

  console.log('\n📊 RÉSULTATS DU DEBUG');
  console.log('======================');
  console.log(`🌐 Accessibilité: ${results.accessibility ? '✅' : '❌'}`);
  console.log(`📁 Fichiers interface: ${results.interfaceFiles.missingFiles.length === 0 ? '✅' : '❌'}`);
  console.log(`🔧 Supabase client: ${results.clientSupabase ? '✅' : '❌'}`);
  console.log(`⚙️ Variables client: ${results.clientEnvironment.envFound ? '✅' : '❌'}`);
  console.log(`🔨 Compilation: ${results.compilation ? '✅' : '❌'}`);

  const allTestsPassed = results.accessibility && 
                        results.interfaceFiles.missingFiles.length === 0 &&
                        results.clientSupabase &&
                        results.clientEnvironment.envFound &&
                        results.compilation;

  if (allTestsPassed) {
    console.log('\n🎉 INTERFACE CORRECTEMENT CONFIGURÉE !');
    console.log('✅ Tous les composants sont présents');
    console.log('');
    console.log('💡 Le problème pourrait être :');
    console.log('   1. Erreur JavaScript dans le navigateur (F12)');
    console.log('   2. Données de formulaire incorrectes');
    console.log('   3. Problème de validation côté client');
    console.log('   4. Erreur réseau lors de l\'appel à Supabase');
    console.log('');
    console.log('🔍 Prochaines étapes :');
    console.log('   1. Ouvrez l\'application sur http://localhost:5174');
    console.log('   2. Ouvrez la console (F12)');
    console.log('   3. Faites une réservation et observez les erreurs');
  } else {
    console.log('\n⚠️ PROBLÈMES DÉTECTÉS');
    if (!results.accessibility) {
      console.log('   ❌ L\'application n\'est pas accessible');
      console.log('   💡 Vérifiez que npm run dev fonctionne');
    }
    if (results.interfaceFiles.missingFiles.length > 0) {
      console.log('   ❌ Fichiers d\'interface manquants');
      console.log(`   💡 Fichiers manquants: ${results.interfaceFiles.missingFiles.join(', ')}`);
    }
    if (!results.clientSupabase) {
      console.log('   ❌ Configuration Supabase côté client manquante');
    }
    if (!results.clientEnvironment.envFound) {
      console.log('   ❌ Variables d\'environnement manquantes');
    }
    if (!results.compilation) {
      console.log('   ❌ Problème de compilation');
    }
  }

  return results;
}

testAppInterfaceDebug().catch(console.error);
