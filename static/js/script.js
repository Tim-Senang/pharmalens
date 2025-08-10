// Proteksi: index.html selalu bisa diakses
// Tapi fitur scan & riwayat hanya muncul jika login

document.addEventListener('DOMContentLoaded', function() {
  // Navbar: tampilkan link scan/riwayat jika login
  const scanNavLink = document.getElementById('scanNavLink');
  const riwayatNavLink = document.getElementById('riwayatNavLink');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (scanNavLink) scanNavLink.style.display = isLoggedIn ? '' : 'none';
  if (riwayatNavLink) riwayatNavLink.style.display = isLoggedIn ? '' : 'none';
  // Sembunyikan section scan dan riwayat jika belum login
  const scanSection = document.getElementById('scan');
  const riwayatSection = document.getElementById('riwayat');
  if (!isLoggedIn) {
    if (scanSection) scanSection.style.display = 'none';
    if (riwayatSection) riwayatSection.style.display = 'none';
  } else {
    if (scanSection) scanSection.style.display = '';
    if (riwayatSection) riwayatSection.style.display = '';
  }
});


// Tombol Login/Logout dinamis di navbar
const authBtnContainer = document.getElementById('authBtnContainer');
function renderAuthButton() {
  if (!authBtnContainer) return;
  const username = localStorage.getItem('username');
  if (localStorage.getItem('isLoggedIn')) {
    authBtnContainer.innerHTML = `<span class='mr-2 font-semibold text-green-800'>👤 ${username || ''}</span><button id="logoutBtn" class="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-xl ml-2">Logout</button>`;
    document.getElementById('logoutBtn').onclick = function() {
      logout();
    };
  } else {
    authBtnContainer.innerHTML = `<a href="login-page.html" class="bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded-xl ml-2">Login</a>`;
  }
}

// Agar update otomatis saat login/logout
document.addEventListener('loginStatusChanged', renderAuthButton);
renderAuthButton();

// Fungsi logout global
function logout() {
  fetch('http://localhost:5000/logout', {
    method: 'POST',
    credentials: 'include',
  })
    .then(() => {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('scanResult');
      localStorage.removeItem('scanImg');
      document.dispatchEvent(new Event('loginStatusChanged'));
      window.location.href = 'login-page.html';
    });
}
window.logout = logout;


// Landing Page
const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle('is-active');

    menu.classList.toggle("menu-active");
});

window.addEventListener("scroll", () => {
    hamburger.classList.remove("is-active");
    menu.classList.remove("menu-active");
})

// Scan Obat
  const uploadInput = document.getElementById("upload");
  const previewImg = document.getElementById("preview");
  const explanation = document.getElementById("aiExplanation");
  const uploadForm = document.getElementById("uploadForm");
  const manualSearchContainer = document.getElementById("manualSearchContainer");
  const manualSearchInput = document.getElementById("manualSearch");
  const searchButton = document.getElementById("searchButton");

  // Reset manual search dan hasil saat gambar dipilih
  uploadInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      previewImg.src = URL.createObjectURL(file);
      previewImg.classList.remove("hidden");
      explanation.textContent = "Silakan klik Scan untuk memproses gambar.";
    }

    // 🔁 Reset manual search
    manualSearchInput.value = "";
    manualSearchContainer.classList.add("hidden");
  });

  // Submit form untuk scan gambar
  uploadForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const file = uploadInput.files[0];
    if (!file) return;

    explanation.innerHTML = `<span class='loader'></span> <span style='font-size:14px;'>Memproses gambar & penjelasan AI...</span>`;
    manualSearchContainer.classList.add("hidden");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem('pharmalens_token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: headers,
        body: formData,
        credentials: 'include',
      });
      const result = await response.json();

      if (result && result.prediction) {
        explanation.innerHTML = `<b>${result.prediction}</b><br><br><b>Manfaat Obat:</b><br>${result.manfaat}`;
      } else {
        explanation.textContent = "Gambar tidak terbaca. Silakan gunakan pencarian manual.";
        manualSearchContainer.classList.remove("hidden");
      }
    } catch (error) {
      console.error(error);
      explanation.textContent = "Terjadi kesalahan saat mengirim gambar.";
      manualSearchContainer.classList.remove("hidden");
    }
  });

  // Pencarian manual
  searchButton.addEventListener("click", function () {
    const keyword = manualSearchInput.value.trim();
    if (!keyword) return;

    // 🔁 Reset upload gambar
    uploadInput.value = "";
    previewImg.src = "";
    previewImg.classList.add("hidden");

    // Panggil backend Flask untuk penjelasan manfaat obat dari Cohere AI
    explanation.innerHTML = `<span class='loader'></span> <span style='font-size:14px;'>Mencari Manfaat Obat...</span>`;
    fetch("http://localhost:5000/manfaat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_obat: keyword })
    })
      .then(response => response.json())
      .then(result => {
        if (result && result.manfaat) {
          explanation.innerHTML = `<b>Penjelasan AI untuk ${keyword}:</b><br><br>${result.manfaat}`;
        } else {
          explanation.textContent = "Obat tidak ditemukan atau terjadi kesalahan.";
        }
      })
      .catch(error => {
        explanation.textContent = "Terjadi kesalahan saat mengambil penjelasan AI.";
      });
  });
