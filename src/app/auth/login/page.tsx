"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (!auth) {
        throw new Error("Koneksi ke server gagal. Konfigurasi Firebase (Environment Variables) di Vercel belum disetel atau kosong. Harap isi di menu Settings Vercel.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      
      Swal.fire({
        title: "Selamat Datang!",
        text: "Berhasil masuk ke Dashboard Superadmin.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        position: 'center'
      });

      setTimeout(() => {
        router.push("/superadmin/dashboard");
      }, 1500);
    } catch (error: any) {
      Swal.fire({
        title: "Gagal Masuk",
        text: error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Left Side: Text and Icon */}
      <div className="hidden lg:flex w-1/2 bg-blue-950 flex-col justify-center text-white p-20 relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-5xl font-black text-blue-950 mb-10 shadow-2xl">N</div>
          <h1 className="text-6xl font-black tracking-tighter mb-6 leading-tight">Nayakarsa<br/>Superadmin</h1>
          <p className="text-xl text-blue-200 font-medium leading-relaxed">
            Command center cerdas untuk manajemen institusi pendidikan dan korporasi di seluruh Indonesia.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-hidden bg-white">
        <div className="w-full max-w-md space-y-6 lg:space-y-8 my-auto">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Login</h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Masuk ke Dashboard Superadmin</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="admin@nayakarsa.com"
                className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all duration-300 text-sm sm:text-base"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-blue-900 focus:ring-blue-900" />
                <span className="text-[11px] sm:text-sm font-medium text-slate-500 group-hover:text-slate-700 transition">Ingat saya</span>
              </label>
              <Link href="#" className="text-[11px] sm:text-sm font-bold text-blue-900 hover:text-blue-800 transition">Lupa Password?</Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-900 text-white py-4 sm:py-5 rounded-[1.5rem] font-bold text-base sm:text-lg hover:bg-blue-800 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Menghubungkan..." : "Masuk Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm sm:text-base text-slate-500 font-medium pt-2 sm:pt-4">
            Belum punya akun? {" "}
            <Link href="/auth/register" className="text-blue-900 font-bold hover:underline">Daftar Baru</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
