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
    <div className="p-10 flex flex-col md:flex-row gap-10 min-h-screen bg-slate-50/50">
      {/* Left Sidebar Menu */}
      <div className="w-full md:w-80 shrink-0">
        <h1 className="text-3xl font-black text-slate-800 mb-8">Pengaturan</h1>
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-left ${
                  isActive 
                  ? "bg-white text-blue-600 shadow-sm border border-slate-100" 
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-800 border border-transparent"
                }`}
              >
                <div className={`${isActive ? "text-blue-600" : "text-slate-500"}`}>
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
        )}

        {/* Tab Content: Keamanan & Sandi */}
        {activeTab === "Keamanan & Sandi" && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Keamanan & Sandi</h3>
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
        )}

        {/* Tab Content: Notifikasi Firebase */}
        {activeTab === "Notifikasi Firebase" && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Notifikasi Firebase</h3>
            </div>
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <div>
                <p className="font-bold text-slate-700 text-lg">Push Notifications</p>
                <p className="text-slate-500 text-sm mt-1">Atur preferensi notifikasi dari Firebase Cloud Messaging.</p>
              </div>
              <button className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Konfigurasi Notifikasi</button>
            </div>
          </div>
        )}

        {/* Tab Content: Log Aktivitas Admin */}
        {activeTab === "Log Aktivitas Admin" && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-50 overflow-hidden">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50">
              <h3 className="font-bold text-slate-800">Log Aktivitas Admin</h3>
            </div>
            <div className="p-10">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-800 text-sm">Login Sukses</div>
                      <time className="text-xs font-medium text-slate-400">Hari ini, 08:30</time>
                    </div>
                    <div className="text-slate-500 text-xs">Berhasil login dari IP 192.168.1.1</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
