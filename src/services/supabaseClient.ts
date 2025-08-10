import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Créer un client Supabase ou un client factice selon la configuration
let supabase: any;

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configured, creating real client');
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  console.warn('⚠️ Supabase not configured, using mock client');
  // Client factice pour éviter les erreurs
  supabase = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: function() { return this; },
      neq: function() { return this; },
      limit: function() { return this; },
      order: function() { return this; },
      single: function() { return this; }
    }),
    rpc: () => Promise.resolve({ data: null, error: null }),
    functions: {
      invoke: () => Promise.resolve({ data: null, error: null })
    }
  };
}

export { supabase };

// Export types
export type { Database } from './database.types';