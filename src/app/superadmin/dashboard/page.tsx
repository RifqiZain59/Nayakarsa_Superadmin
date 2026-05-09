"use client";

import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, query } from "firebase/firestore";
import { sha256 } from "@/lib/utils";
import CryptoJS from "crypto-js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from "recharts";

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // State untuk menyimpan jumlah data dari Firestore
  const [counts, setCounts] = useState({
    perusahaan: 0,
    universitas: 0,
    sekolah: 0,
  });

  const totalUsers = counts.perusahaan + counts.universitas + counts.sekolah;

  useEffect(() => {
    if (!auth) return;

    let unsubP: () => void;
    let unsubU: () => void;
    let unsubS: () => void;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const emailHash = await sha256(user.email);

        // 1. Ambil Data Profil Superadmin
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

        // 2. Listener Real-time untuk Sub-collection
        unsubP = onSnapshot(query(collection(db, "superadmin", emailHash, "perusahaan")), (snap) => {
          setCounts(prev => ({ ...prev, perusahaan: snap.size }));
        });

        unsubU = onSnapshot(query(collection(db, "superadmin", emailHash, "universitas")), (snap) => {
          setCounts(prev => ({ ...prev, universitas: snap.size }));
        });

        unsubS = onSnapshot(query(collection(db, "superadmin", emailHash, "sekolah")), (snap) => {
          setCounts(prev => ({ ...prev, sekolah: snap.size }));
        });

      }
    });

    return () => {
      unsubAuth();
      if (unsubP) unsubP();
      if (unsubU) unsubU();
      if (unsubS) unsubS();
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data untuk Grafik (Chart)
  const chartData = [
    { name: "Perusahaan", value: counts.perusahaan, color: "#10b981" }, // Emerald
    { name: "Universitas", value: counts.universitas, color: "#6366f1" }, // Indigo
    { name: "Sekolah", value: counts.sekolah, color: "#3b82f6" }, // Blue
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 min-h-screen bg-[#f4f7fe] font-sans">

      {/* Welcome Banner (Premium Dark Glassmorphism Design) */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-[2rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
              <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">Dashboard</h1>
          </div>
          <p className="text-slate-300 mt-3 text-sm sm:text-base font-medium">
            Selamat datang kembali, <span className="text-blue-400 font-bold tracking-wide">{userData?.name || "..."}</span>.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md text-emerald-300 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest border border-white/10 flex items-center gap-2.5 shadow-inner">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live Sync Active
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Total Users */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <div className="w-12 h-12 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center border border-slate-100 mb-6 transition-colors group-hover:bg-slate-700 group-hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div>
            <p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-widest mb-1">Total Entitas</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{totalUsers}</p>
          </div>
        </div>

        {/* Perusahaan */}
        <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-lg shadow-emerald-100/40 group hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 flex flex-col justify-between">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 mb-6 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <p className="text-emerald-500 text-[11px] font-extrabold uppercase tracking-widest mb-1">Perusahaan</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{counts.perusahaan}</p>
          </div>
        </div>

        {/* Universitas */}
        <div className="p-6 bg-white rounded-3xl border border-indigo-100 shadow-lg shadow-indigo-100/40 group hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col justify-between">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 mb-6 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
          </div>
          <div>
            <p className="text-indigo-500 text-[11px] font-extrabold uppercase tracking-widest mb-1">Universitas</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{counts.universitas}</p>
          </div>
        </div>

        {/* Sekolah */}
        <div className="p-6 bg-white rounded-3xl border border-blue-100 shadow-lg shadow-blue-100/40 group hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 flex flex-col justify-between">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 mb-6 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <div>
            <p className="text-blue-500 text-[11px] font-extrabold uppercase tracking-widest mb-1">Sekolah</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{counts.sekolah}</p>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Distribusi Institusi</h3>
          {mounted && (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 flex flex-col min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6 tracking-tight">Proporsi Pengguna</h3>
          {mounted && (
            <div style={{ width: '100%', height: '300px', position: 'relative' }}>
              <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-slate-600 font-semibold text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>

              {/* Center Text for Doughnut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-slate-800">{totalUsers}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}