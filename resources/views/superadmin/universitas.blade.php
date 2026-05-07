@extends('layouts.app')
@section('page-title', 'Kelola Akun')
@section('content')

<link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/jquery.dataTables.min.css">
<style>
.dataTables_wrapper .dataTables_filter input {
    border: 1px solid #e2e8f0; border-radius: 0.75rem;
    padding: 0.4rem 0.9rem; font-size: 0.85rem; outline: none;
    transition: border-color 0.2s;
}
.dataTables_wrapper .dataTables_filter input:focus { border-color: #10b981; }
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
    background: #10b981 !important; color: #fff !important; border-color: #10b981 !important;
}
.dataTables_wrapper .dataTables_paginate .paginate_button:hover:not(.current) {
    background: #f1f5f9 !important; color: #334155 !important;
}
table.dataTable thead th { border-bottom: 2px solid #f1f5f9 !important; }
table.dataTable tbody tr:hover { background: #f8fafc !important; }
</style>

<div class="space-y-6">

    {{-- Header --}}
    <div class="relative bg-gradient-to-r from-[#0f172a] via-emerald-900 to-emerald-700 rounded-2xl px-8 py-7 text-white overflow-hidden shadow-lg">
        <div class="absolute right-0 top-0 w-64 h-full opacity-10"><svg viewBox="0 0 200 200" fill="currentColor" class="w-full h-full"><circle cx="160" cy="40" r="80"/><circle cx="60" cy="160" r="60"/></svg></div>
        <div class="relative flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
                </div>
                <div>
                    <p class="text-emerald-300 text-sm font-medium">Kelola Akun</p>
                    <h2 class="text-3xl font-extrabold">Universitas</h2>
                    <p class="text-emerald-200 text-sm mt-0.5"><span id="header-total">0</span> terdaftar &middot; <span id="header-active">0</span> aktif berlangganan</p>
                </div>
            </div>
            <button onclick="document.getElementById('add-modal').classList.remove('hidden')"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0f172a] font-semibold text-sm rounded-xl shadow hover:bg-emerald-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Tambah Akun
            </button>
        </div>
    </div>

    {{-- Table --}}
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h3 class="text-base font-bold text-slate-800">Daftar Akun</h3>
                <p class="text-xs text-slate-400 mt-0.5">Pengguna tipe institusi universitas / korporasi</p>
            </div>
            <span class="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full font-semibold border border-emerald-100"><span id="badge-total">0</span> Universitas</span>
        </div>
        <div class="p-6">
            <table id="tbl-universitas" class="min-w-full" style="width:100%">
                <thead><tr class="bg-slate-50">
                    <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                    <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pengguna</th>
                    <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nama Universitas</th>
                    <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Langganan</th>
                    <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Durasi</th>
                    <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">API Key</th>
                    <th class="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50" id="table-body">
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Add Modal --}}
<div id="add-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('add-modal').classList.add('hidden')"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-600 to-emerald-800 px-6 py-5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
            </div>
            <div>
                <h3 class="text-lg font-bold text-white">Tambah Akun Universitas</h3>
                <p class="text-emerald-200 text-xs mt-0.5">Disimpan langsung ke Firebase</p>
            </div>
        </div>
        <form id="add-form" onsubmit="handleAddUser(event)" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap <span class="text-red-500">*</span></label>
                    <input type="text" name="name" required placeholder="Nama admin" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-slate-50">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email <span class="text-red-500">*</span></label>
                    <input type="email" name="email" required placeholder="admin@universitas.com" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-slate-50">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password <span class="text-red-500">*</span></label>
                    <input type="password" name="password" required minlength="8" placeholder="Minimal 8 karakter" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-slate-50">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Universitas <span class="text-red-500">*</span></label>
                    <input type="text" name="institution_name" required placeholder="Universitas Indonesia" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-slate-50">
                </div>
            </div>

            <div class="bg-emerald-50 rounded-xl p-4 space-y-3 border border-emerald-100">
                <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                    Paket Langganan <span class="text-red-500">*</span>
                </p>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Nama Paket</label>
                        <div class="relative">
                            <select name="plan_name" required class="w-full pl-3 pr-10 py-2.5 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white text-slate-700 appearance-none cursor-pointer">
                                <option value="">-- Pilih Paket --</option>
                                <option value="Basic Plan">Basic Plan</option>
                                <option value="Standard Plan">Standard Plan</option>
                                <option value="Premium Plan">Premium Plan</option>
                                <option value="Enterprise Plan">Enterprise Plan</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1.5">Durasi</label>
                        <div class="relative">
                            <select name="duration_days" class="w-full pl-3 pr-10 py-2.5 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white text-slate-700 appearance-none cursor-pointer">
                                <option value="0">-- Pilih Durasi --</option>
                                <option value="30">1 Bulan</option>
                                <option value="90">3 Bulan</option>
                                <option value="180">6 Bulan</option>
                                <option value="365">1 Tahun</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-200">
                <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <p class="text-xs text-slate-600 font-medium">API Key akan dibuat <strong>otomatis</strong> secara aman</p>
            </div>
            <div class="flex gap-3 pt-1">
                <button type="submit" id="btn-submit-add" class="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow-sm shadow-emerald-200">Simpan Akun</button>
                <button type="button" onclick="document.getElementById('add-modal').classList.add('hidden')" class="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition">Batal</button>
            </div>
        </form>
    </div>
</div>

{{-- Edit Modal --}}
<div id="edit-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('edit-modal').classList.add('hidden')"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div class="bg-[#059669] px-6 py-5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </div>
            <div>
                <h3 class="text-lg font-bold text-white">Edit Pengguna</h3>
                <p class="text-emerald-100 text-xs mt-0.5" id="edit-email-label">email@example.com</p>
            </div>
        </div>
        <form id="edit-form" onsubmit="handleEditUser(event)" class="p-6 space-y-4">
            <input type="hidden" name="doc_id" id="edit-doc-id">
            <input type="hidden" name="current_end_millis" id="edit-end-millis">
            <input type="hidden" name="old_duration_days" id="edit-old-duration">
            <input type="hidden" name="edit_quota" id="edit-quota">
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Lengkap <span class="text-red-500">*</span></label>
                    <input type="text" name="name" id="edit-name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] transition bg-white">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email (Tidak bisa diubah)</label>
                    <input type="email" name="email" id="edit-email" readonly class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none bg-slate-50 text-slate-600 cursor-not-allowed">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password <span class="text-slate-400 font-normal normal-case">(Isi jika ganti)</span></label>
                    <input type="password" name="password" minlength="8" placeholder="Biarkan kosong" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nama Universitas <span class="text-red-500">*</span></label>
                    <input type="text" name="institution_name" id="edit-institution" required placeholder="Universitas Indonesia" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] transition bg-white">
                </div>
            </div>

            
            <div class="bg-emerald-50 rounded-xl p-4 space-y-3 border border-emerald-100">
                <div class="flex justify-between items-center">
                    <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        Paket Langganan <span class="text-red-500">*</span>
                    </p>
                    <span id="edit-status-badge" class="text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold">Memuat...</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="block text-[11px] font-semibold text-slate-600 mb-1.5">Nama Paket</label>
                        <div class="relative">
                            <select name="plan_name" id="edit-plan-name" required class="w-full pl-3 pr-10 py-2.5 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white text-slate-700 appearance-none cursor-pointer">
                                <option value="">-- Pilih --</option>
                                <option value="Basic Plan">Basic Plan</option>
                                <option value="Standard Plan">Standard Plan</option>
                                <option value="Premium Plan">Premium Plan</option>
                                <option value="Enterprise Plan">Enterprise Plan</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-slate-600 mb-1.5">Edit Durasi (Reset)</label>
                        <div class="relative">
                            <select name="edit_duration_days" id="edit-duration-days" onchange="updateEditBadge()" class="w-full pl-3 pr-10 py-2.5 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white text-slate-700 appearance-none cursor-pointer">
                                <option value="0">-- Pilih --</option>
                                <option value="30">1 Bulan</option>
                                <option value="90">3 Bulan</option>
                                <option value="180">6 Bulan</option>
                                <option value="365">1 Tahun</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label class="block text-[11px] font-semibold text-slate-600 mb-1.5">Tambah Durasi (+)</label>
                        <div class="relative">
                            <select name="add_duration_days" id="add-duration-days" onchange="updateEditBadge()" class="w-full pl-3 pr-10 py-2.5 rounded-lg border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white text-slate-700 appearance-none cursor-pointer">
                                <option value="0">-- Tambah --</option>
                                <option value="30">+ 1 Bulan</option>
                                <option value="90">+ 3 Bulan</option>
                                <option value="180">+ 6 Bulan</option>
                                <option value="365">+ 1 Tahun</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-1 sm:col-span-3 pt-1">
                        <p id="quota-warning-text" class="text-[11px] font-bold text-blue-600">Sisa kuota edit durasi: 4 kali</p>
                    </div>
                </div>
            </div>

            <div class="bg-slate-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-slate-200">
                <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <p class="text-xs text-slate-500 font-medium">API Key telah diamankan dan tidak dapat diubah dari sini.</p>
            </div>
            
            <div class="pt-2 flex gap-3">
                <button type="submit" id="btn-submit-edit" class="flex-1 py-2.5 bg-[#059669] hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    Simpan Perubahan
                </button>
                <button type="button" onclick="document.getElementById('edit-modal').classList.add('hidden')" class="flex-1 py-2.5 bg-[#e2e8f0] hover:bg-slate-300 text-slate-700 text-sm font-semibold rounded-xl transition">Batal</button>
            </div>
        </form>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
async function sha256(msg) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg.toLowerCase().trim()));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function generateRandomApiKey() {
    return Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function getIpAddress() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        return data.ip;
    } catch(e) {
        return 'Unknown IP';
    }
}

const SECRET_KEY = "SUPERADMIN_SECURE_KEY_2026";
function encryptData(text) {
    if (!text) return text;
    text = text.toString();
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(result);
}
function decryptData(base64Str) {
    if (!base64Str) return base64Str;
    try {
        const text = atob(base64Str);
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
        }
        return result;
    } catch (e) {
        return base64Str;
    }
}

let SUPERADMIN_ID = "";
let dataTable;

$(document).ready(async function() {
    SUPERADMIN_ID = await sha256("{{ auth()->user()->email }}");
    
    dataTable = $('#tbl-universitas').DataTable({
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/id.json',
            lengthMenu: "Tampilkan _MENU_ data",
            search: "Cari:"
        },
        columnDefs: [ { orderable: false, targets: 6 } ]
    });

    const db = firebase.firestore();
    let hasAlertedExpired = new Set();
    
    db.collection('superadmin').doc(SUPERADMIN_ID).collection('universitas')
      .onSnapshot(snapshot => {
          dataTable.clear();
          let activeCount = 0;
          let i = 1;
          let newlyExpired = [];

          snapshot.forEach(doc => {
              const rawData = doc.data();
              const user = {
                  ...rawData,
                  name: decryptData(rawData.name),
                  email: decryptData(rawData.email),
                  institutionName: decryptData(rawData.institutionName),
                  role: decryptData(rawData.role),
                  institutionType: decryptData(rawData.institutionType)
              };
              const hasSub = user.subscription && user.subscription.isActive;
              if(hasSub) activeCount++;
              
              let editQuota = user.editQuota !== undefined ? user.editQuota : 4;

              const initials = user.name ? user.name.charAt(0).toUpperCase() : '?';
              const nameHtml = `
                  <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">${initials}</div>
                      <div>
                          <p class="text-sm font-semibold text-slate-800">${user.name || '—'}</p>
                          <p class="text-xs text-slate-400">${user.email || '—'}</p>
                      </div>
                  </div>
              `;
              
              let subHtml = '<span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">Tidak ada</span>';
              let planName = '';
              let endMillis = 0;
              let currentEndDateStr = 'Tidak ada paket aktif';
              let durationDays = 0; // Data durasi yang disimpan

              if(hasSub) {
                  const endObj = user.subscription.endDate;
                  if(endObj) {
                      endMillis = endObj.toMillis();
                      currentEndDateStr = 'Aktif s/d ' + new Date(endMillis).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'});
                  }
                  planName = user.subscription.planName;
                  durationDays = user.subscription.durationDays || 0;

                  subHtml = `
                      <div>
                          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                              <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>${planName}
                          </span>
                          <p class="text-[10px] text-slate-400 mt-0.5">${currentEndDateStr.replace('Aktif ', '')}</p>
                      </div>
                  `;
              }
              
              let durasiHtml = '<span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">—</span>';
              if(hasSub && endMillis > 0) {
                  const now = new Date().getTime();
                  const diffDays = Math.ceil((endMillis - now) / (1000 * 60 * 60 * 24));
                  if(diffDays > 0) {
                      durasiHtml = `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${diffDays} hari</span>`;
                  } else {
                      durasiHtml = `<span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600">Expired</span>`;
                      currentEndDateStr = 'Sudah Expired';
                      if (!hasAlertedExpired.has(doc.id)) {
                          hasAlertedExpired.add(doc.id);
                          newlyExpired.push(user.institutionName || 'Universitas');
                      }
                  }
              }

              let apiHtml = '<span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">Tidak ada</span>';
              if(user.hasApiKey && user.apiKeyHash) {
                  const shortHash = user.apiKeyHash.substring(0, 12) + '...';
                  apiHtml = `
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-slate-100 text-slate-600" title="${user.apiKeyHash}">
                          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                          ${shortHash}
                      </span>
                  `;
              }

              const safeName = (user.name || '').replace(/'/g, "\\'");
              const safeInst = (user.institutionName || '').replace(/'/g, "\\'");

              const actionsHtml = `
                  <div class="flex items-center gap-2">
                      <button onclick="openEditModal('${doc.id}', '${safeName}', '${user.email}', '${safeInst}', '${planName}', '${currentEndDateStr}', ${endMillis}, ${editQuota}, ${durationDays})"
                          class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          Edit
                      </button>
                      <button type="button" onclick="deleteUserFirebase('${doc.id}', '${user.email}')" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                  </div>
              `;

              dataTable.row.add([
                  `<span class="text-sm text-slate-400">${i++}</span>`,
                  nameHtml,
                  `<span class="text-sm text-slate-600 font-medium">${user.institutionName || '—'}</span>`,
                  subHtml,
                  durasiHtml,
                  apiHtml,
                  actionsHtml
              ]);
          });
          dataTable.draw();

          document.getElementById('header-total').textContent = snapshot.size;
          document.getElementById('badge-total').textContent = snapshot.size;
          document.getElementById('header-active').textContent = activeCount;
          
          if (newlyExpired.length > 0) {
              const text = newlyExpired.length > 1 ? `Langganan untuk ${newlyExpired.length} universitas telah habis!` : `Langganan untuk ${newlyExpired[0]} telah habis!`;
              Swal.fire('Langganan Habis', text, 'warning');
          }
      });
});

async function handleAddUser(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-add');
    btn.disabled = true;
    btn.innerText = 'Menyimpan...';

    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const instName = form.institution_name.value;
    const planName = form.plan_name.value;
    const durDays = parseInt(form.duration_days.value) || 0;
    const type = 'universitas';

    try {
        const db = firebase.firestore();
        const idHash = await sha256(crypto.randomUUID() + email);
        const passwordHash = await sha256(password);
        
        const rawApiKey = generateRandomApiKey();
        const apiKeyHash = await sha256(rawApiKey);
        
        const data = {
            uidHash: idHash,
            role: encryptData('user'),
            institutionType: encryptData(type),
            name: encryptData(name),
            email: encryptData(email),
            passwordHash: passwordHash,
            apiKeyHash: apiKeyHash,
            hasApiKey: true,
            institutionName: encryptData(instName),
            editQuota: 4,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (planName && durDays > 0) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + durDays);
            data.subscription = {
                planName: planName,
                isActive: true,
                endDate: firebase.firestore.Timestamp.fromDate(endDate),
                durationDays: durDays
            };
        }

        await db.collection('superadmin').doc(SUPERADMIN_ID).collection(type).doc(idHash).set(data);
        
        const ip = await getIpAddress();
        const encAct = await sha256(`add_universitas_${email}_${Date.now()}`);
        const encIp = await sha256(ip);
        const encDev = await sha256(navigator.userAgent);
        await db.collection('superadmin').doc(SUPERADMIN_ID).collection('logs').add({
            activity: `Berhasil menambahkan akun universitas baru (${email})`,
            activityHash: encAct, ipAddress: ip, ipHash: encIp, device: navigator.userAgent, deviceHash: encDev,
            type: 'add_universitas',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('add-modal').classList.add('hidden');
        form.reset();
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Didaftarkan!',
            html: `Akun <b>${name}</b> berhasil disimpan ke Firebase.<br><br><div class="text-left bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2"><span class="text-xs font-bold text-slate-500 uppercase">API Key (Sekali Tampil):</span><br><code class="text-sm text-slate-800 break-all select-all font-mono">${rawApiKey}</code></div><p class="text-xs text-red-500 mt-3">*Sistem hanya menyimpan versi sandi rahasia. Salin API Key ini sekarang!</p>`,
            confirmButtonColor: '#059669'
        });
        
    } catch(e) {
        console.error("Error adding user:", e);
        Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan data: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Simpan Akun';
    }
}

function openEditModal(docId, name, email, instName, planName, endDateStr, endMillis, editQuota, durationDays) {
    document.getElementById('edit-doc-id').value = docId;
    document.getElementById('edit-end-millis').value = endMillis || 0;
    document.getElementById('edit-name').value = name;
    document.getElementById('edit-email').value = email;
    document.getElementById('edit-email-label').textContent = email;
    document.getElementById('edit-institution').value = instName !== 'undefined' ? instName : '';
    document.getElementById('edit-plan-name').value = planName || '';
    document.getElementById('edit-old-duration').value = durationDays || 0;
    document.getElementById('edit-quota').value = editQuota || 0;
    document.getElementById('edit-form').password.value = '';

    let editDurSelect = document.getElementById('edit-duration-days');
    if (durationDays > 0 && Array.from(editDurSelect.options).some(opt => opt.value == durationDays)) {
        editDurSelect.value = durationDays;
    } else {
        editDurSelect.value = '0';
    }
    
    document.getElementById('add-duration-days').value = '0';

    const quotaText = document.getElementById('quota-warning-text');
    quotaText.textContent = `Sisa kuota edit durasi: ${editQuota} kali`;
    if(editQuota <= 0) {
        quotaText.className = 'text-[11px] font-bold text-red-600 mt-1';
    } else {
        quotaText.className = 'text-[11px] font-bold text-blue-600 mt-1';
    }
    
    const badge = document.getElementById('edit-status-badge');
    badge.innerHTML = endDateStr;
    if(endDateStr.includes('Aktif') || endDateStr.includes('Sisa')) {
        badge.className = 'text-[10px] bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-bold';
    } else if (endDateStr.includes('Expired') || endDateStr.includes('Kadaluarsa')) {
        badge.className = 'text-[10px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-bold';
    } else {
        badge.className = 'text-[10px] bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full font-bold';
    }
    
    document.getElementById('edit-modal').classList.remove('hidden');
}

function updateEditBadge() {
    const endMillis = parseInt(document.getElementById('edit-end-millis').value) || 0;
    const addDurDays = parseInt(document.getElementById('add-duration-days').value) || 0;
    const editDurDays = parseInt(document.getElementById('edit-duration-days').value) || 0;
    const oldDurDays = parseInt(document.getElementById('edit-old-duration').value) || 0;
    
    let isAdding = addDurDays > 0;
    let isEditing = !isAdding && (editDurDays > 0 && editDurDays !== oldDurDays);
    
    let baseDate = new Date();
    let newEndDate = baseDate;
    
    if (isAdding) {
        if (endMillis > baseDate.getTime()) {
            baseDate = new Date(endMillis);
        }
        newEndDate = new Date(baseDate);
        newEndDate.setDate(newEndDate.getDate() + addDurDays);
    } else if (isEditing) {
        newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + editDurDays);
    } else if (endMillis > 0) {
        newEndDate = new Date(endMillis);
    } else {
        return; // Tidak ada langganan
    }
    
    const now = new Date().getTime();
    const diffDays = Math.ceil((newEndDate.getTime() - now) / (1000 * 60 * 60 * 24));
    
    const badge = document.getElementById('edit-status-badge');
    if (diffDays > 0) {
        badge.innerHTML = `Aktif s/d ${newEndDate.toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'})} <span class="ml-1 opacity-75">(Sisa ${diffDays} hr)</span>`;
        badge.className = 'text-[10px] bg-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-bold inline-flex items-center';
    } else {
        badge.innerHTML = `Kadaluarsa`;
        badge.className = 'text-[10px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-bold inline-flex items-center';
    }
}

async function handleEditUser(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-edit');
    btn.disabled = true;
    btn.innerText = 'Menyimpan...';

    const form = event.target;
    const docId = form.doc_id.value;
    const name = form.name.value;
    const password = form.password.value;
    const instName = form.institution_name.value;
    const planName = form.plan_name.value;
    const editDurDays = parseInt(form.edit_duration_days.value) || 0;
    const addDurDays = parseInt(form.add_duration_days.value) || 0;
    const currentEndMillis = parseInt(form.current_end_millis.value) || 0;
    const oldDurDays = parseInt(form.old_duration_days.value) || 0;
    let editQuota = parseInt(form.edit_quota.value);
    if (isNaN(editQuota)) editQuota = 4;

    const type = 'universitas';

    let isAdding = addDurDays > 0;
    let isEditing = !isAdding && (editDurDays > 0 && editDurDays !== oldDurDays);

    if (isEditing) {
        if (editQuota <= 0) {
            Swal.fire('Gagal', 'Sisa kuota edit durasi Anda sudah habis (0). Anda hanya bisa menggunakan opsi Tambah Durasi (+).', 'error');
            btn.disabled = false;
            btn.innerText = 'Simpan Perubahan';
            return;
        }

        const confirm = await Swal.fire({
            title: 'Peringatan Edit Durasi',
            html: `Anda akan mereset masa aktif langganan mulai dari hari ini.<br><br><b>Sisa kuota edit durasi: ${editQuota} kali</b>.<br>Jika dilanjutkan, sisa akan menjadi <b>${editQuota - 1} kali</b>.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Lanjutkan',
            cancelButtonText: 'Batal'
        });

        if (!confirm.isConfirmed) {
            btn.disabled = false;
            btn.innerText = 'Simpan Perubahan';
            return;
        }
        
        editQuota -= 1;
    }

    try {
        const db = firebase.firestore();
        
        const updateData = {
            name: encryptData(name),
            institutionName: encryptData(instName),
            editQuota: editQuota
        };
        
        if (password) {
            updateData.passwordHash = await sha256(password);
        }
        
        if (planName) {
            let baseDate = new Date();
            let newEndDate = baseDate;
            let finalDurDays = oldDurDays;

            if (isAdding) {
                if (currentEndMillis > baseDate.getTime()) {
                    baseDate = new Date(currentEndMillis);
                }
                newEndDate = new Date(baseDate);
                newEndDate.setDate(newEndDate.getDate() + addDurDays);
                finalDurDays = oldDurDays + addDurDays;
                updateData.subscription = { planName: planName, isActive: true, endDate: firebase.firestore.Timestamp.fromDate(newEndDate), durationDays: finalDurDays };
            } else if (isEditing) {
                newEndDate = new Date();
                newEndDate.setDate(newEndDate.getDate() + editDurDays);
                finalDurDays = editDurDays;
                updateData.subscription = { planName: planName, isActive: true, endDate: firebase.firestore.Timestamp.fromDate(newEndDate), durationDays: finalDurDays };
            } else if (currentEndMillis > 0) {
                newEndDate = new Date(currentEndMillis);
                updateData.subscription = { planName: planName, isActive: true, endDate: firebase.firestore.Timestamp.fromDate(newEndDate), durationDays: finalDurDays };
            }
        }

        await db.collection('superadmin').doc(SUPERADMIN_ID).collection(type).doc(docId).update(updateData);
        
        const ip = await getIpAddress();
        const encActE = await sha256(`edit_universitas_${name}_${Date.now()}`);
        const encIpE = await sha256(ip);
        const encDevE = await sha256(navigator.userAgent);
        await db.collection('superadmin').doc(SUPERADMIN_ID).collection('logs').add({
            activity: `Berhasil memperbarui profil universitas (${name})`,
            activityHash: encActE, ipAddress: ip, ipHash: encIpE, device: navigator.userAgent, deviceHash: encDevE,
            type: 'edit_universitas',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        document.getElementById('edit-modal').classList.add('hidden');
        Swal.fire({
            icon: 'success',
            title: 'Tersimpan!',
            text: 'Data berhasil diperbarui di Firebase.',
            showConfirmButton: false,
            timer: 1500
        });
    } catch(e) {
        console.error("Error updating user:", e);
        Swal.fire('Gagal', 'Terjadi kesalahan: ' + e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = 'Simpan Perubahan';
    }
}

async function deleteUserFirebase(docId, email) {
    Swal.fire({
        title: 'Hapus Akun?',
        text: "Akun ini akan dihapus permanen dari Firebase!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const db = firebase.firestore();
                await db.collection('superadmin').doc(SUPERADMIN_ID).collection('universitas').doc(docId).delete();
                
                const ip = await getIpAddress();
                const encActD = await sha256(`delete_universitas_${email}_${Date.now()}`);
                const encIpD = await sha256(ip);
                const encDevD = await sha256(navigator.userAgent);
                await db.collection('superadmin').doc(SUPERADMIN_ID).collection('logs').add({
                    activity: `Berhasil menghapus akun universitas (${email})`,
                    activityHash: encActD, ipAddress: ip, ipHash: encIpD, device: navigator.userAgent, deviceHash: encDevD,
                    type: 'delete_universitas',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Akun telah dihapus.',
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (e) {
                console.error("Gagal menghapus dari Firebase:", e);
                Swal.fire('Gagal', 'Tidak dapat menghapus data.', 'error');
            }
        }
    });
}
</script>
@endsection