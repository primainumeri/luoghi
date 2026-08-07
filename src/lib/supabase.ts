import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Fallisce presto in sviluppo se le variabili pubbliche non sono configurate.
  throw new Error(
    'Variabili mancanti: definire VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (vedi .env.example).',
  );
}

// Client con la sola publishable key: la protezione dei dati dipende dalle policy RLS.
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
