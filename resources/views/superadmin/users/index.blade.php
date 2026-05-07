@extends('layouts.app')
@section('page-title', 'Kelola Pengguna')
@section('content')

<div class="space-y-6">
    {{-- Header --}}
    <div class="relative bg-gradient-to-r from-[#0f172a] via-[#1e3a5f] to-[#1e40af] rounded-2xl px-8 py-7 text-white overflow-hidden shadow-lg">
        <div class="absolute right-0 top-0 w-64 h-full opacity-10">
            <svg viewBox="0 0 200 200" fill="currentColor" class="w-full h-full"><circle cx="160" cy="40" r="80"/><circle cx="60" cy="160" r="60"/></svg>
        </div>
        <div class="relative flex items-center justify-between">
            <div>
                <p class="text-blue-300 text-sm font-medium">Manajemen</p>
                <h2 class="text-3xl font-extrabold">Daftar Pengguna</h2>
                <p class="text-blue-200 text-sm mt-0.5">Kelola akses, API Key, dan langganan pengguna sistem.</p>
            </div>
            <button onclick="document.getElementById('add-user-modal').classList.remove('hidden')" 
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-900 font-semibold text-sm rounded-xl shadow hover:bg-blue-50 transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Tambah Pengguna
            </button>
        </div>
    </div>

    {{-- API Key Alert (Sesuai Perintah) --}}
    @if(session('new_api_key'))
        <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm mb-6 animate-pulse-once">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div class="flex-1">
                    <h4 class="text-lg font-bold text-emerald-800">✅ API Key Berhasil Dibuat!</h4>
                    <p class="text-emerald-600 text-sm mt-1">Silakan copy dan simpan API Key di bawah ini. <b>Token ini hanya ditampilkan SATU KALI ini saja untuk alasan keamanan!</b></p>
                    
                    <div class="mt-4 flex gap-2">
                        <input type="text" value="{{ session('new_api_key') }}" readonly id="apiKeyInput" 
                            class="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-emerald-900 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                        
                        <button onclick="copyToken()" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-0 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
                            Copy API Key
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            function copyToken() {
                var copyText = document.getElementById("apiKeyInput");
                copyText.select();
                copyText.setSelectionRange(0, 99999); /* Untuk mobile */
                navigator.clipboard.writeText(copyText.value);
                
                // Menggunakan SweetAlert jika tersedia di layout, jika tidak alert biasa
                if(typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Tercopy!',
                        text: 'API Key berhasil disalin ke clipboard.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    alert("API Key berhasil di-copy!");
                }
            }
        </script>
    @endif

    {{-- Users Table --}}
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-800">Daftar Akun</h3>
            <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-semibold">{{ count($users) }} Pengguna</span>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                        <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                        <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipe Institusi</th>
                        <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Langganan</th>
                        <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    @forelse($users as $index => $user)
                        <tr class="hover:bg-slate-50 transition">
                            <td class="px-6 py-4 text-sm text-slate-400">{{ $index + 1 }}</td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {{ strtoupper(substr($user->name, 0, 1)) }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-slate-800">{{ $user->name }}</p>
                                        <p class="text-xs text-slate-400">{{ $user->email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold {{ $user->institution_type === 'sekolah' ? 'bg-blue-100 text-blue-700' : ($user->institution_type === 'universitas' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700') }}">
                                    {{ ucfirst($user->institution_type) }}
                                </span>
                                <p class="text-[10px] text-slate-400 mt-0.5">{{ $user->institution_name }}</p>
                            </td>
                            <td class="px-6 py-4">
                                @php $activeSub = $user->subscriptions->where('is_active', true)->first(); @endphp
                                @if($activeSub)
                                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                                        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                        {{ $activeSub->plan_name }}
                                    </span>
                                    <p class="text-[10px] text-slate-400 mt-0.5">s/d {{ \Carbon\Carbon::parse($activeSub->end_date)->format('d M Y') }}</p>
                                @else
                                    <span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">Tidak ada</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <form action="{{ route('superadmin.users.apikey', $user) }}" method="POST" onsubmit="return confirm('Generate API Key baru untuk user ini? Token lama akan hangus.')">
                                        @csrf
                                        <button type="submit" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition" title="Generate API Key">
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                                        </button>
                                    </form>
                                    <button onclick="openDeleteModal('{{ $user->id }}', '{{ $user->name }}')" class="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Hapus User">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                                <p class="font-semibold text-sm">Belum ada pengguna terdaftar.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

{{-- Add User Modal --}}
<div id="add-user-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="document.getElementById('add-user-modal').classList.add('hidden')"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 flex items-center gap-3 text-white">
            <h3 class="text-lg font-bold">Tambah Pengguna Baru</h3>
        </div>
        <form action="{{ route('superadmin.users.store') }}" method="POST" class="p-6 space-y-4">
            @csrf
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                    <input type="text" name="name" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input type="email" name="email" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input type="password" name="password" required minlength="8" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Tipe Institusi</label>
                    <select name="institution_type" required class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                        <option value="sekolah">Sekolah</option>
                        <option value="universitas">Universitas</option>
                        <option value="perusahaan">Perusahaan</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Institusi</label>
                    <input type="text" name="institution_name" class="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                </div>
            </div>
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p class="text-xs font-bold text-blue-700 uppercase mb-3">Paket Langganan Awal</p>
                <div class="grid grid-cols-2 gap-4">
                    <select name="plan_name" class="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white">
                        <option value="">-- Pilih Paket --</option>
                        <option value="Basic Plan">Basic Plan</option>
                        <option value="Standard Plan">Standard Plan</option>
                        <option value="Premium Plan">Premium Plan</option>
                    </select>
                    <input type="number" name="duration_days" placeholder="Durasi (Hari)" class="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white">
                </div>
            </div>
            <div class="flex gap-3 pt-2">
                <button type="submit" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition">Simpan Pengguna</button>
                <button type="button" onclick="document.getElementById('add-user-modal').classList.add('hidden')" class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">Batal</button>
            </div>
        </form>
    </div>
</div>

{{-- Delete Form (Hidden) --}}
<form id="delete-form" method="POST" class="hidden">
    @csrf
    @method('DELETE')
</form>

<script>
    function openDeleteModal(id, name) {
        if(confirm('Apakah Anda yakin ingin menghapus user ' + name + '? Seluruh data langganan dan token akan ikut terhapus.')) {
            const form = document.getElementById('delete-form');
            form.action = '/superadmin/users/' + id;
            form.submit();
        }
    }
</script>

@endsection
