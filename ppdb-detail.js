
// =============================================
// DETAIL PENDAFTAR PPDB
// SMA SWASTA KATOLIK 1 KABANJAHE
// =============================================

const pesanDetail = document.getElementById("pesanDetail");

// =============================================
// FORMAT TANGGAL
// =============================================

function formatTanggal(tanggal) {
    if (!tanggal) return "-";

    return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });
}

// =============================================
// TAMPILKAN TEKS DENGAN AMAN
// =============================================

function tampilkanTeks(id, nilai) {
    const elemen = document.getElementById(id);

    if (elemen) {
        elemen.textContent = nilai || "-";
    }
}

// =============================================
// TAMPILKAN DOKUMEN PRIVAT
// =============================================

async function tampilkanDokumen(idElemen, path, namaDokumen) {
    const elemen = document.getElementById(idElemen);

    if (!elemen) return;

    elemen.textContent = "Belum tersedia";

    if (!path) return;

    const { data, error } = await supabaseClient
        .storage
        .from("dokumen-ppdb")
        .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
        console.error("Gagal membuka dokumen:", error);
        elemen.textContent = "Dokumen belum dapat dibuka";
        return;
    }

    const tautan = document.createElement("a");

    tautan.href = data.signedUrl;
    tautan.textContent = "Lihat " + namaDokumen;
    tautan.target = "_blank";
    tautan.rel = "noopener noreferrer";

    elemen.textContent = "";
    elemen.appendChild(tautan);
}

// =============================================
// PERIKSA LOGIN DAN HAK AKSES ADMIN
// =============================================

async function periksaAdmin() {
    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
    }

    const user = sessionData.session.user;

    const { data: roleData, error: roleError } =
        await supabaseClient
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .in("role", ["admin", "operator"]);

    if (roleError || !roleData || roleData.length === 0) {
        alert("Anda tidak memiliki akses ke halaman ini.");

        await supabaseClient.auth.signOut();

        window.location.href = "login.html";
        return false;
    }

    return true;
}

// =============================================
// MUAT DETAIL PENDAFTAR
// =============================================

async function muatDetailPendaftar() {
    if (pesanDetail) {
        pesanDetail.textContent = "Memuat data pendaftar...";
    }

    const bolehMasuk = await periksaAdmin();

    if (!bolehMasuk) return;

    const parameter = new URLSearchParams(window.location.search);
    const idPendaftar = parameter.get("id");

    if (!idPendaftar) {
        if (pesanDetail) {
            pesanDetail.textContent = "ID pendaftar tidak ditemukan.";
        }
        return;
    }

    const { data, error } = await supabaseClient
        .from("ppdb_pendaftar")
        .select("*")
        .eq("id", idPendaftar)
        .maybeSingle();

    if (error) {
        console.error("Gagal mengambil data:", error);

        if (pesanDetail) {
            pesanDetail.textContent = "Gagal memuat data pendaftar.";
        }
        return;
    }

    if (!data) {
        if (pesanDetail) {
            pesanDetail.textContent = "Data pendaftar tidak ditemukan.";
        }
        return;
    }

    // =========================================
    // INFORMASI CALON SISWA
    // =========================================

    tampilkanTeks("nomorPendaftaran", data.nomor_pendaftaran);
    tampilkanTeks("namaLengkap", data.nama_lengkap);
    tampilkanTeks("jenisKelamin", data.jenis_kelamin);
    tampilkanTeks("nisn", data.nisn);
    tampilkanTeks("tempatLahir", data.tempat_lahir);
    tampilkanTeks("tanggalLahir", formatTanggal(data.tanggal_lahir));
    tampilkanTeks("asalSekolah", data.asal_sekolah);
    tampilkanTeks("alamat", data.alamat);

    // =========================================
    // INFORMASI ORANG TUA
    // =========================================

    tampilkanTeks("namaAyah", data.nama_ayah);
    tampilkanTeks("namaIbu", data.nama_ibu);
    tampilkanTeks("nomorHp", data.nomor_hp_orang_tua);

    // =========================================
    // STATUS PENDAFTARAN
    // =========================================

    tampilkanTeks("statusPendaftaran", data.status);
    tampilkanTeks("catatanAdmin", data.catatan_admin);

    // =========================================
    // DOKUMEN PENDAFTAR
    // =========================================

    await tampilkanDokumen(
        "fotoSiswa",
        data.foto_siswa,
        "Foto Siswa"
    );

    await tampilkanDokumen(
        "dokumenKK",
        data.dokumen_kk,
        "Kartu Keluarga"
    );

    await tampilkanDokumen(
        "dokumenIjazah",
        data.dokumen_ijazah,
        "Ijazah"
    );

    await tampilkanDokumen(
        "dokumenAkta",
        data.dokumen_akta,
        "Akta Kelahiran"
    );

    if (pesanDetail) {
        pesanDetail.textContent = "Data pendaftar berhasil dimuat.";
    }
}

// =============================================
// JALANKAN PROGRAM
// =============================================

muatDetailPendaftar();
