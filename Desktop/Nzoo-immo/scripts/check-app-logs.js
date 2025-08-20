#!/usr/bin/env node

/**
 * Script pour vérifier les logs de l'application
 * Usage: node scripts/check-app-logs.js
 */

console.log('🔍 Vérification des logs de l\'application - Nzoo Immo\n');

console.log('📋 Instructions pour diagnostiquer le problème :');
console.log('');
console.log('1. Ouvrez l\'application dans votre navigateur');
console.log('2. Ouvrez les outils de développement (F12)');
console.log('3. Allez dans l\'onglet "Console"');
console.log('4. Effectuez une réservation');
console.log('5. Surveillez les logs suivants :');
console.log('');
console.log('📧 Logs attendus lors d\'une réservation :');
console.log('   - [EMAIL] Début envoi emails pour: [email]');
console.log('   - [CLIENT] Préparation email pour: [email]');
console.log('   - [RESEND] Envoi direct vers: [email]');
console.log('   - ✅ [RESEND] Email envoyé avec succès: [ID]');
console.log('   - ✅ [EMAIL] Email client envoyé avec succès');
console.log('   - [ADMIN] Préparation email admin');
console.log('   - ✅ [EMAIL] Email admin envoyé avec succès');
console.log('');
console.log('❌ Si vous ne voyez PAS ces logs, le problème est :');
console.log('   - L\'application n\'utilise pas les services mis à jour');
console.log('   - Cache du navigateur (Ctrl+F5 pour forcer le rechargement)');
console.log('   - Problème de compilation');
console.log('');
console.log('❌ Si vous voyez des erreurs, notez-les et partagez-les');
console.log('');
console.log('🔧 Solutions possibles :');
console.log('1. Videz le cache du navigateur (Ctrl+Shift+Delete)');
console.log('2. Rechargez la page (Ctrl+F5)');
console.log('3. Redémarrez le serveur de développement (npm run dev)');
console.log('4. Vérifiez que l\'application utilise les bons services');
console.log('');
console.log('📧 Vérifiez aussi :');
console.log('- Les emails arrivent-ils dans votre boîte mail ?');
console.log('- Y a-t-il des erreurs dans la console ?');
console.log('- La réservation est-elle créée dans la base de données ?');
console.log('');
console.log('💡 Conseil :');
console.log('Comparez les logs de l\'application avec ceux du script de test');
console.log('qui fonctionne : node scripts/test-app-exact.js test@example.com');


