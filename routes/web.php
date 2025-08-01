<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\dashboard\dashboardController;
use Illuminate\Support\Facades\Route;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;


// Route::middleware('guest')->group(function () {
// });
Route::view('/',  'welcome')->name('welcome');
Route::view('/login', 'auth.login')->name('login');
Route::post('/loginpost', [LoginController::class, 'handleLogin'])->name('loginpost');
Route::view('/register', 'auth.register')->name('register');
Route::post('/registerpost', [LoginController::class, 'handleRegister'])->name('registerpost');

// Route::middleware('auth')->group(function () {
// });
Route::get('/dashboard', [dashboardController::class, 'index'])->name('dashboard');
Route::get('/logout', [LoginController::class, 'logout'])->name('logout');

