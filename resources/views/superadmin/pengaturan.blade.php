@extends('layouts.app')
@section('page-title', 'Pengaturan')
@section('content')

<div class="space-y-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
        <h2 class="text-3xl font-extrabold text-slate-800">Pengaturan</h2>
        <p class="text-slate-500 mt-2 text-sm">Kelola preferensi, keamanan akun, dan log sistem Command Center.</p>
    </div>

    <div class="flex flex-col md:flex-row gap-8">
        <!-- Sidebar Navigation -->
        <div class="w-full md:w-64 shrink-0 space-y-4" id="settings-tabs">
            <button onclick="switchTab('profil')" id="tab-btn-profil" class="tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-white text-blue-600 shadow-sm border border-blue-100">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Informasi Pribadi
            </button>
            <button onclick="switchTab('keamanan')" id="tab-btn-keamanan" class="tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:bg-slate-50 border border-transparent">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                Keamanan & Sandi
            </button>
            <button onclick="switchTab('notifikasi')" id="tab-btn-notifikasi" class="tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:bg-slate-50 border border-transparent">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                Notifikasi Firebase
            </button>
            <button onclick="switchTab('log')" id="tab-btn-log" class="tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:bg-slate-50 border border-transparent">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Log Aktivitas Admin
            </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px]">
            
            @if(session('success'))
            <div class="m-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                {{ session('success') }}
            </div>
            @endif
            @if(session('error'))
            <div class="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>
                {{ session('error') }}
            </div>
            @endif

            <!-- TAB: Informasi Pribadi -->
            <div id="tab-profil" class="tab-content block">
                <div class="px-8 py-6 border-b border-slate-100">
                    <h3 class="text-xl font-bold text-slate-800">Informasi Pribadi</h3>
                </div>
                <form action="{{ route('superadmin.users.profile', auth()->id()) }}" method="POST" enctype="multipart/form-data" class="p-8 space-y-6">
                    @csrf
                    
                    <div class="p-6 bg-slate-50 rounded-2xl flex items-center gap-6 border border-slate-100">
                        @if(auth()->user()->avatar)
                            <img id="avatar-preview" src="{{ asset('storage/'.auth()->user()->avatar) }}" class="w-24 h-24 rounded-full object-cover shadow-sm ring-4 ring-white">
                        @else
                            <div id="avatar-preview" class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-sm ring-4 ring-white">{{ strtoupper(substr(auth()->user()->name,0,2)) }}</div>
                        @endif
                        
                        <div>
                            <p class="text-sm font-bold text-slate-800 mb-2">Foto Profil</p>
                            <label class="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold text-sm rounded-lg cursor-pointer transition inline-block">
                                Ubah Foto
                                <input type="file" name="avatar" class="hidden" accept="image/*" onchange="previewAvatar(this, 'avatar-preview')">
                            </label>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                        <input type="text" name="name" value="{{ auth()->user()->name }}" required class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">Alamat Email (Terkunci)</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            </div>
                            <input type="email" value="{{ auth()->user()->email }}" disabled class="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed">
                        </div>
                    </div>

                    <div class="pt-4">
                        <button type="submit" class="w-full py-3.5 bg-[#0f172a] hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>

            <!-- TAB: Keamanan & Sandi -->
            <div id="tab-keamanan" class="tab-content hidden">
                <div class="px-8 py-6 border-b border-slate-100">
                    <h3 class="text-xl font-bold text-slate-800">Keamanan & Sandi</h3>
                </div>
                <div class="p-8 space-y-8">
                    <form action="{{ route('superadmin.users.changePassword', auth()->id()) }}" method="POST" class="space-y-6">
                        @csrf
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Sandi Saat Ini</label>
                            <input type="password" name="current_password" placeholder="Masukkan sandi saat ini" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Sandi Baru</label>
                            <input type="password" name="new_password" required minlength="8" placeholder="Sandi baru (Min. 8 karakter)" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Konfirmasi Sandi Baru</label>
                            <input type="password" name="new_password_confirmation" required placeholder="Ulangi sandi baru" class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        </div>
                        <button type="submit" class="w-full py-3.5 bg-[#e87000] hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                            Perbarui Kata Sandi
                        </button>
                    </form>

                    <div class="pt-8 border-t border-slate-100">
                        <h4 class="text-red-600 font-bold text-lg mb-2">Zona Berbahaya</h4>
                        <p class="text-sm text-slate-500 mb-6 leading-relaxed">Menghapus akun akan menghilangkan seluruh akses Anda ke Command Center Nayakarsa secara permanen. Tindakan ini tidak dapat dibatalkan.</p>
                        <button type="button" class="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 border border-red-100" onclick="handleDeleteAccount()">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Hapus Akun Permanen
                        </button>
                    </div>
                </div>
            </div>

            <!-- TAB: Notifikasi Firebase -->
            <div id="tab-notifikasi" class="tab-content hidden">
                <div class="px-8 py-6 border-b border-slate-100">
                    <h3 class="text-xl font-bold text-slate-800">Notifikasi Firebase</h3>
                </div>
                <div class="p-8 space-y-4">
                    <!-- Toggle 1 -->
                    <div class="flex items-center justify-between p-5 border border-slate-200 rounded-2xl">
                        <div>
                            <h4 class="font-bold text-slate-800">Peringatan API Limit</h4>
                            <p class="text-sm text-slate-500 mt-0.5">Kirim email jika limit API klien hampir habis.</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <!-- Toggle 2 -->
                    <div class="flex items-center justify-between p-5 border border-slate-200 rounded-2xl">
                        <div>
                            <h4 class="font-bold text-slate-800">Aktivitas Login Mencurigakan</h4>
                            <p class="text-sm text-slate-500 mt-0.5">Notifikasi push ke perangkat saat IP tidak dikenal login.</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <!-- Toggle 3 -->
                    <div class="flex items-center justify-between p-5 border border-amber-200 bg-amber-50 rounded-2xl">
                        <div>
                            <h4 class="font-bold text-amber-900">Peringatan Pemeliharaan (Maintenance)</h4>
                            <p class="text-sm text-amber-700 mt-0.5">Kirim pengumuman pemeliharaan server secara massal ke klien.</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer opacity-70">
                            <input type="checkbox" class="sr-only peer">
                            <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- TAB: Log Aktivitas -->
            <div id="tab-log" class="tab-content hidden">
                <div class="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 class="text-xl font-bold text-slate-800">Log Aktivitas Admin</h3>
                </div>
                <div class="p-8">
                    <div class="space-y-4" id="firebase-logs-container">
                        <div class="text-center py-10 text-slate-400 text-sm">Memuat log dari Firebase...</div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

@endsection

@push('scripts')
<script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
function switchTab(tabId) {
    // Sembunyikan semua konten tab
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('block');
    });
    
    // Reset semua gaya tombol tab ke non-aktif
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.className = 'tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-500 hover:bg-slate-50 border border-transparent';
    });

    // Tampilkan konten tab yang aktif
    const content = document.getElementById('tab-' + tabId);
    if(content) {
        content.classList.remove('hidden');
        content.classList.add('block');
    }

    // Ubah gaya tombol tab yang aktif
    const activeBtn = document.getElementById('tab-btn-' + tabId);
    if(activeBtn) {
        activeBtn.className = 'tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-white text-blue-600 shadow-sm border border-blue-100';
    }
}

function previewAvatar(input, targetId) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const target = document.getElementById(targetId);
            if (target.tagName === 'IMG') {
                target.src = e.target.result;
            } else {
                const img = document.createElement('img');
                img.id = targetId;
                img.src = e.target.result;
                img.className = 'w-24 h-24 rounded-full object-cover shadow-sm ring-4 ring-white';
                target.parentNode.replaceChild(img, target);
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Cek URL hash untuk tab aktif saat memuat halaman
document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    if (['profil', 'keamanan', 'notifikasi', 'log'].includes(hash)) {
        switchTab(hash);
    }
    // Set SUPERADMIN_ID via SHA256 and load logs
    initFirebaseLogs();
});

const emailRaw = "{{ auth()->user()->email }}";
let SUPERADMIN_ID = "";

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function initFirebaseLogs() {
    SUPERADMIN_ID = await sha256(emailRaw);
    loadFirebaseLogs();
}

async function loadFirebaseLogs() {
    try {
        const db = firebase.firestore();
        const logsSnapshot = await db.collection('superadmin').doc(SUPERADMIN_ID).collection('logs').get();
        let logs = [];
        logsSnapshot.forEach(doc => {
            logs.push({ id: doc.id, ref: doc.ref, ...doc.data() });
        });

        // Sort descending locally to avoid requiring a Firebase composite index
        logs.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.toMillis() : 0;
            const timeB = b.timestamp ? b.timestamp.toMillis() : 0;
            return timeB - timeA;
        });

        const container = document.getElementById('firebase-logs-container');
        container.innerHTML = '';

        if (logs.length === 0) {
            container.innerHTML = '<div class="text-center py-10 text-slate-400 text-sm">Belum ada aktivitas di Firebase.</div>';
            return;
        }

        logs.forEach(log => {
            let dateStr = '—';
            if (log.timestamp) {
                const d = new Date(log.timestamp.toMillis());
                dateStr = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
            }

            // Determine badge color based on log type
            let badgeClass = 'bg-emerald-100 text-emerald-700';
            if (log.type === 'login' || log.type === 'register') badgeClass = 'bg-blue-100 text-blue-700';
            if (log.type && log.type.startsWith('delete')) badgeClass = 'bg-red-100 text-red-700';
            if (log.type && log.type.startsWith('edit')) badgeClass = 'bg-amber-100 text-amber-700';

            const typeLabel = log.type ? log.type.toUpperCase().replace('_', ' ') : 'SUKSES';

            container.innerHTML += `
            <div class="p-5 border border-slate-200 rounded-2xl flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <h4 class="font-bold text-slate-800">${log.activity || 'Aktivitas Tidak Diketahui'}</h4>
                    <span class="px-2.5 py-0.5 rounded-full ${badgeClass} text-[10px] font-bold tracking-wider">${typeLabel}</span>
                </div>
                <div class="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span class="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md" title="IP Address">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                        ${log.ipAddress || 'IP Tidak Diketahui'}
                    </span>
                    <span class="flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        ${dateStr}
                    </span>
                </div>
            </div>`;
        });
    } catch (e) {
        console.error("Gagal memuat log firebase", e);
        document.getElementById('firebase-logs-container').innerHTML = '<div class="text-center py-10 text-red-500 text-sm">Gagal memuat log. '+e.message+'</div>';
    }
}


async function handleDeleteAccount() {
    const result = await Swal.fire({
        title: 'Hapus Akun Permanen?',
        html: '<p class="text-sm text-slate-500">Seluruh data Anda termasuk sub-collection di Firebase akan dihapus. Tindakan ini <strong class="text-red-600">TIDAK DAPAT</strong> dibatalkan.</p>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Ya, Hapus Akun Saya!',
        cancelButtonText: 'Batal',
        input: 'text',
        inputPlaceholder: 'Ketik "HAPUS" untuk konfirmasi',
        inputValidator: (value) => {
            if (value !== 'HAPUS') return 'Ketik HAPUS untuk mengkonfirmasi penghapusan akun.';
        }
    });

    if (result.isConfirmed) {
        try {
            Swal.fire({ title: 'Menghapus akun...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

            const user = firebase.auth().currentUser;
            const db = firebase.firestore();

            // Delete Firestore sub-collections first
            const subcollections = ['sekolah', 'universitas', 'perusahaan', 'logs'];
            for (const sub of subcollections) {
                const snap = await db.collection('superadmin').doc(SUPERADMIN_ID).collection(sub).get();
                const batch = db.batch();
                snap.forEach(doc => batch.delete(doc.ref));
                if (snap.size > 0) await batch.commit();
            }

            // Delete main superadmin document
            await db.collection('superadmin').doc(SUPERADMIN_ID).delete();

            // Delete Firebase Auth user
            if (user) {
                await user.delete();
            }

            // Logout from Laravel session
            await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': '{{ csrf_token() }}'
                }
            });

            Swal.fire({
                icon: 'success',
                title: 'Akun Terhapus',
                text: 'Akun Anda telah dihapus secara permanen.',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "{{ route('login') }}";
            });
        } catch (e) {
            console.error('Gagal menghapus akun:', e);
            Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus akun: ' + e.message, 'error');
        }
    }
}
</script>
@endpush

