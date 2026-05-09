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

export default function SekolahPage() {
  const type = "sekolah";
  const title = "Daftar Sekolah";
  const bgGradient = "bg-gradient-to-br from-blue-600 to-blue-800";

  const [items, setItems] = useState<InstitutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Datatable States
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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
  }, []);

  // Logic: Filter & Pagination
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewApiKey = async (item: InstitutionData) => {
    if (item.encryptedApiKey) {
      const rawApi = decryptData(item.encryptedApiKey);
      Swal.fire({
        title: 'API Key',
        html: `
          <div class="text-left">
            <p class="text-sm text-gray-500 mb-2">Token untuk <b>${item.name}</b>:</p>
            <div class="bg-gray-100 p-3 rounded border font-mono text-xs break-all text-gray-700">${rawApi}</div>
          </div>`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Salin Token',
        confirmButtonColor: '#10b981',
        customClass: { popup: 'rounded-3xl' }
      }).then((result) => {
        if (result.isConfirmed) {
          navigator.clipboard.writeText(rawApi);
          Swal.fire({ title: 'Tersalin!', icon: 'success', timer: 1000, showConfirmButton: false });
        }
      });
    } else {
      handleRegenApiKey(item.id, item.name);
    }
  };

  const handleRegenApiKey = async (id: string, name: string) => {
    const rawApi = generateApiKey();
    const apiHash = await sha256(rawApi);
    const encryptedApi = encryptData(rawApi);
    const superadminId = await sha256("superadmin@gmail.com");

    await updateDoc(doc(db, "superadmin", superadminId, type, id), {
      apiKeyHash: apiHash,
      encryptedApiKey: encryptedApi,
      hasApiKey: true
    });
    Swal.fire("Berhasil", "API Key baru dibuat", "success");
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus?",
      text: `Data ${name} akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      const superadminId = await sha256("superadmin@gmail.com");
      await deleteDoc(doc(db, "superadmin", superadminId, type, id));
      Swal.fire("Terhapus", "", "success");
    }
  };

  const openEditModal = (item: InstitutionData) => {
    setEditItem(item);
    setIsModalOpen(true);
    setTimeout(() => {
      const form = document.getElementById("editForm") as HTMLFormElement;
      if (form) {
        (form.elements.namedItem("name") as HTMLInputElement).value = item.name;
        (form.elements.namedItem("institution_name") as HTMLInputElement).value = item.institutionName;
      }
    }, 50);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editItem) return;
    const formData = new FormData(e.currentTarget);
    const superadminId = await sha256("superadmin@gmail.com");

    await updateDoc(doc(db, "superadmin", superadminId, type, editItem.id), {
      name: encryptData(formData.get("name") as string),
      institutionName: encryptData(formData.get("institution_name") as string),
    });

    setIsModalOpen(false);
    Swal.fire("Berhasil", "Data diperbarui", "success");
  };

  return (
    <div className="p-6 space-y-6 bg-[#f4f7fe] min-h-screen font-sans">
      {/* Header Section */}
      <div className={`${bgGradient} rounded-3xl p-8 text-white shadow-lg border border-white/20 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-40 h-40 transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-white/80 font-medium">Manajemen data institusi Nayakarsa</p>
        </div>
      </div>

      {/* Datatable Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Datatable Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">Tampilkan</span>
            <select
              value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-500 font-medium">data</span>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-10 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest font-bold border-b border-gray-100">
                <th className="px-6 py-4 text-center w-16">No</th>
                <th className="px-6 py-4">Penanggung Jawab</th>
                <th className="px-6 py-4">Detail Institusi</th>
                <th className="px-6 py-4 text-center">Tipe</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-medium">Memproses data...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-gray-400 font-medium">Tidak ada data ditemukan.</td></tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-center text-sm font-bold text-gray-400">
                      {indexOfFirstItem + index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-[15px]">{item.name}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          {item.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-700">{item.institutionName}</span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                        {type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewApiKey(item)} title="API Key" className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg></button>
                        <button onClick={() => openEditModal(item)} title="Edit" className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => handleDelete(item.id, item.name)} title="Hapus" className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-5 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 font-medium">
            Menampilkan <span className="text-gray-800 font-bold">{indexOfFirstItem + Math.min(1, filteredItems.length)}</span> sampai <span className="text-gray-800 font-bold">{Math.min(indexOfLastItem, filteredItems.length)}</span> dari <span className="text-gray-800 font-bold">{filteredItems.length}</span> entri
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-xs"
            >Sebelumnya</button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === num ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >{num}</button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 transition-all font-bold text-xs"
            >Berikutnya</button>
          </div>
        </div>
      </div>

      {/* Modal Edit (Premium Style) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white">
            <div className="p-8 pb-0 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-800">Edit Institusi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form id="editForm" onSubmit={handleEditSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Penanggung Jawab</label>
                <input name="name" required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nama Institusi</label>
                <input name="institution_name" required className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all">Batal</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
