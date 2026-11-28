
/* ==========================================
   PPDB ONLINE
   SMA KATOLIK 1 KABANJAHE
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("ppdbForm");
    const tombol = document.getElementById("submitPPDB");
    const pesan = document.getElementById("ppdbMessage");

    if (!form || !tombol || !pesan) {
        console.error("Elemen formulir PPDB tidak ditemukan.");
        return;
    }

    // Memastikan koneksi Supabase tersedia
    if (typeof supabaseClient === "undefined") {
        pesan.textContent = "Koneksi database belum tersedia.";
        return;
    }

    const db = supabaseClient;
    const bucket = "ppdb-dokumen";
    const batasUkuran = 5 * 1024 * 1024;

    // =====================================
    // FUNGSI PESAN
    // =====================================

    function tampilkanPesan(teks, berhasil = false) {
        pesan.textContent = teks;
        pesan.style.color = berhasil ? "#16803c" : "#c62828";
    }

    // =====================================
    // VALIDASI DOKUMEN
    // =====================================

    function validasiFile(file, nama, khususFoto = false) {

        if (!file) {
            throw new Error(nama + " wajib diunggah.");
        }

        if (file.size > batasUkuran) {
            throw new Error(nama + " melebihi batas 5 MB.");
        }

        const tipeDiizinkan = khususFoto
            ? ["image/jpeg", "image/png"]
            : [
                "image/jpeg",
                "image/png",
                "application/pdf"
            ];

        if (!tipeDiizinkan.includes(file.type)) {
            throw new Error(
                "Format " + nama + " tidak diperbolehkan."
            );
        }

        return file;
    }

    // =====================================
    // UPLOAD DOKUMEN
    // =====================================

    async function uploadDokumen(file, namaFolder, idPendaftaran) {

        const ekstensi = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "application/pdf": "pdf"
        };

        const ext = ekstensi[file.type];

        if (!ext) {
            throw new Error("Format dokumen tidak valid.");
        }

        const lokasi =
            "berkas/" +
            idPendaftaran +
            "/" +
            namaFolder +
            "." +
            ext;

        const { data, error } = await db
            .storage
            .from(bucket)
            .upload(lokasi, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type
            });

        if (error) {
            throw new Error(
                "Upload " + namaFolder + " gagal: " + error.message
            );
        }

        return data.path;
    }

    // =====================================
    // PROSES PENDAFTARAN
    // =====================================

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        tombol.disabled = true;
        tombol.textContent = "SEDANG MENGIRIM...";
        tampilkanPesan("Mohon tunggu, data sedang diproses.");

        let berhasil = false;

        try {

            // 1. Ambil data formulir

            const nama = form.elements["nama_lengkap"].value.trim();
            const nisn = form.elements["nisn"].value.trim();
            const hpSiswa = form.elements["no_hp_siswa"].value.trim();
            const tempat = form.elements["tempat_lahir"].value.trim();
            const tanggal = form.elements["tanggal_lahir"].value;
            const jk = form.elements["jenis_kelamin"].value;
            const alamat = form.elements["alamat"].value.trim();
            const asal = form.elements["asal_sekolah"].value.trim();
            const tahun = Number(form.elements["tahun_lulus"].value);
            const ortu = form.elements["nama_ortu"].value.trim();
            const hp = form.elements["no_hp_ortu"].value.trim();
            const email = form.elements["email"].value.trim();

            // 2. Validasi data

            if (!/^[0-9]{10}$/.test(nisn)) {
                throw new Error("NISN harus terdiri dari 10 angka.");
            }

            if (!nama || !tempat || !tanggal ||
                !alamat || !asal || !ortu || !hp) {
                throw new Error("Lengkapi seluruh data wajib.");
            }

            if (!["Laki-laki", "Perempuan"].includes(jk)) {
                throw new Error("Jenis kelamin tidak valid.");
            }

            if (!Number.isInteger(tahun) ||
                tahun < 2020 || tahun > 2035) {
                throw new Error("Tahun lulus tidak valid.");
            }

            const tanggalLahir = new Date(tanggal + "T00:00:00");

            if (Number.isNaN(tanggalLahir.getTime()) ||
                tanggalLahir >= new Date()) {
                throw new Error("Tanggal lahir tidak valid.");
            }

            if (!/^[0-9+\- ]{8,25}$/.test(hp)) {
                throw new Error("Nomor HP orang tua tidak valid.");
            }
           // Validasi nomor HP siswa jika diisi
if (hpSiswa && !/^[0-9+\- ]{8,25}$/.test(hpSiswa)) {
    throw new Error("Nomor HP siswa tidak valid.");
}

            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error("Alamat email tidak valid.");
            }

            // 3. Ambil dan validasi dokumen

            const foto = validasiFile(
                form.elements["pas_foto"].files[0],
                "Pas foto",
                true
            );

            const kk = validasiFile(
                form.elements["kk"].files[0],
                "Kartu Keluarga"
            );

            const ijazah = validasiFile(
                form.elements["ijazah"].files[0],
                "Ijazah / SKL"
            );

            const akta = validasiFile(
                form.elements["akta"].files[0],
                "Akta Kelahiran"
            );

            // 4. Buat ID folder unik

            const idPendaftaran = crypto.randomUUID();

            // 5. Upload dokumen ke Storage privat

            tampilkanPesan("1/2 Mengunggah dokumen...");

            const pathFoto = await uploadDokumen(
                foto, "pas-foto", idPendaftaran
            );

            const pathKK = await uploadDokumen(
                kk, "kartu-keluarga", idPendaftaran
            );

            const pathIjazah = await uploadDokumen(
                ijazah, "ijazah", idPendaftaran
            );

            const pathAkta = await uploadDokumen(
                akta, "akta-kelahiran", idPendaftaran
            );

            // 6. Siapkan data untuk database

            const dataPendaftaran = {
                nama_lengkap: nama,
                nisn: nisn,
               no_hp_siswa: hpSiswa || null,
                tempat_lahir: tempat,
                tanggal_lahir: tanggal,
                jenis_kelamin: jk,
                alamat: alamat,
                asal_sekolah: asal,
                tahun_lulus: tahun,
                nama_ortu: ortu,
                no_hp_ortu: hp,
                email: email || null,

                pas_foto_path: pathFoto,
                kk_path: pathKK,
                ijazah_path: pathIjazah,
                akta_path: pathAkta
            };

            // 7. Simpan melalui fungsi RPC

            tampilkanPesan("2/2 Menyimpan data pendaftaran...");

            const { data, error } = await db.rpc(
                "daftar_ppdb",
                {
                    p_data: dataPendaftaran
                }
            );

            if (error) {
                throw new Error(error.message);
            }

            if (typeof data !== "string" ||
                !/^PPDB-\d{4}-[A-F0-9]{8}$/.test(data)) {
                throw new Error("Nomor pendaftaran tidak valid.");
            }

           
            // 8. Tampilkan bukti pendaftaran
            berhasil = true;
            form.hidden = true;

            const bukti = document.createElement("div");
            bukti.className = "bukti-pendaftaran";

            const judul = document.createElement("h2");
            judul.textContent = "SMA KATOLIK 1 KABANJAHE";

            const subjudul = document.createElement("h3");
            subjudul.textContent = "BUKTI PENDAFTARAN PPDB ONLINE";

            const garis = document.createElement("div");
            garis.className = "garis";

            const keterangan = document.createElement("p");
            keterangan.textContent =
                "Pendaftaran calon peserta didik berhasil dikirim.";

            const nomor = document.createElement("p");
            nomor.textContent = "Nomor Pendaftaran: " + data;

            const namaSiswa = document.createElement("p");
            namaSiswa.textContent = "Nama Calon Siswa: " + nama;

            const asalSekolah = document.createElement("p");
            asalSekolah.textContent = "Asal Sekolah: " + asal;

            const tanggalDaftar = document.createElement("p");
            tanggalDaftar.textContent =
                "Tanggal Pendaftaran: " +
                new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                });

            const status = document.createElement("p");
            status.textContent = "Status: Menunggu Verifikasi";

            const catatan = document.createElement("p");
            catatan.textContent =
                "Simpan bukti ini sebagai tanda bahwa pendaftaran telah dikirim. " +
                "Bukti pendaftaran bukan merupakan tanda bahwa calon siswa telah diterima.";

            const tombolCetak = document.createElement("button");
            tombolCetak.type = "button";
            tombolCetak.textContent = "CETAK BUKTI PENDAFTARAN";
            tombolCetak.className = "btn";

            tombolCetak.addEventListener("click", function () {
                window.print();
            });

            bukti.append(
                judul,
                subjudul,
                garis,
                keterangan,
                nomor,
                namaSiswa,
                asalSekolah,
                tanggalDaftar,
                status,
                catatan,
                tombolCetak
            );

            form.parentNode.appendChild(bukti);

            tampilkanPesan("Pendaftaran berhasil dikirim.", true);

        } catch (error) {

            console.error("Kesalahan PPDB:", error);

            tampilkanPesan(
                "Pendaftaran belum berhasil: " + error.message
            );

        } finally {

            if (!berhasil) {
                tombol.disabled = false;
                tombol.textContent = "KIRIM PENDAFTARAN";
            }

        }

    });

});
