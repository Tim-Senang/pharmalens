<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\dashboard\dashboardController;
use App\Http\Controllers\Fitur\FiturController;
use Illuminate\Support\Facades\Route;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;


// Route::middleware('guest')->group(function () {
// });
Route::view('/login', 'auth.login')->name('login');
Route::post('/loginpost', [LoginController::class, 'handleLogin'])->name('loginpost');
Route::post('/registerpost', [LoginController::class, 'handleRegister'])->name('registerpost');

// Route::middleware('auth')->group(function () {
// });
Route::view('/',  'welcome')->name('welcome');
Route::get('/scan', [FiturController::class, 'scan'])->name('scan');
Route::get('/riwayat', [FiturController::class, 'riwayat'])->name('riwayat');
Route::get('/logout', [LoginController::class, 'logout'])->name('logout');


