import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmgidrczefxpunuiowie.supabase.co';

const supabasePublishableKey = 'PASTE_YOUR_ACTUAL_KEY_HERE';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
