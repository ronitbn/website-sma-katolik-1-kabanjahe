
/* ==========================================
   WEBSITE SMA KATOLIK 1 KABANJAHE
   Yayasan Perguruan Katolik Don Bosko
========================================== */

// 1. JAM DIGITAL
function updateClock() {
    const clock = document.getElementById("digitalClock");

    if (!clock) return;

    const now = new Date();

    clock.textContent = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

setInterval(updateClock, 1000);
updateClock();


// 2. TANGGAL HARI INI
function updateDate() {
    const dateElement = document.getElementById("todayDate");

    if (!dateElement) return;

    dateElement.textContent = new Date().toLocaleDateString(
        "id-ID",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

updateDate();


// 3. MENU MOBILE
function toggleMenu() {
    const menu = document.getElementById("navMenu");

    if (menu) {
        menu.classList.toggle("active");
    }
}


// 4. MENUTUP MENU SETELAH DIKLIK
document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", function () {
        const menu = document.getElementById("navMenu");

        if (menu) {
            menu.classList.remove("active");
        }
    });
});


// 5. PENCARIAN BERITA
function searchNews() {
    const input = document.getElementById("searchInput");

    if (!input) return;

    const keyword = input.value.toLowerCase();

    const newsCards = document.querySelectorAll(".news-card");

    newsCards.forEach(card => {
        const content = card.textContent.toLowerCase();

        card.style.display = content.includes(keyword)
            ? "block"
            : "none";
    });
}


// 6. GALERI FOTO
function openGallery(imageSource) {
    const modal = document.getElementById("galleryModal");
    const modalImage = document.getElementById("modalImage");

    if (modal && modalImage) {
        modalImage.src = imageSource;
        modal.style.display = "flex";
    }
}

function closeGallery() {
    const modal = document.getElementById("galleryModal");

    if (modal) {
        modal.style.display = "none";
    }
}


// 7. TOMBOL KEMBALI KE ATAS
window.addEventListener("scroll", function () {
    const button = document.getElementById("backToTop");

    if (!button) return;

    button.style.display = window.scrollY > 300
        ? "block"
        : "none";
});

function backToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// 8. ANIMASI SAAT HALAMAN DIBUKA
document.addEventListener("DOMContentLoaded", function () {

    const elements = document.querySelectorAll(".card");

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }

            });

        }, {
            threshold: 0.15
        });

        elements.forEach(element => {
            observer.observe(element);
        });

    } else {
        elements.forEach(element => {
            element.classList.add("show");
        });
    }

});


// 9. TAHUN OTOMATIS PADA FOOTER
function updateYear() {
    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }
}

updateYear();


// 10. FORM KONTAK
function sendContact() {

    const name = document.getElementById("contactName");
    const message = document.getElementById("contactMessage");

    if (!name || !message) return;

    if (name.value.trim() === "" ||
        message.value.trim() === "") {

        alert("Silakan isi nama dan pesan terlebih dahulu!");
        return;
    }

    const email = "smark1kj@gmail.com";

    const subject = encodeURIComponent(
        "Pesan dari Website SMA Katolik 1 Kabanjahe"
    );

    const body = encodeURIComponent(
        "Nama: " + name.value +
        "\n\nPesan:\n" + message.value
    );

    window.location.href =
        "mailto:" + email +
        "?subject=" + subject +
        "&body=" + body;
}


// 11. NOTIFIKASI SELAMAT DATANG
console.log(
    "Selamat datang di Website SMA Katolik 1 Kabanjahe!"
);
