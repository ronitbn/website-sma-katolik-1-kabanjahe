
// ==========================================
// DASHBOARD ADMIN PPDB
// SMA SWASTA KATOLIK 1 KABANJAHE
// ==========================================

const pesanDashboard = document.getElementById("pesanDashboard");

async function periksaAdminPPDB() {
    try {
        // MEMERIKSA SESSION LOGIN
        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            window.location.href = "login.html";
            return;
        }

        // MEMERIKSA ROLE ADMIN / OPERATOR
        const { data: roleData, error: roleError } =
            await supabaseClient
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id)
                .in("role", ["admin", "operator"])
                .maybeSingle();

        if (roleError) throw roleError;

        if (!roleData) {
            await supabaseClient.auth.signOut();
            alert("Anda tidak memiliki hak akses PPDB.");
            window.location.href = "login.html";
            return;
        }

        pesanDashboard.textContent =
            "Akses admin berhasil diverifikasi.";

        // MEMUAT STATISTIK
        await muatStatistikPPDB();

    } catch (error) {
        console.error("Pemeriksaan admin gagal:", error);

        pesanDashboard.textContent =
            "Gagal memeriksa akses: " + error.message;
    }
}

// ==========================================
// MEMUAT STATISTIK PENDAFTAR
// ==========================================

async function muatStatistikPPDB() {

    try {
        const { data, error } = await supabaseClient
            .from("ppdb_pendaftar")
            .select("status");

        if (error) throw error;

        const total = data.length;

        const menunggu = data.filter(
            item => item.status === "menunggu"
        ).length;

        const diterima = data.filter(
            item => item.status === "diterima"
        ).length;

        const ditolak = data.filter(
            item => item.status === "ditolak"
        ).length;

        document.getElementById("totalPendaftar")
            .textContent = total;

        document.getElementById("menungguVerifikasi")
            .textContent = menunggu;

        document.getElementById("jumlahDiterima")
            .textContent = diterima;

        document.getElementById("jumlahDitolak")
            .textContent = ditolak;

    } catch (error) {
        console.error("Gagal memuat statistik:", error);

        pesanDashboard.textContent =
            "Gagal memuat statistik PPDB: " + error.message;
    }
}

// JALANKAN PEMERIKSAAN
periksaAdminPPDB();
