import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fmgidrczefxpunuiowie.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZ2lkcmN6ZWZ4cHVudWlvd2llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMzE1NTUsImV4cCI6MjEwNzYwNzU1NX0.Uf_2XcwVK3dxtyFcmuaacY2wVl1YTE436QzhjgdK3Og';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
