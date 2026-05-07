@extends('layouts.guest')

@section('content')
<div class="w-full">
    <div class="mb-10">
        <h2 class="text-4xl font-bold tracking-tight mb-2 text-[#0f172a]">Create Account</h2>
        <p class="text-sm text-gray-500">Join SuperAdmin to manage your system.</p>
    </div>
    
    <form id="registerForm" class="space-y-5">

        <div>
            <label class="block text-sm font-medium mb-1 text-gray-700" for="name">Full Name</label>
            <input class="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition" id="name" type="text" placeholder="John Doe" required autofocus>
        </div>

        <div>
            <label class="block text-sm font-medium mb-1 text-gray-700" for="email">Email Address</label>
            <input class="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition" id="email" type="email" placeholder="superadmin@example.com" required>
        </div>
        
        <div>
            <label class="block text-sm font-medium mb-1 text-gray-700" for="password">Password</label>
            <input class="w-full py-3 px-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent transition" id="password" type="password" placeholder="••••••••" required>
        </div>
        
        <div class="pt-4">
            <button class="w-full py-3 rounded-xl font-semibold tracking-wide bg-[#0f172a] hover:bg-slate-800 text-white transition-colors" type="submit" id="submitBtn">
                Register
            </button>
        </div>

        <div class="mt-4 text-left">
            <p class="text-sm text-gray-600">Already have an account? <a href="{{ route('login') }}" class="font-bold hover:underline text-[#0f172a]">Login</a></p>
        </div>
    </form>
</div>

@push('scripts')
<script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore-compat.js"></script>
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script>
    const db = firebase.firestore();

    async function getIpAddress() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch(e) {
            return 'Unknown IP';
        }
    }

    /**
     * Hash string menggunakan SHA-256 (Web Crypto API)
     * Digunakan agar identifier tidak tersimpan dalam format plaintext
     */
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray  = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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

    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name     = document.getElementById('name').value;
        const email    = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn      = document.getElementById('submitBtn');
        btn.innerHTML = 'Creating account...';
        btn.disabled  = true;

        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

            // Update profile Firebase dengan nama asli
            await userCredential.user.updateProfile({ displayName: name });
            
            // Create initial SuperAdmin document in Firestore
            const uidHash = await sha256(email);
            const passwordHash = await sha256(password);
            
            await db.collection('superadmin').doc(uidHash).set({
                uidHash: uidHash,
                role: encryptData('superadmin'),
                name: encryptData(name),
                email: encryptData(email),
                passwordHash: passwordHash,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            // Log activity "Register" (encrypted)
            const ip = await getIpAddress();
            const encAct = await sha256(`register_${email}_${Date.now()}`);
            const encIp = await sha256(ip);
            const encDev = await sha256(navigator.userAgent);
            await db.collection('superadmin').doc(uidHash).collection('logs').add({
                activity: 'Berhasil registrasi akun SuperAdmin',
                activityHash: encAct,
                ipAddress: ip,
                ipHash: encIp,
                device: navigator.userAgent,
                deviceHash: encDev,
                type: 'register',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Logout dari Firebase agar user harus login manual
            await firebase.auth().signOut();

            Swal.fire({
                icon: 'success',
                title: 'Registrasi Berhasil',
                text: 'Akun Anda telah dibuat. Silakan login.',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "{{ route('login') }}?registered=true";
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Registrasi Gagal',
                text: error.message
            });
            btn.innerHTML = 'Register';
            btn.disabled  = false;
        }
    });
</script>
@endpush
@endsection
