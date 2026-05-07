"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-slate-500 mt-2">Selamat datang di Command Center Nayakarsa.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-black mt-1 text-slate-800">1,234</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Apps</p>
          <p className="text-3xl font-black mt-1 text-slate-800">56</p>
        </div>
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Firebase Status</p>
          <p className="text-3xl font-black mt-1 text-emerald-500">Connected</p>
        </div>
      </div>
    </div>
  );
}
