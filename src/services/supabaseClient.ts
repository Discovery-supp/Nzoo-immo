import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase configuration check:');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Key:', supabaseAnonKey ? 'Set' : 'Missing');

// Créer le client Supabase
export const supabase = createClient(
  supabaseUrl || 'https://zfxkyiusextbhhxemwuu.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmeGt5aXVzZXh0YmhoeGVtd3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODU0MTMsImV4cCI6MjA2ODE2MTQxM30.75nsiuH6S1o_OyhynyIOEyLv2YynGP383Ob89ofoujw',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Test de connexion
supabase
  .from('reservations')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  });

// Export types
export type { Database } from './database.types';