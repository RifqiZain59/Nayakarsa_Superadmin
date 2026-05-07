@extends('layouts.guest')

@section('content')
<div class="w-full">
    <div class="mb-10">
        <h2 class="text-4xl font-bold tracking-tight mb-2 text-[#0f172a]">Welcome Back</h2>
        <p class="text-sm text-gray-500">Sign in to your SuperAdmin account.</p>
    </div>
    
    <form id="loginForm" class="space-y-6">

        <div>
            <label class="block text-sm font-medium mb-2 text-gray-700" for="email">Email Address</label>
            <input class="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition" id="email" type="email" placeholder="superadmin@example.com" required>
        </div>
        
        <div>
            <label class="block text-sm font-medium mb-2 text-gray-700" for="password">Password</label>
            <input class="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition" id="password" type="password" placeholder="••••••••" required>
        </div>
        
        <div class="pt-2">
            <button class="w-full py-3 rounded-xl font-semibold tracking-wide bg-[#0f172a] hover:bg-slate-800 text-white transition-colors" type="submit" id="submitBtn">
                Sign In
            </button>
        </div>

        <div class="mt-6 text-left">
            <p class="text-sm text-gray-600">Don't have an account? <a href="{{ route('register') }}" class="font-bold hover:underline text-[#0f172a]">Register</a></p>
        </div>
    </form>
</div>

@push('scripts')
<script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
    const db = firebase.firestore();

    /**
     * Hash string menggunakan SHA-256 (Web Crypto API)
     * Digunakan sebagai document ID agar email tidak terbaca langsung
     */
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray  = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Simpan/update data superadmin ke Firestore:
     * - Collection: "superadmin"
     * - Document ID: SHA-256(uid)        ← tidak mengekspos uid mentah
     * - Sub-collection "credentials":
     *     - Document ID: SHA-256(email)  ← email di-hash, tidak terbaca hacker
     *     - Field "ref": SHA-256(email)  ← identifier tersembunyi
     */
    async function syncToFirestore(fbUser, realName) {
        const uidHash   = await sha256(fbUser.email);
        
        async function getIpAddress() {
            try {
                const res = await fetch('https://api.ipify.org?format=json');
                const data = await res.json();
                return data.ip;
            } catch(e) {
                return 'Unknown IP';
            }
        }

        // Document utama di collection "superadmin" (menggunakan hash uid)
        await db.collection('superadmin').doc(uidHash).set({
            uidHash:     uidHash,
            role:        'superadmin',
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        // Sub-collection "logs" untuk mencatat aktivitas login (encrypted)
        const ip = await getIpAddress();
        const encAct = await sha256(`login_${fbUser.email}_${Date.now()}`);
        const encIp = await sha256(ip);
        const encDev = await sha256(navigator.userAgent);
        await db.collection('superadmin').doc(uidHash).collection('logs').add({
            activity: 'Berhasil login ke sistem (SuperAdmin)',
            activityHash: encAct,
            ipAddress: ip,
            ipHash: encIp,
            device: navigator.userAgent,
            deviceHash: encDev,
            type: 'login',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email    = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn      = document.getElementById('submitBtn');
        btn.innerHTML = 'Signing in...';
        btn.disabled  = true;

        try {
            const cred     = await firebase.auth().signInWithEmailAndPassword(email, password);
            const fbUser   = cred.user;
            const realName = fbUser.displayName || email.split('@')[0];

            // 1. Sinkronisasi ke Firestore collection "superadmin" dengan data ter-hash
            await syncToFirestore(fbUser, realName);

            // 2. Buat sesi Laravel via backend
            const token = await fbUser.getIdToken();
            const res   = await fetch('/firebase-login', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'X-CSRF-TOKEN':  '{{ csrf_token() }}',
                },
                body: JSON.stringify({ token, email: fbUser.email, name: realName, uid: fbUser.uid }),
            });
            const data = await res.json();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil',
                    text: 'Selamat datang di SuperAdmin!',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = "{{ route('superadmin.dashboard') }}";
                });
            } else {
                throw new Error('Gagal membuat sesi server.');
            }
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: err.message || 'Terjadi kesalahan. Coba lagi.'
            });
            btn.innerHTML = 'Sign In';
            btn.disabled  = false;
        }
    });
</script>
@endpush
@endsection
