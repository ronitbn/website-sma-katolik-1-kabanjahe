const SUPABASE_URL =
  "https://kokxmkfjtzdphwewswfk.supabase.co";

const SUPABASE_ANON_KEY =
  "MASUKKAN_PUBLISHABLE_KEY_BAPAK";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
