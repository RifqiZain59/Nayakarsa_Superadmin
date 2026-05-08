"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="p-10 space-y-10 min-h-screen bg-slate-50/30">
      {/* Welcome Section */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-100/50 border border-slate-50 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-2 font-medium">Selamat datang kembali, Superadmin Nayakarsa.</p>
        </div>
        <div className="hidden md:block">
           <div className="bg-blue-50 text-blue-600 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-100">
             Live Updates Enabled
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-white rounded-[2rem] border border-slate-50 shadow-lg shadow-slate-100/50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Users</p>
          <p className="text-4xl font-black mt-2 text-slate-800">1,234</p>
          <p className="text-emerald-500 text-xs font-bold mt-4 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" /></svg>
            +12% this month
          </p>
        </div>

        <div className="p-8 bg-white rounded-[2rem] border border-slate-50 shadow-lg shadow-slate-100/50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Institutions</p>
          <p className="text-4xl font-black mt-2 text-slate-800">56</p>
          <div className="mt-4 flex -space-x-2">
            {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">+52</div>
          </div>
        </div>

        <div className="p-8 bg-white rounded-[2rem] border border-slate-50 shadow-lg shadow-slate-100/50 group hover:scale-[1.02] transition-transform duration-300">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Firebase Sync</p>
          <p className="text-4xl font-black mt-2 text-emerald-500">Connected</p>
          <p className="text-slate-300 text-[10px] font-bold mt-4 uppercase tracking-tighter">Last synced: Just now</p>
        </div>
      </div>
    </div>
  );
}
