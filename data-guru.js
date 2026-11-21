
// ==========================================
// DATA GURU
// SMA SWASTA KATOLIK 1 KABANJAHE
// ==========================================

async function muatDataGuru() {

    const teacherList = document.getElementById("teacherList");

    if (!teacherList) return;

    teacherList.textContent = "Memuat data guru...";

    try {

        if (typeof supabaseClient === "undefined") {
            throw new Error("Koneksi Supabase belum tersedia.");
        }

        const { data, error } = await supabaseClient
            .from("teachers")
            .select("id, name, position, short_bio, photo_url")
            .eq("is_active", true)
            .order("name", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {

            teacherList.innerHTML = `
                <div class="empty-message">
                    <h3>Data Guru Belum Tersedia</h3>
                    <p>
                        Informasi guru akan ditampilkan
                        setelah data dimasukkan oleh admin.
                    </p>
                </div>
            `;

            return;
        }

        teacherList.innerHTML = "";

        data.forEach((guru) => {

            const card = document.createElement("div");
            card.className = "teacher-card";

            const icon = document.createElement("div");
            icon.className = "teacher-icon";

            if (guru.photo_url) {

                const img = document.createElement("img");
                img.src = guru.photo_url;
                img.alt = "Foto " + guru.name;
                img.loading = "lazy";
                img.style.width = "100px";
                img.style.height = "100px";
                img.style.objectFit = "cover";
                img.style.borderRadius = "50%";

                icon.appendChild(img);

            } else {
                icon.textContent = "👩‍🏫";
            }

            const nama = document.createElement("h3");
            nama.textContent = guru.name || "Nama belum tersedia";

            const jabatan = document.createElement("p");
            jabatan.textContent = guru.position || "";

            const bio = document.createElement("p");
            bio.textContent = guru.short_bio || "";

            card.appendChild(icon);
            card.appendChild(nama);
            card.appendChild(jabatan);
            card.appendChild(bio);

            teacherList.appendChild(card);

        });

    } catch (error) {

        console.error("Gagal memuat data guru:", error);

        teacherList.textContent =
            "Data guru belum dapat dimuat. Silakan coba kembali.";

    }
}

// Jalankan saat halaman selesai dimuat
document.addEventListener("DOMContentLoaded", muatDataGuru);
