"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sha256 } from "@/lib/utils";
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026";

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

      // Encrypt data before saving
      const encryptedName = CryptoJS.AES.encrypt(name, ENCRYPTION_KEY).toString();
      const encryptedEmail = CryptoJS.AES.encrypt(email, ENCRYPTION_KEY).toString();
      const encryptedRole = CryptoJS.AES.encrypt("superadmin", ENCRYPTION_KEY).toString();

      // Save encrypted profile to "superadmin" collection
      await setDoc(doc(db, "superadmin", emailHash), {
        uid: uid, // UID from Firebase Auth
        name: encryptedName,
        email: encryptedEmail,
        role: encryptedRole,
        createdAt: serverTimestamp()
      });
      
      Swal.fire({
        title: "Pendaftaran Berhasil!",
        text: "Silakan masuk dengan akun baru Anda.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        position: 'center'
      });

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      {/* Left Side: Text and Icon */}
      <div className="hidden lg:flex w-1/2 bg-blue-950 flex-col justify-center text-white p-20 relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-lg">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-5xl font-black text-blue-950 mb-10 shadow-2xl">N</div>
          <h1 className="text-6xl font-black tracking-tighter mb-6 leading-tight">Bergabunglah<br/>Bersama Kami</h1>
          <p className="text-xl text-blue-200 font-medium leading-relaxed">
            Mulai perjalanan Anda dalam mengelola ekosistem pendidikan digital masa depan.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 overflow-hidden bg-white">
        <div className="w-full max-w-md space-y-4 sm:space-y-6 lg:space-y-8 my-auto">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Register</h2>
            <p className="text-sm sm:text-base text-slate-500 font-medium">Daftar Akun Superadmin</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2">
              <label className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                name="name" 
                required 
                placeholder="Artano Nayakarsa"
                className="w-full px-5 sm:px-6 py-3 sm:py-4 rounded-[1.5rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all duration-300 text-sm sm:text-base"
              />
            </div>

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

            <div className="px-1 py-1 sm:py-2">
              <p className="text-[10px] sm:text-xs text-slate-400 leading-relaxed text-center">
                Dengan mendaftar, Anda menyetujui <Link href="#" className="text-blue-900 font-bold hover:underline">Syarat & Ketentuan</Link> serta <Link href="#" className="text-blue-900 font-bold hover:underline">Kebijakan Privasi</Link> kami.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-900 text-white py-4 sm:py-5 rounded-[1.5rem] font-bold text-base sm:text-lg hover:bg-blue-800 hover:shadow-2xl hover:shadow-blue-200 transition-all duration-500 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Memproses Data..." : "Daftar Akun Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm sm:text-base text-slate-500 font-medium pt-2 sm:pt-4">
            Sudah punya akun? {" "}
            <Link href="/auth/login" className="text-blue-900 font-bold hover:underline">Masuk Disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
