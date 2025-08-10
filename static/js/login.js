// Notifikasi Login/Registrasi
function showLoginNotif(message, isSuccess) {
  showNotif(message, isSuccess ? 'success' : 'error');
}


// Login dan Registrasi
const container = document.querySelector(".container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});
console.log("Register Button:", registerBtn);
console.log("Login Button:", loginBtn);

// LOGIN LOGIC
const loginForm = document.querySelector('.form-box.login form');
const loginUsername = loginForm.querySelector('input[type="text"]');
const loginPassword = loginForm.querySelector('input[type="password"]');

// REGISTRASI LOGIC
const registerForm = document.querySelector('.form-box.register form');
const registerUsername = registerForm.querySelector('input[type="text"]');
const registerPassword = registerForm.querySelector('input[type="password"]');

registerForm.addEventListener('submit', function(e) {
  e.preventDefault();
  fetch('http://localhost:5000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: registerUsername.value,
      password: registerPassword.value
    })
  })
    .then(res => res.json())
    .then(res => {
      if (res.message) {
        showLoginNotif('Registrasi berhasil! Silakan login.', true);
        document.querySelector('.container').classList.remove('active');
      } else {
        showLoginNotif(res.error || 'Registrasi gagal', false);
      }
    })
    .catch(() => showLoginNotif('Gagal terhubung ke server', false));
});

loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      username: loginUsername.value,
      password: loginPassword.value
    })
  })
    .then(res => res.json())
    .then(res => {
      if (res.message === 'Login berhasil') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', res.username);
        localStorage.setItem('role', res.role);
        localStorage.setItem('pharmalens_token', res.token);  // Store token
        console.log('Login success - Token stored:', res.token);
        showLoginNotif('Login berhasil! Selamat datang.', true);
        setTimeout(()=>{ window.location.href = 'index.html'; }, 1800);
      } else {
        showLoginNotif('Login gagal, cek username/password.', false);
      }
    })
    .catch(() => showLoginNotif('Gagal terhubung ke server', false));
});
