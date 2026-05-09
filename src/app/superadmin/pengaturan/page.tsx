"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { sha256 } from "@/lib/utils";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";

interface SuperadminProfile {
  name: string;
  email: string;
  role: string;
  lastLogin: string;
}

export default function PengaturanPage() {
  const [profile, setProfile] = useState<SuperadminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const emailHash = await sha256(user.email);
        try {
          const userDoc = await getDoc(doc(db, "superadmin", emailHash));
          if (userDoc.exists()) {
            const data = userDoc.data();
            try {
              const decryptedName = data.name ? CryptoJS.AES.decrypt(data.name, process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026").toString(CryptoJS.enc.Utf8) : "";
              const decryptedEmail = data.email ? CryptoJS.AES.decrypt(data.email, process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026").toString(CryptoJS.enc.Utf8) : "";
              const decryptedRole = data.role ? CryptoJS.AES.decrypt(data.role, process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026").toString(CryptoJS.enc.Utf8) : "";

              setProfile({
                name: decryptedName || data.name,
                email: decryptedEmail || data.email,
                role: decryptedRole || data.role || "Superadmin",
                lastLogin: new Date().toLocaleString(),
              });
            } catch (e) {
              setProfile({
                name: data.name,
                email: data.email,
                role: data.role || "Superadmin",
                lastLogin: new Date().toLocaleString(),
              });
            }
          } else {
            setProfile({
              name: user.displayName || "Admin",
              email: user.email,
              role: "Superadmin",
              lastLogin: new Date().toLocaleString(),
            });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsub();
  }, []);

  const [activeTab, setActiveTab] = useState("Informasi Pribadi");

  const tabs = [
    {
      id: "Informasi Pribadi",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    },
    {
      id: "Keamanan & Sandi",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    },
    {
      id: "Notifikasi Firebase",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
    },
    {
      id: "Log Aktivitas Admin",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    }
  ];

  return (
    <div className="p-10 flex flex-col md:flex-row gap-10 min-h-screen">
      {/* Left Sidebar Menu */}
      <div className="w-full md:w-80 shrink-0">
        <h1 className="text-3xl font-black text-slate-800 mb-8">Pengaturan</h1>
        <nav className="space-y-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-5 px-6 py-5 rounded-2xl font-bold transition-all duration-300 text-left ${isActive
                    ? "bg-white text-blue-700 shadow-xl shadow-slate-200/40 border border-slate-100 scale-[1.02]"
                    : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-md hover:shadow-slate-200/20 border border-transparent"
                  }`}
              >
                <div className={`${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} transition-colors`}>
                  {tab.icon}
                </div>
                {tab.id}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 space-y-8">

        {/* Tab Content: Informasi Pribadi */}
        {activeTab === "Informasi Pribadi" && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Informasi Pribadi</h3>
              <button className="text-blue-600 font-bold text-sm hover:underline">Edit Profil</button>
            </div>
            <div className="p-10">
              <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-100">
                <div className="relative group cursor-pointer">
                  <div className="w-28 h-28 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-4xl font-black border-4 border-white shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                    {profile?.name?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-blue-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-800">{profile?.name || "..."}</h4>
                  <p className="text-slate-500 font-medium">{profile?.email || "..."}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <p className="text-lg font-bold text-slate-700 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">{profile?.name || "..."}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                  <p className="text-lg font-bold text-slate-700 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">{profile?.email || "..."}</p>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role Akses</label>
                  <div className="pt-2">
                    <span className="inline-block bg-blue-50 text-blue-600 px-6 py-2 rounded-xl text-sm font-black border border-blue-100 shadow-sm">
                      {profile?.role || "..."}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Terakhir Login</label>
                  <p className="text-sm font-medium text-slate-500 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100 shadow-sm">{profile?.lastLogin || "..."}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Keamanan & Sandi */}
        {activeTab === "Keamanan & Sandi" && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Keamanan & Sandi</h3>
            </div>
            <div className="p-10 space-y-8">
              
              {/* Update Password Card */}
              <div className="bg-white border border-slate-200/60 shadow-lg shadow-slate-200/20 rounded-3xl p-8 transition-all hover:shadow-xl hover:shadow-slate-200/40">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100/50">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">Ubah Kata Sandi</h4>
                    <p className="text-slate-500 text-sm font-medium mt-1">Pastikan akun Anda menggunakan kata sandi yang kuat dan aman.</p>
                  </div>
                </div>

                <div className="space-y-5 max-w-2xl">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Password Lama</label>
                    <input type="password" placeholder="Masukkan password saat ini" className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:font-normal" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Password Baru</label>
                      <input type="password" placeholder="Minimal 8 karakter" className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:font-normal" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Konfirmasi Password Baru</label>
                      <input type="password" placeholder="Ulangi password baru" className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:font-normal" />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 w-full sm:w-auto flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Account Card */}
              <div className="bg-white border border-red-200/60 shadow-lg shadow-red-200/20 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-50 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex shrink-0 items-center justify-center border border-red-100">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-red-600 text-lg">Zona Bahaya: Hapus Akun Superadmin</h4>
                    <p className="text-red-900/60 text-sm font-medium mt-2 leading-relaxed max-w-3xl">
                      Perhatian! Menghapus akun Anda bersifat <strong className="text-red-600">permanen</strong> dan tidak dapat dibatalkan. Semua data profil, akses, dan log aktivitas Anda akan hilang selamanya. Pastikan masih ada Superadmin lain yang memiliki akses sebelum Anda menghapus akun ini.
                    </p>
                    <button className="mt-6 bg-white text-red-600 border-2 border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Hapus Akun Permanen
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab Content: Notifikasi Firebase */}
        {activeTab === "Notifikasi Firebase" && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Notifikasi Firebase</h3>
            </div>
            <div className="p-10">
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 text-lg">Kirim Notifikasi Maintenance</h4>
                    <p className="text-amber-700/80 text-sm">Beritahu seluruh pengguna aplikasi (Sekolah, Universitas, Perusahaan) bahwa sistem sedang dalam perbaikan.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Judul Notifikasi</label>
                  <input type="text" defaultValue="Sistem dalam Perbaikan" className="w-full bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pesan Notifikasi</label>
                  <textarea rows={4} defaultValue="Mohon maaf, saat ini sistem sedang dalam tahap pemeliharaan rutin. Kami akan segera kembali beroperasi secepatnya." className="w-full bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition resize-none"></textarea>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h5 className="font-bold text-slate-700">Kirim sebagai Push Notification</h5>
                    <p className="text-sm text-slate-500">Kirim notifikasi langsung ke perangkat pengguna.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <button className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-600 transition shadow-lg shadow-amber-200 w-full md:w-auto flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  Kirim Notifikasi Sekarang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Log Aktivitas Admin */}
        {activeTab === "Log Aktivitas Admin" && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Log Aktivitas Admin</h3>
              <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                30 Hari Terakhir
              </div>
            </div>
            <div className="p-10">
              
              <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden divide-y divide-slate-100">
                
                {/* Item 1 */}
                <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100/50 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">Login Sukses</h4>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">Berhasil masuk ke sistem superadmin</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">IP: 192.168.1.1</span>
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider">Chrome / Windows</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-700">08:30 WIB</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Hari ini</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100/50 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">Pembaruan Sistem</h4>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">Mengubah konfigurasi API key institusi Universitas A</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-700">14:15 WIB</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Kemarin</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100/50 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">Login Gagal</h4>
                      <p className="text-sm text-slate-500 font-medium mt-0.5">Percobaan login gagal dengan password yang salah</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border border-rose-100">IP: 103.45.67.89</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-700">09:00 WIB</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">3 Hari Lalu</p>
                  </div>
                </div>

              </div>

              <div className="mt-6 text-center">
                <button className="text-blue-600 font-bold text-sm hover:underline">Muat Lebih Banyak Log</button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
