
// LOGIN ADMIN PORTAL SMA KATOLIK 1 KABANJAHE

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginButton.disabled = true;
    loginButton.textContent = "MEMERIKSA...";
    loginMessage.textContent = "";

    try {

        // 1. LOGIN KE SUPABASE
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        const user = data.user;

        // 2. PERIKSA ROLE ADMIN
        const { data: roleData, error: roleError } =
            await supabaseClient
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .eq("role", "admin")
                .maybeSingle();

        if (roleError) {
            throw roleError;
        }

        // 3. TOLAK JIKA BUKAN ADMIN
        if (!roleData) {
            await supabaseClient.auth.signOut();
            throw new Error(
                "Akun ini tidak memiliki hak akses admin."
            );
        }

        // 4. JIKA BERHASIL
        loginMessage.style.color = "green";
        loginMessage.textContent =
            "Login berhasil! Mengarahkan ke dashboard...";

        window.location.href = "admin.html";

    } catch (error) {

        loginMessage.style.color = "red";
        loginMessage.textContent =
            error.message || "Login gagal. Silakan coba kembali.";

        console.error("Login Admin gagal:", error);

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "LOGIN";

    }

});
