<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class LoginController extends Controller
{
    public function index(){
        return view('auth.login');
    }

    public function handleLogin(Request $request){
        $credentials = $request->validate([
            'email' =>'required|email',
            'password' => 'required'
        ], [
            'email.required' => 'Email is required',
            'email.email' => 'Invalid email format',
            'password.required' => 'Password is required'
        ]);
        if(Auth::attempt($credentials)){
            $request->session()->regenerate();
            return redirect()->route('dashboard');;
        }

        return back()->withErrors([
            'message' => 'Invalid credentials'
        ])->onlyInput('email');
        
       
    }

    public function register(){
        return view('auth.register');
    }
    public function handleRegister(Request $request)
    {
        $data = [
            'username' => request('username'),
            'name' => request('name'),
            'email' => request('email'),
            'password' => Hash::make(request('password')),
        ];

        User::create($data);

        session()->flash('berhasil', 'Register Berhasil');
        return redirect('/login');
    }
    public function logout(Request $request)
    {
        Auth::logout();
        return redirect('/')->with('success', 'Anda Berhasil Logout');
    }
}
