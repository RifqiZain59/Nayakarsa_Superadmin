<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SuperAdmin - Firebase Auth</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.11.0/firebase-auth-compat.js"></script>
    <style>
        body { 
            font-family: 'Outfit', sans-serif; 
        }
    </style>
</head>
<body class="min-h-screen flex bg-white">

    <!-- Left Split: Dark Blue Branding -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-center items-center relative z-10 p-16 bg-[#0f172a]">
        <div class="max-w-lg text-left">
            <h1 class="text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">Nayakarsa <br><span class="text-blue-400">Face Attendance</span></h1>
            <p class="text-lg text-gray-300 font-light leading-relaxed mb-8">Tingkatkan kedisiplinan dan akurasi absensi dengan teknologi pengenalan wajah cerdas. Kelola data kehadiran dengan cepat, aman, dan anti-kecurangan.</p>
            <div class="flex space-x-4">
                <div class="border border-gray-700 rounded-lg p-4 text-white text-center w-32 bg-white/5">
                    <span class="block text-2xl font-bold">99.9%</span>
                    <span class="text-xs text-gray-400 uppercase tracking-wide">Akurasi Wajah</span>
                </div>
                <div class="border border-gray-700 rounded-lg p-4 text-white text-center w-32 bg-white/5">
                    <span class="block text-2xl font-bold">< 1s</span>
                    <span class="text-xs text-gray-400 uppercase tracking-wide">Kecepatan Scan</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Right Split: Form (White) -->
    <div class="w-full lg:w-1/2 flex items-center justify-center relative z-10 p-6 sm:p-12 bg-white text-gray-900">
        <div class="w-full max-w-md">
            @yield('content')
        </div>
    </div>

    <!-- Firebase Config -->
    <script src="{{ asset('js/firebase-config.js') }}"></script>
    @stack('scripts')
</body>
</html>
