"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { sha256, encryptData, decryptData, generateApiKey } from "@/lib/utils";
import Swal from "sweetalert2";

interface InstitutionData {
  id: string;
  name: string;
  email: string;
  institutionName: string;
  apiKeyHash?: string;
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

  const fetchData = async () => {
    setLoading(true);
    const superadminEmail = "nayakarsa.artano@gmail.com";
    const superadminId = await sha256(superadminEmail);
    
    try {
      const querySnapshot = await getDocs(collection(db, "superadmin", superadminId, type));
      const data: InstitutionData[] = [];
      querySnapshot.forEach((doc) => {
        const d = doc.data();
        data.push({
          id: doc.id,
          name: decryptData(d.name),
          email: decryptData(d.email),
          institutionName: decryptData(d.institutionName),
          apiKeyHash: d.apiKeyHash,
          hasApiKey: d.hasApiKey,
        });
      });
      setItems(data);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        const superadminEmail = "nayakarsa.artano@gmail.com";
        const superadminId = await sha256(superadminEmail);
        await deleteDoc(doc(db, "superadmin", superadminId, type, id));
        fetchData();
        Swal.fire("Terhapus!", "", "success");
      } catch (error: any) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleRegenApiKey = async (id: string, name: string) => {
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
        fetchData();
      } catch (error: any) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className={`${bgGradient} rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden`}>
        <div className="relative">
          <h1 className="text-4xl font-black tracking-tight">{title}</h1>
          <p className="opacity-80 mt-2 font-medium italic">Manajemen institusi kategori {type}</p>
        </div>
      </div>

      {/* API Key Alert */}
      {showApiKey && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 shadow-lg animate-in slide-in-from-top duration-500">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-emerald-900 font-bold text-lg">✅ API Key Baru untuk {showApiKey.name}</h3>
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

      {/* Table Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-8 py-6">Admin Name</th>
                <th className="px-6 py-6">Email Address</th>
                <th className="px-6 py-6">Institution Name</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-8 h-8 border-4 ${colorClass} border-t-transparent rounded-full animate-spin`}></div>
                      <p className="text-slate-400 font-medium italic">Mengambil data...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-slate-300 italic font-medium">Belum ada data untuk kategori ini.</td>
                </tr>
              ) : items.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-8 py-6 font-bold text-slate-700">{item.name}</td>
                  <td className="px-6 py-6 text-slate-500 text-sm font-medium">{item.email}</td>
                  <td className="px-6 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-bold ${
                      type === 'sekolah' ? 'bg-blue-50 text-blue-600' :
                      type === 'universitas' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {item.institutionName}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRegenApiKey(item.id, item.name)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition"
                      title="Reset API Key"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition"
                      title="Delete"
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
    </div>
  );
}
