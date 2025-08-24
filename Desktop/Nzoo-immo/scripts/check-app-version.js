#!/usr/bin/env node

/**
 * Script pour vérifier la version de l'application
 * Usage: node scripts/check-app-version.js
 */

import fs from 'fs';
import path from 'path';

function checkAppVersion() {
  console.log('🔍 Vérification de la version de l\'application - Nzoo Immo\n');
  
  // Vérifier le service d'email
  const emailServicePath = path.join(process.cwd(), 'src', 'services', 'emailService.ts');
  
  if (fs.existsSync(emailServicePath)) {
    const emailServiceContent = fs.readFileSync(emailServicePath, 'utf8');
    
    console.log('📧 Service d\'email:');
    
    // Vérifier l'email d'administration
    if (emailServiceContent.includes('tricksonmabengi123@gmail.com')) {
      console.log('✅ Email admin correct: tricksonmabengi123@gmail.com');
    } else {
      console.log('❌ Email admin incorrect ou manquant');
    }
    
    // Vérifier la fonction Edge
    if (emailServiceContent.includes('send-email-confirmation')) {
      console.log('✅ Fonction Edge correcte: send-email-confirmation');
    } else {
      console.log('❌ Fonction Edge incorrecte');
    }
    
    // Vérifier les imports
    if (emailServiceContent.includes('import { supabase }')) {
      console.log('✅ Import Supabase présent');
    } else {
      console.log('❌ Import Supabase manquant');
    }
    
  } else {
    console.log('❌ Fichier emailService.ts non trouvé');
  }
  
  // Vérifier le service de réservation
  const reservationServicePath = path.join(process.cwd(), 'src', 'services', 'reservationService.ts');
  
  if (fs.existsSync(reservationServicePath)) {
    const reservationServiceContent = fs.readFileSync(reservationServicePath, 'utf8');
    
    console.log('\n📋 Service de réservation:');
    
    // Vérifier l'import du service d'email
    if (reservationServiceContent.includes('import { sendReservationEmails }')) {
      console.log('✅ Import sendReservationEmails présent');
    } else {
      console.log('❌ Import sendReservationEmails manquant');
    }
    
    // Vérifier l'appel à sendReservationEmails
    if (reservationServiceContent.includes('sendReservationEmails(')) {
      console.log('✅ Appel à sendReservationEmails présent');
    } else {
      console.log('❌ Appel à sendReservationEmails manquant');
    }
    
  } else {
    console.log('❌ Fichier reservationService.ts non trouvé');
  }
  
  // Vérifier la page de réservation
  const reservationPagePath = path.join(process.cwd(), 'src', 'pages', 'ReservationPage.tsx');
  
  if (fs.existsSync(reservationPagePath)) {
    const reservationPageContent = fs.readFileSync(reservationPagePath, 'utf8');
    
    console.log('\n📄 Page de réservation:');
    
    // Vérifier l'import du service de réservation
    if (reservationPageContent.includes('import { createReservation }')) {
      console.log('✅ Import createReservation présent');
    } else {
      console.log('❌ Import createReservation manquant');
    }
    
    // Vérifier l'appel à createReservation
    if (reservationPageContent.includes('createReservation(')) {
      console.log('✅ Appel à createReservation présent');
    } else {
      console.log('❌ Appel à createReservation manquant');
    }
    
  } else {
    console.log('❌ Fichier ReservationPage.tsx non trouvé');
  }
  
  console.log('\n🎯 Recommandations:');
  console.log('1. Si tous les ✅ sont présents, l\'application devrait fonctionner');
  console.log('2. Si des ❌ sont présents, redémarrez l\'application avec npm run dev');
  console.log('3. Vérifiez que l\'application utilise bien la dernière version des fichiers');
}

checkAppVersion();




