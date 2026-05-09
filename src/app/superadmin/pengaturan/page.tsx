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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-100 to-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Pengaturan Akun</h1>
          <p className="text-slate-400 mt-2 font-medium">Kelola informasi profil dan keamanan Anda.</p>
        </div>
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
          {profile?.name?.charAt(0).toUpperCase() || "A"}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden">
        <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Informasi Pribadi</h3>
          <button className="text-blue-600 font-bold text-sm hover:underline">Edit Profil</button>
        </div>
        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
            <p className="text-lg font-bold text-slate-700">{profile?.name || "..."}</p>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
            <p className="text-lg font-bold text-slate-700">{profile?.email || "..."}</p>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role</label>
            <div className="flex">
              <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-black">
                {profile?.role || "..." }
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Terakhir Login</label>
            <p className="text-sm font-medium text-slate-500">{profile?.lastLogin || "..."}</p>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden">
        <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">Keamanan</h3>
        </div>
        <div className="p-10 space-y-6">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <div>
                <p className="font-bold text-slate-700">Password</p>
                <p className="text-xs text-slate-400">Terakhir diubah 3 bulan lalu</p>
              </div>
            </div>
            <button className="bg-white text-slate-600 px-6 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition">Ubah</button>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <p className="font-bold text-slate-700">Autentikasi 2 Faktor</p>
                <p className="text-xs text-emerald-500 font-bold">Aktif</p>
              </div>
            </div>
            <button className="bg-white text-slate-600 px-6 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition">Atur</button>
          </div>
        </div>
      </div>
    </div>
  );
}
