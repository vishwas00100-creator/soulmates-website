import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmgidrczefxpunuiowie.supabase.co';

const supabasePublishableKey = 'sb_publishable_jaesWf6JoK5ILIaGLaDUEg_4gjaXbna';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
