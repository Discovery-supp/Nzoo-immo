#!/usr/bin/env node

/**
 * Script de test pour la fonction hello très simple
 * Usage: node scripts/test-hello.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nnkywmfxoohehtyyzzgp.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testHello() {
  console.log('🧪 Test de la fonction hello - Nzoo Immo\n');
  
  console.log('📋 Test de la fonction hello...');
  
  try {
    const { data, error } = await supabase.functions.invoke('hello');

    if (error) {
      console.log('❌ Erreur de la fonction hello:', error.message);
      console.log('📋 Détails:', error);
      
      if (error.message.includes('Function not found')) {
        console.log('\n🔧 Solution: Créez la fonction hello dans le dashboard Supabase');
        console.log('1. Créez une nouvelle fonction: hello');
        console.log('2. Copiez le code du fichier supabase/functions/hello/index.ts');
        console.log('3. Déployez la fonction');
      }
    } else {
      console.log('✅ Fonction hello répond correctement');
      console.log('📧 Réponse:', data);
      
      if (data && data.message) {
        console.log('\n🎉 Test réussi !');
        console.log('Les Edge Functions fonctionnent correctement.');
      }
    }
  } catch (err) {
    console.log('❌ Erreur lors du test:', err.message);
  }
  
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Si hello fonctionne, le problème vient des autres fonctions');
  console.log('2. Si hello échoue, le problème vient de la configuration générale');
  console.log('3. Créez la fonction hello dans le dashboard Supabase');
}

testHello().catch(console.error);




