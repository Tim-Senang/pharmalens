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

document.getElementById("upload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    const preview = document.getElementById("preview");

    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.classList.remove("hidden");
    }
  });


  const form = document.getElementById("uploadForm");
  const aiExplanation = document.getElementById("aiExplanation");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("upload");
    const file = fileInput.files[0];

    if (!file) {
      aiExplanation.textContent = "Silakan pilih gambar terlebih dahulu.";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    aiExplanation.textContent = "Memproses gambar...";

    try {
      const response = await fetch("http://localhost:5000/detect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data && data.result) {
        aiExplanation.textContent = `Obat terdeteksi: ${data.result.nama_obat}. Manfaat: ${data.result.manfaat}`;
      } else {
        aiExplanation.textContent = "Tidak ada obat terdeteksi.";
      }
    } catch (err) {
      console.error(err);
      aiExplanation.textContent = "Gagal menghubungi server.";
    }
  })
