
// =============================================
// DETAIL DAN VERIFIKASI PENDAFTAR PPDB
// SMA SWASTA KATOLIK 1 KABANJAHE
// =============================================

const pesanDetail = document.getElementById("pesanDetail");
const formVerifikasi = document.getElementById("formVerifikasi");
const pesanVerifikasi = document.getElementById("pesanVerifikasi");
const tombolSimpanVerifikasi = document.getElementById("tombolSimpanVerifikasi");

let dataPendaftarAktif = null;

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

    dataPendaftarAktif = data;

    tampilkanTeks("nomorPendaftaran", data.nomor_pendaftaran);
    tampilkanTeks("namaLengkap", data.nama_lengkap);
    tampilkanTeks("jenisKelamin", data.jenis_kelamin);
    tampilkanTeks("nisn", data.nisn);
    tampilkanTeks("tempatLahir", data.tempat_lahir);
    tampilkanTeks("tanggalLahir", formatTanggal(data.tanggal_lahir));
    tampilkanTeks("asalSekolah", data.asal_sekolah);
    tampilkanTeks("alamat", data.alamat);

    tampilkanTeks("namaAyah", data.nama_ayah);
    tampilkanTeks("namaIbu", data.nama_ibu);
    tampilkanTeks("nomorHp", data.nomor_hp_orang_tua);

    tampilkanStatus(data.status);
    tampilkanTeks("catatanAdmin", data.catatan_admin);

    const statusBaru = document.getElementById("statusBaru");
    const catatanBaru = document.getElementById("catatanBaru");

    if (statusBaru) {
        statusBaru.value = data.status || "menunggu";
    }

    if (catatanBaru) {
        catatanBaru.value = data.catatan_admin || "";
    }

    await tampilkanDokumen("fotoSiswa", data.foto_siswa, "Foto Siswa");
    await tampilkanDokumen("dokumenKK", data.dokumen_kk, "Kartu Keluarga");
    await tampilkanDokumen("dokumenIjazah", data.dokumen_ijazah, "Ijazah");
    await tampilkanDokumen("dokumenAkta", data.dokumen_akta, "Akta Kelahiran");

    if (pesanDetail) {
        pesanDetail.textContent = "Data pendaftar berhasil dimuat.";
    }
}

// =============================================
// TAMPILKAN STATUS
// =============================================

function tampilkanStatus(status) {
    const elemen = document.getElementById("statusPendaftaran");

    if (!elemen) return;

    elemen.textContent = status || "-";
    elemen.className = "status";

    if (status === "diterima") {
        elemen.classList.add("diterima");
    } else if (status === "ditolak") {
        elemen.classList.add("ditolak");
    }
}

// =============================================
// SIMPAN HASIL VERIFIKASI
// =============================================

if (formVerifikasi) {
    formVerifikasi.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!dataPendaftarAktif) {
            pesanVerifikasi.textContent = "Data pendaftar belum tersedia.";
            return;
        }

        const statusBaru = document.getElementById("statusBaru").value;
        const catatanBaru = document.getElementById("catatanBaru").value.trim();

        const daftarStatus = [
            "menunggu",
            "diverifikasi",
            "diterima",
            "ditolak"
        ];

        if (!daftarStatus.includes(statusBaru)) {
            pesanVerifikasi.textContent = "Status tidak valid.";
            return;
        }

        tombolSimpanVerifikasi.disabled = true;
        tombolSimpanVerifikasi.textContent = "Menyimpan...";

        pesanVerifikasi.textContent = "Sedang menyimpan hasil verifikasi...";

        try {
            const { data, error } = await supabaseClient
                .from("ppdb_pendaftar")
                .update({
                    status: statusBaru,
                    catatan_admin: catatanBaru,
                    updated_at: new Date().toISOString()
                })
                .eq("id", dataPendaftarAktif.id)
                .select("status, catatan_admin")
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data) {
                throw new Error("Data tidak ditemukan atau perubahan tidak tersimpan.");
            }

            dataPendaftarAktif.status = data.status;
            dataPendaftarAktif.catatan_admin = data.catatan_admin;

            tampilkanStatus(data.status);
            tampilkanTeks("catatanAdmin", data.catatan_admin);

            pesanVerifikasi.textContent =
                "Hasil verifikasi berhasil disimpan.";

        } catch (error) {
            console.error("Gagal menyimpan verifikasi:", error);

            pesanVerifikasi.textContent =
                "Gagal menyimpan verifikasi. Silakan periksa koneksi dan hak akses.";
        } finally {
            tombolSimpanVerifikasi.disabled = false;
            tombolSimpanVerifikasi.textContent = "Simpan Verifikasi";
        }
    });
}

// =============================================
// JALANKAN PROGRAM
// =============================================

muatDetailPendaftar();
