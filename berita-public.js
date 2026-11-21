
// =====================================
// BERITA PUBLIK SEKOLAH
// SMA SWASTA KATOLIK 1 KABANJAHE
// =====================================

let semuaBerita = [];

// =====================================
// MEMUAT BERITA DARI SUPABASE
// =====================================

async function muatBeritaPublik() {
    const newsGrid = document.getElementById("newsGrid");

    if (!newsGrid) return;

    newsGrid.textContent = "Memuat berita terbaru...";

    const { data, error } = await supabaseClient
        .from("berita")
        .select("id, judul, isi, gambar_url, created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (error) {
        newsGrid.textContent = "Berita belum dapat dimuat.";
        console.error("Gagal memuat berita:", error.message);
        return;
    }

    semuaBerita = data || [];

    tampilkanBerita(semuaBerita);
}

// =====================================
// MENAMPILKAN BERITA
// =====================================

function tampilkanBerita(daftarBerita) {
    const newsGrid = document.getElementById("newsGrid");

    if (!newsGrid) return;

    newsGrid.replaceChildren();

    if (daftarBerita.length === 0) {
        newsGrid.textContent = "Berita yang dicari tidak ditemukan.";
        return;
    }

    daftarBerita.forEach((berita) => {
        const card = document.createElement("article");
        card.className = "news-card";

        if (berita.gambar_url) {
            const img = document.createElement("img");
            img.src = berita.gambar_url;
            img.alt = berita.judul || "Foto berita sekolah";

            img.onerror = () => {
                img.style.display = "none";
            };

            card.appendChild(img);
        }

        const content = document.createElement("div");
        content.className = "news-content";

        const date = document.createElement("span");
        date.className = "news-date";

        date.textContent = berita.created_at
            ? new Date(berita.created_at).toLocaleDateString(
                "id-ID",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            )
            : "BERITA SEKOLAH";

        const title = document.createElement("h3");
        title.textContent = berita.judul;

        const paragraph = document.createElement("p");

        const isiBerita = berita.isi || "";

        paragraph.textContent =
            isiBerita.length > 150
                ? isiBerita.substring(0, 150) + "..."
                : isiBerita;

        const tombolDetail = document.createElement("a");

        tombolDetail.href =
            "berita-detail.html?id=" +
            encodeURIComponent(berita.id);

        tombolDetail.textContent = "Baca Selengkapnya";
        tombolDetail.className = "tombol-detail";

        content.append(date, title, paragraph, tombolDetail);

        card.appendChild(content);

        newsGrid.appendChild(card);
    });
}

// =====================================
// FUNGSI PENCARIAN BERITA
// =====================================

function cariBeritaSekolah() {
    const input = document.getElementById("cariBerita");

    if (!input) return;

    const kataKunci = input.value
        .trim()
        .toLowerCase();

    const hasilPencarian = semuaBerita.filter((berita) => {
        const judul = (berita.judul || "").toLowerCase();
        const isi = (berita.isi || "").toLowerCase();

        return (
            judul.includes(kataKunci) ||
            isi.includes(kataKunci)
        );
    });

    tampilkanBerita(hasilPencarian);
}

// =====================================
// MENJALANKAN PENCARIAN
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("cariBerita");
    const tombol = document.getElementById("tombolCariBerita");

    if (input) {
        input.addEventListener("input", cariBeritaSekolah);
    }

    if (tombol) {
        tombol.addEventListener("click", cariBeritaSekolah);
    }

    muatBeritaPublik();
});
