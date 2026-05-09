"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, serverTimestamp, addDoc } from "firebase/firestore";
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
  subscription?: {
    planName: string;
    isActive: boolean;
    duration?: string;
  };
}

export default function UniversitasPage() {
  const type = "universitas";
  const title = "Daftar Universitas";
  const bgGradient = "bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-900";
  const badgeClass = "bg-indigo-50 text-indigo-600 border border-indigo-100";

  const [items, setItems] = useState<InstitutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState<{ name: string; key: string } | null>(null);

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
            subscription: d.subscription,
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

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / entriesPerPage);
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const instName = formData.get("institution_name") as string;
    const pass = formData.get("password") as string;
    const duration = formData.get("subscription_duration") as string;

    const subData = {
      planName: `Premium ${duration}`,
      isActive: true,
      duration: duration
    };

    try {
      const superadminEmail = "superadmin@gmail.com";
      const superadminId = await sha256(superadminEmail);
      const encryptedEmailId = encryptData(email).replace(/\//g, '_');

      if (isEditMode && editItemId) {
        let updateData: Record<string, unknown> = {
          name: encryptData(name),
          institutionName: encryptData(instName),
          institutionType: type,
          subscription: subData
        };
        if (pass) updateData.passwordHash = await sha256(pass);

        await updateDoc(doc(db, "superadmin", superadminId, type, editItemId), updateData);
        await addDoc(collection(db, "superadmin", superadminId, "logs"), {
          action: "Edit Data",
          message: `Data penanggung jawab ${name} telah diperbarui di Universitas`,
          timestamp: serverTimestamp()
        });
        Swal.fire("Berhasil", "Data telah diperbarui", "success");
      } else {
        const passHash = await sha256(pass);
        const rawApi = generateApiKey();
        const apiHash = await sha256(rawApi);
        const encryptedApi = encryptData(rawApi);

        const data = {
          uidHash: encryptedEmailId,
          name: encryptData(name),
          email: encryptData(email),
          institutionName: encryptData(instName),
          institutionType: type,
          role: encryptData('user'),
          passwordHash: passHash,
          apiKeyHash: apiHash,
          encryptedApiKey: encryptedApi,
          hasApiKey: true,
          subscription: subData,
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, "superadmin", superadminId, type, encryptedEmailId), data);
        await addDoc(collection(db, "superadmin", superadminId, "logs"), {
          action: "Tambah Data",
          message: `Data penanggung jawab ${name} berhasil didaftarkan di Universitas`,
          timestamp: serverTimestamp()
        });
        setShowApiKey({ name, key: rawApi });
        Swal.fire("Berhasil", "Data baru telah didaftarkan", "success");
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error: unknown) {
      Swal.fire("Gagal", (error as Error).message, "error");
    }
  };

  const handleViewApiKey = async (item: InstitutionData) => {
    if (item.encryptedApiKey) {
      const rawApi = decryptData(item.encryptedApiKey);
      setShowApiKey({ name: item.name, key: rawApi });
    } else {
      Swal.fire("Info", "API Key sistem lama terdeteksi. Silakan hubungi admin teknis.", "info");
    }
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
      await addDoc(collection(db, "superadmin", superadminId, "logs"), {
        action: "Hapus Data",
        message: `Data ${name} telah dihapus dari Universitas`,
        timestamp: serverTimestamp()
      });
      await deleteDoc(doc(db, "superadmin", superadminId, type, id));
      Swal.fire("Terhapus", "", "success");
    }
  };

  const openEditModal = (item: InstitutionData) => {
    setIsEditMode(true);
    setEditItemId(item.id);
    setIsModalOpen(true);
    setTimeout(() => {
      const form = document.getElementById("dataForm") as HTMLFormElement;
      if (form) {
        (form.elements.namedItem("name") as HTMLInputElement).value = item.name;
        (form.elements.namedItem("email") as HTMLInputElement).value = item.email;
        (form.elements.namedItem("institution_name") as HTMLInputElement).value = item.institutionName;
        (form.elements.namedItem("subscription_duration") as HTMLSelectElement).value = item.subscription?.duration || "1 Bulan";
      }
    }, 50);
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditItemId(null);
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
    } catch (_err) {
      Swal.fire({ title: "Gagal menyalin", text: "Clipboard tidak didukung", icon: "error" });
    }
    document.body.removeChild(textArea);
  };

  return (
    <div className="p-6 space-y-6 bg-[#f4f7fe] min-h-screen font-sans">

      {/* HEADER PREMIUM SAAS STYLE */}
      <div className={`${bgGradient} rounded-[2rem] p-8 sm:p-10 text-white shadow-xl relative overflow-hidden border border-white/10`}>
        {/* Decorative Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Glass Icon Box */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 border border-white/20 rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center backdrop-blur-md shadow-inner shrink-0">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">{title}</h1>
              </div>
              <p className="text-indigo-50 mt-1 text-sm sm:text-base font-medium max-w-xl leading-relaxed text-balance">
                Kelola akses, konfigurasi langganan, dan pantau aktivitas data institusi universitas yang terdaftar.
              </p>
            </div>
          </div>

          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="group w-full md:w-auto bg-white text-indigo-700 px-6 py-3.5 rounded-2xl font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(79,70,229,0.3)] flex items-center justify-center gap-3 border border-indigo-100 shadow-sm"
          >
            <div className="bg-indigo-100/80 p-1.5 rounded-xl group-hover:rotate-90 group-hover:bg-indigo-200 transition-all duration-300">
              <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-sm sm:text-base tracking-wide">Tambah Data</span>
          </button>
        </div>
      </div>

      {/* API Key Alert */}
      {showApiKey && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm relative">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="w-full">
              <h3 className="text-green-800 font-bold flex items-center gap-2">
                API Key untuk {showApiKey.name}
              </h3>
              <p className="text-green-700 text-sm mt-1 mb-3">Salin token ini sekarang. Demi keamanan, token hanya ditampilkan sekali.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <code className="bg-white px-4 py-2 rounded-lg border border-green-100 font-mono text-sm flex-1 text-gray-700 break-all">
                  {showApiKey.key}
                </code>
                <button
                  onClick={() => {
                    if (!navigator.clipboard) {
                      fallbackCopyTextToClipboard(showApiKey.key); return;
                    }
                    navigator.clipboard.writeText(showApiKey.key).then(() => {
                      Swal.fire({ title: "Tersalin!", icon: "success", timer: 1000, showConfirmButton: false });
                    }).catch(() => fallbackCopyTextToClipboard(showApiKey.key));
                  }}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Salin Token
                </button>
              </div>
            </div>
            <button onClick={() => setShowApiKey(null)} className="absolute top-3 right-3 text-green-500 hover:text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Datatable Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Datatable Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Tampilkan</span>
            <div className="relative">
              <select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="border border-gray-300 rounded-lg pl-3 pr-8 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-gray-500">data</span>
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                <th className="px-6 py-4 text-center w-16">No</th>
                <th className="px-6 py-4">Penanggung Jawab</th>
                <th className="px-6 py-4">Detail Institusi</th>
                <th className="px-6 py-4 text-center">Tipe</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500 text-sm">Memuat data...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-500 text-sm">Tidak ada data ditemukan.</td></tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{item.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold text-gray-700">{item.institutionName}</span>
                        {item.subscription?.isActive ? (
                          <span className="text-[11px] font-medium text-green-600 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {item.subscription.planName}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-400 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Free Plan
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold capitalize ${badgeClass}`}>
                        {type}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleViewApiKey(item)} title="API Key" className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg></button>
                        <button onClick={() => openEditModal(item)} title="Edit" className="p-2 bg-gray-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => handleDelete(item.id, item.name)} title="Hapus" className="p-2 bg-gray-50 text-red-600 rounded-lg hover:bg-red-100 transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold">{indexOfFirstItem + Math.min(1, filteredItems.length)}</span> hingga <span className="font-semibold">{Math.min(indexOfLastItem, filteredItems.length)}</span> dari <span className="font-semibold">{filteredItems.length}</span> data
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm transition"
            >Prev</button>
            <div className="flex gap-1 hidden sm:flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 rounded-lg text-sm transition-all ${currentPage === num ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >{num}</button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm transition"
            >Next</button>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah/Edit (Premium 2-Panel Design) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>

          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">

            {/* Left Panel - Banner */}
            <div className={`hidden md:flex md:w-5/12 ${bgGradient} p-10 flex-col justify-between text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/30 shadow-inner">
                  {isEditMode ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                  )}
                </div>
                <h3 className="text-3xl font-bold mb-3 tracking-tight">
                  {isEditMode ? "Edit Data" : "Pendaftaran"}
                </h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  {isEditMode
                    ? `Perbarui informasi profil dan paket langganan untuk entitas ${type} ini.`
                    : `Isi formulir pendaftaran di samping untuk menambahkan data entitas ${type} baru ke dalam sistem.`}
                </p>
              </div>

              <div className="relative z-10">
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Sistem Terenkripsi</h4>
                      <p className="text-xs text-white/70 mt-1">Data sensitif dan API Key dilindungi enkripsi SHA-256 tingkat lanjut.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full md:w-7/12 flex flex-col max-h-[85vh]">
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                <h3 className="text-xl font-bold text-gray-800 md:hidden">
                  {isEditMode ? "Edit Data" : "Daftar Baru"}
                </h3>
                <div className="hidden md:block">
                  <h3 className="text-xl font-bold text-gray-800">Formulir Data</h3>
                  <p className="text-xs text-gray-500 mt-1">Harap lengkapi semua kolom wajib</p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-full p-2.5 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form id="dataForm" onSubmit={handleAddSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-8 overflow-y-auto space-y-8 bg-[#fafcff]">

                  {/* Section 1: Informasi Akun */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg ${badgeClass} flex items-center justify-center text-xs font-black shadow-sm`}>1</span>
                      Informasi Akun
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700">Nama Penanggung Jawab <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          <input name="name" required placeholder="Contoh: Budi Santoso" className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Alamat Email <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          </div>
                          <input name="email" type="email" required disabled={isEditMode} placeholder="email@institusi.com" className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Password Akun {isEditMode ? '' : <span className="text-red-500">*</span>}</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          </div>
                          <input name="password" type="password" required={!isEditMode} placeholder={isEditMode ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" />
                        </div>
                      </div>

                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Section 2: Institusi */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg ${badgeClass} flex items-center justify-center text-xs font-black shadow-sm`}>2</span>
                      Detail Institusi
                    </h4>
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Nama Institusi Penuh <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </div>
                          <input name="institution_name" required placeholder={`Contoh: Universitas Indonesia`} className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-700">Durasi Langganan <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <select name="subscription_duration" required className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none cursor-pointer font-medium text-gray-700">
                            <option value="1 Bulan">Paket Premium - 1 Bulan</option>
                            <option value="3 Bulan">Paket Premium - 3 Bulan</option>
                            <option value="6 Bulan">Paket Premium - 6 Bulan</option>
                            <option value="1 Tahun">Paket Premium - 1 Tahun</option>
                          </select>
                          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 px-8 py-5 bg-white border-t border-gray-100 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm">
                    Batal
                  </button>
                  <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                    {isEditMode ? "Simpan Perubahan" : "Daftarkan Akun"}
                    {!isEditMode && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}