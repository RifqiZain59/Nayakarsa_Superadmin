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
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 relative overflow-hidden">
        <img 
          src="/images/auth-bg.png" 
          alt="Auth Branding" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
        <div className="relative z-10 p-20 flex flex-col justify-end text-white h-full">
          <div className="mb-8">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl font-black mb-6">N</div>
             <h1 className="text-6xl font-black tracking-tighter">Nayakarsa<br/>Superadmin</h1>
             <p className="text-xl text-blue-100 mt-6 max-w-md font-medium leading-relaxed">
               Command center cerdas untuk manajemen institusi pendidikan dan korporasi di seluruh Indonesia.
             </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-400 font-medium">Masuk untuk mengelola Dashboard Anda.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="admin@nayakarsa.com"
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition">Ingat saya</span>
              </label>
              <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition">Lupa Password?</Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Menghubungkan..." : "Masuk Sekarang"}
            </button>
          </form>

          <p className="text-center text-slate-400 font-medium pt-8">
            Belum punya akun? {" "}
            <Link href="/auth/register" className="text-blue-600 font-bold hover:underline">Daftar Baru</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
