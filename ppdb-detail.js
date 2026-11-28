
// =============================================
// DETAIL DAN VERIFIKASI PENDAFTAR PPDB
// SMA SWASTA KATOLIK 1 KABANJAHE
// =============================================

const pesanDetail = document.getElementById("pesanDetail");
const formVerifikasi = document.getElementById("formVerifikasi");
const pesanVerifikasi = document.getElementById("pesanVerifikasi");
const tombolSimpanVerifikasi = document.getElementById("tombolSimpanVerifikasi");

let dataPendaftarAktif = null;

const daftarStatus = [
    "Menunggu Verifikasi",
    "Sedang Diproses",
    "Diterima",
    "Ditolak"
];

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
 // TAMPILKAN DOKUMEN PRIVAT PPDB
 // =============================================

async function tampilkanDokumen(idElemen, path, namaDokumen) {
    const elemen = document.getElementById(idElemen);

    if (!elemen) return;

    elemen.textContent = "Memuat dokumen...";

    if (!path) {
        elemen.textContent = "Dokumen belum diunggah";
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .storage
            .from("ppdb-dokumen")
            .createSignedUrl(path, 300);

        if (error || !data?.signedUrl) {
            console.error("Gagal membuka dokumen:", error);
            elemen.textContent = "Dokumen belum dapat dibuka";
            return;
        }

        // FOTO SISWA
        if (idElemen === "fotoSiswa") {
            const gambar = document.createElement("img");

            gambar.src = data.signedUrl;
            gambar.alt = "Foto Siswa";
            gambar.style.maxWidth = "180px";
            gambar.style.maxHeight = "220px";
            gambar.style.objectFit = "contain";
            gambar.style.borderRadius = "8px";

            const tautan = document.createElement("a");
            tautan.href = data.signedUrl;
            tautan.target = "_blank";
            tautan.rel = "noopener noreferrer";

            tautan.appendChild(gambar);

            elemen.replaceChildren(tautan);

        } else {
            // DOKUMEN KK, IJAZAH, DAN AKTA
            const tautan = document.createElement("a");

            tautan.href = data.signedUrl;
            tautan.textContent = "Lihat " + namaDokumen;
            tautan.target = "_blank";
            tautan.rel = "noopener noreferrer";

            elemen.replaceChildren(tautan);
        }

    } catch (error) {
        console.error("Kesalahan membuka dokumen:", error);
        elemen.textContent = "Dokumen belum dapat dibuka";
    }
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
    tampilkanTeks("namaLengkapHeader", data.nama_lengkap);
    tampilkanTeks("jenisKelamin", data.jenis_kelamin);
    tampilkanTeks("nisn", data.nisn);
    tampilkanTeks("nomorHpSiswa", data.no_hp_siswa);
    tampilkanTeks("tempatLahir", data.tempat_lahir);
    tampilkanTeks("tanggalLahir", formatTanggal(data.tanggal_lahir));
    tampilkanTeks("asalSekolah", data.asal_sekolah);
    tampilkanTeks("alamat", data.alamat);

    // Data orang tua
    tampilkanTeks("namaAyah", data.nama_ortu);
    tampilkanTeks("namaIbu", "-");
    tampilkanTeks("nomorHp", data.no_hp_ortu);

    // Status dan catatan admin
    tampilkanStatus(data.status);
    tampilkanTeks("catatanAdmin", data.catatan_admin);
        // Data untuk bukti cetak PPDB
    tampilkanTeks(
        "cetakNomorPendaftaran",
        data.nomor_pendaftaran
    );

    tampilkanTeks(
        "cetakNamaLengkap",
        data.nama_lengkap
    );

    tampilkanTeks(
        "cetakAsalSekolah",
        data.asal_sekolah
    );

    tampilkanTeks(
        "cetakJenisKelamin",
        data.jenis_kelamin
    );

    tampilkanTeks(
        "cetakStatus",
        data.status
    );

    tampilkanTeks(
        "cetakCatatan",
        data.catatan_admin || "-"
    );

    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    tampilkanTeks("cetakTanggal", tanggalCetak);
    tampilkanTeks("tanggalTandaTangan", tanggalCetak);

    const statusBaru = document.getElementById("statusBaru");
    const catatanBaru = document.getElementById("catatanBaru");

    if (statusBaru) {
        statusBaru.value = daftarStatus.includes(data.status)
            ? data.status
            : daftarStatus[0];
    }

    if (catatanBaru) {
        catatanBaru.value = data.catatan_admin || "";
    }

    // Dokumen siswa
    await tampilkanDokumen(
        "fotoSiswa",
        data.pas_foto_path,
        "Foto Siswa"
    );

    await tampilkanDokumen(
        "dokumenKK",
        data.kk_path,
        "Kartu Keluarga"
    );

    await tampilkanDokumen(
        "dokumenIjazah",
        data.ijazah_path,
        "Ijazah"
    );

    await tampilkanDokumen(
        "dokumenAkta",
        data.akta_path,
        "Akta Kelahiran"
    );

    if (pesanDetail) {
        pesanDetail.textContent = "Data pendaftar berhasil dimuat.";
    }
}

// =============================================
// TAMPILKAN STATUS
// =============================================

function tampilkanStatus(status) {
    const elemenHeader = document.getElementById("statusPendaftaranHeader");
    const elemenPanel = document.getElementById("statusPendaftaran");

    [elemenHeader, elemenPanel].forEach(elemen => {
        if (!elemen) return;

        elemen.textContent = status || "-";
        elemen.className = "status";

        if (status === "Diterima") {
            elemen.classList.add("diterima");
        } else if (status === "Ditolak") {
            elemen.classList.add("ditolak");
        } else if (status === "Sedang Diproses") {
            elemen.classList.add("diproses");
        }
    });
}

// =============================================
// SIMPAN HASIL VERIFIKASI
// =============================================

if (formVerifikasi) {
    formVerifikasi.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!dataPendaftarAktif) {
            pesanVerifikasi.textContent =
                "Data pendaftar belum tersedia.";
            return;
        }

        const statusBaru =
            document.getElementById("statusBaru").value;

        const catatanBaru =
            document.getElementById("catatanBaru").value.trim();

        if (!daftarStatus.includes(statusBaru)) {
            pesanVerifikasi.textContent =
                "Status pendaftaran tidak valid.";
            return;
        }

        tombolSimpanVerifikasi.disabled = true;
        tombolSimpanVerifikasi.textContent = "Menyimpan...";

        pesanVerifikasi.textContent =
            "Sedang menyimpan hasil verifikasi...";

        try {
            const { data, error } = await supabaseClient
                .from("ppdb_pendaftar")
                .update({
                    status: statusBaru,
                    catatan_admin: catatanBaru
                })
                .eq("id", dataPendaftarAktif.id)
                .select("status, catatan_admin")
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data) {
                throw new Error(
                    "Data tidak ditemukan atau perubahan tidak tersimpan."
                );
            }

            // Perbarui data aktif
            dataPendaftarAktif.status = data.status;
            dataPendaftarAktif.catatan_admin = data.catatan_admin;

            // Perbarui tampilan halaman
            tampilkanStatus(data.status);
            tampilkanTeks("catatanAdmin", data.catatan_admin);
            // Perbarui bukti cetak setelah verifikasi disimpan
            tampilkanTeks("cetakStatus", data.status);
            tampilkanTeks("cetakCatatan", data.catatan_admin || "-");

            pesanVerifikasi.textContent =
                "Hasil verifikasi berhasil disimpan.";

        } catch (error) {
            console.error("Gagal menyimpan verifikasi:", error);

            pesanVerifikasi.textContent =
                "Gagal menyimpan verifikasi. Periksa koneksi dan hak akses admin.";
        } finally {
            tombolSimpanVerifikasi.disabled = false;
            tombolSimpanVerifikasi.textContent =
                "Simpan Verifikasi";
        }
    });
}

// =============================================
// JALANKAN PROGRAM
// =============================================

muatDetailPendaftar();
// =============================================
// CETAK BUKTI VERIFIKASI PPDB
// =============================================

const tombolCetakBukti = document.getElementById("tombolCetakBukti");

if (tombolCetakBukti) {
    tombolCetakBukti.addEventListener("click", function() {
        if (!dataPendaftarAktif) {
            alert("Data pendaftar belum tersedia.");
            return;
        }

        window.print();
    });
}
