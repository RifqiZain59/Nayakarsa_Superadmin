<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->route('superadmin.dashboard');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function showRegister()
    {
        return view('auth.register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'user',
        ]);

        return redirect()->route('login')->with('registered', true);
    }

    /**
     * Receive Firebase ID token + real user info from frontend.
     * Creates or updates the local Laravel user record with the real name/email.
     */
    public function firebaseLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name'  => 'nullable|string|max:255',
            'uid'   => 'nullable|string',
        ]);

        $email = $request->input('email');
        $uid   = $request->input('uid', '');
        // Use real displayName; fallback to email prefix only if truly empty
        $name  = trim($request->input('name', ''));
        if (empty($name) || $name === 'Firebase User') {
            $name = explode('@', $email)[0];
        }

        // Try find by firebase_uid first, then by email
        $user = User::where('firebase_uid', $uid)->first()
             ?? User::where('email', $email)->first();

        if ($user) {
            // Always sync latest name & uid from Firebase
            $user->update([
                'name'        => $name,
                'firebase_uid'=> $uid,
                'role'        => 'superadmin', // Panel ini khusus superadmin
            ]);
        } else {
            $user = User::create([
                'name'         => $name,
                'email'        => $email,
                'password'     => Hash::make($uid . now()->timestamp),
                'role'         => 'superadmin', // Panel ini khusus superadmin
                'firebase_uid' => $uid,
            ]);
        }

        Auth::login($user);

        return response()->json(['success' => true, 'role' => $user->role, 'name' => $user->name]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
