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
        return view('superadmin.users.index');
    }

    public function generateApiKey($id)
    {
        return back()->with('success', 'API Key diproses via Firebase.');
    }

    public function manageSubscription(Request $request, $id)
    {
        return back()->with('success', 'Subscription diproses via Firebase.');
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

    public function changePassword(Request $request, $id)
    {
        return back()->with('success', 'Password diperbarui.');
    }

    public function deleteUser(Request $request, $id)
    {
        return back()->with('success', 'User dihapus dari Firebase.');
    }

    public function storeUser(Request $request)
    {
        return back()->with('success', 'User berhasil ditambahkan ke Firebase.');
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
