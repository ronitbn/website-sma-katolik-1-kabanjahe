
// KONFIGURASI SUPABASE

const SUPABASE_URL =
"https://kokxmkfjtzdphwewswfk.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_RfiSv56Ns5ItjcvkXdwNgA_oyh1svE3";

// MEMBUAT KONEKSI SUPABASE
if (!window.supabase || typeof window.supabase.createClient !== "function") {
    throw new Error("Library Supabase belum berhasil dimuat.");
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("Supabase Client berhasil dibuat!");
