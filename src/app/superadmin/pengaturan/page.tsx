"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot, updateDoc, getDocs, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [profile, setProfile] = useState<SuperadminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!auth) return;
    let unsubLogs: any = null;

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

        const qLogs = query(collection(db, "superadmin", emailHash, "logs"), orderBy("timestamp", "desc"), limit(50));
        unsubLogs = onSnapshot(qLogs, (snapshot) => {
          setLogs(snapshot.docs.map(doc => ({
            id: doc.id,
            action: doc.data().action,
            message: doc.data().message,
            timestamp: doc.data().timestamp,
          })));
        });

      }
    });
    return () => {
      unsub();
      if (unsubLogs) unsubLogs();
    };
  }, []);

  const handleSaveProfile = async () => {
    if (!profile || !auth.currentUser?.email) return;
    try {
      const emailHash = await sha256(auth.currentUser.email);
      const encryptedName = CryptoJS.AES.encrypt(profile.name, process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026").toString();
      const encryptedEmail = CryptoJS.AES.encrypt(profile.email, process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026").toString();
      const encryptedRole = CryptoJS.AES.encrypt(profile.role, process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026").toString();

      await updateDoc(doc(db, "superadmin", emailHash), {
        name: encryptedName,
        email: encryptedEmail,
        role: encryptedRole
      });
      Swal.fire("Berhasil", "Profil telah diperbarui", "success");
    } catch (e: unknown) {
      Swal.fire("Gagal", (e as Error).message, "error");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Swal.fire({
        title: "Segera Hadir!",
        text: "Fitur ganti foto profil sedang dalam proses pengembangan.",
        icon: "info",
        confirmButtonColor: "#2563eb"
      });
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Swal.fire("Gagal", "Semua kolom kata sandi harus diisi", "error");
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire("Gagal", "Kata sandi baru dan konfirmasi tidak cocok", "error");
    }
    try {
      if (!auth.currentUser || !auth.currentUser.email) return;
      const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      const emailHash = await sha256(auth.currentUser.email);
      await addDoc(collection(db, "superadmin", emailHash, "logs"), {
        action: "Ganti Sandi",
        message: "Superadmin telah mengubah kata sandi keamanan akun",
        timestamp: serverTimestamp()
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Swal.fire("Berhasil", "Kata sandi berhasil diperbarui", "success");
    } catch (e: unknown) {
      Swal.fire("Gagal", "Sandi lama salah atau terjadi kesalahan pada server.", "error");
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Yakin Hapus Akun?",
      text: "Semua data akan dihapus permanen. Masukkan password Anda untuk melanjutkan:",
      input: "password",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Hapus Permanen",
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Batal"
    });

    if (result.isConfirmed && result.value) {
      const password = result.value;
      try {
        if (!auth.currentUser || !auth.currentUser.email) return;
        const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);

        const emailHash = await sha256(auth.currentUser.email);
        
        const subcollections = ["sekolah", "universitas", "perusahaan", "logs"];
        for (const sub of subcollections) {
          const q = query(collection(db, "superadmin", emailHash, sub));
          const snapshots = await getDocs(q);
          const deletePromises = snapshots.docs.map(d => deleteDoc(d.ref));
          await Promise.all(deletePromises);
        }

        await deleteDoc(doc(db, "superadmin", emailHash));
        await deleteUser(auth.currentUser);

        Swal.fire("Berhasil", "Akun dan seluruh datanya telah dihapus secara permanen.", "success").then(() => {
          router.push("/auth/login");
        });
      } catch (e: unknown) {
        Swal.fire("Gagal", "Password salah atau terjadi kesalahan pada server.", "error");
      }
    }
  };

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
    <div className="p-6 sm:p-10 flex flex-col lg:flex-row gap-8 min-h-screen bg-[#f4f7fe]">
      {/* Left Sidebar Menu */}
      <div className="w-full lg:w-80 shrink-0">
        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">Pengaturan</h1>
        <nav className="space-y-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 text-left ${isActive
                  ? "bg-white text-blue-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 scale-[1.02]"
                  : "text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-md hover:shadow-slate-200/40 border border-transparent"
                  }`}
              >
                <div className={`${isActive ? "text-blue-600 bg-blue-50" : "text-slate-400 bg-slate-50 group-hover:text-slate-600"} p-2 rounded-xl transition-colors`}>
                  {tab.icon}
                </div>
                {tab.id}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1">

        {/* Tab Content: Informasi Pribadi */}
        {activeTab === "Informasi Pribadi" && (
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">

            {/* Header / Banner Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            <div className="px-8 pb-10 sm:px-12 relative -mt-16">
              {/* Profile Avatar & Name Container (DI TENGAH DENGAN GAP KECIL) */}
              <div className="flex flex-col items-center gap-3 pt-6 mb-8 pb-8 border-b border-slate-100 text-center">

                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-full bg-white text-blue-600 flex items-center justify-center text-5xl font-black border-4 border-slate-50 shadow-xl overflow-hidden transition-transform group-hover:scale-105 relative z-10">
                    <span className="bg-gradient-to-br from-blue-500 to-indigo-600 text-transparent bg-clip-text">
                      {profile?.name?.charAt(0).toUpperCase() || "A"}
                    </span>
                  </div>
                  {/* Icon Kamera + Trigger File Upload */}
                  <label htmlFor="upload-avatar" className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white hover:bg-blue-700 hover:scale-110 transition-all cursor-pointer z-20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <input
                      type="file"
                      id="upload-avatar"
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </label>
                </div>

                <div className="flex flex-col justify-center">
                  <h4 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{profile?.name || "..."}</h4>
                  <p className="text-slate-500 font-medium text-sm mt-1">{profile?.email || "..."}</p>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <input type="text" value={profile?.name || ""} onChange={(e) => setProfile(p => p ? { ...p, name: e.target.value } : null)} className="w-full text-sm font-bold text-slate-700 bg-slate-50/50 pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <input type="email" value={profile?.email || ""} onChange={(e) => setProfile(p => p ? { ...p, email: e.target.value } : null)} className="w-full text-sm font-bold text-slate-700 bg-slate-50/50 pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tingkat Akses (Role)</label>
                  <div className="relative cursor-not-allowed opacity-80">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <input type="text" readOnly value={profile?.role || "..."} className="w-full text-sm font-bold text-blue-700 bg-blue-50/50 pl-11 pr-4 py-3.5 rounded-2xl border border-blue-100 outline-none cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Terakhir Login (Waktu Sistem)</label>
                  <div className="relative cursor-not-allowed opacity-80">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <input type="text" readOnly value={profile?.lastLogin || "..."} className="w-full text-sm font-medium text-slate-500 bg-slate-100 pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                <button onClick={handleSaveProfile} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-[0_8px_20px_rgb(37,99,235,0.3)] hover:shadow-[0_10px_25px_rgb(37,99,235,0.4)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Keamanan & Sandi */}
        {activeTab === "Keamanan & Sandi" && (
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative">
              <div className="absolute inset-0 bg-white/5 opacity-50 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            <div className="px-8 pb-10 sm:px-12 relative -mt-8">

              {/* Update Password Card */}
              <div className="bg-white border border-slate-100 shadow-lg shadow-slate-200/40 rounded-3xl p-8 mb-8 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner border border-indigo-100/50 shrink-0">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-xl tracking-tight">Ubah Kata Sandi</h4>
                    <p className="text-slate-500 text-sm font-medium mt-1">Pastikan akun Anda menggunakan kata sandi yang kuat dan aman.</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Password Lama</label>
                    <input type="password" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} placeholder="Masukkan password saat ini" className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Password Baru</label>
                      <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Minimal 8 karakter" className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Konfirmasi Password Baru</label>
                      <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400" />
                    </div>
                  </div>
                  <div className="pt-4">
                    <button onClick={handleChangePassword} className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-[0_8px_20px_rgb(79,70,229,0.3)] hover:shadow-[0_10px_25px_rgb(79,70,229,0.4)] w-full sm:w-auto flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Account Card */}
              <div className="bg-red-50/30 border border-red-200/60 shadow-lg shadow-red-200/20 rounded-3xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-red-100 to-transparent rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                  <div className="w-14 h-14 bg-white text-red-600 rounded-2xl flex shrink-0 items-center justify-center border border-red-200 shadow-sm">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-red-600 text-xl tracking-tight">Zona Bahaya: Hapus Akun</h4>
                    <p className="text-red-900/70 text-sm font-medium mt-2 leading-relaxed max-w-2xl">
                      Perhatian! Menghapus akun Anda bersifat <strong className="text-red-600">permanen</strong> dan tidak dapat dibatalkan. Semua data profil, akses, dan log aktivitas Anda akan hilang selamanya.
                    </p>
                    <button onClick={handleDeleteAccount} className="mt-6 bg-white text-red-600 border-2 border-red-200 px-6 py-3 rounded-xl font-bold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 shadow-sm">
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
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative">
            <div className="h-24 bg-gradient-to-r from-amber-500 to-orange-600 relative">
              <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            <div className="px-8 pb-10 sm:px-12 relative -mt-8">
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10 pb-8 border-b border-slate-100">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-100 shrink-0 shadow-inner">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-xl tracking-tight">Kirim Notifikasi Push Global</h4>
                    <p className="text-slate-500 text-sm font-medium mt-1">Beritahu seluruh pengguna aplikasi (Sekolah, Universitas, Perusahaan) secara instan melalui sistem Firebase Cloud Messaging.</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-3xl">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Judul Notifikasi</label>
                    <input type="text" defaultValue="Pemeliharaan Sistem Terjadwal" className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white outline-none transition-all font-medium text-slate-700" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-2">Pesan Notifikasi</label>
                    <textarea rows={4} defaultValue="Mohon maaf, saat ini sistem sedang dalam tahap pemeliharaan rutin untuk meningkatkan performa layanan. Kami akan segera kembali beroperasi secepatnya." className="w-full bg-slate-50/50 px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 focus:bg-white outline-none transition-all font-medium text-slate-700 resize-none"></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-200 gap-4">
                    <div>
                      <h5 className="font-bold text-slate-700 text-sm">Mode Prioritas Tinggi</h5>
                      <p className="text-xs font-medium text-slate-500 mt-1">Notifikasi akan membunyikan alarm pada perangkat pengguna.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500"></div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3.5 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-[0_8px_20px_rgb(245,158,11,0.3)] hover:shadow-[0_10px_25px_rgb(245,158,11,0.4)] w-full sm:w-auto flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      Kirim Pesan Sekarang
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Log Aktivitas Admin */}
        {activeTab === "Log Aktivitas Admin" && (
          <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden relative flex flex-col min-h-[500px]">
            <div className="h-24 bg-gradient-to-r from-teal-500 to-emerald-600 relative shrink-0">
              <div className="absolute inset-0 bg-white/10 opacity-50 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            <div className="px-8 pb-10 sm:px-12 relative -mt-8 flex-1 flex flex-col">
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 sm:p-10 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100 shrink-0">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Timeline Aktivitas</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">Rekam jejak tindakan admin dalam 30 hari terakhir.</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100/50 shadow-sm whitespace-nowrap self-start">
                    Merekam Otomatis
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  {logs.length === 0 ? (
                    <div className="w-full flex-1 flex flex-col items-center justify-center py-10">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100 shadow-inner">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <p className="text-slate-500 font-bold text-base">Belum ada log aktivitas tercatat</p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
                      {logs.map((log, idx) => {
                        const date = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
                        return (
                          <div key={log.id} className="relative pl-8 group">
                            {/* Glowing Dot on Timeline */}
                            <span className="absolute -left-[9px] top-1 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform"></span>

                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 group-hover:shadow-md transition-shadow">
                              <h4 className="font-bold text-slate-800 text-sm">{log.action}</h4>
                              <p className="text-slate-500 text-sm mt-1">{log.message}</p>
                              <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} • {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}