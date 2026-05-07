@extends('layouts.app')
@section('page-title', 'Dashboard')
@section('content')
<div class="space-y-6">

    <div class="relative bg-gradient-to-r from-[#0f172a] via-[#1e3a5f] to-[#1e40af] rounded-2xl px-8 py-7 text-white overflow-hidden shadow-lg">
        <div class="absolute right-0 top-0 w-64 h-full opacity-10">
            <svg viewBox="0 0 200 200" fill="currentColor" class="w-full h-full"><circle cx="160" cy="40" r="80"/><circle cx="60" cy="160" r="60"/></svg>
        </div>
        <div class="relative">
            <p class="text-blue-300 text-sm font-medium mb-1">Selamat datang,</p>
            <h2 class="text-3xl font-extrabold mb-1">{{ auth()->user()->name }}</h2>
            <p class="text-blue-200 text-sm">Kelola pengguna Absensi Wajah dan langganan dari sini.</p>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
            </div>
            <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Sekolah</p>
                <p class="text-3xl font-extrabold text-slate-800 leading-none mt-0.5" id="stat-sekolah">
                    <span class="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse"></span>
                </p>
            </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>
            </div>
            <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Universitas</p>
                <p class="text-3xl font-extrabold text-slate-800 leading-none mt-0.5" id="stat-universitas">
                    <span class="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse"></span>
                </p>
            </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-slate-400">Perusahaan</p>
                <p class="text-3xl font-extrabold text-slate-800 leading-none mt-0.5" id="stat-perusahaan">
                    <span class="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse"></span>
                </p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
            <h3 class="text-sm font-bold text-slate-800 mb-1">Pengguna per Institusi</h3>
            <p class="text-xs text-slate-400 mb-4">Data dari Sekolah, Universitas & Perusahaan</p>
            <div class="flex-grow flex items-center justify-center">
                <canvas id="instChart" style="width: 100%; height: 220px;"></canvas>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
            <h3 class="text-sm font-bold text-slate-800 mb-1">Distribusi Langganan</h3>
            <p class="text-xs text-slate-400 mb-4">Persentase paket langganan yang digunakan</p>
            <div class="flex-grow flex items-center justify-center">
                <canvas id="subChart" width="220" height="220" style="max-width:220px;max-height:220px;"></canvas>
            </div>
            <div class="flex flex-wrap justify-center gap-3 mt-4" id="sub-chart-legend"></div>
        </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h3 class="text-base font-bold text-slate-800">Pengguna Terbaru</h3>
                <p class="text-xs text-slate-400 mt-0.5">5 pengguna yang baru bergabung dari Firebase</p>
            </div>
            <span class="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-semibold" id="table-total-badge">— Total</span>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full">
                <thead><tr class="bg-slate-50 border-b border-slate-100">
                    <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">#</th>
                    <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                    <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tipe</th>
                    <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Langganan</th>
                    <th class="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-widest">Institusi</th>
                </tr></thead>
                <tbody class="divide-y divide-slate-50" id="recent-users-body">
                    <tr><td colspan="5" class="px-6 py-12 text-center text-slate-400"><span class="font-semibold text-sm">Memuat data dari Firebase...</span></td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script>
const emailRaw = "{{ auth()->user()->email }}";
const SECRET_KEY = "SUPERADMIN_SECURE_KEY_2026";
let SUPERADMIN_ID = '';

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function decryptData(encodedText) {
    if (!encodedText) return '';
    try {
        const xored = atob(encodedText);
        let utf8Text = '';
        for (let i = 0; i < xored.length; i++) {
            utf8Text += String.fromCharCode(xored.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
        }
        return decodeURIComponent(escape(utf8Text));
    } catch (e) {
        return encodedText;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    const db = firebase.firestore();
    SUPERADMIN_ID = await sha256(emailRaw);

    // Fetch all 3 sub-collections
    const [sekolahSnap, univSnap, perusahaanSnap] = await Promise.all([
        db.collection('superadmin').doc(SUPERADMIN_ID).collection('sekolah').get(),
        db.collection('superadmin').doc(SUPERADMIN_ID).collection('universitas').get(),
        db.collection('superadmin').doc(SUPERADMIN_ID).collection('perusahaan').get()
    ]);

    const sekolahCount = sekolahSnap.size;
    const univCount = univSnap.size;
    const perusahaanCount = perusahaanSnap.size;
    const totalUsers = sekolahCount + univCount + perusahaanCount;

    // Update stat cards
    document.getElementById('stat-sekolah').textContent = sekolahCount;
    document.getElementById('stat-universitas').textContent = univCount;
    document.getElementById('stat-perusahaan').textContent = perusahaanCount;
    document.getElementById('table-total-badge').textContent = totalUsers + ' Total';

    // Bar Chart - Per Institution
    new Chart(document.getElementById('instChart'), {
        type: 'bar',
        data: {
            labels: ['Sekolah', 'Universitas', 'Perusahaan'], // Emoji dihapus agar lebih bersih
            datasets: [{
                label: 'Pengguna',
                data: [sekolahCount, univCount, perusahaanCount],
                backgroundColor: ['#3b82f6', '#6366f1', '#10b981'],
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Ditambahkan agar responsif mengikuti flex container
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { precision: 0 } },
                x: { grid: { display: false } }
            }
        }
    });

    // Collect all users for subscription chart + recent users table
    const allUsers = [];
    const planCounts = {};

    function processSnapshot(snap, typeName) {
        snap.forEach(doc => {
            const d = doc.data();
            d._type = typeName;
            d._createdAtMs = d.createdAt ? d.createdAt.toMillis() : 0;
            
            d.name = decryptData(d.name);
            d.email = decryptData(d.email);
            d.institutionName = decryptData(d.institutionName);
            
            allUsers.push(d);

            if (d.subscription && d.subscription.isActive && d.subscription.planName) {
                const plan = d.subscription.planName;
                planCounts[plan] = (planCounts[plan] || 0) + 1;
            }
        });
    }
    processSnapshot(sekolahSnap, 'Sekolah');
    processSnapshot(univSnap, 'Universitas');
    processSnapshot(perusahaanSnap, 'Perusahaan');

    // Donut Chart - Subscription distribution
    const planLabels = Object.keys(planCounts);
    const planData = Object.values(planCounts);
    const planColors = ['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (planLabels.length > 0) {
        new Chart(document.getElementById('subChart'), {
            type: 'doughnut',
            data: {
                labels: planLabels,
                datasets: [{
                    data: planData,
                    backgroundColor: planColors.slice(0, planLabels.length),
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                cutout: '72%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                                return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Legend
        const legendEl = document.getElementById('sub-chart-legend');
        const totalSubs = planData.reduce((a, b) => a + b, 0);
        planLabels.forEach((label, i) => {
            const pct = ((planData[i] / totalSubs) * 100).toFixed(1);
            legendEl.innerHTML += `<div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full" style="background:${planColors[i]}"></span><span class="text-xs text-slate-600 font-medium">${label} (${pct}%)</span></div>`;
        });
    } else {
        document.getElementById('subChart').parentElement.innerHTML = '<div class="flex items-center justify-center h-[220px] text-slate-400 text-sm">Belum ada data langganan</div>';
    }

    // Recent users table (sorted by createdAt desc, top 5)
    allUsers.sort((a, b) => b._createdAtMs - a._createdAtMs);
    const recent = allUsers.slice(0, 5);
    const tbody = document.getElementById('recent-users-body');
    tbody.innerHTML = '';

    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-12 text-center text-slate-400"><p class="font-semibold text-sm">Belum ada pengguna</p></td></tr>';
        return;
    }

    const typeColors = { 'Sekolah': 'bg-blue-100 text-blue-700', 'Universitas': 'bg-indigo-100 text-indigo-700', 'Perusahaan': 'bg-emerald-100 text-emerald-700' };

    recent.forEach((user, idx) => {
        const initials = user.name ? user.name.charAt(0).toUpperCase() : '?';
        const planHtml = (user.subscription && user.subscription.isActive)
            ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700"><span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>${user.subscription.planName}</span>`
            : '<span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500">Tidak ada</span>';

        tbody.innerHTML += `
        <tr class="hover:bg-slate-50 transition">
            <td class="px-6 py-4 text-sm text-slate-400">${idx + 1}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">${initials}</div>
                    <div><p class="text-sm font-semibold text-slate-800">${user.name || '—'}</p><p class="text-xs text-slate-400">${user.email || '—'}</p></div>
                </div>
            </td>
            <td class="px-6 py-4"><span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${typeColors[user._type] || 'bg-slate-100 text-slate-600'}">${user._type}</span></td>
            <td class="px-6 py-4">${planHtml}</td>
            <td class="px-6 py-4"><span class="text-sm text-slate-600 font-medium">${user.institutionName || '—'}</span></td>
        </tr>`;
    });
});
</script>
@endsection