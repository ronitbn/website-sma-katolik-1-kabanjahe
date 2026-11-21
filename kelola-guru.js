
// ==========================================
// KELOLA DATA GURU
// SMA SWASTA KATOLIK 1 KABANJAHE
// ==========================================

const formGuru = document.getElementById("formGuru");
const daftarGuru = document.getElementById("daftarGuru");
const pesan = document.getElementById("pesan");

const namaGuru = document.getElementById("namaGuru");
const jabatanGuru = document.getElementById("jabatanGuru");
const previewFotoGuru =
    document.getElementById("previewFotoGuru");
const bioGuru = document.getElementById("bioGuru");
const statusGuru = document.getElementById("statusGuru");

const simpanGuru = document.getElementById("simpanGuru");
const batalEdit = document.getElementById("batalEdit");

let fotoUrlSaatIni = null;

// =====================================
// PREVIEW FOTO GURU
// =====================================

fotoGuru.addEventListener("change", function() {
    const file = fotoGuru.files[0];

    if (!file) {
        previewFotoGuru.style.display = "none";
        previewFotoGuru.src = "";
        return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("Format foto harus JPG, PNG, atau WEBP.");
        fotoGuru.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2 MB.");
        fotoGuru.value = "";
        return;
    }

    previewFotoGuru.src = URL.createObjectURL(file);
    previewFotoGuru.style.display = "block";
});



// =====================================
// UPLOAD FOTO GURU KE SUPABASE STORAGE
// =====================================

async function uploadFotoGuru(file) {
    if (!file) {
        return null;
    }

    const ekstensi = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
    };

    const namaFile =
        Date.now() + "-" +
        crypto.randomUUID() + "." +
        ekstensi[file.type];

    const { data, error } = await supabaseClient
        .storage
        .from("foto-guru")
        .upload(namaFile, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type
        });

    if (error) {
        throw error;
    }

    const { data: urlData } = supabaseClient
        .storage
        .from("foto-guru")
        .getPublicUrl(data.path);

    return urlData.publicUrl;
}

// ==========================================
// PEMERIKSAAN LOGIN DAN HAK AKSES
// ==========================================

async function periksaAksesGuru() {
    try {
        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        const session = data.session;

        if (!session) {
            window.location.href = "login.html";
            return;
        }

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
            alert("Anda tidak memiliki hak akses.");
            window.location.href = "login.html";
            return;
        }

        adminTerverifikasi = true;

        await muatDaftarGuru();

    } catch (error) {
        console.error("Pemeriksaan akses gagal:", error);
        daftarGuru.textContent =
            "Gagal memeriksa akses. Silakan coba login kembali.";
    }
}

// ==========================================
// MENAMPILKAN DAFTAR GURU
// ==========================================

async function muatDaftarGuru() {
    daftarGuru.textContent = "Memuat data guru...";

    try {
        const { data, error } = await supabaseClient
            .from("teachers")
            .select("id, name, position, short_bio, photo_url, is_active")
            .order("name", { ascending: true });

        if (error) throw error;

        daftarGuru.replaceChildren();

        if (!data || data.length === 0) {
            const baris = document.createElement("tr");
            const kolom = document.createElement("td");

            kolom.colSpan = 5;
            kolom.textContent = "Belum ada data guru.";

            baris.appendChild(kolom);
            daftarGuru.appendChild(baris);

            return;
        }

        data.forEach((guru, index) => {
            const baris = document.createElement("tr");

            const kolomNomor = document.createElement("td");
            kolomNomor.textContent = index + 1;

            const kolomNama = document.createElement("td");
            kolomNama.textContent = guru.name || "-";

            const kolomJabatan = document.createElement("td");
            kolomJabatan.textContent = guru.position || "-";

            const kolomStatus = document.createElement("td");
            kolomStatus.textContent =
                guru.is_active ? "Aktif" : "Tidak Aktif";

            const kolomAksi = document.createElement("td");

            const tombolEdit = document.createElement("button");
            tombolEdit.type = "button";
            tombolEdit.textContent = "Edit";
            tombolEdit.style.background = "#1565c0";
            tombolEdit.style.color = "white";

            tombolEdit.addEventListener("click", () => {
                editGuru(guru);
            });

            const tombolHapus = document.createElement("button");
            tombolHapus.type = "button";
            tombolHapus.textContent = "Hapus";
            tombolHapus.style.background = "#c62828";
            tombolHapus.style.color = "white";
            tombolHapus.style.marginLeft = "6px";

            tombolHapus.addEventListener("click", () => {
                hapusGuru(guru.id, guru.name);
            });

            kolomAksi.appendChild(tombolEdit);
            kolomAksi.appendChild(tombolHapus);

            baris.appendChild(kolomNomor);
            baris.appendChild(kolomNama);
            baris.appendChild(kolomJabatan);
            baris.appendChild(kolomStatus);
            baris.appendChild(kolomAksi);

            daftarGuru.appendChild(baris);
        });

    } catch (error) {
        console.error("Gagal memuat guru:", error);
        daftarGuru.textContent =
            "Gagal memuat data guru: " + error.message;
    }
}

// ==========================================
// MENAMBAH DAN MENYIMPAN DATA GURU
// ==========================================

formGuru.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!adminTerverifikasi) return;

    simpanGuru.disabled = true;
    simpanGuru.textContent = "Menyimpan...";

    pesan.textContent = "";

    
const fileFoto = fotoGuru.files[0];


    try {
        
// Validasi nama dan jabatan
if (!namaGuru.value.trim() || !jabatanGuru.value.trim()) {
    throw new Error("Nama dan jabatan guru wajib diisi.");
}

// Upload foto jika Admin memilih foto baru
let photoUrl = fotoUrlSaatIni;

if (fileFoto) {
    photoUrl = await uploadFotoGuru(fileFoto);
}

// Menyiapkan data guru
const dataGuru = {
    name: namaGuru.value.trim(),
    position: jabatanGuru.value.trim(),
    short_bio: bioGuru.value.trim() || null,
    photo_url: photoUrl,
    is_active: statusGuru.value === "true"
};

let hasil;


        if (idGuruEdit) {
            hasil = await supabaseClient
                .from("teachers")
                .update(dataGuru)
                .eq("id", idGuruEdit);
        } else {
            hasil = await supabaseClient
                .from("teachers")
                .insert([dataGuru]);
        }

        if (hasil.error) throw hasil.error;

        pesan.textContent = idGuruEdit
            ? "Data guru berhasil diperbarui."
            : "Data guru berhasil ditambahkan.";

        formGuru.reset();
        idGuruEdit = null;

        batalEdit.hidden = true;
        simpanGuru.textContent = "Simpan Data Guru";

        await muatDaftarGuru();

    } catch (error) {
        console.error("Gagal menyimpan guru:", error);
        pesan.textContent =
            "Gagal menyimpan data: " + error.message;

    } finally {
        simpanGuru.disabled = false;

        if (!idGuruEdit) {
            simpanGuru.textContent = "Simpan Data Guru";
        } else {
            simpanGuru.textContent = "Perbarui Data Guru";
        }
    }
});

// ==========================================
// EDIT DATA GURU
// ==========================================

function editGuru(guru) {
    idGuruEdit = guru.id;

    namaGuru.value = guru.name || "";
    jabatanGuru.value = guru.position || "";
    bioGuru.value = guru.short_bio || "";
    fotoUrlSaatIni = guru.photo_url || null;

if (fotoUrlSaatIni) {
    previewFotoGuru.src = fotoUrlSaatIni;
    previewFotoGuru.style.display = "block";
} else {
    previewFotoGuru.src = "";
    previewFotoGuru.style.display = "none";
}

fotoGuru.value = "";
    statusGuru.value = String(guru.is_active);

    simpanGuru.textContent = "Perbarui Data Guru";
    batalEdit.hidden = false;

    pesan.textContent = "Sedang mengedit: " + guru.name;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// BATAL EDIT
// ==========================================


batalEdit.addEventListener("click", function() {
    formGuru.reset();

    idGuruEdit = null;
    fotoUrlSaatIni = null;

    previewFotoGuru.src = "";
    previewFotoGuru.style.display = "none";

    batalEdit.hidden = true;
    simpanGuru.textContent = "Simpan Data Guru";

    pesan.textContent = "Edit data dibatalkan.";
});


// ==========================================
// HAPUS DATA GURU
// ==========================================

async function hapusGuru(id, nama) {
    if (!adminTerverifikasi) return;

    const konfirmasi = confirm(
        "Apakah Bapak yakin ingin menghapus data guru " +
        nama + "?"
    );

    if (!konfirmasi) return;

    try {
        const { error } = await supabaseClient
            .from("teachers")
            .delete()
            .eq("id", id);

        if (error) throw error;

        pesan.textContent = "Data guru berhasil dihapus.";

        await muatDaftarGuru();

    } catch (error) {
        console.error("Gagal menghapus guru:", error);
        pesan.textContent =
            "Gagal menghapus data: " + error.message;
    }
}

// ==========================================
// JALANKAN PROGRAM
// ==========================================

periksaAksesGuru();
