
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

    newsGrid.replaceChildren();

    if (!data || data.length === 0) {
        newsGrid.textContent = "Belum ada berita yang diterbitkan.";
        return;
    }

    data.forEach((berita) => {
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

paragraph.textContent =
    berita.isi.length > 150
        ? berita.isi.substring(0, 150) + "..."
        : berita.isi;

// TOMBOL BACA SELENGKAPNYA
const tombolDetail = document.createElement("a");

tombolDetail.href =
    "berita-detail.html?id=" +
    encodeURIComponent(berita.id);

tombolDetail.textContent = "Baca Selengkapnya";

tombolDetail.className = "tombol-detail";

// MENAMPILKAN KONTEN
content.append(date, title, paragraph, tombolDetail);

card.appendChild(content);

newsGrid.appendChild(card);

    });
}

document.addEventListener("DOMContentLoaded", muatBeritaPublik);
