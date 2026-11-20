
// UPDATE PASSWORD ADMIN
// SMA SWASTA KATOLIK 1 KABANJAHE

const updatePasswordForm =
    document.getElementById("updatePasswordForm");

const updateButton =
    document.getElementById("updateButton");

const message =
    document.getElementById("message");

// Memproses password baru
updatePasswordForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    if (newPassword.length < 8) {
        message.style.color = "red";
        message.textContent =
            "Password minimal harus 8 karakter.";
        return;
    }

    if (newPassword !== confirmPassword) {
        message.style.color = "red";
        message.textContent =
            "Konfirmasi password tidak sama.";
        return;
    }

    updateButton.disabled = true;
    updateButton.textContent = "MENYIMPAN...";

    try {
        // Memastikan sesi pemulihan tersedia
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData.session) {
            throw new Error(
                "Sesi pemulihan tidak ditemukan. Silakan minta tautan pemulihan baru."
            );
        }

        // Memperbarui password Supabase
        const { error } =
            await supabaseClient.auth.updateUser({
                password: newPassword
            });

        if (error) throw error;

        message.style.color = "green";
        message.textContent =
            "Password berhasil diperbarui. Silakan login kembali.";

        updatePasswordForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 2500);

    } catch (error) {
        message.style.color = "red";
        message.textContent =
            error.message || "Gagal memperbarui password.";
        console.error("Update password gagal:", error);

    } finally {
        updateButton.disabled = false;
        updateButton.textContent = "SIMPAN PASSWORD BARU";
    }
});
