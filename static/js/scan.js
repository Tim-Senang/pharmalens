// Script khusus halaman scan.html
// Pastikan tidak ada deklarasi variabel yang sama dengan script.js

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in (localStorage)
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = 'login-page.html';
    return;
  }

  const uploadInput = document.getElementById('upload');
  const previewImg = document.getElementById('preview');
  const scanBtn = document.getElementById('scanBtn');
  const aiExplanation = document.getElementById('aiExplanation');
  const manualSearchInput = document.getElementById('manualSearch');
  const searchButton = document.getElementById('searchButton');

  if (uploadInput && previewImg) {
    uploadInput.addEventListener('change', function() {
      // Hapus hasil scan lama saat upload gambar baru
      localStorage.removeItem('scanResult');
      localStorage.removeItem('scanImg');
      const file = this.files[0];
      if (file) {
        previewImg.src = URL.createObjectURL(file);
        previewImg.classList.remove('hidden');
        aiExplanation.textContent = 'Silakan klik Scan untuk memproses gambar.';
      }
    });
  }

  if (scanBtn) {
    scanBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      const file = uploadInput.files[0];
      if (!file) return;
      
      // Test session dulu sebelum scan
      aiExplanation.innerHTML = `<span class='loader'></span> <span style='font-size:14px;'>Mengecek session...</span>`;
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('pharmalens_token');
        if (!token) {
          aiExplanation.innerHTML = '<b>Token tidak ditemukan.</b><br><br>Silakan <a href="login-page.html" style="color: #16a34a; text-decoration: underline;">login kembali</a> untuk menggunakan fitur scan.';
          return;
        }
        
        // Cek session dengan token
        const sessionResponse = await fetch('http://localhost:5000/session-check', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        });
        const sessionData = await sessionResponse.json();
        console.log('Session check before scan:', sessionData);
        
        if (!sessionData.logged_in) {
          aiExplanation.innerHTML = '<b>Session tidak valid.</b><br><br>Silakan <a href="login-page.html" style="color: #16a34a; text-decoration: underline;">login kembali</a> untuk menggunakan fitur scan.';
          localStorage.removeItem('pharmalens_token');
          return;
        }
        
        // Jika session valid, lanjut scan
        aiExplanation.innerHTML = `<span class='loader'></span> <span style='font-size:14px;'>Memproses gambar & penjelasan AI...</span>`;
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('http://localhost:5000/predict', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include',
        });
        
        if (response.status === 401) {
          aiExplanation.innerHTML = '<b>Sesi login telah berakhir.</b><br><br>Silakan <a href="login-page.html" style="color: #16a34a; text-decoration: underline;">login kembali</a> untuk menggunakan fitur scan.';
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('username');
          return;
        }
        
        const result = await response.json();
        if (result && result.prediction) {
          aiExplanation.innerHTML = `<b>${result.prediction}</b><br><br><b>Manfaat Obat:</b><br>${result.manfaat}`;
          // Simpan hasil scan dan gambar ke localStorage
          localStorage.setItem('scanResult', JSON.stringify(result));
          localStorage.setItem('scanImg', previewImg.src);
        } else {
          aiExplanation.textContent = 'Gambar tidak terbaca. Silakan gunakan pencarian manual.';
        }
      } catch (error) {
        console.error('Scan error:', error);
        aiExplanation.textContent = 'Terjadi kesalahan saat mengirim gambar.';
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', function () {
      const keyword = manualSearchInput.value.trim();
      if (!keyword) return;
      aiExplanation.innerHTML = `<span class='loader'></span> <span style='font-size:14px;'>Mencari Manfaat Obat...</span>`;
      fetch('http://localhost:5000/manfaat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama_obat: keyword })
      })
        .then(response => response.json())
        .then(result => {
          if (result && result.manfaat) {
            aiExplanation.innerHTML = `<b>Penjelasan AI untuk ${keyword}:</b><br><br>${result.manfaat}`;
          } else {
            aiExplanation.textContent = 'Obat tidak ditemukan atau terjadi kesalahan.';
          }
        })
        .catch(error => {
          aiExplanation.textContent = 'Terjadi kesalahan saat mengambil penjelasan AI.';
        });
    });
  }
});

// Tampilkan hasil scan terakhir jika ada
const lastScan = localStorage.getItem('scanResult');
const lastImg = localStorage.getItem('scanImg');
if (lastScan) {
  const data = JSON.parse(lastScan);
  aiExplanation.innerHTML = `<b>${data.prediction}</b><br><br><b>Manfaat Obat:</b><br>${data.manfaat}`;
  if (lastImg) {
    previewImg.src = lastImg;
    previewImg.classList.remove('hidden');
  }
}
