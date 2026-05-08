"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { sha256, encryptData, decryptData, generateApiKey } from "@/lib/utils";
import Swal from "sweetalert2";

interface UserData {
  id: string;
  name: string;
  email: string;
  institutionName: string;
  institutionType: string;
  apiKeyHash?: string;
  hasApiKey?: boolean;
  subscription?: {
    planName: string;
    isActive: boolean;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState<{ name: string; key: string } | null>(null);

  useEffect(() => {
    let unsubscribes: (() => void)[] = [];

    const startSync = async () => {
      const superadminEmail = "nayakarsa.artano@gmail.com";
      const superadminId = await sha256(superadminEmail);
      const collections = ["sekolah", "universitas", "perusahaan"];

      collections.forEach((col) => {
        const q = collection(db, "superadmin", superadminId, col);
        const unsub = onSnapshot(q, (snapshot) => {
          setUsers(prev => {
            const otherColUsers = prev.filter(u => u.institutionType !== col);
            const newColUsers = snapshot.docs.map(doc => {
              const d = doc.data();
              return {
                id: doc.id,
                name: decryptData(d.name),
                email: decryptData(d.email),
                institutionName: decryptData(d.institutionName),
                institutionType: col,
                apiKeyHash: d.apiKeyHash,
                hasApiKey: d.hasApiKey,
                subscription: d.subscription,
              };
            });
            return [...otherColUsers, ...newColUsers];
          });
          setLoading(false);
        });
        unsubscribes.push(unsub);
      });
    };

    startSync();
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const type = formData.get("type") as string;
    const instName = formData.get("institution_name") as string;
    const pass = formData.get("password") as string;

    try {
      const superadminEmail = "nayakarsa.artano@gmail.com";
      const superadminId = await sha256(superadminEmail);
      const idHash = await sha256(Date.now() + email);
      const passHash = await sha256(pass);
      const rawApi = generateApiKey();
      const apiHash = await sha256(rawApi);

      const data = {
        uidHash: idHash,
        name: encryptData(name),
        email: encryptData(email),
        institutionName: encryptData(instName),
        institutionType: encryptData(type),
        role: encryptData('user'),
        passwordHash: passHash,
        apiKeyHash: apiHash,
        hasApiKey: true,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "superadmin", superadminId, type, idHash), data);

      setShowApiKey({ name, key: rawApi });
      setIsModalOpen(false);
      Swal.fire("Berhasil", "User telah ditambahkan ke Firebase", "success");
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  const handleDelete = async (type: string, id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus User?",
      text: `Akun ${name} akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        const superadminEmail = "nayakarsa.artano@gmail.com";
        const superadminId = await sha256(superadminEmail);
        await deleteDoc(doc(db, "superadmin", superadminId, type, id));
        Swal.fire("Terhapus!", "", "success");
      } catch (error: any) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleRegenApiKey = async (type: string, id: string, name: string) => {
    const result = await Swal.fire({
      title: "Reset API Key?",
      text: `Buat token baru untuk ${name}?`,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Ya, Buat Baru",
    });

    if (result.isConfirmed) {
      try {
        const superadminEmail = "nayakarsa.artano@gmail.com";
        const superadminId = await sha256(superadminEmail);
        const rawApi = generateApiKey();
        const apiHash = await sha256(rawApi);

        await updateDoc(doc(db, "superadmin", superadminId, type, id), {
          apiKeyHash: apiHash,
          hasApiKey: true
        });

        setShowApiKey({ name, key: rawApi });
      } catch (error: any) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>
        </div>
        <div className="relative flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Manajemen Pengguna</h1>
            <p className="text-blue-200 mt-2 font-medium">Data real-time dari Cloud Firestore (Next.js Version)</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-blue-900 px-6 py-3 rounded-2xl font-bold hover:bg-blue-50 transition shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Tambah User
          </button>
        </div>
      </div>

      {/* API Key Alert */}
      {showApiKey && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 shadow-lg animate-in slide-in-from-top duration-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-emerald-900 font-bold text-lg">✅ API Key Berhasil Dibuat untuk {showApiKey.name}</h3>
              <p className="text-emerald-700 text-sm mt-1">Copy sekarang! Token ini hanya ditampilkan sekali demi keamanan.</p>
              <div className="mt-4 flex gap-3">
                <code className="bg-white px-4 py-2 rounded-xl border border-emerald-100 font-mono text-sm flex-1">{showApiKey.key}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(showApiKey.key);
                    Swal.fire({ title: "Copied!", icon: "success", timer: 800, showConfirmButton: false });
                  }}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition"
                >
                  Copy
                </button>
              </div>
            </div>
            <button onClick={() => setShowApiKey(null)} className="text-emerald-400 hover:text-emerald-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-8 py-5">Pengguna</th>
                <th className="px-6 py-5">Tipe</th>
                <th className="px-6 py-5">Institusi</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">Memuat data dari Firebase...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400">Belum ada pengguna terdaftar.</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.institutionType === 'sekolah' ? 'bg-blue-50 text-blue-600' :
                        user.institutionType === 'universitas' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      {user.institutionType}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-600">{user.institutionName}</td>
                  <td className="px-6 py-5">
                    {user.subscription?.isActive ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        {user.subscription.planName}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs italic">No Subscription</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <button
                      onClick={() => handleRegenApiKey(user.institutionType, user.id, user.name)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(user.institutionType, user.id, user.name)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-blue-600 p-8 text-white">
              <h3 className="text-2xl font-bold">Tambah Pengguna</h3>
              <p className="text-blue-100 text-sm mt-1">Daftarkan institusi baru ke Firebase</p>
            </div>
            <form onSubmit={handleAddUser} className="p-8 space-y-4">
              <input name="name" required placeholder="Nama Lengkap" className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <input name="email" type="email" required placeholder="Email" className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <div className="grid grid-cols-2 gap-4">
                <select name="type" required className="px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition">
                  <option value="sekolah">Sekolah</option>
                  <option value="universitas">Universitas</option>
                  <option value="perusahaan">Perusahaan</option>
                </select>
                <input name="institution_name" required placeholder="Nama Institusi" className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <input name="password" type="password" required placeholder="Password" className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition" />
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200">Simpan</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
