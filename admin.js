
// DASHBOARD ADMIN SMA KATOLIK 1 KABANJAHE

const adminEmail = document.getElementById("adminEmail");
const logoutButton = document.getElementById("logoutButton");

// Memeriksa akun admin
async function periksaAdmin() {
    try {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        const session = sessionData.session;

        // Jika belum login, kembali ke login
        if (!session) {
            window.location.href = "login.html";
            return;
        }

        const user = session.user;

        // Memeriksa hak akses admin
        const { data: roleData, error: roleError } =
            await supabaseClient
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .in("role", ["admin", "operator"])
                .maybeSingle();

        if (roleError) throw roleError;

        if (!roleData) {
            await supabaseClient.auth.signOut();
            alert("Akun Anda tidak memiliki hak akses admin.");
            window.location.href = "login.html";
            return;
        }

        adminEmail.textContent = "Login sebagai: " + user.email;

        console.log("Admin berhasil diverifikasi.");

    } catch (error) {
        console.error("Pemeriksaan admin gagal:", error);
        adminEmail.textContent =
            "Gagal memeriksa akun. Silakan login kembali.";
    }
}

// Fungsi logout
logoutButton.addEventListener("click", async function () {
    logoutButton.disabled = true;
    logoutButton.textContent = "KELUAR...";

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Logout gagal:", error);
        alert("Logout gagal. Silakan coba kembali.");

        logoutButton.disabled = false;
        logoutButton.textContent = "LOGOUT";
        return;
    }

    window.location.href = "login.html";
});

// Menjalankan pemeriksaan
periksaAdmin();
