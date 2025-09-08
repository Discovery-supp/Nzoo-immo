import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier la configuration Supabase (logs de développement uniquement)
if (import.meta.env.DEV) {
  console.log('🔍 Supabase configuration check:');
  console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('Key:', supabaseAnonKey ? 'Set' : 'Missing');
  
  // Vérifier si une instance existe déjà
  if (typeof window !== 'undefined' && (window as any).__supabase_instance_created) {
    console.warn('⚠️ Multiple Supabase instances detected! This may cause authentication issues.');
  }
}

// Vérifier si les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
    console.warn('⚠️ Variables d\'environnement Supabase manquantes');
    console.warn('Veuillez créer un fichier .env.local avec:');
    console.warn('VITE_SUPABASE_URL=votre_url_supabase');
    console.warn('VITE_SUPABASE_ANON_KEY=votre_clé_anon');
  }
}

// Créer le client Supabase avec fallback et configuration optimisée
export const supabase = createClient(
  supabaseUrl || 'https://nnkywmfxoohehtyyzzgp.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua3l3bWZ4b29oZWh0eXl6emdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNDQ3NTcsImV4cCI6MjA2OTcyMDc1N30.VZtsHLfbVks1uLhfnjW6uJSP0-J-Z30-WWT5D_B8Jpk',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'nzoo-immo-web'
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Marquer qu'une instance a été créée (pour détecter les instances multiples)
if (typeof window !== 'undefined') {
  (window as any).__supabase_instance_created = true;
}

// Fonction de test de connexion améliorée
export const testSupabaseConnection = async () => {
  try {
    if (import.meta.env.DEV) {
      console.log('🔍 Testing Supabase connection...');
    }
    
    const { data, error } = await supabase
      .from('reservations')
      .select('count')
      .limit(1);
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Supabase connection failed:', error.message);
        
        // Diagnostic des erreurs courantes
        if (error.message.includes('Invalid API key')) {
          console.error('🔧 Solution: Vérifiez votre clé API Supabase');
        } else if (error.message.includes('fetch')) {
          console.error('🔧 Solution: Vérifiez votre connexion internet');
        } else if (error.message.includes('relation "reservations" does not exist')) {
          console.error('🔧 Solution: La table reservations n\'existe pas, exécutez les migrations');
        }
      }
      
      return { success: false, error: error.message };
    } else {
      if (import.meta.env.DEV) {
        console.log('✅ Supabase connected successfully');
      }
      return { success: true };
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('❌ Unexpected error testing Supabase:', err);
    }
    return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' };
  }
};

// Test de connexion au démarrage (uniquement en développement)
if (import.meta.env.DEV) {
  testSupabaseConnection();
}

// Export types
export type { Database } from './database.types';