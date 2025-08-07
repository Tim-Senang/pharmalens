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

    explanation.textContent = "Memproses gambar...";
    manualSearchContainer.classList.add("hidden");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result && result.prediction) {
        explanation.textContent = result.prediction;
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

    // Simulasi database
    const dummyDatabase = {
      "paracetamol": "Paracetamol adalah obat untuk menurunkan demam dan meredakan nyeri.",
      "amoxicillin": "Amoxicillin adalah antibiotik untuk mengobati infeksi bakteri.",
      "ibuprofen": "Ibuprofen digunakan untuk mengurangi peradangan dan nyeri."
    };

    const result = dummyDatabase[keyword.toLowerCase()];
    explanation.textContent = result || "Obat tidak ditemukan dalam database.";
  });
