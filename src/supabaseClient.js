import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmgidrczefxpunuiowie.supabase.co';

const supabasePublishableKey = 'YOUR_SUPABASE_PUBLISHABLE_KEY';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
