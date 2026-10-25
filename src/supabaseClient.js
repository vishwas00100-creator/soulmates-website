import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmgidrczefxpunuiowie.supabase.co';

const supabaseKey =
  'sb_publishable_jaesWf6JoK5ILIaGLaDUEg_4gjaXbna';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseKey.startsWith('sb_publishable_')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
