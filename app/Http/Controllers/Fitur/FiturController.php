<?php

namespace App\Http\Controllers\Fitur;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FiturController extends Controller
{
    public function scan() {
        return view('fitur.scan');
    }
    public function riwayat() {
        return view('fitur.riwayat');
    }
}
