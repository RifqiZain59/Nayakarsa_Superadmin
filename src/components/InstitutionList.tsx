"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query } from "firebase/firestore";
import { sha256, encryptData, decryptData, generateApiKey } from "@/lib/utils";
import Swal from "sweetalert2";

interface InstitutionData {
  id: string;
  name: string;
  email: string;
  institutionName: string;
  institutionType: string;
  apiKeyHash?: string;
  encryptedApiKey?: string;
  hasApiKey?: boolean;
}

interface Props {
  type: "sekolah" | "universitas" | "perusahaan";
  title: string;
  colorClass: string;
  bgGradient: string;
}

export default function InstitutionList({ type, title, colorClass, bgGradient }: Props) {
  const [items, setItems] = useState<InstitutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState<{ name: string; key: string } | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<InstitutionData | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const startSync = async () => {
      const superadminEmail = "superadmin@gmail.com";
      const superadminId = await sha256(superadminEmail);
      
      const q = query(collection(db, "superadmin", superadminId, type));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const data: InstitutionData[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: decryptData(d.name),
            email: decryptData(d.email),
            institutionName: decryptData(d.institutionName),
            institutionType: type,
            apiKeyHash: d.apiKeyHash,
            encryptedApiKey: d.encryptedApiKey,
            hasApiKey: d.hasApiKey,
          };
        });
        setItems(data);
        setLoading(false);
      }, (error) => {
        console.error(`Error syncing ${type}:`, error);
        setLoading(false);
      });
    };

    startSync();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [type]);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: `Data ${name} akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        const superadminEmail = "superadmin@gmail.com";
        const superadminId = await sha256(superadminEmail);
        await deleteDoc(doc(db, "superadmin", superadminId, type, id));
        Swal.fire("Terhapus!", "", "success");
      } catch (error: any) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleViewApiKey = async (item: InstitutionData) => {
    if (item.encryptedApiKey) {
      const rawApi = decryptData(item.encryptedApiKey);
      setShowApiKey({ name: item.name, key: rawApi });
    } else {
      const result = await Swal.fire({
        title: "API Key Tidak Tersedia",
        text: `API Key untuk ${item.name} menggunakan sistem lama (hanya hash). Apakah Anda ingin membuat (Reset) API Key baru sekarang?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Ya, Buat Baru",
      });

      if (result.isConfirmed) {
        handleRegenApiKey(item.id, item.name);
      }
    }
  };

  const handleRegenApiKey = async (id: string, name: string) => {
    try {
      const superadminEmail = "superadmin@gmail.com";
      const superadminId = await sha256(superadminEmail);
      const rawApi = generateApiKey();
      const apiHash = await sha256(rawApi);
      const encryptedApi = encryptData(rawApi);
      
      await updateDoc(doc(db, "superadmin", superadminId, type, id), {
        apiKeyHash: apiHash,
        encryptedApiKey: encryptedApi,
        hasApiKey: true
      });

      setShowApiKey({ name, key: rawApi });
      Swal.fire("Berhasil", "API Key baru telah dibuat", "success");
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const instName = formData.get("institution_name") as string;
    const pass = formData.get("password") as string;

    try {
      const superadminEmail = "superadmin@gmail.com";
      const superadminId = await sha256(superadminEmail);
      
      let updateData: any = {
        name: encryptData(name),
        institutionName: encryptData(instName),
      };
      
      if (pass) {
        updateData.passwordHash = await sha256(pass);
      }

      await updateDoc(doc(db, "superadmin", superadminId, type, editItem.id), updateData);
      Swal.fire("Berhasil", "Data telah diperbarui", "success");
      setIsModalOpen(false);
      setEditItem(null);
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    }
  };

  const openEditModal = (item: InstitutionData) => {
    setEditItem(item);
    setIsModalOpen(true);
    setTimeout(() => {
      const form = document.getElementById("editForm") as HTMLFormElement;
      if (form) {
        (form.elements.namedItem("name") as HTMLInputElement).value = item.name;
        (form.elements.namedItem("email") as HTMLInputElement).value = item.email;
        (form.elements.namedItem("email") as HTMLInputElement).disabled = true;
        (form.elements.namedItem("institution_name") as HTMLInputElement).value = item.institutionName;
      }
    }, 100);
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      Swal.fire({ title: "Tersalin!", icon: "success", timer: 1000, showConfirmButton: false });
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      Swal.fire({ title: "Gagal menyalin", text: "Clipboard tidak didukung", icon: "error" });
    }
    document.body.removeChild(textArea);
  };

  // Helper untuk menentukan icon dan warna badge berdasarkan tipe
  const getTypeColor = () => {
    if (type === 'sekolah') return 'bg-sky-50 text-sky-600 border-sky-100';
    if (type === 'universitas') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  return (
    <div className="p-8 space-y-8 bg-slate-100/50 min-h-screen">
      {/* Header */}
      <div className={`${bgGradient} rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          {type === 'sekolah' && <svg className="w-40 h-40 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
          {type === 'universitas' && <svg className="w-40 h-40 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>}
          {type === 'perusahaan' && <svg className="w-40 h-40 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        </div>
        <div className="relative">
          <h1 className="text-4xl font-black tracking-tight">{title}</h1>
          <p className="opacity-90 mt-2 font-medium text-lg">Manajemen institusi kategori {type}</p>
        </div>
      </div>

      {/* API Key Alert */}
      {showApiKey && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[2rem] p-8 shadow-xl animate-in slide-in-from-top duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-900">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9.003 4.304a.75.75 0 01.077.994l-3.5 4.5a.75.75 0 01-1.127.042l-2-2a.75.75 0 011.06-1.06l1.393 1.393 2.993-3.848a.75.75 0 01.884-.131z" clipRule="evenodd" /></svg>
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-full mr-8">
              <h3 className="text-emerald-900 font-black text-xl flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                API Key untuk {showApiKey.name}
              </h3>
              <p className="text-emerald-700 font-medium mt-2">Salin token ini untuk digunakan di aplikasi klien.</p>
              <div className="mt-5 flex gap-4">
                <code className="bg-white px-5 py-4 rounded-2xl border-2 border-emerald-100 font-mono text-base flex-1 shadow-inner text-slate-700">{showApiKey.key}</code>
                <button
                  onClick={() => {
                    if (!navigator.clipboard) {
                      fallbackCopyTextToClipboard(showApiKey.key);
                      return;
                    }
                    navigator.clipboard.writeText(showApiKey.key).then(() => {
                      Swal.fire({ title: "Tersalin!", icon: "success", timer: 1000, showConfirmButton: false });
                    }).catch(err => {
                      fallbackCopyTextToClipboard(showApiKey.key);
                    });
                  }}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  Salin Token
                </button>
              </div>
            </div>
            <button onClick={() => setShowApiKey(null)} className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Grid Kartu */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className={`inline-block w-10 h-10 border-4 border-slate-200 ${colorClass.replace('border-', 'border-t-')} rounded-full animate-spin`}></div>
            <p className="mt-4 text-slate-500 font-medium">Memuat data institusi...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-slate-200/60 shadow-sm">
            <p className="text-slate-400 font-medium">Belum ada data untuk kategori ini.</p>
          </div>
        ) : items.map((item) => (
          <div key={item.id} className="bg-white rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/40 p-8 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 flex items-center justify-center font-black text-2xl shadow-inner border border-slate-200/50">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-xl">{item.name}</h3>
                  <p className="text-sm font-medium text-slate-500 mt-1">{item.email}</p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getTypeColor()}`}>
                {type}
              </span>
            </div>

            <div className="mt-8 mb-8 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Institusi</p>
              <p className="font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {item.institutionName}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition border border-transparent hover:border-amber-100 tooltip"
                  title="Edit Institusi"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button
                  onClick={() => handleViewApiKey(item)}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition border border-transparent hover:border-blue-100 tooltip"
                  title="Lihat API Key"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition border border-transparent hover:border-red-100 tooltip"
                  title="Hapus Institusi"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 w-full max-w-lg overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner border border-amber-100/50">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Edit Institusi</h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">Perbarui informasi {type}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors border border-slate-200/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form id="editForm" onSubmit={handleEditSubmit} className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-3">Informasi Akun</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <input name="name" required placeholder="Nama Lengkap Penanggung Jawab" className="w-full bg-slate-50/50 pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700" />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input name="email" type="email" required placeholder="Alamat Email Resmi" className="w-full bg-slate-50/50 pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input name="password" type="password" placeholder="Kosongkan jika tidak ingin ganti" className="w-full bg-slate-50/50 pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 block mb-3 mt-4">Detail Institusi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <input name="institution_name" required placeholder="Nama Institusi Lengkap" className="w-full bg-slate-50/50 pl-11 pr-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-700" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-8 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 bg-slate-50 text-slate-600 py-3.5 rounded-2xl font-bold hover:bg-slate-100 border border-slate-200 transition">Batal</button>
                <button type="submit" className="w-2/3 bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
