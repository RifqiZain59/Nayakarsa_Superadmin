@extends('layouts.app')
@section('page-title', 'Manajemen Pengguna (Firebase)')
@section('content')

<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
<style>
.dataTables_wrapper .dataTables_filter input {
    border: 1px solid #e2e8f0; border-radius: 0.75rem;
    padding: 0.4rem 0.9rem; font-size: 0.85rem; outline: none;
    transition: border-color 0.2s;
}
.dataTables_wrapper .dataTables_filter input:focus { border-color: #3b82f6; }
.dataTables_wrapper .dataTables_length select {
    border: 1px solid #e2e8f0; border-radius: 0.5rem;
    padding: 0.3rem 0.6rem; font-size: 0.85rem;
}
.dataTables_wrapper .dataTables_info,
.dataTables_wrapper .dataTables_paginate { font-size: 0.82rem; margin-top: 0.75rem; }
.dataTables_wrapper .dataTables_paginate .paginate_button {
    border-radius: 0.5rem !important; padding: 0.25rem 0.6rem !important;
    margin: 0 1px; border: 1px solid transparent !important;
}
.dataTables_wrapper .dataTables_paginate .paginate_button.current {
    background: #3b82f6 !important; color: #fff !important; border-color: #3b82f6 !important;
}
.dataTables_wrapper .dataTables_paginate .paginate_button:hover:not(.current) {
    background: #f1f5f9 !important; color: #334155 !important;
}
table.dataTable thead th { border-bottom: 2px solid #f1f5f9 !important; }
table.dataTable tbody tr:hover { background: #f8fafc !important; }

/* Custom API Key Alert Style */
.api-key-box {
    background-color: #dcfce7;
    border: 1px solid #86efac;
    color: #166534;
    padding: 1.5rem;
    border-radius: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    animation: slideDown 0.4s ease-out;
}
@keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>

<div class="space-y-6">

    {{-- Header --}}
    <div class="relative bg-gradient-to-r from-[#0f172a] via-[#1e3a5f] to-[#1e40af] rounded-2xl px-8 py-7 text-white overflow-hidden shadow-lg">
        <div class="absolute right-0 top-0 w-64 h-full opacity-10">
            <svg viewBox="0 0 200 200" fill="currentColor" class="w-full h-full"><circle cx="160" cy="40" r="80"/><circle cx="60" cy="160" r="60"/></svg>
        </div>
        <div class="relative flex items-center justify-between">
            <div>
                <p class="text-blue-300 text-sm font-medium">Data Terpusat (Firebase)</p>
                <h2 class="text-3xl font-extrabold">Semua Pengguna</h2>
                <p class="text-blue-200 text-sm mt-0.5">Gabungan data dari Sekolah, Universitas, dan Perusahaan.</p>
            </div>
            <div class="flex gap-2">
                <button onclick="fetchAllData()" class="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                </button>
                <button onclick="document.getElementById('add-modal').classList.remove('hidden')"
                    class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 font-semibold text-sm rounded-xl shadow hover:bg-blue-50 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                    Tambah User
                </button>
            </div>
        </div>
    </div>

    {{-- API Key Alert Box (Placeholder for JS) --}}
    <div id="api-key-alert-container"></div>

    {{-- Table Card --}}
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h3 class="text-base font-bold text-slate-800">Daftar Akun Global</h3>
                <p class="text-xs text-slate-400 mt-0.5">Menampilkan data real-time dari Cloud Firestore</p>
            </div>
            <span id="total-badge" class="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-semibold border border-blue-100">0 Pengguna</span>
        </div>
        <div class="p-6">
            <table id="tbl-users" class="min-w-full" style="width:100%">
                <thead>
                    <tr class="bg-slate-50">
                        <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                        <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pengguna</th>
                        <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipe</th>
                        <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Institusi</th>
                        <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Langganan</th>
                        <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">API Key</th>
                        <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50" id="table-body">
                    <tr>
                        <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                            <span class="font-semibold text-sm italic">Memuat data dari Firebase...</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Modal Tambah (Global) --}}
<div id="add-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('add-modal').classList.add('hidden')"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            </div>
            <div>
                <h3 class="text-lg font-bold text-white">Tambah User Baru</h3>
                <p class="text-blue-100 text-xs mt-0.5">Pilih tipe institusi untuk sinkronisasi otomatis</p>
            </div>
        </div>
        <form id="add-form" onsubmit="handleAddUser(event)" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Lengkap</label>
                    <input type="text" name="name" required placeholder="Nama user" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
                    <input type="email" name="email" required placeholder="email@example.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipe Institusi</label>
                    <select name="type" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50">
                        <option value="sekolah">Sekolah</option>
                        <option value="universitas">Universitas</option>
                        <option value="perusahaan">Perusahaan</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nama Institusi</label>
                    <input type="text" name="institution_name" required placeholder="Mis: SMAN 1" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
                <input type="password" name="password" required minlength="8" placeholder="Minimal 8 karakter" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50">
            </div>
            <div class="flex gap-3 pt-2">
                <button type="submit" id="btn-submit-add" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-200">Simpan ke Firebase</button>
                <button type="button" onclick="document.getElementById('add-modal').classList.add('hidden')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Batal</button>
            </div>
        </form>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

<script>
// --- KONFIGURASI & UTILITY ---
const SECRET_KEY = "SUPERADMIN_SECURE_KEY_2026";
const emailRaw = "{{ auth()->user()->email }}";
let SUPERADMIN_ID = "";
let dataTable;

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function encryptData(text) {
    if (!text) return "";
    text = text.toString();
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(unescape(encodeURIComponent(result)));
}

function decryptData(encoded) {
    if (!encoded) return "";
    try {
        let text = decodeURIComponent(escape(atob(encoded)));
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
        }
        return result;
    } catch (e) { return encoded; }
}

function generateApiKey() {
    return Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- CORE LOGIC ---
$(document).ready(async function() {
    SUPERADMIN_ID = await sha256(emailRaw);
    
    dataTable = $('#tbl-users').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/id.json',
            search: "Cari User:",
            lengthMenu: "Tampilkan _MENU_ data"
        },
        columnDefs: [{ orderable: false, targets: [5, 6] }]
    });

    fetchAllData();
});

async function fetchAllData() {
    const db = firebase.firestore();
    const collections = ['sekolah', 'universitas', 'perusahaan'];
    
    try {
        const snapshots = await Promise.all(
            collections.map(col => db.collection('superadmin').doc(SUPERADMIN_ID).collection(col).get())
        );

        dataTable.clear();
        let total = 0;
        let counter = 1;

        snapshots.forEach((snap, idx) => {
            const typeName = collections[idx];
            total += snap.size;

            snap.forEach(doc => {
                const d = doc.data();
                const name = decryptData(d.name);
                const email = decryptData(d.email);
                const inst = decryptData(d.institutionName);
                
                const initials = name ? name.charAt(0).toUpperCase() : '?';
                const userHtml = `
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">${initials}</div>
                        <div>
                            <p class="text-sm font-semibold text-slate-800">${name}</p>
                            <p class="text-xs text-slate-400">${email}</p>
                        </div>
                    </div>
                `;

                const typeColors = { sekolah: 'bg-blue-100 text-blue-700', universitas: 'bg-indigo-100 text-indigo-700', perusahaan: 'bg-emerald-100 text-emerald-700' };
                const typeHtml = `<span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${typeColors[typeName]}">${typeName.toUpperCase()}</span>`;

                let subHtml = '<span class="text-xs text-slate-400">Tidak ada</span>';
                if (d.subscription && d.subscription.isActive) {
                    subHtml = `
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                            <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>${d.subscription.planName}
                        </span>
                    `;
                }

                let apiHtml = '<span class="text-xs text-slate-400 italic">Belum dibuat</span>';
                if (d.apiKeyHash) {
                    apiHtml = `<code class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">${d.apiKeyHash.substring(0, 10)}...</code>`;
                }

                const actionsHtml = `
                    <div class="flex items-center gap-2">
                        <button onclick="regenApiKey('${typeName}', '${doc.id}', '${name}')" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Reset API Key">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                        </button>
                        <button onclick="deleteUser('${typeName}', '${doc.id}', '${name}')" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                `;

                dataTable.row.add([
                    `<span class="text-slate-400 text-sm font-medium">${counter++}</span>`,
                    userHtml,
                    typeHtml,
                    `<span class="text-sm text-slate-600 font-medium">${inst}</span>`,
                    subHtml,
                    apiHtml,
                    actionsHtml
                ]);
            });
        });

        dataTable.draw();
        document.getElementById('total-badge').innerText = total + " Pengguna";

    } catch (e) {
        console.error("Fetch Error:", e);
        Swal.fire('Error', 'Gagal memuat data dari Firebase: ' + e.message, 'error');
    }
}

async function handleAddUser(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-add');
    btn.disabled = true;
    btn.innerText = 'Memproses...';

    const f = event.target;
    const rawName = f.name.value;
    const rawEmail = f.email.value;
    const rawType = f.type.value;
    const rawInst = f.institution_name.value;
    const rawPass = f.password.value;

    try {
        const db = firebase.firestore();
        const idHash = await sha256(Date.now() + rawEmail);
        const passHash = await sha256(rawPass);
        const rawApi = generateApiKey();
        const apiHash = await sha256(rawApi);

        const data = {
            uidHash: idHash,
            name: encryptData(rawName),
            email: encryptData(rawEmail),
            institutionName: encryptData(rawInst),
            institutionType: encryptData(rawType),
            role: encryptData('user'),
            passwordHash: passHash,
            apiKeyHash: apiHash,
            hasApiKey: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('superadmin').doc(SUPERADMIN_ID).collection(rawType).doc(idHash).set(data);

        // Show API Key Alert
        showApiKeyAlert(rawName, rawApi);

        document.getElementById('add-modal').classList.add('hidden');
        f.reset();
        fetchAllData();

    } catch (e) {
        Swal.fire('Gagal', e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Simpan ke Firebase';
    }
}

function showApiKeyAlert(name, key) {
    const container = document.getElementById('api-key-alert-container');
    container.innerHTML = `
        <div class="api-key-box">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div class="flex-1">
                    <h4 class="text-lg font-bold">✅ API Key Berhasil Dibuat untuk ${name}!</h4>
                    <p class="text-sm opacity-90">Silakan copy sekarang. <b>Token ini hanya ditampilkan satu kali demi keamanan.</b></p>
                    <div class="mt-4 flex gap-2">
                        <input type="text" value="${key}" readonly id="apiKeyInput" class="flex-1 px-4 py-2.5 rounded-lg border-none outline-none font-mono text-sm bg-white/80">
                        <button onclick="copyToClipboard()" class="px-5 py-2.5 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition">Copy</button>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="text-emerald-700/50 hover:text-emerald-700"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>
        </div>
    `;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function copyToClipboard() {
    const input = document.getElementById('apiKeyInput');
    input.select();
    navigator.clipboard.writeText(input.value);
    Swal.fire({ icon: 'success', title: 'Tercopy!', timer: 1000, showConfirmButton: false });
}

async function regenApiKey(type, docId, name) {
    const { isConfirmed } = await Swal.fire({
        title: 'Reset API Key?',
        text: `API Key lama untuk ${name} akan hangus.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Ya, Buat Baru'
    });

    if (isConfirmed) {
        try {
            const rawApi = generateApiKey();
            const apiHash = await sha256(rawApi);
            await firebase.firestore().collection('superadmin').doc(SUPERADMIN_ID).collection(type).doc(docId).update({
                apiKeyHash: apiHash,
                hasApiKey: true
            });
            showApiKeyAlert(name, rawApi);
            fetchAllData();
        } catch (e) { Swal.fire('Error', e.message, 'error'); }
    }
}

async function deleteUser(type, docId, name) {
    const { isConfirmed } = await Swal.fire({
        title: 'Hapus User?',
        text: `Akun ${name} akan dihapus permanen dari Firebase.`,
        icon: 'danger',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Hapus Sekarang'
    });

    if (isConfirmed) {
        try {
            await firebase.firestore().collection('superadmin').doc(SUPERADMIN_ID).collection(type).doc(docId).delete();
            Swal.fire('Terhapus', '', 'success');
            fetchAllData();
        } catch (e) { Swal.fire('Error', e.message, 'error'); }
    }
}
</script>

@endsection
