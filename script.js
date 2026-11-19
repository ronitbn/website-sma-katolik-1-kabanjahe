
// TAHUN OTOMATIS
document.getElementById("currentYear").textContent =
    new Date().getFullYear();

// MENU NAVIGASI HP
const menuToggle = document.getElementById("menuToggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", function () {
    navbar.classList.toggle("show");

    const isOpen = navbar.classList.contains("show");

    menuToggle.setAttribute("aria-expanded", isOpen);
    menuToggle.textContent = isOpen ? "✕" : "☰";
});

// MENUTUP MENU SETELAH DIKLIK
const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        navbar.classList.remove("show");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";

        navLinks.forEach(function (item) {
            item.classList.remove("active");
        });

        link.classList.add("active");
    });
});

// MENANDAI MENU SESUAI BAGIAN YANG DIBUKA
const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", function () {
    let current = "";

    sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 120;

        if (window.scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(function (link) {
        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});

// TOMBOL KEMBALI KE ATAS
const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
        backToTop.style.display = "block";
    } else {
        backToTop.style.display = "none";
    }
});

backToTop.addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// FORMULIR KONTAK
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const nama = document.getElementById("nama").value.trim();
    const email = document.getElementById("email").value.trim();
    const pesan = document.getElementById("pesan").value.trim();

    if (!nama || !email || !pesan) {
        alert("Mohon lengkapi semua data!");
        return;
    }

    const subject = encodeURIComponent(
        "Pesan Website SMA Katolik 1 Kabanjahe"
    );

    const body = encodeURIComponent(
        "Nama: " + nama +
        "\nEmail: " + email +
        "\n\nPesan:\n" + pesan
    );

    const mailto =
        "mailto:smark1kj@gmail.com?subject=" +
        subject + "&body=" + body;

    window.location.href = mailto;
});

// ===================================
// PEMERIKSAAN KONEKSI SUPABASE
// ===================================

(async function cekKoneksiSupabase() {
  try {
    if (typeof supabaseClient === "undefined") {
      throw new Error("Konfigurasi Supabase belum terbaca.");
    }

    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error) throw error;

    console.log("Supabase Client berhasil dimuat!");

    if (data.session) {
      console.log("Admin sudah memiliki sesi login.");
    } else {
      console.log("Supabase siap. Admin belum login.");
    }

  } catch (error) {
    console.error("Pemeriksaan Supabase gagal:", error.message);
  }
})();
