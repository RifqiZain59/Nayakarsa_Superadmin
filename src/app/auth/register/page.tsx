"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sha256 } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const emailHash = await sha256(email);

      // Save initial superadmin profile
      await setDoc(doc(db, "superadmins", emailHash), {
        uid: uid,
        name: name,
        email: email,
        role: "superadmin",
        createdAt: serverTimestamp()
      });
      
      Swal.fire({
        title: "Pendaftaran Berhasil!",
        text: "Akun Superadmin Anda telah dibuat.",
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
        title: "Pendaftaran Gagal",
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
      <div className="hidden lg:flex w-1/2 bg-indigo-600 relative overflow-hidden">
        <img 
          src="/images/auth-bg.png" 
          alt="Auth Branding" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
        <div className="relative z-10 p-20 flex flex-col justify-end text-white h-full">
          <div className="mb-8">
             <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center text-4xl font-black mb-6">N</div>
             <h1 className="text-6xl font-black tracking-tighter">Bergabunglah<br/>Bersama Kami</h1>
             <p className="text-xl text-indigo-100 mt-6 max-w-md font-medium leading-relaxed">
               Mulai perjalanan Anda dalam mengelola ekosistem pendidikan digital masa depan.
             </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-12 py-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Daftar Akun</h2>
            <p className="text-slate-400 font-medium">Buat akun Superadmin baru Anda sekarang.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                name="name" 
                required 
                placeholder="Artano Nayakarsa"
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="admin@nayakarsa.com"
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all duration-300"
              />
            </div>

            <div className="px-1 py-2">
              <p className="text-xs text-slate-400 leading-relaxed">
                Dengan mendaftar, Anda menyetujui <Link href="#" className="text-indigo-600 font-bold hover:underline">Syarat & Ketentuan</Link> serta <Link href="#" className="text-indigo-600 font-bold hover:underline">Kebijakan Privasi</Link> kami.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-lg hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all duration-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Memproses Data..." : "Daftar Akun Sekarang"}
            </button>
          </form>

          <p className="text-center text-slate-400 font-medium pt-4">
            Sudah punya akun? {" "}
            <Link href="/auth/login" className="text-indigo-600 font-bold hover:underline">Masuk Disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
