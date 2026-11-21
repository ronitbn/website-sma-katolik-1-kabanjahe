
// =====================================
// KELOLA BERITA SEKOLAH
// SMA SWASTA KATOLIK 1 KABANJAHE
// =====================================

const formBerita = document.getElementById("beritaForm");
const daftarBerita = document.getElementById("daftarBerita");
const tombolBatal = document.getElementById("batalEdit");

let userAdmin = null;

// =====================================
// PREVIEW FOTO BERITA
// =====================================

const inputGambar = document.getElementById("gambarBerita");
const previewGambar = document.getElementById("previewGambar");

inputGambar.addEventListener("change", function() {
    const file = inputGambar.files[0];

    if (!file) {
        previewGambar.src = "";
        previewGambar.style.display = "none";
        return;
    }

    const tipeDiizinkan = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!tipeDiizinkan.includes(file.type)) {
        alert("Format foto harus JPG, PNG, atau WEBP.");
        inputGambar.value = "";
        previewGambar.src = "";
        previewGambar.style.display = "none";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal 5 MB.");
        inputGambar.value = "";
        previewGambar.src = "";
        previewGambar.style.display = "none";
        return;
    }

    previewGambar.src = URL.createObjectURL(file);
    previewGambar.style.display = "block";
});


// =====================================
// MEMERIKSA LOGIN DAN HAK AKSES ADMIN
// =====================================

async function periksaAdmin() {
    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
    }

    userAdmin = sessionData.session.user;

    const { data: roleData, error: roleError } =
        await supabaseClient
            .from("user_roles")
            .select("role")
            .eq("user_id", userAdmin.id)
            .eq("role", "admin")
            .maybeSingle();

    if (roleError || !roleData) {
        alert("Akses ditolak. Akun ini bukan Admin.");
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
        return false;
    }

    return true;
}

// =====================================
// MENAMPILKAN DAFTAR BERITA
// =====================================

async function tampilkanBerita() {
    daftarBerita.textContent = "Memuat berita...";

    const { data, error } = await supabaseClient
        .from("berita")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        daftarBerita.textContent =
            "Gagal memuat berita: " + error.message;
        return;
    }

    daftarBerita.innerHTML = "";

    if (!data || data.length === 0) {
        daftarBerita.textContent = "Belum ada berita.";
        return;
    }

    data.forEach((berita) => {
        const kartu = document.createElement("div");
        kartu.style.border = "1px solid #ccc";
        kartu.style.padding = "15px";
        kartu.style.marginBottom = "12px";
        kartu.style.borderRadius = "8px";

        const judul = document.createElement("h3");
        judul.textContent = berita.judul;

        const isi = document.createElement("p");
        isi.textContent =
            berita.isi.length > 200
                ? berita.isi.substring(0, 200) + "..."
                : berita.isi;

        const status = document.createElement("p");
        status.textContent = "Status: " + berita.status;

        const tombolEdit = document.createElement("button");
        tombolEdit.textContent = "Edit";
        tombolEdit.addEventListener("click", () => {
            editBerita(berita);
        });

        const tombolHapus = document.createElement("button");
        tombolHapus.textContent = "Hapus";
        tombolHapus.addEventListener("click", () => {
            hapusBerita(berita.id);
        });

        kartu.append(judul, isi, status, tombolEdit, tombolHapus);
        daftarBerita.appendChild(kartu);
    });
}

// =====================================
// MENYIMPAN BERITA BARU ATAU EDIT
// =====================================


// =====================================
// MENYIMPAN BERITA BARU ATAU EDIT
// DENGAN UPLOAD FOTO KE SUPABASE
// =====================================

formBerita.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("beritaId").value;
    const judul = document.getElementById("judul").value.trim();
    const isi = document.getElementById("isi").value.trim();
    const kategori = document.getElementById("kategori").value;
    const status = document.getElementById("status").value;
    const file = inputGambar.files[0];

    if (!judul || !isi) {
        alert("Judul dan isi berita wajib diisi.");
        return;
    }

    const dataBerita = {
        judul: judul,
        isi: isi,
        status: status
    };

    // VALIDASI DAN UPLOAD FOTO
    if (file) {
        const tipeDiizinkan = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!tipeDiizinkan.includes(file.type)) {
            alert("Format foto harus JPG, PNG, atau WEBP.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Ukuran foto maksimal 5 MB.");
            return;
        }

        const ekstensi = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        };

        const namaFile =
            Date.now() + "-" +
            Math.random().toString(36).substring(2) +
            "." + ekstensi[file.type];

        const { data: uploadData, error: uploadError } =
            await supabaseClient
                .storage
                .from("berita")
                .upload(namaFile, file, {
                    cacheControl: "3600",
                    upsert: false,
                    contentType: file.type
                });

        if (uploadError) {
            alert("Gagal mengunggah foto: " + uploadError.message);
            return;
        }

        const { data: publicData } =
            supabaseClient
                .storage
                .from("berita")
                .getPublicUrl(uploadData.path);

        dataBerita.gambar_url = publicData.publicUrl;
    }

    let hasil;

    if (id) {
        hasil = await supabaseClient
            .from("berita")
            .update({
                ...dataBerita,
                updated_at: new Date().toISOString()
            })
            .eq("id", id);
    } else {
        dataBerita.author_id = userAdmin.id;

        hasil = await supabaseClient
            .from("berita")
            .insert([dataBerita]);
    }

    if (hasil.error) {
        alert("Gagal menyimpan berita: " + hasil.error.message);
        return;
    }

    alert("Berita berhasil disimpan!");

    formBerita.reset();
    document.getElementById("beritaId").value = "";

    previewGambar.src = "";
    previewGambar.style.display = "none";

    await tampilkanBerita();
});


// =====================================
// MENGEDIT BERITA
// =====================================

function editBerita(berita) {
    document.getElementById("beritaId").value = berita.id;
    document.getElementById("judul").value = berita.judul;
    document.getElementById("isi").value = berita.isi;
    document.getElementById("status").value = berita.status;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// =====================================
// MEMBATALKAN EDIT
// =====================================

tombolBatal.addEventListener("click", function() {
    formBerita.reset();
    document.getElementById("beritaId").value = "";
});

// =====================================
// MENGHAPUS BERITA
// =====================================

async function hapusBerita(id) {
    const yakin = confirm(
        "Apakah Anda yakin ingin menghapus berita ini?"
    );

    if (!yakin) return;

    const { error } = await supabaseClient
        .from("berita")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Gagal menghapus berita: " + error.message);
        return;
    }

    alert("Berita berhasil dihapus!");

    await tampilkanBerita();
}

// =====================================
// MENJALANKAN HALAMAN
// =====================================

async function mulaiHalamanBerita() {
    const bolehMasuk = await periksaAdmin();

    if (bolehMasuk) {
        await tampilkanBerita();
    }
}

mulaiHalamanBerita();
