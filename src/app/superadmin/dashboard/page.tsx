"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { sha256 } from "@/lib/utils";
import CryptoJS from "crypto-js";

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const emailHash = await sha256(user.email);
        const userDoc = await getDoc(doc(db, "superadmin", emailHash));
        if (userDoc.exists()) {
          const data = userDoc.data();
          try {
             const decryptedName = data.name ? CryptoJS.AES.decrypt(data.name, process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026").toString(CryptoJS.enc.Utf8) : "";
             setUserData({ ...data, name: decryptedName || data.name });
          } catch (e) {
             setUserData(data);
          }
        } else {
          setUserData({ name: user.displayName || "Admin", email: user.email });
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-10 space-y-10 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/40 border border-slate-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-2 font-medium">Selamat datang kembali, <span className="text-blue-700 font-bold">{userData?.name || "..."}</span>.</p>
        </div>
        <div className="relative z-10">
           <div className="bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest border border-emerald-100/50 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             Live Sync
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-100/50">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Users</p>
          <p className="text-4xl font-black mt-2 text-slate-800">1,234</p>
          <p className="text-emerald-500 text-xs font-bold mt-4 flex items-center gap-1 bg-emerald-50 w-max px-2.5 py-1 rounded-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" /></svg>
            +12% this month
          </p>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100/50">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Institutions</p>
          <p className="text-4xl font-black mt-2 text-slate-800">56</p>
          <div className="mt-4 flex -space-x-2">
            {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm" />)}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">+52</div>
          </div>
        </div>

        <div className="p-8 bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/40 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-100 transition-colors"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100/50">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Firebase Sync</p>
            <p className="text-4xl font-black mt-2 text-emerald-500 drop-shadow-sm">Connected</p>
            <p className="text-slate-400 text-[10px] font-bold mt-4 uppercase tracking-wider">Last synced: Just now</p>
          </div>
        </div>
      </div>
    </div>
  );
}
