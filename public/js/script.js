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
const fileInput = document.getElementById('upload');
    const aiExplanation = document.getElementById('aiExplanation');
    const preview = document.getElementById('preview');

    fileInput.addEventListener('change', function () {
      const file = fileInput.files[0];
      if (!file) {
        aiExplanation.textContent = 'Silakan unggah gambar untuk melihat hasil pembahasan.';
        preview.src = '';
        preview.classList.add('hidden');
        return;
      }

      // preview gambar
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);

      // Simulasi hasil AI
      const dummyText = "Gambar obat dikenali sebagai Paracetamol. Digunakan untuk meredakan nyeri dan menurunkan demam.";
      aiExplanation.textContent = dummyText;
    });








