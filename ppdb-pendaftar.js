
// ==========================================
// DATA PENDAFTAR PPDB
// SMA SWASTA KATOLIK 1 KABANJAHE
// ==========================================

const daftarPendaftar =
    document.getElementById("daftarPendaftar");

const pesanPendaftar =
    document.getElementById("pesanPendaftar");

const cariPendaftar =
    document.getElementById("cariPendaftar");

const filterStatus =
    document.getElementById("filterStatus");

let semuaPendaftar = [];

// ==========================================
// MEMERIKSA LOGIN DAN HAK AKSES
// ==========================================

async function periksaAksesPendaftar() {
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
            alert("Anda tidak memiliki hak akses PPDB.");
            window.location.href = "login.html";
            return;
        }

        await muatDataPendaftar();

    } catch (error) {
        console.error("Pemeriksaan akses gagal:", error);

        pesanPendaftar.textContent =
            "Gagal memeriksa akses: " + error.message;
    }
}

// ==========================================
// MEMUAT DATA PENDAFTAR
// ==========================================

async function muatDataPendaftar() {

    daftarPendaftar.innerHTML =
        '<tr><td colspan="7">Memuat data pendaftar...</td></tr>';

    try {
        const { data, error } = await supabaseClient
            .from("ppdb_pendaftar")
            .select(`
                id,
                nomor_pendaftaran,
                nama_lengkap,
                asal_sekolah,
                status,
                created_at
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        semuaPendaftar = data || [];

        tampilkanPendaftar(semuaPendaftar);

        pesanPendaftar.textContent =
            "Jumlah pendaftar: " + semuaPendaftar.length;

    } catch (error) {
        console.error("Gagal memuat pendaftar:", error);

        daftarPendaftar.innerHTML = "";

        const baris = document.createElement("tr");
        const kolom = document.createElement("td");

        kolom.colSpan = 7;
        kolom.textContent =
            "Gagal memuat data: " + error.message;

        baris.appendChild(kolom);
        daftarPendaftar.appendChild(baris);
    }
}

// ==========================================
// MENAMPILKAN DATA PENDAFTAR
// ==========================================

function tampilkanPendaftar(data) {

    daftarPendaftar.replaceChildren();

    if (!data || data.length === 0) {

        const baris = document.createElement("tr");
        const kolom = document.createElement("td");

        kolom.colSpan = 7;
        kolom.textContent = "Belum ada data pendaftar.";

        baris.appendChild(kolom);
        daftarPendaftar.appendChild(baris);

        return;
    }

    data.forEach((pendaftar, index) => {

        const baris = document.createElement("tr");

        const tanggal = pendaftar.created_at
            ? new Date(pendaftar.created_at)
                .toLocaleDateString("id-ID")
            : "-";

        const kolom = [
            index + 1,
            pendaftar.nomor_pendaftaran || "-",
            pendaftar.nama_lengkap || "-",
            pendaftar.asal_sekolah || "-",
            tanggal
        ];

        kolom.forEach(nilai => {
            const td = document.createElement("td");
            td.textContent = nilai;
            baris.appendChild(td);
        });

        // STATUS
        const kolomStatus = document.createElement("td");
        const labelStatus = document.createElement("span");

        labelStatus.className = "status";
        labelStatus.textContent = pendaftar.status;

        if (pendaftar.status === "diterima") {
            labelStatus.classList.add("diterima");
        }

        if (pendaftar.status === "ditolak") {
            labelStatus.classList.add("ditolak");
        }

        kolomStatus.appendChild(labelStatus);
        baris.appendChild(kolomStatus);

        // TOMBOL DETAIL
        const kolomAksi = document.createElement("td");
        const tombolDetail = document.createElement("button");

        tombolDetail.type = "button";
        tombolDetail.className = "tombol-detail";
        tombolDetail.textContent = "Lihat Detail";

        tombolDetail.addEventListener("click", () => {
            window.location.href =
                "ppdb-detail.html?id=" +
                encodeURIComponent(pendaftar.id);
        });

        kolomAksi.appendChild(tombolDetail);
        baris.appendChild(kolomAksi);

        daftarPendaftar.appendChild(baris);
    });
}

// ==========================================
// PENCARIAN DAN FILTER
// ==========================================

function filterDataPendaftar() {

    const kataKunci =
        cariPendaftar.value.toLowerCase().trim();

    const statusDipilih = filterStatus.value;

    const hasil = semuaPendaftar.filter(pendaftar => {

        const cocokNama =
            (pendaftar.nama_lengkap || "")
                .toLowerCase()
                .includes(kataKunci);

        const cocokNomor =
            (pendaftar.nomor_pendaftaran || "")
                .toLowerCase()
                .includes(kataKunci);

        const cocokStatus =
            !statusDipilih ||
            pendaftar.status === statusDipilih;

        return (cocokNama || cocokNomor) && cocokStatus;
    });

    tampilkanPendaftar(hasil);

    pesanPendaftar.textContent =
        "Data ditemukan: " + hasil.length;
}

cariPendaftar.addEventListener(
    "input",
    filterDataPendaftar
);

filterStatus.addEventListener(
    "change",
    filterDataPendaftar
);

// ==========================================
// JALANKAN PROGRAM
// ==========================================

periksaAksesPendaftar();
