
// =====================================
// DETAIL BERITA SEKOLAH
// SMA SWASTA KATOLIK 1 KABANJAHE
// =====================================

async function tampilkanDetailBerita() {

    const detailBerita = document.getElementById("detailBerita");

    const parameter = new URLSearchParams(window.location.search);
    const idBerita = parameter.get("id");

    if (!idBerita) {
        detailBerita.textContent = "ID berita tidak ditemukan.";
        return;
    }

    const { data, error } = await supabaseClient
        .from("berita")
        .select("id, judul, isi, gambar_url, created_at")
        .eq("id", idBerita)
        .eq("status", "published")
        .maybeSingle();

    if (error) {
        console.error("Gagal mengambil berita:", error.message);
        detailBerita.textContent = "Gagal memuat berita.";
        return;
    }

    if (!data) {
        detailBerita.textContent = "Berita tidak ditemukan.";
        return;
    }

    detailBerita.replaceChildren();

    // JUDUL BERITA
    const judul = document.createElement("h1");
    judul.textContent = data.judul;

    // TANGGAL BERITA
    const tanggal = document.createElement("p");
    tanggal.className = "detail-tanggal";
    tanggal.textContent = new Date(data.created_at)
        .toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    // FOTO BERITA
    if (data.gambar_url) {
        const foto = document.createElement("img");
        foto.src = data.gambar_url;
        foto.alt = data.judul;
        foto.onerror = function() {
            foto.style.display = "none";
        };

        detailBerita.appendChild(foto);
    }

    // ISI BERITA
    const isi = document.createElement("div");
    isi.className = "detail-isi";
    isi.textContent = data.isi;

    detailBerita.append(judul, tanggal, isi);
}

// JALANKAN HALAMAN
document.addEventListener("DOMContentLoaded", tampilkanDetailBerita);
