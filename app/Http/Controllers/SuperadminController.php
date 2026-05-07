<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Subscription;
use App\Models\ActivityLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class SuperadminController extends Controller
{
    public function dashboard()
    {
        return view('superadmin.dashboard');
    }

    public function users()
    {
        $users = User::with('subscriptions')->latest()->get();
        return view('superadmin.users.index', compact('users'));
    }

    public function generateApiKey(User $user)
    {
        $user->tokens()->delete();
        
        // PERBAIKAN: Ambil nilai plainTextToken agar bisa ditampilkan ke user
        $token = $user->createToken('api-key')->plainTextToken;
        
        // Kirimkan token melalui session flash agar bisa di-copy oleh admin
        return back()->with('success', 'API Key baru berhasil dibuat untuk ' . $user->name . '. Token: ' . $token)
                     ->with('new_api_key', $token);
    }

    public function manageSubscription(Request $request, User $user)
    {
        $request->validate([
            'plan_name' => 'required|string',
            'duration_days' => 'required|integer|min:1'
        ]);

        $user->subscriptions()->create([
            'plan_name' => $request->plan_name,
            'start_date' => now(),
            'end_date' => now()->addDays($request->duration_days),
            'is_active' => true,
        ]);

        return back()->with('success', 'Subscription added for ' . $user->name);
    }

    public function sekolah()
    {
        return view('superadmin.sekolah');
    }

    public function universitas()
    {
        return view('superadmin.universitas');
    }

    public function perusahaan()
    {
        return view('superadmin.perusahaan');
    }

    public function pengaturan()
    {
        return view('superadmin.pengaturan');
    }

    public function clearLogs()
    {
        ActivityLog::truncate();
        return back()->with('success', 'Semua log aktivitas berhasil dihapus.');
    }

    public function changePassword(Request $request, User $user)
    {
        $request->validate([
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($request->new_password)]);

        ActivityLog::create([
            'action' => 'Perubahan Password Akun (' . $user->email . ')',
            'type' => 'Keamanan',
            'status' => 'SUKSES'
        ]);

        return back()->with('success', 'Password untuk ' . $user->name . ' berhasil diperbarui.');
    }

    public function deleteUser(Request $request, User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }
        
        $userEmail = $user->email;
        $user->tokens()->delete();
        $user->subscriptions()->delete();
        $user->delete();

        ActivityLog::create([
            'action' => 'Hapus Akun Pengguna (' . $userEmail . ')',
            'type' => 'Manajemen Akun',
            'status' => 'SUKSES'
        ]);

        return back()->with('success', 'Pengguna berhasil dihapus dari sistem.');
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'email'            => 'required|email|unique:users,email',
            'password'         => 'required|string|min:8',
            'institution_type' => 'required|in:sekolah,universitas,perusahaan',
            'institution_name' => 'nullable|string|max:255',
            'duration_days'    => 'nullable|integer|min:1',
            'plan_name'        => 'nullable|string|max:100',
        ]);

        // 1. Buat user
        $user = User::create([
            'name'             => $request->name,
            'email'            => $request->email,
            'password'         => Hash::make($request->password),
            'role'             => 'user',
            'institution_type' => $request->institution_type,
            'institution_name' => $request->institution_name,
        ]);

        // 2. Generate API Key otomatis & simpan plain token-nya
        $user->tokens()->delete(); // Meskipun baru, memastikan token reset jika ada default behavior
        $token = $user->createToken('api-key')->plainTextToken;

        // 3. Buat subscription jika durasi diisi
        if ($request->filled('plan_name') && $request->filled('duration_days')) {
            $user->subscriptions()->create([
                'plan_name' => $request->plan_name,
                'start_date' => now(),
                'end_date' => now()->addDays($request->duration_days),
                'is_active' => true,
            ]);
        }

        ActivityLog::create([
            'action' => 'Registrasi Akun Baru (' . $user->email . ')',
            'type' => 'Autentikasi',
            'status' => 'SUKSES'
        ]);

        // PERBAIKAN: Mengirimkan $token ke view agar bisa ditampilkan
        return back()->with([
            'success'        => 'Akun ' . $user->name . ' berhasil ditambahkan beserta API Key & langganan.',
            'new_user_id'    => $user->id,
            'new_user_email' => $user->email,
            'new_user_name'  => $user->name,
            'new_user_type'  => $user->institution_type,
            'new_api_key'    => $token, 
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $request->validate([
            'name'             => 'required|string|max:255',
            'institution_name' => 'nullable|string|max:255',
        ]);

        $user->update([
            'name'             => $request->name,
            'institution_name' => $request->institution_name,
        ]);

        ActivityLog::create([
            'action' => 'Update Akun Pengguna (' . $user->email . ')',
            'type' => 'Manajemen Akun',
            'status' => 'SUKSES'
        ]);

        return back()->with('success', 'Data ' . $user->name . ' berhasil diperbarui.');
    }

    /**
     * Update profil (nama + avatar) – digunakan dari halaman Pengaturan
     */
    public function updateProfile(Request $request, User $user)
    {
        $request->validate([
            'name'   => 'required|string|max:255',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data = ['name' => $request->name];

        if ($request->hasFile('avatar')) {
            // Hapus avatar lama jika ada
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user->update($data);

        ActivityLog::create([
            'action' => 'Update Profil (' . $user->email . ')',
            'type' => 'Manajemen Akun',
            'status' => 'SUKSES'
        ]);

        return back()->with('success', 'Profil ' . $user->name . ' berhasil diperbarui.');
    }
}