#!/usr/bin/env node

/**
 * Script de configuration SendGrid
 * Utilisez ce script une fois que vous avez votre API Key SendGrid
 */

const { execSync } = require('child_process');

console.log('🔧 CONFIGURATION SENDGRID');
console.log('==========================');
console.log('');

console.log('📋 Étapes à suivre :');
console.log('1. Allez sur https://sendgrid.com');
console.log('2. Créez un compte gratuit');
console.log('3. Allez dans Settings → API Keys');
console.log('4. Créez une nouvelle API Key');
console.log('5. Copiez l\'API Key (commence par SG.)');
console.log('');

console.log('🔑 Une fois que vous avez votre API Key SendGrid,');
console.log('   remplacez SENDGRID_API_KEY_ICI par votre vraie clé');
console.log('   dans la commande ci-dessous :');
console.log('');

console.log('💻 Commande à exécuter :');
console.log('npx supabase secrets set SENDGRID_API_KEY=SENDGRID_API_KEY_ICI');
console.log('');

console.log('📧 Exemple :');
console.log('npx supabase secrets set SENDGRID_API_KEY=SG.abc123...');
console.log('');

console.log('✅ Une fois configuré, testez avec :');
console.log('node test_sendgrid.cjs');
console.log('');

console.log('🎯 SendGrid sera utilisé en priorité par rapport à Resend');
console.log('   pour l\'envoi d\'emails.');
