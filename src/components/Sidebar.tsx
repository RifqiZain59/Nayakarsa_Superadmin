"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { sha256 } from "@/lib/utils";
import CryptoJS from "crypto-js";

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "NayakarsaSecureKey2026";

const mainMenuItems = [
  { name: "Dashboard", href: "/superadmin/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Daftar User", href: "/superadmin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

const institutionSubItems = [
  { name: "Sekolah", href: "/superadmin/sekolah", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { name: "Universitas", href: "/superadmin/universitas", icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4 2.222" },
  { name: "Perusahaan", href: "/superadmin/perusahaan", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isInstOpen, setIsInstOpen] = useState(pathname.includes('sekolah') || pathname.includes('universitas') || pathname.includes('perusahaan'));
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const emailHash = await sha256(user.email);
        const userDoc = await getDoc(doc(db, "superadmin", emailHash));
        if (userDoc.exists()) {
          const data = userDoc.data();
          try {
             const decryptedName = data.name ? CryptoJS.AES.decrypt(data.name, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8) : "";
             const decryptedEmail = data.email ? CryptoJS.AES.decrypt(data.email, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8) : "";
             setUserData({ 
               ...data, 
               name: decryptedName || data.name, 
               email: decryptedEmail || data.email 
             });
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

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <aside className="w-72 bg-blue-950 border-r border-blue-900 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-950 font-black text-xl shadow-lg">N</div>
          <span className="font-black text-xl text-white tracking-tight">Nayakarsa</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {mainMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                isActive 
                ? "bg-blue-900 text-white shadow-sm border border-blue-800" 
                : "text-blue-200 hover:text-white hover:bg-blue-900/50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.name}
            </Link>
          );
        })}

        {/* Accordion Menu */}
        <div>
          <button 
            onClick={() => setIsInstOpen(!isInstOpen)}
            className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
              isInstOpen ? "text-white" : "text-blue-200 hover:bg-blue-900/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Institusi
            </div>
            <svg className={`w-4 h-4 transition-transform ${isInstOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isInstOpen && (
            <div className="mt-1 ml-4 border-l-2 border-blue-900 space-y-1">
              {institutionSubItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center gap-4 px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all ${
                      isActive 
                      ? "text-white bg-blue-900/30" 
                      : "text-blue-300 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Link 
          href="/superadmin/pengaturan"
          className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
            pathname === "/superadmin/pengaturan"
            ? "bg-blue-900 text-white shadow-sm border border-blue-800" 
            : "text-blue-200 hover:text-white hover:bg-blue-900/50"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          Pengaturan
        </Link>
      </nav>

      {/* User Footer */}
      <div className="p-4 mt-auto border-t border-blue-900">
        <div className="flex items-center gap-3 p-3 bg-blue-900 rounded-2xl border border-blue-800">
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-blue-950">
            {userData?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{userData?.name || "..."}</p>
            <p className="text-[10px] text-blue-200 truncate">{userData?.email || "..."}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-blue-300 hover:text-white transition"
            title="Keluar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
