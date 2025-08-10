// js/riwayat.js
// Proteksi: hanya user login yang bisa akses riwayat
if (!localStorage.getItem('isLoggedIn')) {
  window.location.href = 'login-page.html';
}

// Render tombol login/logout di navbar
function renderAuthButton() {
  const authBtnContainer = document.getElementById('authBtnContainer');
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
document.addEventListener('loginStatusChanged', renderAuthButton);
renderAuthButton();

// Ambil dan tampilkan riwayat scan user
async function loadRiwayat() {
  const riwayatContainer = document.querySelector('.scan-form');
  riwayatContainer.innerHTML = '<p class="text-green-900 text-center">Memuat riwayat scan...</p>';
  
  try {
    // Get token from localStorage
    const token = localStorage.getItem('pharmalens_token');
    if (!token) {
      riwayatContainer.innerHTML = '<p class="text-red-700 text-center">Token tidak ditemukan. Silakan login ulang.</p>';
      return;
    }

    const res = await fetch('http://localhost:5000/riwayat', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (res.status === 401) {
      riwayatContainer.innerHTML = '<p class="text-red-700 text-center">Session berakhir. <a href="login-page.html" class="underline">Login ulang</a></p>';
      localStorage.removeItem('pharmalens_token');
      return;
    }

    if (!res.ok) throw new Error('Gagal mengambil data riwayat');
    
    const data = await res.json();
    console.log('Riwayat data:', data);

    if (data.riwayat && data.riwayat.length > 0) {
      // Statistik Mini
      let totalScan = data.riwayat.length;
      let today = new Date().toLocaleDateString('id-ID');
      let todayScan = data.riwayat.filter(item => item.scanned_at && new Date(item.scanned_at).toLocaleDateString('id-ID') === today).length;
      let drugCounts = {};
      data.riwayat.forEach(item => { drugCounts[item.drug_name] = (drugCounts[item.drug_name]||0)+1; });
      let favoriteDrug = Object.entries(drugCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-';
      riwayatContainer.innerHTML = `
        <div class="w-full">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 mb-7">
            <div class="stat-card bg-gradient-to-br from-green-300 via-emerald-200 to-cyan-200 border-emerald-200"><div class="icon bg-gradient-to-tr from-green-400 to-cyan-40"><i class="fas fa-pills"></i></div><div><p class="text-xs text-black">Total Scan</p><p class="font-bold text-xl">${totalScan}</p></div></div>
            <div class="stat-card bg-gradient-to-br from-yellow-100 via-yellow-300 to-cyan-100 border-yellow-200"><div class="icon bg-gradient-to-tr from-yellow-300 to-green-300"><i class="fas fa-calendar-day"></i></div><div><p class="text-xs text-black">Scan Hari Ini</p><p class="font-bold text-xl">${todayScan}</p></div></div>
            <div class="stat-card bg-gradient-to-br from-pink-100 via-pink-200 to-cyan-100 border-pink-200"><div class="icon bg-gradient-to-tr from-pink-400 to-cyan-400"><i class="fas fa-star"></i></div><div><p class="text-xs text-black">Obat Favorit</p><p class="font-bold text-base truncate">${favoriteDrug}</p></div></div>
          </div>
          <h2 class=" text-2xl font-extrabold bg-gradient-to-r from-green-400 via-cyan-400 to-yellow-400 bg-clip-text text-center mb-7 animate-fadeInUp text-black">Riwayat Scan Anda</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10 max-h-[440px] overflow-y-auto custom-scrollbar pr-2">
            ${data.riwayat.map((item, idx) => `
              <div class="glass-card group gap-4 p-5 rounded-2xl shadow-xl border-2 border-cyan-200 " style="animation-delay:${idx*0.04}s">
                ${item.image_path ? `
                  <div class="grid group items-center justify-center">
                    <img src="http://localhost:5000/${item.image_path}"
                         alt="Gambar obat ${item.drug_name}"
                         class="gambar-riwayat mx-auto rounded-xl border-2 border-cyan-300 shadow-md transition-transform duration-300 group-hover:shadow-2xl bg-white"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-2 border-gray-300 flex items-center justify-center text-gray-500 text-sm" style="display:none;">
                      <div class="text-center">
                        <i class="fas fa-image text-2xl mb-1"></i>
                        <p class="text-xs">Gambar tidak tersedia</p>
                      </div>
                    </div>
                  </div>
                ` : `
                  <div class="flex-shrink-0 w-24 h-24 aspect-square flex items-center justify-center bg-gradient-to-br from-cyan-100 to-green-100 rounded-xl border-2 border-gray-300">
                    <div class="text-center">
                      <i class="fas fa-pills text-2xl mb-1 text-cyan-400"></i>
                      <p class="text-xs text-gray-500">No Image</p>
                    </div>
                  </div>
                `}
                <div class="flex-1 min-w-0 flex flex-col justify-between mt-10">
                  <div class="flex flex-col gap-1">
                  <span class=" flex items-center text-xs text-cyan-700  py-1 rounded-full"><i class="fas fa-clock mr-1"></i>${item.scanned_at ? new Date(item.scanned_at).toLocaleString('id-ID', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'N/A'}</span>
                    <div class="flex items-center gap-2 mb-1">
                      <h3 class="font-extrabold text-base md:text-lg  text-black">${item.drug_name}</h3>
                    </div>
                    <div class="text-xs md:text-sm mb-1">
                      ${item.benefit || '<span class="text-gray-400">Tidak ada informasi manfaat tersedia untuk obat ini.</span>'}
                    </div>
                  </div>
                 
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <style>
          .stat-card {
            @apply flex items-center gap-3 bg-white/80 rounded-xl p-3 shadow border border-cyan-100;
          }
          .stat-card .icon {
            @apply w-10 h-10 flex items-center justify-center rounded-full text-white text-lg shadow-md mr-2;
          }
          .glass-card {
            backdrop-filter: blur(10px);
            background: rgba(255,255,255,0.18);
            border: 1.5px solid rgba(255,255,255,0.25);
            box-shadow: 0 8px 32px 0 rgba(31,38,135,0.10);
            transition: box-shadow 0.2s, transform 0.2s;
          }
          .gambar-riwayat {
              width: 80%;
              border: white;
              height: 250px;
        
          }
          .glass-card:hover {
            box-shadow: 0 16px 48px 0 rgba(31,38,135,0.18);
            transform: translateY(-4px) scale(1.015);
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(120deg, #43e97b 0%, #38f9d7 100%);
            border-radius: 6px;
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.65s cubic-bezier(.39,.575,.56,1.000) both;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          .animate-bounce-slow { animation: bounce-slow 2.5s infinite; }
          .detail-btn:active { filter: brightness(0.92); }
        </style>
      `;
    } else {
      riwayatContainer.innerHTML = `
        <div class="text-center">
          <img src="./img/history-scan.svg" alt="undraw.co" class="md:w-[150px] w-[120px] mx-auto mb-4">
          <p class="text-green-900 text-lg">Belum ada riwayat scan</p>
          <p class="text-white text-2xl  mt-2">Mulai scan obat untuk melihat riwayat di sini</p>
          <a href="scan.html" class="inline-block mt-4 bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
            Mulai Scan
          </a>
        </div>
      `;
    }
  } catch (err) {
    console.error('Error loading riwayat:', err);
    riwayatContainer.innerHTML = `
      <div class="text-center">
        <p class="text-red-700 mb-4">Error: ${err.message}</p>
        <button onclick="loadRiwayat()" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-lg">
          Coba Lagi
        </button>
      </div>
    `;
  }
}
document.addEventListener('DOMContentLoaded', loadRiwayat);
